/**
 * Covers the CORS origin resolution added during M1.7
 * (docs/operations/027-m1.7-delivery-foundation-report.md) -- the previous binary NODE_ENV
 * check didn't distinguish staging from development. jest.resetModules + jest.doMock per test
 * because env.ts reads process.env once at import time.
 */
describe('resolveCorsOrigin (via applySecurityMiddleware)', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  async function corsOriginPassedTo(): Promise<unknown> {
    const corsMock = jest.fn(
      (_options: { origin: unknown }) => (_req: unknown, _res: unknown, next: () => void) => next(),
    );
    jest.doMock('cors', () => corsMock);
    jest.doMock('helmet', () => () => (_req: unknown, _res: unknown, next: () => void) => next());

    const { applySecurityMiddleware } = await import('./security');
    const use = jest.fn();
    applySecurityMiddleware({ use } as never);

    return corsMock.mock.calls[0]?.[0]?.origin;
  }

  it('uses the explicit allow-list when CORS_ALLOWED_ORIGINS is set, regardless of NODE_ENV', async () => {
    process.env.NODE_ENV = 'production';
    process.env.CORS_ALLOWED_ORIGINS = 'https://app.novalight.com, https://staging.novalight.com';

    expect(await corsOriginPassedTo()).toEqual([
      'https://app.novalight.com',
      'https://staging.novalight.com',
    ]);
  });

  it('falls back to permissive when CORS_ALLOWED_ORIGINS is unset and NODE_ENV is not production', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.CORS_ALLOWED_ORIGINS;

    expect(await corsOriginPassedTo()).toBe(true);
  });

  it('falls back to blocked when CORS_ALLOWED_ORIGINS is unset and NODE_ENV is production (fail-safe default, unchanged)', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.CORS_ALLOWED_ORIGINS;

    expect(await corsOriginPassedTo()).toBe(false);
  });

  it('a whitespace/comma-only CORS_ALLOWED_ORIGINS resolves to an empty allow-list (blocks all origins) -- fails safe, not open, even set in production (per independent architecture review)', async () => {
    process.env.NODE_ENV = 'production';
    process.env.CORS_ALLOWED_ORIGINS = ' , ,';

    expect(await corsOriginPassedTo()).toEqual([]);
  });
});
