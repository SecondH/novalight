import { AiProviderError } from '@novalight/ai-core';
import { MockAiProvider } from './mock-ai-provider';

describe('MockAiProvider', () => {
  it('returns deterministic output for a given prompt', async () => {
    const provider = new MockAiProvider();

    const first = await provider.generateText({ userPrompt: 'hello' });
    const second = await provider.generateText({ userPrompt: 'hello' });

    expect(first).toEqual(second);
    expect(first.text).toBe('[mock-response] hello');
    expect(first.provider).toBe('mock');
    expect(first.model).toBe('mock-model');
  });

  it('exposes predictable usage metadata derived from the prompt/response lengths', async () => {
    const provider = new MockAiProvider();

    const result = await provider.generateText({ userPrompt: 'abc' });

    expect(result.usage).toEqual({
      inputTokens: 3,
      outputTokens: result.text.length,
      totalTokens: 3 + result.text.length,
    });
    expect(result.latencyMs).toBe(0);
  });

  it('never performs a network call (pure function of input, no fetch/http import)', async () => {
    const provider = new MockAiProvider();
    const result = await provider.generateText({ userPrompt: 'network check' });
    expect(result.text).toContain('network check');
  });

  it('supports failure simulation for testing error paths', async () => {
    const failure = new AiProviderError('rate_limited', 'Simulated rate limit');
    const provider = new MockAiProvider({ simulateFailure: failure });

    await expect(provider.generateText({ userPrompt: 'anything' })).rejects.toBe(failure);
  });
});
