import { AiProviderError } from '@novalight/ai-core';
import { createAiProvider } from './ai-provider-factory';
import { MockAiProvider } from './mock-ai-provider';
import { GroqAiProvider } from './groq-ai-provider';

const baseConfig = { timeoutMs: 30_000, retryCount: 1 };

describe('createAiProvider', () => {
  it('selects MockAiProvider when provider is "mock"', () => {
    const provider = createAiProvider({ ...baseConfig, provider: 'mock' });
    expect(provider).toBeInstanceOf(MockAiProvider);
  });

  it('selects GroqAiProvider when provider is "groq" with a valid key and model', () => {
    const provider = createAiProvider({
      ...baseConfig,
      provider: 'groq',
      groqApiKey: 'gsk_test',
      groqModel: 'llama-3.1-8b-instant',
    });
    expect(provider).toBeInstanceOf(GroqAiProvider);
  });

  it('fails closed when provider is "groq" without an API key', () => {
    expect(() =>
      createAiProvider({ ...baseConfig, provider: 'groq', groqModel: 'llama-3.1-8b-instant' }),
    ).toThrow(AiProviderError);
  });

  it('fails closed when provider is "groq" without a model', () => {
    expect(() =>
      createAiProvider({ ...baseConfig, provider: 'groq', groqApiKey: 'gsk_test' }),
    ).toThrow(AiProviderError);
  });

  it('fails closed on an unknown provider name rather than defaulting to mock', () => {
    let caught: unknown;
    try {
      createAiProvider({ ...baseConfig, provider: 'openai' });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(AiProviderError);
    expect((caught as AiProviderError).code).toBe('configuration_error');
  });
});
