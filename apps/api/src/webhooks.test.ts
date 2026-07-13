import { Webhook } from 'svix';

// jest.resetModules() per test forces a full re-require of the app's dependency graph each
// time (same ts-jest recompilation cost this repo's other suites already pay once per file,
// e.g. authentication.test.ts/health.test.ts) -- paid 3x here, so the 5s default is too tight.
jest.setTimeout(30_000);

/**
 * UserProvisioningService is mocked so this suite stays scoped to what it's actually meant to
 * prove -- raw-body wiring (apps/api/src/app.ts) and real Svix signature verification working
 * together end to end -- without depending on the local dev database having the clerkUserId
 * migration applied yet (per ADR-029, that migration is reviewed but not applied pending
 * explicit sign-off). Provisioning logic itself is covered by user-provisioning.service.test.ts
 * and clerk-webhook.service.test.ts's mocked-provisioning-service unit tests.
 */
jest.mock('./services/user-provisioning.service', () => ({
  UserProvisioningService: jest.fn().mockImplementation(() => ({
    resolveOrProvisionLocalUserId: jest.fn().mockResolvedValue('local-uuid'),
    upsertFromWebhook: jest.fn().mockResolvedValue(undefined),
    deactivateByClerkUserId: jest.fn().mockResolvedValue(undefined),
  })),
}));

/**
 * End-to-end through the real Express app (createApp()), not a mocked service -- proves the
 * raw-body wiring in apps/api/src/app.ts and the actual Svix signature verification genuinely
 * work together, per ADR-029's confirmed decision that a signed-payload integration test is
 * sufficient for this pass (no live Clerk-dashboard delivery required). jest.resetModules +
 * dynamic import because env.ts reads process.env once at import time, same pattern as
 * apps/api/src/middlewares/security.test.ts.
 */
describe('POST /api/v1/webhooks/clerk', () => {
  const ORIGINAL_ENV = process.env;
  // Synthetic, computed test fixture -- not a real Clerk secret. svix's Webhook constructor
  // expects a "whsec_"-prefixed base64 payload; built from an obviously-fake source string
  // rather than a hardcoded blob so it reads unambiguously as test-only.
  const SIGNING_SECRET =
    'whsec_' + Buffer.from('not-a-real-secret-test-fixture-only').toString('base64');

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...ORIGINAL_ENV,
      CLERK_WEBHOOK_SIGNING_SECRET: String(SIGNING_SECRET),
    };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  function sign(payload: string) {
    const webhook = new Webhook(SIGNING_SECRET);
    const msgId = 'msg_test_1';
    const timestamp = new Date();
    const signature = webhook.sign(msgId, timestamp, payload);
    return {
      'svix-id': msgId,
      'svix-timestamp': String(Math.floor(timestamp.getTime() / 1000)),
      'svix-signature': signature,
    };
  }

  it('accepts a validly signed user.created event with 200', async () => {
    const request = (await import('supertest')).default;
    const { createApp } = await import('./app');
    const app = createApp();

    const payload = JSON.stringify({
      type: 'user.created',
      data: {
        id: 'clerk_1',
        primary_email_address_id: 'email_1',
        email_addresses: [{ id: 'email_1', email_address: 'user@example.com' }],
      },
    });
    const headers = sign(payload);

    const res = await request(app)
      .post('/api/v1/webhooks/clerk')
      .set('svix-id', headers['svix-id'])
      .set('svix-timestamp', headers['svix-timestamp'])
      .set('svix-signature', headers['svix-signature'])
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { received: true } });
  });

  it('rejects a tampered payload (signature no longer matches) with 400', async () => {
    const request = (await import('supertest')).default;
    const { createApp } = await import('./app');
    const app = createApp();

    const signedPayload = JSON.stringify({ type: 'user.created', data: { id: 'clerk_1' } });
    const headers = sign(signedPayload);
    const tamperedPayload = JSON.stringify({ type: 'user.created', data: { id: 'clerk_evil' } });

    const res = await request(app)
      .post('/api/v1/webhooks/clerk')
      .set('svix-id', headers['svix-id'])
      .set('svix-timestamp', headers['svix-timestamp'])
      .set('svix-signature', headers['svix-signature'])
      .set('Content-Type', 'application/json')
      .send(tamperedPayload);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error: { code: 'AUTHENTICATION_ERROR', message: expect.any(String) },
    });
  });

  it('rejects a request missing the svix signature headers with 400', async () => {
    const request = (await import('supertest')).default;
    const { createApp } = await import('./app');
    const app = createApp();

    const res = await request(app)
      .post('/api/v1/webhooks/clerk')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ type: 'user.created', data: { id: 'clerk_1' } }));

    expect(res.status).toBe(400);
  });
});
