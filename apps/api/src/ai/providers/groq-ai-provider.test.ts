import { AiProviderError } from '@novalight/ai-core';

const createCompletion = jest.fn();

jest.mock('groq-sdk', () => {
  class MockAPIError extends Error {}
  class RateLimitError extends MockAPIError {}
  class AuthenticationError extends MockAPIError {}
  class PermissionDeniedError extends MockAPIError {}
  class NotFoundError extends MockAPIError {}
  class BadRequestError extends MockAPIError {}
  class ConflictError extends MockAPIError {}
  class UnprocessableEntityError extends MockAPIError {}
  class InternalServerError extends MockAPIError {}
  class APIConnectionError extends MockAPIError {}
  class APIConnectionTimeoutError extends APIConnectionError {}
  class APIUserAbortError extends MockAPIError {}

  return {
    Groq: jest.fn().mockImplementation(() => ({
      chat: { completions: { create: (...args: unknown[]) => createCompletion(...args) } },
    })),
    RateLimitError,
    AuthenticationError,
    PermissionDeniedError,
    NotFoundError,
    BadRequestError,
    ConflictError,
    UnprocessableEntityError,
    InternalServerError,
    APIConnectionError,
    APIConnectionTimeoutError,
    APIUserAbortError,
  };
});

import { GroqAiProvider } from './groq-ai-provider';
import {
  RateLimitError,
  AuthenticationError,
  BadRequestError,
  InternalServerError,
  APIUserAbortError,
} from 'groq-sdk';

// The real groq-sdk .d.ts types these constructors as APIError<status, headers>(status, error,
// message, headers) -- 4 args. At runtime (mocked above) they're plain single-arg Error
// subclasses, so TypeScript's static types don't match the mock's actual shape. This helper
// bypasses that mismatch in one place rather than casting at every call site.
function makeError<T extends Error>(Ctor: new (...args: never[]) => T, message?: string): T {
  return new (Ctor as unknown as new (message?: string) => T)(message);
}

function successfulCompletion(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    model: 'llama-3.1-8b-instant',
    choices: [{ message: { content: 'Hello from Groq' }, finish_reason: 'stop' }],
    usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    ...overrides,
  };
}

describe('GroqAiProvider', () => {
  const baseConfig = {
    apiKey: 'test-key',
    model: 'llama-3.1-8b-instant',
    timeoutMs: 200,
    retryCount: 1,
  };

  beforeEach(() => {
    createCompletion.mockReset();
  });

  it('normalizes a successful Groq response into GenerateTextResult', async () => {
    createCompletion.mockResolvedValue(successfulCompletion());
    const provider = new GroqAiProvider(baseConfig);

    const result = await provider.generateText({ userPrompt: 'Say hello' });

    expect(result).toMatchObject({
      text: 'Hello from Groq',
      model: 'llama-3.1-8b-instant',
      provider: 'groq',
      finishReason: 'stop',
      usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
    });
    expect(typeof result.latencyMs).toBe('number');
  });

  it('sends system and user messages separately when systemPrompt is provided', async () => {
    createCompletion.mockResolvedValue(successfulCompletion());
    const provider = new GroqAiProvider(baseConfig);

    await provider.generateText({ systemPrompt: 'Be concise.', userPrompt: 'Say hello' });

    expect(createCompletion).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          { role: 'system', content: 'Be concise.' },
          { role: 'user', content: 'Say hello' },
        ],
      }),
      expect.anything(),
    );
  });

  it('times out via AbortSignal and throws a normalized timeout error', async () => {
    createCompletion.mockImplementation((_body: unknown, options: { signal: AbortSignal }) => {
      return new Promise((_resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(makeError(APIUserAbortError)));
      });
    });
    const provider = new GroqAiProvider({ ...baseConfig, retryCount: 0, timeoutMs: 20 });

    await expect(provider.generateText({ userPrompt: 'slow' })).rejects.toMatchObject({
      code: 'timeout',
    });
  });

  it('retries exactly once on a transient failure (rate limit) and returns the success', async () => {
    createCompletion
      .mockRejectedValueOnce(makeError(RateLimitError))
      .mockResolvedValueOnce(successfulCompletion());
    const provider = new GroqAiProvider({ ...baseConfig, retryCount: 1 });

    const result = await provider.generateText({ userPrompt: 'retry me' });

    expect(result.text).toBe('Hello from Groq');
    expect(createCompletion).toHaveBeenCalledTimes(2);
  });

  it('does not retry a 400-shaped failure and normalizes it without leaking the vendor message', async () => {
    createCompletion.mockRejectedValue(
      makeError(BadRequestError, 'raw vendor detail, must not leak'),
    );
    const provider = new GroqAiProvider({ ...baseConfig, retryCount: 1 });

    await expect(provider.generateText({ userPrompt: 'bad' })).rejects.toMatchObject({
      code: 'invalid_request',
    });
    expect(createCompletion).toHaveBeenCalledTimes(1);
  });

  it('does not retry a 401-shaped failure and classifies it as a configuration error', async () => {
    createCompletion.mockRejectedValue(makeError(AuthenticationError, 'raw vendor detail'));
    const provider = new GroqAiProvider({ ...baseConfig, retryCount: 1 });

    await expect(provider.generateText({ userPrompt: 'auth' })).rejects.toMatchObject({
      code: 'configuration_error',
    });
    expect(createCompletion).toHaveBeenCalledTimes(1);
  });

  it('exhausts the bounded retry on repeated 5xx failures and throws upstream_error', async () => {
    createCompletion.mockRejectedValue(makeError(InternalServerError));
    const provider = new GroqAiProvider({ ...baseConfig, retryCount: 1 });

    await expect(provider.generateText({ userPrompt: 'flaky' })).rejects.toBeInstanceOf(
      AiProviderError,
    );
    expect(createCompletion).toHaveBeenCalledTimes(2); // initial attempt + exactly one retry
  });

  it('never includes the raw vendor error message in the thrown AiProviderError', async () => {
    const secretDetail = 'internal trace id abc123 leaked from vendor';
    createCompletion.mockRejectedValue(makeError(BadRequestError, secretDetail));
    const provider = new GroqAiProvider(baseConfig);

    await expect(provider.generateText({ userPrompt: 'x' })).rejects.not.toMatchObject({
      message: expect.stringContaining(secretDetail),
    });
  });
});
