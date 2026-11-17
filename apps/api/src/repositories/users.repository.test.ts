import { UsersRepository } from './users.repository';

const findUnique = jest.fn();
const create = jest.fn();
const update = jest.fn();

jest.mock('@novalight/database', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => findUnique(...args),
      create: (...args: unknown[]) => create(...args),
      update: (...args: unknown[]) => update(...args),
    },
  },
}));

describe('UsersRepository', () => {
  const repo = new UsersRepository();

  beforeEach(() => {
    findUnique.mockReset();
    create.mockReset();
    update.mockReset();
  });

  it('findByClerkUserId filters strictly by clerkUserId', async () => {
    await repo.findByClerkUserId('clerk-1');
    expect(findUnique).toHaveBeenCalledWith({ where: { clerkUserId: 'clerk-1' } });
  });

  it('findByEmail filters strictly by email', async () => {
    await repo.findByEmail('user@example.com');
    expect(findUnique).toHaveBeenCalledWith({ where: { email: 'user@example.com' } });
  });

  it('createFromClerkIdentity creates a User from the verified Clerk identity only', async () => {
    await repo.createFromClerkIdentity({ clerkUserId: 'clerk-1', email: 'user@example.com' });
    expect(create).toHaveBeenCalledWith({
      data: { clerkUserId: 'clerk-1', email: 'user@example.com' },
    });
  });

  it('linkClerkUserId sets clerkUserId on the User matched by email', async () => {
    await repo.linkClerkUserId('user@example.com', 'clerk-1');
    expect(update).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      data: { clerkUserId: 'clerk-1' },
    });
  });

  it('updateEmail sets email on the User matched by clerkUserId', async () => {
    await repo.updateEmail('clerk-1', 'new-email@example.com');
    expect(update).toHaveBeenCalledWith({
      where: { clerkUserId: 'clerk-1' },
      data: { email: 'new-email@example.com' },
    });
  });

  it('deactivateByClerkUserId sets deactivatedAt on the User matched by clerkUserId', async () => {
    await repo.deactivateByClerkUserId('clerk-1');
    expect(update).toHaveBeenCalledWith({
      where: { clerkUserId: 'clerk-1' },
      data: { deactivatedAt: expect.any(Date) },
    });
  });
});
