import { prisma, type ApprovalState, type ContentDraft } from '@novalight/database';

export interface CreateContentDraftInput {
  contentIdeaId: string;
  captionText?: string;
  visualPromptText?: string;
}

/** Every method scopes to accountId -- per 028-m1-technical-design.md §2.2. */
export class ContentDraftsRepository {
  findByIdForAccount(accountId: string, id: string): Promise<ContentDraft | null> {
    return prisma.contentDraft.findFirst({ where: { id, accountId } });
  }

  create(accountId: string, input: CreateContentDraftInput): Promise<ContentDraft> {
    return prisma.contentDraft.create({ data: { accountId, ...input } });
  }

  updateApprovalState(
    accountId: string,
    id: string,
    approvalState: ApprovalState,
  ): Promise<ContentDraft> {
    return prisma.contentDraft.update({ where: { id, accountId }, data: { approvalState } });
  }

  updateText(
    accountId: string,
    id: string,
    input: Partial<Pick<CreateContentDraftInput, 'captionText' | 'visualPromptText'>>,
  ): Promise<ContentDraft> {
    return prisma.contentDraft.update({ where: { id, accountId }, data: input });
  }
}
