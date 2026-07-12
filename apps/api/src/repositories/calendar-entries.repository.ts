import { prisma, type CalendarEntry, type PostedState } from '@novalight/database';

export interface CreateCalendarEntryInput {
  contentDraftId: string;
  scheduledDate: Date;
}

/** Every method scopes to accountId -- per 028-m1-technical-design.md §2.2. */
export class CalendarEntriesRepository {
  findAllByAccount(accountId: string): Promise<CalendarEntry[]> {
    return prisma.calendarEntry.findMany({
      where: { accountId },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  findByIdForAccount(accountId: string, id: string): Promise<CalendarEntry | null> {
    return prisma.calendarEntry.findFirst({ where: { id, accountId } });
  }

  create(accountId: string, input: CreateCalendarEntryInput): Promise<CalendarEntry> {
    return prisma.calendarEntry.create({ data: { accountId, ...input } });
  }

  reschedule(accountId: string, id: string, scheduledDate: Date): Promise<CalendarEntry> {
    return prisma.calendarEntry.update({ where: { id, accountId }, data: { scheduledDate } });
  }

  updatePostedState(
    accountId: string,
    id: string,
    postedState: PostedState,
  ): Promise<CalendarEntry> {
    return prisma.calendarEntry.update({ where: { id, accountId }, data: { postedState } });
  }
}
