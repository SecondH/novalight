import { ContentDraftsRepository } from './content-drafts.repository';

const findFirst = jest.fn();
const create = jest.fn();
const update = jest.fn();

jest.mock('@novalight/database', () => ({
  prisma: {
    contentDraft: {
      findFirst: (...args: unknown[]) => findFirst(...args),
      create: (...args: unknown[]) => create(...args),
      update: (...args: unknown[]) => update(...args),
    },
  },
}));

describe('ContentDraftsRepository', () => {
  const repo = new ContentDraftsRepository();

  beforeEach(() => {
    findFirst.mockReset();
    create.mockReset();
    update.mockReset();
  });

  it('findByIdForAccount requires both id and accountId', async () => {
    await repo.findByIdForAccount('account-1', 'draft-1');
    expect(findFirst).toHaveBeenCalledWith({ where: { id: 'draft-1', accountId: 'account-1' } });
  });

  it('updateApprovalState is scoped to accountId -- the field that gates ownership-isolation tests', async () => {
    await repo.updateApprovalState('account-1', 'draft-1', 'APPROVED');
    expect(update).toHaveBeenCalledWith({
      where: { id: 'draft-1', accountId: 'account-1' },
      data: { approvalState: 'APPROVED' },
    });
  });

  it('updateText is scoped to accountId', async () => {
    await repo.updateText('account-1', 'draft-1', { captionText: 'new caption' });
    expect(update).toHaveBeenCalledWith({
      where: { id: 'draft-1', accountId: 'account-1' },
      data: { captionText: 'new caption' },
    });
  });
});
