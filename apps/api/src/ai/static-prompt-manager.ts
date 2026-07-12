import type { PromptManager, PromptTemplate } from '@novalight/ai-core';

/**
 * In-memory PromptManager implementation. Per docs/architecture/social-ai-platform/
 * 020-ai-agent-specifications.md, each template is built from an explicit per-agent field
 * allow-list only -- see docs/product/mvp-social-ai/023-acceptance-criteria.md "Cross-Cutting"
 * (a Copywriter prompt must not include unrelated fields like Approval History, for example).
 * Every rendered prompt is prefixed with `[TEMPLATE:<id>]` so FakeModelProvider can dispatch
 * without any real NLP -- this marker is an internal contract between this file and
 * fake-model-provider.ts, not part of the packages/ai-core interface.
 */
class StaticPromptTemplate implements PromptTemplate {
  constructor(
    public readonly id: string,
    private readonly fields: readonly string[],
  ) {}

  render(variables: Record<string, string>): string {
    const lines = this.fields.map((field) => `${field}: ${variables[field] ?? ''}`);
    return `[TEMPLATE:${this.id}]\n${lines.join('\n')}`;
  }
}

const TEMPLATES: Record<string, StaticPromptTemplate> = {
  'brand-strategist-intake': new StaticPromptTemplate('brand-strategist-intake', [
    'vertical',
    'raw_tone_answer',
    'raw_audience_answer',
    'raw_visual_answer',
    'raw_offerings_answer',
  ]),
  'content-planner-ideation': new StaticPromptTemplate('content-planner-ideation', [
    'vertical',
    'tone_descriptors',
    'audience_description',
  ]),
  'copywriter-caption': new StaticPromptTemplate('copywriter-caption', [
    'topic',
    'tone_descriptors',
  ]),
  'visual-prompt-engineer-prompt': new StaticPromptTemplate('visual-prompt-engineer-prompt', [
    'topic',
    'visual_style_descriptors',
  ]),
};

export class StaticPromptManager implements PromptManager {
  async getTemplate(id: string): Promise<PromptTemplate> {
    const template = TEMPLATES[id];
    if (!template) {
      throw new Error(`No prompt template registered for id "${id}"`);
    }
    return template;
  }
}
