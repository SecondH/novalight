import { CopywriterAgent } from './copywriter.agent';
import { StaticPromptManager } from '../static-prompt-manager';
import { SimpleAgentExecutor } from '../simple-agent-executor';
import { FakeModelProvider } from '../fake-model-provider';

describe('CopywriterAgent', () => {
  const agent = new CopywriterAgent(
    new StaticPromptManager(),
    new SimpleAgentExecutor(new FakeModelProvider()),
  );

  it('drafts a caption grounded in the given topic and tone only', async () => {
    const caption = await agent.draftCaption({
      topic: 'New seasonal latte',
      toneDescriptors: 'playful',
    });
    expect(caption).toContain('New seasonal latte');
    expect(caption).toContain('playful');
  });

  it('the underlying prompt template does not include unrelated fields (e.g. Approval History)', async () => {
    const template = await new StaticPromptManager().getTemplate('copywriter-caption');
    const rendered = template.render({
      topic: 'x',
      tone_descriptors: 'y',
      approval_history: 'should not appear',
    });
    expect(rendered).not.toContain('approval_history');
    expect(rendered).not.toContain('should not appear');
  });
});
