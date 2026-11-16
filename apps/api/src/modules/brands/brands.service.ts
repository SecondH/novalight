import { BrandsRepository } from '../../repositories/brands.repository';
import { AccountsRepository } from '../../repositories/accounts.repository';
import { AccountContextService } from '../../services/account-context.service';
import { BrandStrategistAgent } from '../../ai/agents/brand-strategist.agent';
import { agentExecutor, agentPromptManager } from '../../ai/agent-pipeline';
import { withAiErrorMapping } from '../../ai/ai-error-mapping';
import { auditLogger } from '../../audit/pino-audit-logger';
import { ApiError } from '../../middlewares/error-handler';
import type { BrandIntakeBody } from './brands.validators';

// Real model (Groq) or FakeModelProvider, selected once in ai/agent-pipeline.ts -- see
// docs/architecture/035-agent-pipeline-real-provider-wiring.md.
const brandStrategistAgent = new BrandStrategistAgent(agentPromptManager, agentExecutor);

export class BrandsService {
  constructor(
    private readonly brandsRepository: BrandsRepository = new BrandsRepository(),
    private readonly accountsRepository: AccountsRepository = new AccountsRepository(),
    private readonly accountContext: AccountContextService = new AccountContextService(
      accountsRepository,
    ),
  ) {}

  async submitIntake(userId: string, input: BrandIntakeBody) {
    const account = await this.accountContext.resolveAccountForUser(userId);

    const existing = await this.brandsRepository.findByAccountId(account.id);
    if (existing) {
      throw new ApiError('business', 409, 'A brand profile already exists for this account');
    }

    const draft = await withAiErrorMapping(() =>
      brandStrategistAgent.interpretIntake({
        vertical: account.vertical,
        rawToneAnswer: input.rawToneAnswer,
        rawAudienceAnswer: input.rawAudienceAnswer,
        rawVisualAnswer: input.rawVisualAnswer,
        rawOfferingsAnswer: input.rawOfferingsAnswer,
      }),
    );

    const brand = await this.brandsRepository.create(account.id, {
      vertical: account.vertical,
      ...draft,
    });

    // Sensitive operation per 028-m1-technical-design.md §2.4 ("brand-profile changes").
    await auditLogger.record({
      actor: userId,
      action: 'brand.create',
      resource: `brand:${brand.id}`,
      timestamp: new Date().toISOString(),
      result: 'success',
    });

    return brand;
  }

  async getMyBrand(userId: string) {
    const account = await this.accountContext.resolveAccountForUser(userId);
    return this.brandsRepository.findByAccountId(account.id);
  }

  /**
   * Business Error, not an AuthorizationProvider check -- corrected per
   * docs/architecture/social-ai-platform/028-m1-technical-design.md §2.3: brand-intake
   * completeness is workflow state, not a permission. Used by ContentService before any
   * content generation.
   */
  async requireConfirmedBrand(accountId: string) {
    const brand = await this.brandsRepository.findByAccountId(accountId);
    if (!brand) {
      throw new ApiError(
        'business',
        422,
        'Brand intake must be completed before generating content',
      );
    }
    return brand;
  }
}
