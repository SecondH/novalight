import request from 'supertest';
import { createApp } from './app';

/**
 * Authentication-boundary tests per docs/development/019-mvp-m1-test-strategy.md §5. These do
 * not require a database -- requireAuthentication rejects before any Prisma call.
 */
describe('Authentication boundary', () => {
  const app = createApp();

  it.each([
    ['/api/v1/accounts/me', 'get'],
    ['/api/v1/brands/me', 'get'],
    ['/api/v1/content/ideas', 'get'],
    ['/api/v1/content/calendar', 'get'],
  ] as const)('rejects an unauthenticated request to %s with 401', async (path, method) => {
    const res = await request(app)[method](path);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      error: { code: 'AUTHENTICATION_ERROR', message: expect.any(String) },
    });
  });

  it('rejects an invalid bearer token with 401', async () => {
    const res = await request(app)
      .get('/api/v1/accounts/me')
      .set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });
});
