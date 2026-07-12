import type { ApprovalState, PostedState } from '@novalight/database';
import { ContentIdeasRepository } from '../../repositories/content-ideas.repository';
import { ContentDraftsRepository } from '../../repositories/content-drafts.repository';
import { CalendarEntriesRepository } from '../../repositories/calendar-entries.repository';
import { AccountsRepository } from '../../repositories/accounts.repository';
import { BrandsRepository } from '../../repositories/brands.repository';
import { AccountContextService } from '../../services/account-context.service';
import { BrandsService } from '../brands/brands.service';
import { ContentPlannerAgent } from '../../ai/agents/content-planner.agent';
import { CopywriterAgent } from '../../ai/agents/copywriter.agent';
import { VisualPromptEngineerAgent } from '../../ai/agents/visual-prompt-engineer.agent';
import { StaticPromptManager } from '../../ai/static-prompt-manager';
import { SimpleAgentExecutor } from '../../ai/simple-agent-executor';
import { FakeModelProvider } from '../../ai/fake-model-provider';
import { auditLogger } from '../../audit/pino-audit-logger';
import { ApiError } from '../../middlewares/error-handler';
import {
  withOwnershipScopedNotFound,
  withUniqueConstraintAsBusinessError,
} from '../../utils/prisma-errors';
import type { DraftEditBody } from './content.validators';

// Test/fake ModelProvider only, shared instance -- per
// docs/architecture/social-ai-platform/028-m1-technical-design.md §5. Prompt manager/executor
// are stateless and cheap to share across the three agents that need them.
const promptManager = new StaticPromptManager();
const agentExecutor = new SimpleAgentExecutor(new FakeModelProvider());
const contentPlannerAgent = new ContentPlannerAgent(promptManager, agentExecutor);
const copywriterAgent = new CopywriterAgent(promptManager, agentExecutor);
const visualPromptEngineerAgent = new VisualPromptEngineerAgent(promptManager, agentExecutor);

export class ContentService {
  constructor(
    private readonly contentIdeasRepository: ContentIdeasRepository = new ContentIdeasRepository(),
    private readonly contentDraftsRepository: ContentDraftsRepository = new ContentDraftsRepository(),
    private readonly calendarEntriesRepository: CalendarEntriesRepository = new CalendarEntriesRepository(),
    private readonly brandsRepository: BrandsRepository = new BrandsRepository(),
    private readonly accountsRepository: AccountsRepository = new AccountsRepository(),
    private readonly accountContext: AccountContextService = new AccountContextService(
      accountsRepository,
    ),
    private readonly brandsService: BrandsService = new BrandsService(
      brandsRepository,
      accountsRepository,
      accountContext,
    ),
  ) {}

  // --- Content Ideas -------------------------------------------------------

  async generateIdeas(userId: string) {
    const account = await this.accountContext.resolveAccountForUser(userId);
    const brand = await this.brandsService.requireConfirmedBrand(account.id);

    const suggestions = await contentPlannerAgent.generateIdeas({
      vertical: brand.vertical,
      toneDescriptors: brand.toneDescriptors,
      audienceDescription: brand.audienceDescription,
    });

    const targetDate = new Date();
    const ideas = [];
    for (const suggestion of suggestions) {
      // Created sequentially (not Promise.all) so each idea gets a distinct target date
      // derived from ideas.length; volume is small (a handful per request).
      ideas.push(
        await this.contentIdeasRepository.create(account.id, {
          brandId: brand.id,
          topic: suggestion.topic,
          intendedFormat: suggestion.intendedFormat,
          targetDate: new Date(targetDate.getTime() + ideas.length * 24 * 60 * 60 * 1000),
        }),
      );
    }
    return ideas;
  }

  async listIdeas(userId: string) {
    const account = await this.accountContext.resolveAccountForUser(userId);
    return this.contentIdeasRepository.findAllByAccount(account.id);
  }

  // --- Content Drafts --------------------------------------------------------

