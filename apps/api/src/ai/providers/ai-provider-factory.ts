import type { AiProvider } from '@novalight/ai-core';
import { AiProviderError } from '@novalight/ai-core';
import { MockAiProvider } from './mock-ai-provider';
import { GroqAiProvider } from './groq-ai-provider';

export interface AiProviderFactoryConfig {
  // Deliberately a plain string, not the narrower 'mock' | 'groq' union env.ts's Zod schema
  // enforces -- keeps this function unit-testable against genuinely unknown values, even though
  // in production an invalid value never reaches here (env.ts's enum already fails fast first).
  provider: string;
  groqApiKey?: string;
  groqModel?: string;
  timeoutMs: number;
  retryCount: number;
}

/**
 * Explicit provider selection only -- no hidden fallback, no automatic Mock substitution when
 * Groq is misconfigured. Every failure path throws AiProviderError('configuration_error', ...)
 * rather than silently degrading, per ADR-029-adjacent fail-closed conventions already
 * established in this codebase (env.ts's own loadEnv() fails fast the same way).
 */
export function createAiProvider(config: AiProviderFactoryConfig): AiProvider {
  switch (config.provider) {
    case 'mock':
      return new MockAiProvider();
    case 'groq': {
      if (!config.groqApiKey || !config.groqModel) {
        throw new AiProviderError(
          'configuration_error',
          'AI_PROVIDER=groq requires both GROQ_API_KEY and GROQ_MODEL to be set.',
        );
      }
      return new GroqAiProvider({
        apiKey: config.groqApiKey,
        model: config.groqModel,
        timeoutMs: config.timeoutMs,
        retryCount: config.retryCount,
      });
    }
    default:
      throw new AiProviderError('configuration_error', `Unknown AI provider: "${config.provider}"`);
  }
}
