import type {
  AiProvider,
  ModelCompletionRequest,
  ModelCompletionResult,
  ModelProvider,
} from '@novalight/ai-core';

/** Minimal structured-logger shape (pino-compatible) -- injected so this class stays unit-testable. */
export interface TelemetryLogger {
  info(metadata: Record<string, unknown>, message: string): void;
}

export interface AiProviderModelAdapterConfig {
  maxOutputTokens: number;
  temperature?: number;
  /** Sent with every completion; owned by the prompt layer (see AGENT_SYSTEM_PROMPT in static-prompt-manager.ts). */
  systemPrompt?: string;
  logger?: TelemetryLogger;
}

/**
 * Bridges the M1 agent pipeline's ModelProvider interface onto the richer AiProvider interface
 * (GroqAiProvider today), as anticipated in packages/ai-core/src/ai-provider.interface.ts. Lets
 * BrandStrategist/ContentPlanner/Copywriter/VisualPromptEngineer run against a real model
 * without changing any agent or any packages/ai-core interface. AiProviderError from the
 * underlying provider propagates unchanged -- callers map it via ai-error-mapping.ts.
 *
 * Telemetry logs only safe metadata (provider, model, latency, token counts) -- never prompt or
 * response content, which contains the business owner's own data.
 */
export class AiProviderModelAdapter implements ModelProvider {
  readonly providerId: string;

  constructor(
    private readonly aiProvider: AiProvider,
    providerName: string,
    private readonly config: AiProviderModelAdapterConfig,
  ) {
    this.providerId = providerName;
  }

  async complete(request: ModelCompletionRequest): Promise<ModelCompletionResult> {
    const result = await this.aiProvider.generateText({
      systemPrompt: this.config.systemPrompt,
      userPrompt: request.prompt,
      temperature: this.config.temperature,
      maxOutputTokens: request.maxOutputTokens ?? this.config.maxOutputTokens,
    });

    this.config.logger?.info(
      {
        aiTelemetry: true,
        source: 'agent-pipeline',
        provider: result.provider,
        model: result.model,
        finishReason: result.finishReason,
        latencyMs: result.latencyMs,
        tokens: result.usage,
      },
      'ai_agent_completion',
    );

    return { text: result.text, providerId: result.provider };
  }
}
