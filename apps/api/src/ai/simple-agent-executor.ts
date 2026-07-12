import type { AgentExecutor, AgentResult, AgentTask, ModelProvider } from '@novalight/ai-core';

/**
 * Concrete AgentExecutor composing PromptManager + ModelProvider, per
 * docs/architecture/social-ai-platform/019-ai-agent-architecture.md (ADR-017) -- the
 * packages/ai-core interfaces stay generic; this implementation lives in apps/api as the
 * consumer. AgentTask.input is expected to already be a rendered prompt (built by the
 * per-agent classes in ./agents/ via PromptManager) -- this class does not itself call
 * PromptManager; it takes the executor role of ADR-017's diagram
 * ("AgentExecutor <- PromptManager <- ModelProvider" collapses here to AgentExecutor wrapping
 * ModelProvider directly, since template rendering already happened by the time run() is called).
 */
export class SimpleAgentExecutor implements AgentExecutor {
  constructor(private readonly modelProvider: ModelProvider) {}

  async run(task: AgentTask): Promise<AgentResult> {
    const completion = await this.modelProvider.complete({ prompt: task.input });
    return { taskId: task.id, output: completion.text };
  }
}
