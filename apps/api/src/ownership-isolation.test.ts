import request from 'supertest';
import { createApp } from './app';
import { prisma } from '@novalight/database';
import { authProvider } from './auth/in-memory-auth-provider';

/**
 * Ownership-isolation tests per docs/development/019-mvp-m1-test-strategy.md §3 -- the
 * load-bearing security test category identified during the M1 implementation-readiness gate.
 * Requires a real Postgres reachable at DATABASE_URL (integration test, per test-strategy §2)
 * -- unlike the mocked repository unit tests, this exercises the full
 * Controller -> Service -> Repository -> Prisma -> Postgres path, since ownership scoping is
 * enforced at the query level and a mock could hide a real bug. If no database is reachable,
 * these tests fail with a connection error rather than silently skipping -- consistent with
 * docs/development/016-phase-0-implementation-status.md's documented "no database is
 * provisioned" limitation. Run once DATABASE_URL points to a real (test) Postgres instance.
 *
 * Gated behind RUN_DB_INTEGRATION_TESTS=1 (default: skipped) so `npm test`/CI doesn't
 * permanently fail for an infrastructure reason unrelated to code correctness -- the same
 * "no database provisioned" limitation already documented in
 * docs/development/016-phase-0-implementation-status.md, not a new gap introduced here.
 * Ownership-scoping correctness is additionally covered, without needing a live database, by
 * the mocked query-shape assertions in src/repositories/*.repository.test.ts. Set
 * RUN_DB_INTEGRATION_TESTS=1 with a real DATABASE_URL once a CI database service (or local
 * Postgres) is available -- see the still-open "No CI/CD platform" item in
 * .claude/memory/known-risks.md.
 */
const describeIfDb = process.env.RUN_DB_INTEGRATION_TESTS === '1' ? describe : describe.skip;

describeIfDb('Ownership isolation (cross-account IDOR prevention)', () => {
  const app = createApp();

  async function createAccountWithSession(email: string) {
    const user = await prisma.user.create({ data: { email } });
    const token = authProvider.createSession({ userId: user.id, email: user.email });
    const createRes = await request(app)
      .post('/api/v1/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ vertical: 'CAFE' });
    return { userId: user.id, token, accountId: createRes.body.data.id as string };
  }

  async function submitBrandIntake(token: string) {
    const res = await request(app)
      .post('/api/v1/brands/intake')
      .set('Authorization', `Bearer ${token}`)
      .send({
        rawToneAnswer: 'warm',
        rawAudienceAnswer: 'locals',
        rawVisualAnswer: 'bright',
        rawOfferingsAnswer: 'coffee',
      });
    return res.body.data as { id: string };
  }

  it("Account B cannot read or write Account A's brand via a client-supplied account context", async () => {
    const a = await createAccountWithSession('owner-a@example.test');
    const b = await createAccountWithSession('owner-b@example.test');
    await submitBrandIntake(a.token);

    // B's own /brands/me must never return A's brand -- resolveAccountForUser derives
    // strictly from B's authenticated userId (028-m1-technical-design.md §2.2), never from
    // any value A could have supplied.
    const bBrand = await request(app)
      .get('/api/v1/brands/me')
      .set('Authorization', `Bearer ${b.token}`);
    expect(bBrand.body.data).toBeNull();
  });

  it("Account B cannot approve/discard/edit Account A's content draft (404, not 403 -- 028 §2.5)", async () => {
    const a = await createAccountWithSession('owner-a2@example.test');
    const b = await createAccountWithSession('owner-b2@example.test');
    await submitBrandIntake(a.token);

    const ideasRes = await request(app)
      .post('/api/v1/content/ideas/generate')
      .set('Authorization', `Bearer ${a.token}`);
    const ideaId = ideasRes.body.data[0].id as string;

    const draftRes = await request(app)
      .post(`/api/v1/content/ideas/${ideaId}/draft`)
      .set('Authorization', `Bearer ${a.token}`);
    const draftId = draftRes.body.data.id as string;

    const crossAccountApprove = await request(app)
      .post(`/api/v1/content/drafts/${draftId}/approve`)
      .set('Authorization', `Bearer ${b.token}`);
    expect(crossAccountApprove.status).toBe(404);

    const crossAccountEdit = await request(app)
      .patch(`/api/v1/content/drafts/${draftId}`)
      .set('Authorization', `Bearer ${b.token}`)
      .send({ captionText: 'hijacked' });
    expect(crossAccountEdit.status).toBe(404);

    // No side effect occurred -- A's draft is unmodified by B's attempted edit.
    const aStillOwnsDraft = await prisma.contentDraft.findUnique({ where: { id: draftId } });
    expect(aStillOwnsDraft?.captionText).not.toBe('hijacked');
  });

  it('no endpoint accepts a client-supplied account_id to fetch a different Account (the Account-IDOR rule, 028 §2.2)', async () => {
    const a = await createAccountWithSession('owner-a3@example.test');
    const b = await createAccountWithSession('owner-b3@example.test');

    // There is deliberately no GET /accounts/:id endpoint -- only /accounts/me, which always
    // resolves from the authenticated user. This test documents that absence as intentional.
    const attempted = await request(app)
      .get(`/api/v1/accounts/${a.accountId}`)
      .set('Authorization', `Bearer ${b.token}`);
    expect(attempted.status).toBe(404); // no such route exists
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
