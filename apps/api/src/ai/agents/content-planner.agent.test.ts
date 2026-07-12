import { ContentPlannerAgent } from './content-planner.agent';
import { StaticPromptManager } from '../static-prompt-manager';
import { SimpleAgentExecutor } from '../simple-agent-executor';
import { FakeModelProvider } from '../fake-model-provider';

describe('ContentPlannerAgent', () => {
  const agent = new ContentPlannerAgent(
    new StaticPromptManager(),
    new SimpleAgentExecutor(new FakeModelProvider()),
  );

  it('generates content idea suggestions grounded in vertical, tone, and audience', async () => {
    const ideas = await agent.generateIdeas({
      vertical: 'CAFE',
      toneDescriptors: 'playful',
      audienceDescription: 'locals',
    });

    expect(ideas.length).toBeGreaterThan(0);
    for (const idea of ideas) {
      expect(idea).toHaveProperty('topic');
      expect(idea).toHaveProperty('intendedFormat');
    }
  });
});
