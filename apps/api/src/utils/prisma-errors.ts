import { Prisma } from '@prisma/client';
import { ApiError } from '../middlewares/error-handler';

/**
 * Maps a Prisma "record not found" error (P2025) -- thrown when a repository's WHERE clause
 * combining `id` with `accountId` matches no row, either because the record doesn't exist or
 * because it belongs to a different account -- to a 404, per
 * docs/architecture/social-ai-platform/028-m1-technical-design.md §2.5: "must fail (404, not
 * 403, to avoid confirming the record's existence to an unauthorized caller)". Never leaks the
 * underlying Prisma error message, per CLAUDE.md §7.
 */
export async function withOwnershipScopedNotFound<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new ApiError('authorization', 404, 'Resource not found');
    }
    throw error;
  }
}

/**
 * Maps a Prisma unique-constraint violation (P2002) to a 409 Business Error. Added after
 * independent quality-gate review found that ContentDraft.contentIdeaId and
 * CalendarEntry.contentDraftId (both @unique, modeling their 1:1 relations) had no P2002
 * handling in ContentService -- a second generateDraft/scheduleDraft call for the same
 * idea/draft was falling through to a generic, unhelpful 500 instead of a foreseeable,
 * non-exceptional 409. Never leaks the underlying Prisma error message, same posture as
 * withOwnershipScopedNotFound above.
 */
export async function withUniqueConstraintAsBusinessError<T>(
  operation: () => Promise<T>,
  message: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ApiError('business', 409, message);
    }
    throw error;
  }
}
