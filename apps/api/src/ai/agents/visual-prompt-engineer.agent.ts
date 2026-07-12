import { randomUUID } from 'node:crypto';
import type { AgentExecutor, PromptManager } from '@novalight/ai-core';

/**
 * Visual Prompt Engineer Agent -- per
 * docs/architecture/social-ai-platform/020-ai-agent-specifications.md §4. Produces textual
 * prompt only (Stage 1) -- does not call an image-generation vendor itself, per
 * docs/architecture/social-ai-platform/024-image-generation-integration.md §1.
 * Inputs (Stage 1 field allow-list): the selected idea's topic + brand visual style only.
 */
export interface VisualPromptDraftInput {
  topic: string;
  visualStyleDescriptors: string;
}

export class VisualPromptEngineerAgent {
  constructor(
    private readonly promptManager: PromptManager,
    private readonly agentExecutor: AgentExecutor,
  ) {}

  async draftVisualPrompt(input: VisualPromptDraftInput): Promise<string> {
    const template = await this.promptManager.getTemplate('visual-prompt-engineer-prompt');
    const prompt = template.render({
      topic: input.topic,
      visual_style_descriptors: input.visualStyleDescriptors,
    });

    const result = await this.agentExecutor.run({ id: randomUUID(), input: prompt });
    return result.output;
  }
}
