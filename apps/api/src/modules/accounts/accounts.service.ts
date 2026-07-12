import type { Vertical } from '@novalight/database';
import { AccountsRepository } from '../../repositories/accounts.repository';
import { AccountContextService } from '../../services/account-context.service';
import { auditLogger } from '../../audit/pino-audit-logger';
import { ApiError } from '../../middlewares/error-handler';
import { withUniqueConstraintAsBusinessError } from '../../utils/prisma-errors';

export class AccountsService {
  constructor(
    private readonly accountsRepository: AccountsRepository = new AccountsRepository(),
    private readonly accountContext: AccountContextService = new AccountContextService(
      accountsRepository,
    ),
  ) {}

  async createAccount(userId: string, vertical: Vertical) {
    const existing = await this.accountsRepository.findByOwnerUserId(userId);
    if (existing) {
      // Business rule: Stage 1 is one Account per User (ADR-018 v1.2 "Ownership chain") --
      // not an authorization concern, so this is a Business Error, not an Authorization Error.
      throw new ApiError('business', 409, 'An account already exists for this user');
    }

    // The check above is a fast-path/friendly-message optimization, not the enforcement
    // mechanism -- packages/database/prisma/schema.prisma's `owner_user_id @unique` is the
    // real guard against a concurrent-request race (two simultaneous calls could both pass
    // the check above; the DB constraint is what actually prevents two rows). Wrapped here so
    // that race loses with the same 409 a sequential duplicate call gets, not a generic 500 --
    // added after independent review (solution-architect, data-architect, quality-gate-reviewer
    // all separately flagged this race).
    const account = await withUniqueConstraintAsBusinessError(
      () => this.accountsRepository.create(userId, vertical),
      'An account already exists for this user',
    );

    // Sensitive operation per docs/architecture/social-ai-platform/028-m1-technical-design.md §2.4.
    await auditLogger.record({
      actor: userId,
      action: 'account.create',
      resource: `account:${account.id}`,
      timestamp: new Date().toISOString(),
      result: 'success',
    });

    return account;
  }

  getMyAccount(userId: string) {
    return this.accountContext.resolveAccountForUser(userId);
  }
}
