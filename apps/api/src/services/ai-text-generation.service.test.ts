import { AiProviderError } from '@novalight/ai-core';
import type { AiProvider, GenerateTextResult } from '@novalight/ai-core';

jest.mock('../audit/pino-audit-logger', () => ({
  auditLogger: { record: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock('../config/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { AiTextGenerationService } from './ai-text-generation.service';
import { auditLogger } from '../audit/pino-audit-logger';
import { logger } from '../config/logger';

function fakeProvider(overrides: Partial<AiProvider> = {}): AiProvider {
  return {
    generateText: jest.fn().mockResolvedValue({
      text: 'generated text',
      model: 'test-model',
      provider: 'mock',
      finishReason: 'stop',
      usage: { inputTokens: 1, outputTokens: 2, totalTokens: 3 },
      latencyMs: 5,
    } satisfies GenerateTextResult),
    ...overrides,
  };
}

describe('AiTextGenerationService', () => {
  beforeEach(() => {
    (auditLogger.record as jest.Mock).mockClear();
    (logger.info as jest.Mock).mockClear();
    (logger.warn as jest.Mock).mockClear();
  });

  it('throws a 503 business error when AI is disabled (no provider constructed)', async () => {
    const service = new AiTextGenerationService(null);

    await expect(service.generateText('user-1', { userPrompt: 'hello' })).rejects.toMatchObject({
      statusCode: 503,
      category: 'business',
    });
  });

  it('returns the provider result unchanged and records safe telemetry only', async () => {
    const provider = fakeProvider();
    const service = new AiTextGenerationService(provider);

    const result = await service.generateText('user-1', {
      userPrompt: 'hello',
      correlationId: 'corr-1',
    });

    expect(result).toEqual({
      text: 'generated text',
      model: 'test-model',
      provider: 'mock',
      finishReason: 'stop',
      usage: { inputTokens: 1, outputTokens: 2, totalTokens: 3 },
      latencyMs: 5,
    });

    expect(auditLogger.record).toHaveBeenCalledWith(
      expect.objectContaining({
        actor: 'user-1',
        action: 'ai.generate_text',
        resource: 'ai_generation:corr-1',
        result: 'success',
      }),
    );

    const logCall = (logger.info as jest.Mock).mock.calls[0][0];
    expect(logCall).toMatchObject({
      provider: 'mock',
      model: 'test-model',
      correlationId: 'corr-1',
      latencyMs: 5,
    });
    // Never log prompt/response content -- only safe metadata.
    expect(JSON.stringify(logCall)).not.toContain('hello');
    expect(JSON.stringify(logCall)).not.toContain('generated text');
  });

  it('passes systemPrompt/temperature/maxOutputTokens/correlationId through to the provider', async () => {
    const provider = fakeProvider();
    const service = new AiTextGenerationService(provider);

    await service.generateText('user-1', {
      systemPrompt: 'Be concise.',
      userPrompt: 'hello',
      temperature: 0.5,
      maxOutputTokens: 100,
      correlationId: 'corr-2',
    });

    expect(provider.generateText).toHaveBeenCalledWith({
      systemPrompt: 'Be concise.',
      userPrompt: 'hello',
      temperature: 0.5,
      maxOutputTokens: 100,
      correlationId: 'corr-2',
    });
  });

  it.each([
    ['invalid_request', 400, 'validation'],
    ['rate_limited', 429, 'business'],
    ['timeout', 504, 'business'],
    ['network_error', 502, 'business'],
    ['upstream_error', 502, 'business'],
    ['configuration_error', 500, 'system'],
  ] as const)(
    'maps AiProviderError(%s) to %i (%s), never leaking the vendor message',
    async (code, statusCode, category) => {
      const secretDetail = 'vendor-internal-detail';
      const provider = fakeProvider({
        generateText: jest.fn().mockRejectedValue(new AiProviderError(code, secretDetail)),
      });
      const service = new AiTextGenerationService(provider);

      let caught: unknown;
      try {
        await service.generateText('user-1', { userPrompt: 'hello' });
      } catch (error) {
        caught = error;
      }

      expect(caught).toMatchObject({ statusCode, category });
      expect((caught as Error).message).not.toContain(secretDetail);
      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ai.generate_text', result: 'failure' }),
      );
    },
  );

  it('propagates a non-AiProviderError without mapping or swallowing it', async () => {
    const provider = fakeProvider({
      generateText: jest.fn().mockRejectedValue(new Error('unexpected bug')),
    });
    const service = new AiTextGenerationService(provider);

    await expect(service.generateText('user-1', { userPrompt: 'hello' })).rejects.toThrow(
      'unexpected bug',
    );
  });
});
