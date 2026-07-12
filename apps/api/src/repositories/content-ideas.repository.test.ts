import { ContentIdeasRepository } from './content-ideas.repository';

const findMany = jest.fn();
const findFirst = jest.fn();
const create = jest.fn();

jest.mock('@novalight/database', () => ({
  prisma: {
    contentIdea: {
      findMany: (...args: unknown[]) => findMany(...args),
      findFirst: (...args: unknown[]) => findFirst(...args),
      create: (...args: unknown[]) => create(...args),
    },
  },
}));

describe('ContentIdeasRepository', () => {
  const repo = new ContentIdeasRepository();

  beforeEach(() => {
    findMany.mockReset();
    findFirst.mockReset();
    create.mockReset();
  });

  it('findAllByAccount scopes to accountId, not brandId (direct FK per ADR-018 v1.2, not a transitive join)', async () => {
    await repo.findAllByAccount('account-1');
    expect(findMany).toHaveBeenCalledWith({
      where: { accountId: 'account-1' },
      orderBy: { targetDate: 'asc' },
    });
  });

  it('findByIdForAccount requires both id and accountId to match', async () => {
    await repo.findByIdForAccount('account-1', 'idea-1');
    expect(findFirst).toHaveBeenCalledWith({ where: { id: 'idea-1', accountId: 'account-1' } });
  });

  it('create attaches accountId directly, independent of brandId', async () => {
    const targetDate = new Date('2026-08-01');
    await repo.create('account-1', {
      brandId: 'brand-1',
      topic: 'x',
      intendedFormat: 'photo-post',
      targetDate,
    });
    expect(create).toHaveBeenCalledWith({
      data: {
        accountId: 'account-1',
        brandId: 'brand-1',
        topic: 'x',
        intendedFormat: 'photo-post',
        targetDate,
      },
    });
  });
});
