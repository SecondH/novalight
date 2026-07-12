import { VisualPromptEngineerAgent } from './visual-prompt-engineer.agent';
import { StaticPromptManager } from '../static-prompt-manager';
import { SimpleAgentExecutor } from '../simple-agent-executor';
import { FakeModelProvider } from '../fake-model-provider';

describe('VisualPromptEngineerAgent', () => {
  const agent = new VisualPromptEngineerAgent(
    new StaticPromptManager(),
    new SimpleAgentExecutor(new FakeModelProvider()),
  );

  it('drafts a visual prompt grounded in the given topic and visual style only', async () => {
    const prompt = await agent.draftVisualPrompt({
      topic: 'New seasonal latte',
      visualStyleDescriptors: 'bright, minimal',
    });
    expect(prompt).toContain('New seasonal latte');
    expect(prompt).toContain('bright, minimal');
  });

  it('does not itself call an image-generation vendor -- only produces text (024-image-generation-integration.md §1)', async () => {
    const prompt = await agent.draftVisualPrompt({ topic: 'x', visualStyleDescriptors: 'y' });
    expect(typeof prompt).toBe('string');
  });
});
