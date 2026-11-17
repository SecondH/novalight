import { randomUUID } from 'node:crypto';
import type { AgentExecutor, PromptManager } from '@novalight/ai-core';
import type { Vertical } from '@novalight/database';
import { z } from 'zod';
import { parseJsonModelOutput } from '../parse-model-output';

/**
 * Brand Strategist Agent -- per docs/architecture/social-ai-platform/020-ai-agent-specifications.md §1.
 * Responsibility: interpret guided brand-intake answers into a structured brand profile.
 * Inputs: raw brand-intake answers (Stage 1 field allow-list below -- no other account data).
 * Outputs: structured brand profile fields, for the caller to persist via BrandsRepository.
 */
export interface BrandIntakeInput {
  vertical: Vertical;
  rawToneAnswer: string;
  rawAudienceAnswer: string;
  rawVisualAnswer: string;
  rawOfferingsAnswer: string;
}

export interface BrandProfileDraft {
  toneDescriptors: string;
  audienceDescription: string;
  visualStyleDescriptors: string;
  offeringsSummary: string;
}

const profileField = z.string().trim().min(1).max(1000);

/** Model output is untrusted input -- validated before it is persisted as the brand profile. */
const brandProfileDraftSchema = z.object({
  toneDescriptors: profileField,
  audienceDescription: profileField,
  visualStyleDescriptors: profileField,
  offeringsSummary: profileField,
});

export class BrandStrategistAgent {
  constructor(
    private readonly promptManager: PromptManager,
    private readonly agentExecutor: AgentExecutor,
  ) {}

  async interpretIntake(input: BrandIntakeInput): Promise<BrandProfileDraft> {
    const template = await this.promptManager.getTemplate('brand-strategist-intake');
    const prompt = template.render({
      vertical: input.vertical,
      raw_tone_answer: input.rawToneAnswer,
      raw_audience_answer: input.rawAudienceAnswer,
      raw_visual_answer: input.rawVisualAnswer,
      raw_offerings_answer: input.rawOfferingsAnswer,
    });

    const result = await this.agentExecutor.run({ id: randomUUID(), input: prompt });
    return parseJsonModelOutput(result.output, brandProfileDraftSchema);
  }
}
