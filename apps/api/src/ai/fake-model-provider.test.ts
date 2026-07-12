import { FakeModelProvider } from './fake-model-provider';

describe('FakeModelProvider', () => {
  const provider = new FakeModelProvider();

  it('is not a real vendor -- deterministic, no network call, providerId identifies it as a test double', () => {
    expect(provider.providerId).toBe('fake-test-provider');
  });

  it('rejects a prompt not built by StaticPromptManager (no [TEMPLATE:...] marker)', async () => {
    await expect(provider.complete({ prompt: 'plain unmarked prompt' })).rejects.toThrow(
      'FakeModelProvider requires a prompt built by StaticPromptManager templates',
    );
  });

  it('rejects an unrecognized template id', async () => {
    await expect(
      provider.complete({ prompt: '[TEMPLATE:unknown-template]\nfoo: bar' }),
    ).rejects.toThrow(/no canned response/);
  });
});
