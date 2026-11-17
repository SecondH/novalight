import { randomUUID } from 'node:crypto';
import type { AgentExecutor, PromptManager } from '@novalight/ai-core';
import { parseTextModelOutput } from '../parse-model-output';

/**
 * Matches the owner's own draft-edit limit (content.validators.ts draftEditSchema), so a generated
 * caption is always one the owner can also save edits to. Below Instagram's 2,200-character cap.
 */
const MAX_CAPTION_LENGTH = 2000;

/**
 * Copywriter Agent -- per docs/architecture/social-ai-platform/020-ai-agent-specifications.md §3.
 * Inputs (Stage 1 field allow-list): the selected idea's topic + brand tone only -- not
 * audience, visual style, or any other Brand field, per
 * docs/product/mvp-social-ai/023-acceptance-criteria.md "Cross-Cutting".
 */
export interface CaptionDraftInput {
  topic: string;
  toneDescriptors: string;
}

export class CopywriterAgent {
  constructor(
    private readonly promptManager: PromptManager,
    private readonly agentExecutor: AgentExecutor,
  ) {}

  async draftCaption(input: CaptionDraftInput): Promise<string> {
    const template = await this.promptManager.getTemplate('copywriter-caption');
    const prompt = template.render({ topic: input.topic, tone_descriptors: input.toneDescriptors });

    const result = await this.agentExecutor.run({ id: randomUUID(), input: prompt });
    return parseTextModelOutput(result.output, MAX_CAPTION_LENGTH);
  }
}
