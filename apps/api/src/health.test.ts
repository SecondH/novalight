import request from 'supertest';
import { createApp } from './app';

describe('GET /api/v1/health', () => {
  it('returns 200 with the standard success envelope', async () => {
    const app = createApp();
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: {
        status: 'ok',
        uptimeSeconds: expect.any(Number),
        timestamp: expect.any(String),
      },
    });
  });

  it('returns the versioned error envelope for an unknown route', async () => {
    const app = createApp();
    const res = await request(app).get('/api/v1/does-not-exist');

    expect(res.status).toBe(404);
  });
});
