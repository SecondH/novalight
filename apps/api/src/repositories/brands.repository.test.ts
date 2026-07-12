import { BrandsRepository } from './brands.repository';

const findFirst = jest.fn();
const create = jest.fn();
const update = jest.fn();

jest.mock('@novalight/database', () => ({
  prisma: {
    brand: {
      findFirst: (...args: unknown[]) => findFirst(...args),
      create: (...args: unknown[]) => create(...args),
      update: (...args: unknown[]) => update(...args),
    },
  },
}));

describe('BrandsRepository', () => {
  const repo = new BrandsRepository();
  const input = {
    vertical: 'CAFE' as const,
    toneDescriptors: 'warm',
    audienceDescription: 'locals',
    visualStyleDescriptors: 'bright',
    offeringsSummary: 'coffee',
  };

  beforeEach(() => {
    findFirst.mockReset();
    create.mockReset();
    update.mockReset();
  });

  it('findByAccountId scopes the query to accountId', async () => {
    await repo.findByAccountId('account-1');
    expect(findFirst).toHaveBeenCalledWith({ where: { accountId: 'account-1' } });
  });

  it('create attaches the given accountId', async () => {
    await repo.create('account-1', input);
    expect(create).toHaveBeenCalledWith({ data: { accountId: 'account-1', ...input } });
  });

  it('update requires both id and accountId in the WHERE clause -- the ownership-scoping requirement (028-m1-technical-design.md §2.2)', async () => {
    await repo.update('account-1', 'brand-1', { toneDescriptors: 'new tone' });
    expect(update).toHaveBeenCalledWith({
      where: { id: 'brand-1', accountId: 'account-1' },
      data: { toneDescriptors: 'new tone' },
    });
  });
});
