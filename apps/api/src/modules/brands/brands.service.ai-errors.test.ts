/**
 * Service-level check that a real-model failure reaches the API layer as a safe ApiError and
 * leaves no partial data behind. The shared agent pipeline is replaced with an executor whose
 * output each test controls; repositories are in-memory stubs, so no database is involved.
 */
const runAgent = jest.fn();
jest.mock('../../ai/agent-pipeline', () => {
  const { StaticPromptManager } = jest.requireActual('../../ai/static-prompt-manager');
  return {
    agentPromptManager: new StaticPromptManager(),
    agentExecutor: { run: (...args: unknown[]) => runAgent(...args) },
  };
});

import { AiProviderError } from '@novalight/ai-core';
import { ApiError } from '../../middlewares/error-handler';
import { BrandsService } from './brands.service';
import type { BrandsRepository } from '../../repositories/brands.repository';
import type { AccountsRepository } from '../../repositories/accounts.repository';
import type { AccountContextService } from '../../services/account-context.service';

const intake = {
  rawToneAnswer: 'warm',
  rawAudienceAnswer: 'students',
  rawVisualAnswer: 'cream and brown',
  rawOfferingsAnswer: 'coffee and cake',
};

function buildService() {
  const create = jest.fn();
  const brandsRepository = {
    findByAccountId: jest.fn().mockResolvedValue(null),
    create,
  } as unknown as BrandsRepository;
  const accountContext = {
    resolveAccountForUser: jest.fn().mockResolvedValue({ id: 'account-1', vertical: 'CAFE' }),
  } as unknown as AccountContextService;
  const service = new BrandsService(brandsRepository, {} as AccountsRepository, accountContext);
  return { service, create };
}

describe('BrandsService.submitIntake with a real-model-shaped provider', () => {
  beforeEach(() => runAgent.mockReset());

  it('maps malformed model output to a safe 502 and persists nothing', async () => {
    runAgent.mockResolvedValue({ taskId: 't', output: 'Sorry, I cannot do that.' });
    const { service, create } = buildService();

    const error = await service.submitIntake('user-1', intake).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).statusCode).toBe(502);
    expect((error as ApiError).message).not.toContain('Sorry');
    expect(create).not.toHaveBeenCalled();
  });

  it('maps a provider rate limit to 429', async () => {
    runAgent.mockRejectedValue(new AiProviderError('rate_limited', 'vendor detail'));
    const { service } = buildService();

    await expect(service.submitIntake('user-1', intake)).rejects.toMatchObject({ statusCode: 429 });
  });

  it('persists a validated profile from fenced JSON output', async () => {
    runAgent.mockResolvedValue({
      taskId: 't',
      output:
        '```json\n{"toneDescriptors":"warm","audienceDescription":"students","visualStyleDescriptors":"cream","offeringsSummary":"coffee"}\n```',
    });
    const { service, create } = buildService();
    create.mockResolvedValue({ id: 'brand-1' });

    await service.submitIntake('user-1', intake);

    expect(create).toHaveBeenCalledWith('account-1', {
      vertical: 'CAFE',
      toneDescriptors: 'warm',
      audienceDescription: 'students',
      visualStyleDescriptors: 'cream',
      offeringsSummary: 'coffee',
    });
  });
});
