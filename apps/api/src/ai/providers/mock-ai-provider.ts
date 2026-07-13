import type { AiProvider, GenerateTextRequest, GenerateTextResult } from '@novalight/ai-core';
import { AiProviderError } from '@novalight/ai-core';

export interface MockAiProviderOptions {
  /**
   * When set, generateText rejects with this error instead of returning a result -- lets tests
   * simulate provider failures (rate limits, timeouts, etc.) without any real network dependency.
   */
  simulateFailure?: AiProviderError;
}

/**
 * Deterministic, network-free AiProvider for unit tests, CI, and local development without
 * consuming Groq quota. Output is a pure function of the request (no randomness, no real clock
 * dependency -- latencyMs is always 0) so assertions can compare exact values.
 */
export class MockAiProvider implements AiProvider {
  constructor(private readonly options: MockAiProviderOptions = {}) {}

  async generateText(request: GenerateTextRequest): Promise<GenerateTextResult> {
    if (this.options.simulateFailure) {
      throw this.options.simulateFailure;
    }

    const text = `[mock-response] ${request.userPrompt}`;
    return {
      text,
      model: 'mock-model',
      provider: 'mock',
      finishReason: 'stop',
      usage: {
        inputTokens: request.userPrompt.length,
        outputTokens: text.length,
        totalTokens: request.userPrompt.length + text.length,
      },
      latencyMs: 0,
    };
  }
}
