/**
 * Public, application-facing text-generation capability -- sibling to, not a replacement for,
 * ModelProvider (model-provider.interface.ts). ModelProvider is the M1 agent pipeline's
 * internal, minimal completion primitive (FakeModelProvider -> SimpleAgentExecutor -> the four
 * M1 agents -> ContentService) and stays exactly as-is. AiProvider exists because that pipeline
 * was never designed to carry the richer shape a directly-exposed "generate text" API needs
 * (system/user prompt separation, temperature, usage/latency/finishReason, a correlation id) --
 * widening ModelProvider for this would risk the already-tested agent pipeline for a use case
 * it wasn't built for. Neither interface depends on the other; apps/api's
 * AiProviderModelAdapter bridges the agent pipeline onto this interface so it can use a real
 * model instead of FakeModelProvider (docs/architecture/035-agent-pipeline-real-provider-wiring.md).
 *
 * Deliberately scoped to one method, matching this package's existing convention of small,
 * single-purpose interface files (ModelProvider, AgentExecutor, Evaluator, PromptManager are
 * each separate). Future capabilities (chat, structured JSON output, image/video generation,
 * embeddings, tool calling) extend this boundary as new methods or new sibling interfaces later
 * -- not added speculatively now, and adding them later does not require changing this file's
 * existing shape or any of today's consumers.
 */
export interface GenerateTextRequest {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  correlationId?: string;
}

export interface GenerateTextResult {
  text: string;
  model: string;
  provider: string;
  finishReason?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  latencyMs: number;
}

export interface AiProvider {
  generateText(request: GenerateTextRequest): Promise<GenerateTextResult>;
}
