import { prisma, type Account, type Vertical } from '@novalight/database';

/**
 * Account is the ownership root (ADR-018 v1.2) and has no scoping FK of its own -- every
 * lookup here derives from an authenticated userId, never a client-supplied account id, per
 * docs/architecture/social-ai-platform/028-m1-technical-design.md §2.2's explicit rule
 * (added after independent data-architect review found this gap).
 */
export class AccountsRepository {
  findByOwnerUserId(ownerUserId: string): Promise<Account | null> {
    return prisma.account.findFirst({ where: { ownerUserId } });
  }

  create(ownerUserId: string, vertical: Vertical): Promise<Account> {
    return prisma.account.create({ data: { ownerUserId, vertical } });
  }
}
