/**
 * AI provider abstraction per ADR-009: "AI Interface -> Provider Strategy -> AI Vendor...
 * No application module may directly call AI APIs." Future providers named in ADR-009:
 * OpenAI, Claude, Gemini, Flux, Google Veo, Kling.
 *
 * No concrete provider implements this yet, and no paid API is called anywhere in this
 * package -- Phase 0 explicitly excludes AI generation features (Project Charter §5).
 * This interface exists so a future provider strategy can be added without redesigning
 * any consumer of AI capability.
 */
export interface ModelCompletionRequest {
  prompt: string;
  maxOutputTokens?: number;
}

export interface ModelCompletionResult {
  text: string;
  providerId: string;
}

export interface ModelProvider {
  readonly providerId: string;
  complete(request: ModelCompletionRequest): Promise<ModelCompletionResult>;
}
