/**
 * End-to-end through the real Express app (createApp()), matching the existing convention in
 * authentication.test.ts/webhooks.test.ts. jest.resetModules() + dynamic import because env.ts
 * reads process.env once at import time, and the AI provider is resolved once at
 * ai-text-generation.service.ts's module load (fail-fast posture) -- each test that needs a
 * specific AI_ENABLED/AI_PROVIDER combination gets a fresh module graph. Authenticates the same
 * way ownership-isolation.test.ts does: a real session created via the in-memory
 * AuthProvider's createSession(), not a static/arbitrary bearer string -- no database involved,
 * since this endpoint never touches Prisma.
 */
// This suite repeatedly calls jest.resetModules() and dynamically re-imports the full Express
// app graph (env.ts, @clerk/backend, the AI provider factory, etc.) once per test, for env-var
// isolation. Under concurrent Turborepo execution (every workspace's tests running at once),
// that per-test module-reimport cost can occasionally exceed Jest's default 5-second timeout,
// even though each test's own logic completes quickly in isolation. Scoped to this file only --
// not a repository-wide timeout change.
jest.setTimeout(15_000);

// env.ts's top-level `import 'dotenv/config'` re-reads the real apps/api/.env from disk on
// every fresh module load (jest.resetModules() below clears the module cache, forcing env.ts to
// re-evaluate on each test's dynamic import). dotenv only fills a process.env key that is still
// unset -- without neutralizing it here, `delete process.env.AI_ENABLED` in beforeEach would be
// silently undone on the very next import, refilling it from the developer's real local .env
// (e.g. AI_ENABLED=true, a real GROQ_API_KEY/GROQ_MODEL for local Groq activation). Mocking the
// side-effect-only module file-wide means every test's process.env state is exactly what that
// test set, never influenced by the real .env.
jest.mock('dotenv/config', () => ({}));

// Authentication.ts now activates ClerkAuthProvider (ADR-029/ADR-030) -- a token minted via
// InMemoryAuthProvider.createSession() is no longer accepted by the live app, since
// requireAuthentication verifies it through Clerk's real verifyToken, not an in-memory map
// lookup. Mocked here the same way clerk-auth-provider.test.ts mocks @clerk/backend, plus
// UserProvisioningService (ClerkAuthProvider's own default-constructed dependency), so this
// file keeps its documented "no database involved" property -- these tests exercise the real
// requireAuthentication -> ClerkAuthProvider code path with a fully-controlled fake identity,
// never a real Clerk network call or a real Prisma call.
const verifyToken = jest.fn();
const getUser = jest.fn();
jest.mock('@clerk/backend', () => ({
  createClerkClient: () => ({
    users: { getUser: (...args: unknown[]) => getUser(...args) },
    sessions: { revokeSession: jest.fn() },
  }),
  verifyToken: (...args: unknown[]) => verifyToken(...args),
}));

const resolveOrProvisionLocalUserId = jest.fn();
jest.mock('./services/user-provisioning.service', () => ({
  UserProvisioningService: jest.fn().mockImplementation(() => ({
    resolveOrProvisionLocalUserId: (...args: unknown[]) => resolveOrProvisionLocalUserId(...args),
  })),
}));

