import { prisma, type ContentIdea } from '@novalight/database';

export interface CreateContentIdeaInput {
  brandId: string;
  topic: string;
  intendedFormat: string;
  targetDate: Date;
}

/** Every method scopes to accountId -- per 028-m1-technical-design.md §2.2. */
export class ContentIdeasRepository {
  findAllByAccount(accountId: string): Promise<ContentIdea[]> {
    return prisma.contentIdea.findMany({ where: { accountId }, orderBy: { targetDate: 'asc' } });
  }

  findByIdForAccount(accountId: string, id: string): Promise<ContentIdea | null> {
    return prisma.contentIdea.findFirst({ where: { id, accountId } });
  }

  create(accountId: string, input: CreateContentIdeaInput): Promise<ContentIdea> {
    return prisma.contentIdea.create({ data: { accountId, ...input } });
  }
}
