import { PrismaClient } from '@prisma/client';

/**
 * Single shared Prisma client instance. Per docs/architecture/012-database-architecture.md
 * §21 ("Database access rules"): access must go through Service -> Repository -> Prisma
 * Client. Direct Prisma usage inside controllers is prohibited -- import this only from a
 * repository, never from a controller.
 *
 * Reuses the client across hot reloads in development to avoid exhausting the Postgres
 * connection pool (a well-known Prisma + dev-server pitfall), without introducing a global
 * anywhere outside this file.
 */
declare global {
  // eslint-disable-next-line no-var
  var __novalightPrisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__novalightPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__novalightPrisma = prisma;
}

export type { PrismaClient } from '@prisma/client';

// Re-exported so consumers (apps/api repositories) import model types from this package's
// boundary, not by reaching into @prisma/client directly -- keeps the "database access layer"
// description in package.json accurate as the single point of contact for persistence types.
export type {
  User,
  Account,
  Brand,
  ContentIdea,
  ContentDraft,
  CalendarEntry,
} from '@prisma/client';
export { Vertical, ApprovalState, PostedState } from '@prisma/client';
