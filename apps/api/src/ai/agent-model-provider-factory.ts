import type {
  AiProvider,
  ModelCompletionRequest,
  ModelCompletionResult,
  ModelProvider,
} from '@novalight/ai-core';
import { ApiError } from '../middlewares/error-handler';
import { createAiProvider } from './providers/ai-provider-factory';
import { FakeModelProvider } from './fake-model-provider';
import { AiProviderModelAdapter, type TelemetryLogger } from './ai-provider-model-adapter';
import { AGENT_SYSTEM_PROMPT } from './static-prompt-manager';

export interface AgentModelProviderConfig {
  aiEnabled: boolean;
  /**
   * Whether canned FakeModelProvider output may stand in when Groq is not selected. False in
   * production: there, AI off means generation answers 503, never fake data stored as a real
   * brand profile or content.
   */
  allowFakeProvider: boolean;
  provider: string;
  groqApiKey?: string;
  groqModel?: string;
  timeoutMs: number;
  retryCount: number;
  maxOutputTokens: number;
  logger?: TelemetryLogger;
  /** Injection point for tests; defaults to the real factory. */
  createProvider?: typeof createAiProvider;
}

/**
 * Stands in when AI is off and canned output is not allowed (production). Every call fails with
 * the same 503 the generic /ai/text/generate endpoint returns when disabled, so an operator
 * flipping AI_ENABLED=false as a kill switch stops generation instead of storing fake content.
 */
export class DisabledModelProvider implements ModelProvider {
  readonly providerId = 'disabled';

  async complete(_request: ModelCompletionRequest): Promise<ModelCompletionResult> {
    throw new ApiError('business', 503, 'AI generation is currently disabled.');
  }
}

/** Moderate creativity: content ideas/captions should vary, but stay on-brief. */
const AGENT_TEMPERATURE = 0.7;

/**
 * Selects the ModelProvider behind the Brand/Content agent pipeline. Explicit rule, no hidden
 * fallback on error:
 *
 *   AI_ENABLED=true AND AI_PROVIDER=groq  -> real Groq, via AiProviderModelAdapter
 *   anything else, outside production     -> FakeModelProvider (deterministic canned output)
 *   anything else, in production          -> DisabledModelProvider (every call -> 503)
 *
 * AI_PROVIDER=mock maps to FakeModelProvider, not MockAiProvider: MockAiProvider echoes the
 * prompt, which is not the structured output the agents parse. A misconfigured Groq setup
 * (missing key/model) throws at construction -- the server fails at startup, it does not
 * silently drop back to canned output.
 */
export function createAgentModelProvider(config: AgentModelProviderConfig): ModelProvider {
  if (!config.aiEnabled || config.provider !== 'groq') {
    return config.allowFakeProvider ? new FakeModelProvider() : new DisabledModelProvider();
  }

  const aiProvider: AiProvider = (config.createProvider ?? createAiProvider)({
    provider: config.provider,
    groqApiKey: config.groqApiKey,
    groqModel: config.groqModel,
    timeoutMs: config.timeoutMs,
    retryCount: config.retryCount,
  });

  return new AiProviderModelAdapter(aiProvider, config.provider, {
    maxOutputTokens: config.maxOutputTokens,
    temperature: AGENT_TEMPERATURE,
    systemPrompt: AGENT_SYSTEM_PROMPT,
    logger: config.logger,
  });
}
