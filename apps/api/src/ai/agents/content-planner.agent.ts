import { randomUUID } from 'node:crypto';
import type { AgentExecutor, PromptManager } from '@novalight/ai-core';
import type { Vertical } from '@novalight/database';
import { z } from 'zod';
import { parseJsonModelOutput } from '../parse-model-output';
import { CONTENT_IDEA_FORMATS } from '../static-prompt-manager';

/**
 * Content Planner Agent -- per docs/architecture/social-ai-platform/020-ai-agent-specifications.md §2.
 * Inputs (Stage 1 field allow-list): brand profile's vertical/tone/audience only -- not the
 * full Brand record, not Approval History (Stage 2+), per
 * docs/product/mvp-social-ai/023-acceptance-criteria.md "Cross-Cutting".
 */
export interface ContentIdeationInput {
  vertical: Vertical;
  toneDescriptors: string;
  audienceDescription: string;
}

export interface ContentIdeaSuggestion {
  topic: string;
  intendedFormat: string;
}

const ideaSchema = z.object({
  topic: z.string().trim().min(1).max(300),
  intendedFormat: z.enum(CONTENT_IDEA_FORMATS),
});
const ideaListSchema = z.array(ideaSchema).min(1).max(10);

/**
 * Model output is untrusted input. Accepts a bare array (the requested shape) or an
 * `{ "ideas": [...] }` wrapper, which JSON-mode-leaning models commonly produce instead.
 */
const contentIdeasOutputSchema = z.union([
  ideaListSchema,
  z.object({ ideas: ideaListSchema }).transform((wrapped) => wrapped.ideas),
]);

export class ContentPlannerAgent {
  constructor(
    private readonly promptManager: PromptManager,
    private readonly agentExecutor: AgentExecutor,
  ) {}

  async generateIdeas(input: ContentIdeationInput): Promise<ContentIdeaSuggestion[]> {
    const template = await this.promptManager.getTemplate('content-planner-ideation');
    const prompt = template.render({
      vertical: input.vertical,
      tone_descriptors: input.toneDescriptors,
      audience_description: input.audienceDescription,
    });

    const result = await this.agentExecutor.run({ id: randomUUID(), input: prompt });
    return parseJsonModelOutput(result.output, contentIdeasOutputSchema);
  }
}
