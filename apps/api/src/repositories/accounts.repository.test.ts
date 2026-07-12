import { AccountsRepository } from './accounts.repository';

const findFirst = jest.fn();
const create = jest.fn();

jest.mock('@novalight/database', () => ({
  prisma: {
    account: {
      findFirst: (...args: unknown[]) => findFirst(...args),
      create: (...args: unknown[]) => create(...args),
    },
  },
}));

describe('AccountsRepository', () => {
  const repo = new AccountsRepository();

  beforeEach(() => {
    findFirst.mockReset();
    create.mockReset();
  });

  it('findByOwnerUserId filters strictly by ownerUserId (the Account-IDOR rule: never a client-supplied account id)', async () => {
    await repo.findByOwnerUserId('user-1');
    expect(findFirst).toHaveBeenCalledWith({ where: { ownerUserId: 'user-1' } });
  });

  it('create associates the new Account with the given ownerUserId', async () => {
    await repo.create('user-1', 'CAFE');
    expect(create).toHaveBeenCalledWith({ data: { ownerUserId: 'user-1', vertical: 'CAFE' } });
  });
});
