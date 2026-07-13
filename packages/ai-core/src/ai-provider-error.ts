/**
 * Vendor-neutral error taxonomy for AiProvider implementations -- per ADR-009's "no application
 * module may directly call AI APIs," a vendor SDK's own error classes (e.g. groq-sdk's
 * RateLimitError, AuthenticationError) must never escape the provider implementation. Every
 * AiProvider throws this instead, so AiTextGenerationService can map to an API-safe ApiError
 * without importing or inspecting any vendor-specific type.
 *
 * `configuration_error` covers problems that are NovaLight's fault to fix (bad/expired API key,
 * a model id the configured key can't access) -- distinct from `invalid_request`, which is a
 * request-shape problem the vendor rejected outright (including content-policy rejections).
 */
export type AiErrorCode =
  | 'invalid_request'
  | 'rate_limited'
  | 'timeout'
  | 'network_error'
  | 'upstream_error'
  | 'configuration_error';

/** Error codes safe to retry once, with backoff -- transient by nature, not a request defect. */
export const RETRYABLE_AI_ERROR_CODES: ReadonlySet<AiErrorCode> = new Set([
  'rate_limited',
  'timeout',
  'network_error',
  'upstream_error',
]);

export class AiProviderError extends Error {
  constructor(
    public readonly code: AiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AiProviderError';
  }
}