  async generateDraftForIdea(userId: string, ideaId: string) {
    const account = await this.accountContext.resolveAccountForUser(userId);
    const brand = await this.brandsService.requireConfirmedBrand(account.id);

    const idea = await this.contentIdeasRepository.findByIdForAccount(account.id, ideaId);
    if (!idea) {
      throw new ApiError('authorization', 404, 'Resource not found');
    }

    const [caption, visualPrompt] = await Promise.all([
      copywriterAgent.draftCaption({ topic: idea.topic, toneDescriptors: brand.toneDescriptors }),
      visualPromptEngineerAgent.draftVisualPrompt({
        topic: idea.topic,
        visualStyleDescriptors: brand.visualStyleDescriptors,
      }),
    ]);

    return withUniqueConstraintAsBusinessError(
      () =>
        this.contentDraftsRepository.create(account.id, {
          contentIdeaId: idea.id,
          captionText: caption,
          visualPromptText: visualPrompt,
        }),
      'A draft already exists for this idea',
    );
  }

  async editDraft(userId: string, draftId: string, input: DraftEditBody) {
    const account = await this.accountContext.resolveAccountForUser(userId);
    const draft = await withOwnershipScopedNotFound(() =>
      this.contentDraftsRepository.updateText(account.id, draftId, input),
    );

    if (draft.approvalState === 'DRAFT') {
      await this.setApprovalState(account.id, draftId, 'EDITED');
    }
    return draft;
  }

  async approveDraft(userId: string, draftId: string) {
    const account = await this.accountContext.resolveAccountForUser(userId);
    const draft = await this.setApprovalState(account.id, draftId, 'APPROVED');

    // Sensitive operation per 028-m1-technical-design.md §2.4 ("content-approval actions").
    await auditLogger.record({
      actor: userId,
      action: 'content_draft.approve',
      resource: `content_draft:${draftId}`,
      timestamp: new Date().toISOString(),
      result: 'success',
    });
    return draft;
  }

  async discardDraft(userId: string, draftId: string) {
    const account = await this.accountContext.resolveAccountForUser(userId);
    const draft = await this.setApprovalState(account.id, draftId, 'DISCARDED');

    await auditLogger.record({
      actor: userId,
      action: 'content_draft.discard',
      resource: `content_draft:${draftId}`,
      timestamp: new Date().toISOString(),
      result: 'success',
    });
    return draft;
  }

  private setApprovalState(accountId: string, draftId: string, state: ApprovalState) {
    return withOwnershipScopedNotFound(() =>
      this.contentDraftsRepository.updateApprovalState(accountId, draftId, state),
    );
  }

  // --- Calendar ----------------------------------------------------------

  async scheduleDraft(userId: string, draftId: string, scheduledDate: Date) {
    const account = await this.accountContext.resolveAccountForUser(userId);
    const draft = await this.contentDraftsRepository.findByIdForAccount(account.id, draftId);
    if (!draft) {
      throw new ApiError('authorization', 404, 'Resource not found');
    }
    if (draft.approvalState !== 'APPROVED') {
      throw new ApiError('business', 422, 'Only an approved draft can be scheduled');
    }

    return withUniqueConstraintAsBusinessError(
      () =>
        this.calendarEntriesRepository.create(account.id, {
          contentDraftId: draft.id,
          scheduledDate,
        }),
      'This draft has already been scheduled',
    );
  }

  async listCalendar(userId: string) {
    const account = await this.accountContext.resolveAccountForUser(userId);
    return this.calendarEntriesRepository.findAllByAccount(account.id);
  }

  async rescheduleCalendarEntry(userId: string, entryId: string, scheduledDate: Date) {
    const account = await this.accountContext.resolveAccountForUser(userId);
    return withOwnershipScopedNotFound(() =>
      this.calendarEntriesRepository.reschedule(account.id, entryId, scheduledDate),
    );
  }

  async markPosted(userId: string, entryId: string) {
    const account = await this.accountContext.resolveAccountForUser(userId);
    return this.setCalendarState(account.id, entryId, 'POSTED');
  }

  async discardCalendarEntry(userId: string, entryId: string) {
    const account = await this.accountContext.resolveAccountForUser(userId);
    return this.setCalendarState(account.id, entryId, 'DISCARDED');
  }

  private setCalendarState(accountId: string, entryId: string, state: PostedState) {
    return withOwnershipScopedNotFound(() =>
      this.calendarEntriesRepository.updatePostedState(accountId, entryId, state),
    );
  }
}
