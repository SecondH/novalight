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
describe('POST /api/v1/ai/text/generate', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  async function buildAuthenticatedContext() {
    const { createApp } = await import('./app');
    const { authProvider } = await import('./auth/in-memory-auth-provider');
    const token = authProvider.createSession({ userId: 'test-user-1', email: 'test@example.com' });
    return { app: createApp(), token };
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
