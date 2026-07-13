import { Groq } from 'groq-sdk';
import {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIUserAbortError,
  AuthenticationError,
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  PermissionDeniedError,
  RateLimitError,
  UnprocessableEntityError,
} from 'groq-sdk';
import type { AiProvider, GenerateTextRequest, GenerateTextResult } from '@novalight/ai-core';
import { AiProviderError, RETRYABLE_AI_ERROR_CODES, type AiErrorCode } from '@novalight/ai-core';

export interface GroqAiProviderConfig {
  apiKey: string;
  model: string;
  timeoutMs: number;
  retryCount: number;
}

/**
 * Maps groq-sdk's own error hierarchy (verified against its shipped type definitions, not
 * assumed) to the vendor-neutral AiErrorCode taxonomy. Never inspects/forwards the vendor's own
 * message or response body -- callers only see safeMessageFor()'s fixed text.
 */
function classify(error: unknown): AiErrorCode {
  if (error instanceof APIConnectionTimeoutError || error instanceof APIUserAbortError) {
    return 'timeout';
  }
  if (error instanceof APIConnectionError) {
    return 'network_error';
  }
  if (error instanceof RateLimitError) {
    return 'rate_limited';
  }
  if (error instanceof InternalServerError) {
    return 'upstream_error';
  }
  if (
    error instanceof AuthenticationError ||
    error instanceof PermissionDeniedError ||
    error instanceof NotFoundError
  ) {
    // Our key is invalid/lacks access, or the configured model id doesn't exist for this
    // account -- a NovaLight configuration problem, not something the caller's request caused.
    return 'configuration_error';
  }
  if (
    error instanceof BadRequestError ||
    error instanceof UnprocessableEntityError ||
    error instanceof ConflictError
  ) {
    // Includes content-policy-style rejections -- never retried, per requirement.
    return 'invalid_request';
  }
  return 'upstream_error'; // Unrecognized shape -- treat conservatively, still safe-messaged.
}

function safeMessageFor(code: AiErrorCode): string {
  switch (code) {
    case 'invalid_request':
      return 'The AI provider rejected the request.';
    case 'rate_limited':
      return 'The AI provider is rate-limiting requests. Please try again shortly.';
    case 'timeout':
      return 'The AI provider did not respond in time.';
    case 'network_error':
      return 'A network error occurred while contacting the AI provider.';
    case 'configuration_error':
      return 'The AI provider is misconfigured.';
    case 'upstream_error':
    default:
      return 'The AI provider returned an unexpected error.';
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Short exponential backoff with jitter: ~250ms, ~500ms, ... plus up to 50% random jitter. */
function backoffWithJitter(attempt: number): number {
  const base = 250 * 2 ** attempt;
  return base + Math.random() * base * 0.5;
}

/**
 * Server-side only -- never import from apps/web. API key/model/timeout/retry are injected via
 * config, never read from process.env directly inside this class (the factory reads env once,
 * at the boundary). No Groq-specific type escapes generateText's return value or thrown errors.
 */
export class GroqAiProvider implements AiProvider {
  private readonly client: Groq;

  constructor(private readonly config: GroqAiProviderConfig) {
    // maxRetries: 0 -- this class owns retry policy entirely (bounded, transient-only, jittered
    // backoff per requirement); the SDK's own built-in retry (default 2, per its shipped types)
    // would double up with ours and doesn't distinguish "transient" from "never retry" the way
    // this task requires.
    this.client = new Groq({ apiKey: config.apiKey, timeout: config.timeoutMs, maxRetries: 0 });
  }

  async generateText(request: GenerateTextRequest): Promise<GenerateTextResult> {
    const messages: Array<{ role: 'system'; content: string } | { role: 'user'; content: string }> =
      [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.userPrompt });

    const startedAt = Date.now();
    let lastErrorCode: AiErrorCode = 'upstream_error';

    for (let attempt = 0; attempt <= this.config.retryCount; attempt++) {
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), this.config.timeoutMs);
      try {
        const completion = await this.client.chat.completions.create(
          {
            model: this.config.model,
            messages,
            temperature: request.temperature,
            max_completion_tokens: request.maxOutputTokens,
          },
          { signal: controller.signal },
        );
        clearTimeout(timeoutHandle);

        const choice = completion.choices[0];
        return {
          text: choice?.message?.content ?? '',
          model: completion.model,
          provider: 'groq',
          finishReason: choice?.finish_reason,
          usage: completion.usage
            ? {
                inputTokens: completion.usage.prompt_tokens,
                outputTokens: completion.usage.completion_tokens,
                totalTokens: completion.usage.total_tokens,
              }
            : undefined,
          latencyMs: Date.now() - startedAt,
        };
      } catch (error) {
        clearTimeout(timeoutHandle);
        const code = classify(error);
        lastErrorCode = code;
        const isLastAttempt = attempt === this.config.retryCount;
        if (!RETRYABLE_AI_ERROR_CODES.has(code) || isLastAttempt) {
          throw new AiProviderError(code, safeMessageFor(code));
        }
        await sleep(backoffWithJitter(attempt));
      }
    }

    // Unreachable -- the loop above always returns or throws. Kept only so TypeScript's control
    // flow analysis sees every path returning/throwing.
    throw new AiProviderError(lastErrorCode, safeMessageFor(lastErrorCode));
  }
}
