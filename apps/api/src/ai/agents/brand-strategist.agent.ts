import { randomUUID } from 'node:crypto';
import type { AgentExecutor, PromptManager } from '@novalight/ai-core';
import type { Vertical } from '@novalight/database';

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
    return JSON.parse(result.output) as BrandProfileDraft;
  }
}
