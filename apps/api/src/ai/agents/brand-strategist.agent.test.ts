import { BrandStrategistAgent } from './brand-strategist.agent';
import { StaticPromptManager } from '../static-prompt-manager';
import { SimpleAgentExecutor } from '../simple-agent-executor';
import { FakeModelProvider } from '../fake-model-provider';

describe('BrandStrategistAgent', () => {
  const agent = new BrandStrategistAgent(
    new StaticPromptManager(),
    new SimpleAgentExecutor(new FakeModelProvider()),
  );

  it('produces a structured brand profile from raw intake answers', async () => {
    const draft = await agent.interpretIntake({
      vertical: 'CAFE',
      rawToneAnswer: 'warm and friendly',
      rawAudienceAnswer: 'local remote workers',
      rawVisualAnswer: 'bright, minimal',
      rawOfferingsAnswer: 'specialty coffee, pastries',
    });

    expect(draft).toEqual({
      toneDescriptors: 'warm and friendly',
      audienceDescription: 'local remote workers',
      visualStyleDescriptors: 'bright, minimal',
      offeringsSummary: 'specialty coffee, pastries',
    });
  });
});
