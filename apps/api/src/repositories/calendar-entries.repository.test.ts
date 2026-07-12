import { CalendarEntriesRepository } from './calendar-entries.repository';

const findMany = jest.fn();
const findFirst = jest.fn();
const create = jest.fn();
const update = jest.fn();

jest.mock('@novalight/database', () => ({
  prisma: {
    calendarEntry: {
      findMany: (...args: unknown[]) => findMany(...args),
      findFirst: (...args: unknown[]) => findFirst(...args),
      create: (...args: unknown[]) => create(...args),
      update: (...args: unknown[]) => update(...args),
    },
  },
}));

describe('CalendarEntriesRepository', () => {
  const repo = new CalendarEntriesRepository();

  beforeEach(() => {
    findMany.mockReset();
    findFirst.mockReset();
    create.mockReset();
    update.mockReset();
  });

  it('findAllByAccount scopes to accountId', async () => {
    await repo.findAllByAccount('account-1');
    expect(findMany).toHaveBeenCalledWith({
      where: { accountId: 'account-1' },
      orderBy: { scheduledDate: 'asc' },
    });
  });

  it('reschedule is scoped to accountId', async () => {
    const date = new Date('2026-08-05');
    await repo.reschedule('account-1', 'entry-1', date);
    expect(update).toHaveBeenCalledWith({
      where: { id: 'entry-1', accountId: 'account-1' },
      data: { scheduledDate: date },
    });
  });

  it('updatePostedState is scoped to accountId', async () => {
    await repo.updatePostedState('account-1', 'entry-1', 'POSTED');
    expect(update).toHaveBeenCalledWith({
      where: { id: 'entry-1', accountId: 'account-1' },
      data: { postedState: 'POSTED' },
    });
  });
});
