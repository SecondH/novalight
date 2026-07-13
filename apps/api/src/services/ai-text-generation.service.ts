import type { AiProvider, GenerateTextResult } from '@novalight/ai-core';
import { AiProviderError } from '@novalight/ai-core';
import { createAiProvider } from '../ai/providers/ai-provider-factory';
import { ApiError } from '../middlewares/error-handler';
import { auditLogger } from '../audit/pino-audit-logger';
import { logger } from '../config/logger';
import { env } from '../config/env';

export interface GenerateTextInput {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  correlationId?: string;
}

/**
 * AI_ENABLED is the master kill-switch, checked once here (not per request downstream) --
 * default false means no provider is ever constructed, so a misconfigured/missing Groq key
 * never crashes server startup while the feature is off. When enabled, provider construction
 * happens eagerly (fail-fast, same posture as env.ts's own loadEnv()) so a bad Groq
 * configuration is caught at startup, not on a user's first request.
 */
function resolveProvider(): AiProvider | null {
  if (env.AI_ENABLED !== 'true') {
    return null;
  }
  return createAiProvider({
    provider: env.AI_PROVIDER,
    groqApiKey: env.GROQ_API_KEY,
    groqModel: env.GROQ_MODEL,
    timeoutMs: env.AI_REQUEST_TIMEOUT_MS,
    retryCount: env.AI_RETRY_COUNT,
  });
}

/** Fixed, safe messages only -- never forwards AiProviderError.message verbatim to the client. */
function mapAiErrorToApiError(error: AiProviderError): ApiError {
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
 * Application service between the API controller and AiProvider -- per the required layering,
 * this never touches Express Request/Response, never imports a Groq-specific type, and never
 * trusts a client-supplied provider/model (both come only from server configuration via the
 * factory). Telemetry logs and audits only safe metadata (provider, model, correlationId,
 * latency, token counts, outcome) -- never prompt/response content.
 */
export class AiTextGenerationService {
  constructor(private readonly provider: AiProvider | null = resolveProvider()) {}

  async generateText(userId: string, input: GenerateTextInput): Promise<GenerateTextResult> {
    if (!this.provider) {
      throw new ApiError('business', 503, 'AI generation is currently disabled.');
    }

    try {
      const result = await this.provider.generateText({
        systemPrompt: input.systemPrompt,
        userPrompt: input.userPrompt,
        temperature: input.temperature,
        maxOutputTokens: input.maxOutputTokens,
        correlationId: input.correlationId,
      });

      this.recordTelemetry(userId, input.correlationId, 'success', {
        provider: result.provider,
        model: result.model,
        latencyMs: result.latencyMs,
        tokens: result.usage,
      });

      return result;
    } catch (error) {
      if (error instanceof AiProviderError) {
        this.recordTelemetry(userId, input.correlationId, 'failure', { errorCode: error.code });
        throw mapAiErrorToApiError(error);
      }
      throw error;
    }
  }

  private recordTelemetry(
    userId: string,
    correlationId: string | undefined,
    outcome: 'success' | 'failure',
    metadata: Record<string, unknown>,
  ): void {
    const resource = correlationId ? `ai_generation:${correlationId}` : 'ai_generation';

    logger.info(
      { aiTelemetry: true, actor: userId, correlationId, outcome, ...metadata },
      'ai_text_generation',
    );

    // Meaningful event, not per-word noise -- one audit record per generation call, matching
    // this codebase's existing sensitive-operation convention (account.create, content_draft
    // approve/discard). Fixed {actor, action, resource, timestamp, result} shape per
    // packages/auth's AuditEvent interface -- richer metadata stays in the log line above.
    void auditLogger.record({
      actor: userId,
      action: 'ai.generate_text',
      resource,
      timestamp: new Date().toISOString(),
      result: outcome,
    });
  }
}
