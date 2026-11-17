import { AiProviderError } from '@novalight/ai-core';
import { ApiError } from '../middlewares/error-handler';
import { logger } from '../config/logger';
import { errorTracker } from '../monitoring/error-tracker';

/**
 * Single mapping from the vendor-neutral AiProviderError taxonomy to API-safe errors, shared by
 * every AI consumer (the generic /ai/text/generate endpoint and the Brand/Content agent
 * pipeline). Fixed, safe messages only -- AiProviderError.message is never forwarded verbatim
 * to the client.
 */
export function mapAiErrorToApiError(error: AiProviderError): ApiError {
  switch (error.code) {
    case 'invalid_request':
      return new ApiError('validation', 400, 'The AI request could not be processed.');
    case 'rate_limited':
      return new ApiError('business', 429, 'The AI provider is busy. Please try again shortly.');
    case 'timeout':
      return new ApiError('business', 504, 'The AI provider did not respond in time.');
    case 'network_error':
    case 'upstream_error':
      return new ApiError('business', 502, 'The AI provider is currently unavailable.');
    case 'configuration_error':
    default:
      return new ApiError('system', 500, 'The AI service is misconfigured.');
  }
}

/**
 * Runs an agent call, translating AiProviderError into an API-safe ApiError; rethrows anything
 * else. The central error handler does not log ApiErrors, so the provider failure is recorded
 * here -- the error code only, never the message -- and configuration problems (revoked key,
 * retired model) also go to error tracking, because they need an operator, not a retry.
 */
export async function withAiErrorMapping<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof AiProviderError) {
      logger.warn({ aiTelemetry: true, aiErrorCode: error.code }, 'ai_agent_failure');
      if (error.code === 'configuration_error') {
        errorTracker.captureException(new Error('AI provider configuration error'), {
          aiErrorCode: error.code,
        });
      }
      throw mapAiErrorToApiError(error);
    }
    throw error;
  }
}