describe('POST /api/v1/ai/text/generate', () => {
  const ORIGINAL_ENV = process.env;
  // Obvious placeholder, never validated cryptographically -- verifyToken is mocked above, so
  // this only needs to be non-empty to satisfy authentication.ts's fail-closed startup check.
  const FAKE_CLERK_SECRET = 'placeholder';

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.AI_ENABLED;
    delete process.env.AI_PROVIDER;
    delete process.env.GROQ_API_KEY;
    delete process.env.GROQ_MODEL;
    process.env.CLERK_SECRET_KEY = FAKE_CLERK_SECRET;
    verifyToken.mockReset();
    getUser.mockReset();
    resolveOrProvisionLocalUserId.mockReset();
    verifyToken.mockResolvedValue({ sub: 'clerk_test_user_1', sid: 'sess_test_1' });
    getUser.mockResolvedValue({
      primaryEmailAddressId: 'email_1',
      emailAddresses: [{ id: 'email_1', emailAddress: 'test@example.com' }],
    });
    resolveOrProvisionLocalUserId.mockResolvedValue('test-user-1');
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  async function buildAuthenticatedContext() {
    const { createApp } = await import('./app');
    // The token's actual content is irrelevant -- verifyToken is mocked above and never parses
    // it -- but a non-empty string is required to pass requireAuthentication's bearer-token
    // presence check.
    return { app: createApp(), token: 'fake-clerk-session-token' };
  }

  it('rejects an unauthenticated request with 401', async () => {
    const request = (await import('supertest')).default;
    const { createApp } = await import('./app');
    const app = createApp();

    const res = await request(app).post('/api/v1/ai/text/generate').send({ userPrompt: 'hello' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      error: { code: 'AUTHENTICATION_ERROR', message: expect.any(String) },
    });
  });

  it('rejects an empty userPrompt with 400', async () => {
    process.env.AI_ENABLED = 'true';
    process.env.AI_PROVIDER = 'mock';
    const request = (await import('supertest')).default;
    const { app, token } = await buildAuthenticatedContext();

    const res = await request(app)
      .post('/api/v1/ai/text/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ userPrompt: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects a userPrompt above AI_MAX_PROMPT_CHARS with 400', async () => {
    process.env.AI_ENABLED = 'true';
    process.env.AI_PROVIDER = 'mock';
    process.env.AI_MAX_PROMPT_CHARS = '50';
    const request = (await import('supertest')).default;
    const { app, token } = await buildAuthenticatedContext();

    const res = await request(app)
      .post('/api/v1/ai/text/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ userPrompt: 'x'.repeat(51) });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('responds 503 when AI_ENABLED is false (default)', async () => {
    const request = (await import('supertest')).default;
    const { app, token } = await buildAuthenticatedContext();

    const res = await request(app)
      .post('/api/v1/ai/text/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ userPrompt: 'hello' });

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
  });

  it('returns 200 with a normalized result for a valid request against the mock provider', async () => {
    process.env.AI_ENABLED = 'true';
    process.env.AI_PROVIDER = 'mock';
    const request = (await import('supertest')).default;
    const { app, token } = await buildAuthenticatedContext();

    const res = await request(app)
      .post('/api/v1/ai/text/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ userPrompt: 'Generate a caption', temperature: 0.7, maxOutputTokens: 100 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: {
        text: expect.any(String),
        model: expect.any(String),
        provider: 'mock',
        finishReason: expect.any(String),
        usage: {
          inputTokens: expect.any(Number),
          outputTokens: expect.any(Number),
          totalTokens: expect.any(Number),
        },
        latencyMs: expect.any(Number),
      },
    });
    // No Groq-specific or raw-provider fields leak through.
    expect(Object.keys(res.body.data).sort()).toEqual(
      ['finishReason', 'latencyMs', 'model', 'provider', 'text', 'usage'].sort(),
    );
  });

  it('silently strips a client-supplied provider/model rather than honoring it', async () => {
    process.env.AI_ENABLED = 'true';
    process.env.AI_PROVIDER = 'mock';
    const request = (await import('supertest')).default;
    const { app, token } = await buildAuthenticatedContext();

    const res = await request(app)
      .post('/api/v1/ai/text/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ userPrompt: 'hello', provider: 'groq', model: 'some-other-model' });

    expect(res.status).toBe(200);
    expect(res.body.data.provider).toBe('mock'); // server config wins, not the client's request
  });

  it('fails closed at construction when AI_PROVIDER=groq is missing GROQ_API_KEY/GROQ_MODEL', async () => {
    process.env.AI_ENABLED = 'true';
    process.env.AI_PROVIDER = 'groq';
    // GROQ_API_KEY / GROQ_MODEL deliberately left unset -- createAiProvider must throw before
    // constructing a real GroqAiProvider, so no network call to Groq can ever occur here.
    // v1Router is a static top-level import in app.ts, so the AiTextGenerationService
    // constructed at ai.controller.ts's module scope runs during this import itself, not on the
    // first request -- same fail-fast posture as env.ts's own loadEnv().
    await expect(import('./app')).rejects.toThrow(
      'AI_PROVIDER=groq requires both GROQ_API_KEY and GROQ_MODEL to be set.',
    );
  });

  it('normalizes a provider failure into a safe API error', async () => {
    process.env.AI_ENABLED = 'true';
    process.env.AI_PROVIDER = 'mock';
    // Synchronous require (not the top-level import) so this resolves to the SAME
    // post-resetModules() module instance ai-text-generation.service.ts's own `instanceof
    // AiProviderError` check will use -- a dynamic `import()` of the pre-reset top-level
    // AiProviderError would be a different class reference, and the instanceof check would
    // silently fail (falling through to an unmapped 500 instead of the intended 502).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { AiProviderError: FreshAiProviderError } = require('@novalight/ai-core');
    jest.doMock('./ai/providers/ai-provider-factory', () => ({
      createAiProvider: () => ({
        generateText: () => {
          throw new FreshAiProviderError('upstream_error', 'vendor internal detail, must not leak');
        },
      }),
    }));
    const request = (await import('supertest')).default;
    const { app, token } = await buildAuthenticatedContext();

    const res = await request(app)
      .post('/api/v1/ai/text/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ userPrompt: 'hello' });

    expect(res.status).toBe(502);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).not.toContain('vendor internal detail');

    // jest.doMock's registration outlives this test's own jest.resetModules() call (that only
    // clears cached instances, not the mock factory itself) -- without this, every later test
    // in this file would keep getting the broken factory instead of the real one.
    jest.dontMock('./ai/providers/ai-provider-factory');
  });

  it('rate-limits after the configured ceiling with 429', async () => {
    process.env.AI_ENABLED = 'true';
    process.env.AI_PROVIDER = 'mock';
    const request = (await import('supertest')).default;
    const { app, token } = await buildAuthenticatedContext();

    let lastStatus = 0;
    for (let i = 0; i < 21; i++) {
      const res = await request(app)
        .post('/api/v1/ai/text/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({ userPrompt: 'hello' });
      lastStatus = res.status;
    }

    expect(lastStatus).toBe(429);
  }, 20_000);
});
