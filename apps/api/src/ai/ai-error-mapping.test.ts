import { AiProviderError } from '@novalight/ai-core';
import { ApiError } from '../middlewares/error-handler';
import { mapAiErrorToApiError, withAiErrorMapping } from './ai-error-mapping';

describe('mapAiErrorToApiError', () => {
  it.each([
    ['invalid_request', 400],
    ['rate_limited', 429],
    ['timeout', 504],
    ['network_error', 502],
    ['upstream_error', 502],
    ['configuration_error', 500],
  ] as const)('maps %s to HTTP %i without leaking the provider message', (code, status) => {
    const mapped = mapAiErrorToApiError(new AiProviderError(code, 'vendor detail'));
    expect(mapped.statusCode).toBe(status);
    expect(mapped.message).not.toContain('vendor detail');
  });
});

describe('withAiErrorMapping', () => {
  it('returns the operation result on success', async () => {
    await expect(withAiErrorMapping(async () => 42)).resolves.toBe(42);
  });

  it('converts AiProviderError into ApiError', async () => {
    await expect(
      withAiErrorMapping(async () => {
        throw new AiProviderError('upstream_error', 'vendor detail');
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('rethrows unrelated errors untouched', async () => {
    const original = new Error('db down');
    await expect(
      withAiErrorMapping(async () => {
        throw original;
      }),
    ).rejects.toBe(original);
  });
});
