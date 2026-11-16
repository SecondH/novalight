import { AiProviderError } from '@novalight/ai-core';
import {
  createAgentModelProvider,
  DisabledModelProvider,
  type AgentModelProviderConfig,
} from './agent-model-provider-factory';
import { ApiError } from '../middlewares/error-handler';
import { FakeModelProvider } from './fake-model-provider';
import { AiProviderModelAdapter } from './ai-provider-model-adapter';
import { MockAiProvider } from './providers/mock-ai-provider';

const base: AgentModelProviderConfig = {
  aiEnabled: false,
  allowFakeProvider: true,
  provider: 'mock',
  timeoutMs: 1000,
  retryCount: 0,
  maxOutputTokens: 500,
};

describe('createAgentModelProvider', () => {
  it('uses FakeModelProvider when AI is disabled, even if the provider is groq', () => {
    const createProvider = jest.fn();
    const provider = createAgentModelProvider({ ...base, provider: 'groq', createProvider });
    expect(provider).toBeInstanceOf(FakeModelProvider);
    expect(createProvider).not.toHaveBeenCalled();
  });

  it('uses FakeModelProvider for AI_PROVIDER=mock (MockAiProvider echoes, it does not produce agent output)', () => {
    expect(createAgentModelProvider({ ...base, aiEnabled: true })).toBeInstanceOf(
      FakeModelProvider,
    );
  });

  it('wraps the configured provider in the adapter when AI is enabled with groq', () => {
    const createProvider = jest.fn(() => new MockAiProvider());
    const provider = createAgentModelProvider({
      ...base,
      aiEnabled: true,
      provider: 'groq',
      groqApiKey: 'test-key',
      groqModel: 'test-model',
      createProvider,
    });

    expect(provider).toBeInstanceOf(AiProviderModelAdapter);
    expect(provider.providerId).toBe('groq');
    expect(createProvider).toHaveBeenCalledWith({
      provider: 'groq',
      groqApiKey: 'test-key',
      groqModel: 'test-model',
      timeoutMs: 1000,
      retryCount: 0,
    });
  });

  it('in production (fake not allowed), AI off yields a provider that answers 503 instead of canned output', async () => {
    const provider = createAgentModelProvider({ ...base, allowFakeProvider: false });
    expect(provider).toBeInstanceOf(DisabledModelProvider);
    await expect(provider.complete({ prompt: 'p' })).rejects.toMatchObject({
      statusCode: 503,
    });
    await expect(provider.complete({ prompt: 'p' })).rejects.toBeInstanceOf(ApiError);
  });

  it('fails closed (no silent fallback to canned output) when groq is enabled but misconfigured', () => {
    expect(() => createAgentModelProvider({ ...base, aiEnabled: true, provider: 'groq' })).toThrow(
      AiProviderError,
    );
  });
});
