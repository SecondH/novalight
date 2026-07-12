import type { Account } from '@novalight/database';
import { AccountsRepository } from '../repositories/accounts.repository';
import { ApiError } from '../middlewares/error-handler';

/**
 * Single source of truth for resolving the requesting account, per
 * docs/architecture/social-ai-platform/028-m1-technical-design.md §2.2: "resolved once per
 * request, from the authenticated userId ... by a single Service-layer helper (not re-derived
 * ad hoc in each service)." Every other service calls this rather than looking up Account
 * itself, so the account_id scoping value has exactly one source per request. Per §2.2's
 * `Account`-IDOR rule: this never accepts a client-supplied account id -- only userId.
 */
export class AccountContextService {
  constructor(private readonly accountsRepository: AccountsRepository = new AccountsRepository()) {}

  async resolveAccountForUser(userId: string): Promise<Account> {
    const account = await this.accountsRepository.findByOwnerUserId(userId);
    if (!account) {
      throw new ApiError('business', 404, 'No account exists for this user yet');
    }
    return account;
  }
}
