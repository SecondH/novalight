import type {
  ModelCompletionRequest,
  ModelCompletionResult,
  ModelProvider,
} from '@novalight/ai-core';

/**
 * Test/fake ModelProvider only -- per explicit instruction, no external AI vendor is
 * integrated in M1 (docs/architecture/social-ai-platform/028-m1-technical-design.md §5).
 * Deterministic: dispatches on the `[TEMPLATE:<id>]` marker line that
 * StaticPromptManager-rendered prompts always start with (see static-prompt-manager.ts),
 * so tests can assert exact output without any real model call. No paid API, no network call.
 */
export class FakeModelProvider implements ModelProvider {
  readonly providerId = 'fake-test-provider';

  async complete(request: ModelCompletionRequest): Promise<ModelCompletionResult> {
    const templateMatch = /^\[TEMPLATE:([a-z-]+)\]\n([\s\S]*)$/.exec(request.prompt);
    if (!templateMatch) {
      throw new Error('FakeModelProvider requires a prompt built by StaticPromptManager templates');
    }
    const [, templateId, body] = templateMatch;

    return {
      providerId: this.providerId,
      text: this.respondTo(templateId ?? '', body ?? ''),
    };
  }

  private respondTo(templateId: string, body: string): string {
    switch (templateId) {
      case 'brand-strategist-intake':
        return this.respondBrandStrategist(body);
      case 'content-planner-ideation':
        return this.respondContentPlanner(body);
      case 'copywriter-caption':
        return this.respondCopywriter(body);
      case 'visual-prompt-engineer-prompt':
        return this.respondVisualPromptEngineer(body);
      default:
        throw new Error(`FakeModelProvider has no canned response for template "${templateId}"`);
    }
  }

  private extract(body: string, field: string): string {
    const match = new RegExp(`^${field}: (.*)$`, 'm').exec(body);
    return match?.[1]?.trim() ?? '';
  }

  private respondBrandStrategist(body: string): string {
    const vertical = this.extract(body, 'vertical');
    const rawTone = this.extract(body, 'raw_tone_answer');
    const rawAudience = this.extract(body, 'raw_audience_answer');
    const rawVisual = this.extract(body, 'raw_visual_answer');
    const rawOfferings = this.extract(body, 'raw_offerings_answer');

    return JSON.stringify({
      toneDescriptors: rawTone || `Professional, approachable tone typical of a ${vertical}`,
      audienceDescription: rawAudience || `Local customers of a ${vertical}`,
      visualStyleDescriptors: rawVisual || `Clean, on-brand visuals typical of a ${vertical}`,
      offeringsSummary: rawOfferings || `Core services/products of a ${vertical}`,
    });
  }

  private respondContentPlanner(body: string): string {
    const vertical = this.extract(body, 'vertical');
    const tone = this.extract(body, 'tone_descriptors');
    return JSON.stringify([
      {
        topic: `Highlight a signature offering (${vertical})`,
        intendedFormat: 'photo-post',
      },
      {
        topic: `Behind-the-scenes moment, in a ${tone} voice`,
        intendedFormat: 'photo-post',
      },
    ]);
  }

  private respondCopywriter(body: string): string {
    const topic = this.extract(body, 'topic');
    const tone = this.extract(body, 'tone_descriptors');
    return `${topic} — written in a ${tone} tone. (fake-provider caption for testing only)`;
  }

  private respondVisualPromptEngineer(body: string): string {
    const topic = this.extract(body, 'topic');
    const visualStyle = this.extract(body, 'visual_style_descriptors');
    return `A photo depicting: ${topic}. Visual style: ${visualStyle}. (fake-provider prompt for testing only)`;
  }
}
