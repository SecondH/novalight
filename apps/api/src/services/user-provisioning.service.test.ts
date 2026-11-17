import { UserProvisioningService } from './user-provisioning.service';
import type { UsersRepository } from '../repositories/users.repository';

jest.mock('../audit/pino-audit-logger', () => ({
  auditLogger: { record: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock('../utils/prisma-errors', () => ({
  isUniqueConstraintViolation: (error: unknown) =>
    Boolean(error) && (error as { code?: string }).code === 'P2002',
}));

import { auditLogger } from '../audit/pino-audit-logger';

function buildRepo(overrides: Partial<jest.Mocked<UsersRepository>> = {}) {
  return {
    findByClerkUserId: jest.fn(),
    findByEmail: jest.fn(),
    createFromClerkIdentity: jest.fn(),
    linkClerkUserId: jest.fn(),
    updateEmail: jest.fn(),
    deactivateByClerkUserId: jest.fn(),
    ...overrides,
  } as unknown as jest.Mocked<UsersRepository>;
}

const identity = { clerkUserId: 'clerk-1', email: 'user@example.com' };

describe('UserProvisioningService', () => {
  beforeEach(() => {
    (auditLogger.record as jest.Mock).mockClear();
  });

  describe('resolveOrProvisionLocalUserId', () => {
    it('returns the local id when an active User is already linked (common path, no write)', async () => {
      const repo = buildRepo({
        findByClerkUserId: jest.fn().mockResolvedValue({ id: 'user-1', deactivatedAt: null }),
      });
      const service = new UserProvisioningService(repo);

      const result = await service.resolveOrProvisionLocalUserId(identity);

      expect(result).toBe('user-1');
      expect(repo.createFromClerkIdentity).not.toHaveBeenCalled();
    });

    it('returns null when the linked User is deactivated (fails closed)', async () => {
      const repo = buildRepo({
        findByClerkUserId: jest.fn().mockResolvedValue({ id: 'user-1', deactivatedAt: new Date() }),
      });
      const service = new UserProvisioningService(repo);

      const result = await service.resolveOrProvisionLocalUserId(identity);

      expect(result).toBeNull();
      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'auth.clerk.deactivated_user_denied',
          result: 'failure',
        }),
      );
    });

    it('creates a new User when none is linked yet', async () => {
      const repo = buildRepo({
        findByClerkUserId: jest.fn().mockResolvedValue(null),
        createFromClerkIdentity: jest.fn().mockResolvedValue({ id: 'user-2' }),
      });
      const service = new UserProvisioningService(repo);

      const result = await service.resolveOrProvisionLocalUserId(identity);

      expect(result).toBe('user-2');
      expect(repo.createFromClerkIdentity).toHaveBeenCalledWith(identity);
      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'user.provision.jit_create', result: 'success' }),
      );
    });

    it('re-reads once and returns the winner on a create race (P2002), active case', async () => {
      const p2002 = Object.assign(new Error('unique constraint'), { code: 'P2002' });
      const repo = buildRepo({
        findByClerkUserId: jest
          .fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ id: 'user-3', deactivatedAt: null }),
        createFromClerkIdentity: jest.fn().mockRejectedValue(p2002),
      });
      const service = new UserProvisioningService(repo);

      const result = await service.resolveOrProvisionLocalUserId(identity);

      expect(result).toBe('user-3');
      expect(repo.findByClerkUserId).toHaveBeenCalledTimes(2);
    });

    it('returns null without attempting to create when JIT provisioning is disabled', async () => {
      const repo = buildRepo({ findByClerkUserId: jest.fn().mockResolvedValue(null) });
      const service = new UserProvisioningService(repo, false);

      const result = await service.resolveOrProvisionLocalUserId(identity);

      expect(result).toBeNull();
      expect(repo.createFromClerkIdentity).not.toHaveBeenCalled();
    });

    it('propagates non-P2002 errors from create', async () => {
      const repo = buildRepo({
        findByClerkUserId: jest.fn().mockResolvedValue(null),
        createFromClerkIdentity: jest.fn().mockRejectedValue(new Error('connection lost')),
      });
      const service = new UserProvisioningService(repo);

      await expect(service.resolveOrProvisionLocalUserId(identity)).rejects.toThrow(
        'connection lost',
      );
    });
  });

  describe('upsertFromWebhook', () => {
    it('is a no-op when already linked by clerkUserId with a matching email (idempotent)', async () => {
      const repo = buildRepo({
        findByClerkUserId: jest.fn().mockResolvedValue({ id: 'user-1', email: identity.email }),
      });
      const service = new UserProvisioningService(repo);

      await service.upsertFromWebhook(identity);

      expect(repo.createFromClerkIdentity).not.toHaveBeenCalled();
      expect(repo.linkClerkUserId).not.toHaveBeenCalled();
      expect(repo.updateEmail).not.toHaveBeenCalled();
    });

    it('updates the stored email when already linked but the email changed at Clerk (user.updated)', async () => {
      const repo = buildRepo({
        findByClerkUserId: jest
          .fn()
          .mockResolvedValue({ id: 'user-1', email: 'old-email@example.com' }),
      });
      const service = new UserProvisioningService(repo);

      await service.upsertFromWebhook(identity);

      expect(repo.updateEmail).toHaveBeenCalledWith(identity.clerkUserId, identity.email);
      expect(repo.createFromClerkIdentity).not.toHaveBeenCalled();
      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'user.provision.email_updated', result: 'success' }),
      );
    });

    it('creates a new User when no row matches by clerkUserId or email', async () => {
      const repo = buildRepo({
        findByClerkUserId: jest.fn().mockResolvedValue(null),
        findByEmail: jest.fn().mockResolvedValue(null),
        createFromClerkIdentity: jest.fn().mockResolvedValue({ id: 'user-2' }),
      });
      const service = new UserProvisioningService(repo);

      await service.upsertFromWebhook(identity);

      expect(repo.createFromClerkIdentity).toHaveBeenCalledWith(identity);
      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'user.provision.webhook_create', result: 'success' }),
      );
    });

    it('does not throw when a concurrent writer wins the create race (P2002)', async () => {
      const p2002 = Object.assign(new Error('unique constraint'), { code: 'P2002' });
      const repo = buildRepo({
        findByClerkUserId: jest.fn().mockResolvedValue(null),
        findByEmail: jest.fn().mockResolvedValue(null),
        createFromClerkIdentity: jest.fn().mockRejectedValue(p2002),
      });
      const service = new UserProvisioningService(repo);

      await expect(service.upsertFromWebhook(identity)).resolves.toBeUndefined();
      expect(auditLogger.record).not.toHaveBeenCalledWith(
        expect.objectContaining({ action: 'user.provision.webhook_create' }),
      );
    });

    it('propagates a non-P2002 error from create rather than swallowing it', async () => {
      const repo = buildRepo({
        findByClerkUserId: jest.fn().mockResolvedValue(null),
        findByEmail: jest.fn().mockResolvedValue(null),
        createFromClerkIdentity: jest.fn().mockRejectedValue(new Error('connection lost')),
      });
      const service = new UserProvisioningService(repo);

      await expect(service.upsertFromWebhook(identity)).rejects.toThrow('connection lost');
    });

    it('does not throw when a concurrent writer wins the link race (P2002)', async () => {
      const p2002 = Object.assign(new Error('unique constraint'), { code: 'P2002' });
      const repo = buildRepo({
        findByClerkUserId: jest.fn().mockResolvedValue(null),
        findByEmail: jest.fn().mockResolvedValue({ id: 'user-1', clerkUserId: null }),
        linkClerkUserId: jest.fn().mockRejectedValue(p2002),
      });
      const service = new UserProvisioningService(repo);

      await expect(service.upsertFromWebhook(identity)).resolves.toBeUndefined();
      expect(auditLogger.record).not.toHaveBeenCalledWith(
        expect.objectContaining({ action: 'user.provision.webhook_link' }),
      );
    });

    it('links clerkUserId to an existing unlinked row matched by email', async () => {
      const repo = buildRepo({
        findByClerkUserId: jest.fn().mockResolvedValue(null),
        findByEmail: jest.fn().mockResolvedValue({ id: 'user-1', clerkUserId: null }),
      });
      const service = new UserProvisioningService(repo);

      await service.upsertFromWebhook(identity);

      expect(repo.linkClerkUserId).toHaveBeenCalledWith(identity.email, identity.clerkUserId);
      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'user.provision.webhook_link', result: 'success' }),
      );
    });

    it('does not overwrite an existing, different clerkUserId link -- audit-logs an anomaly instead', async () => {
      const repo = buildRepo({
        findByClerkUserId: jest.fn().mockResolvedValue(null),
        findByEmail: jest.fn().mockResolvedValue({ id: 'user-1', clerkUserId: 'clerk-other' }),
      });
      const service = new UserProvisioningService(repo);

      await service.upsertFromWebhook(identity);

      expect(repo.linkClerkUserId).not.toHaveBeenCalled();
      expect(repo.createFromClerkIdentity).not.toHaveBeenCalled();
      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'user.provision.email_collision', result: 'failure' }),
      );
    });
  });

  describe('deactivateByClerkUserId', () => {
    it('deactivates an active, linked User', async () => {
      const repo = buildRepo({
        findByClerkUserId: jest.fn().mockResolvedValue({ id: 'user-1', deactivatedAt: null }),
      });
      const service = new UserProvisioningService(repo);

      await service.deactivateByClerkUserId('clerk-1');

      expect(repo.deactivateByClerkUserId).toHaveBeenCalledWith('clerk-1');
      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'user.provision.deactivate', result: 'success' }),
      );
    });

    it('no-ops when the clerkUserId was never provisioned locally', async () => {
      const repo = buildRepo({ findByClerkUserId: jest.fn().mockResolvedValue(null) });
      const service = new UserProvisioningService(repo);

      await service.deactivateByClerkUserId('clerk-unknown');

      expect(repo.deactivateByClerkUserId).not.toHaveBeenCalled();
    });

    it('no-ops when already deactivated', async () => {
      const repo = buildRepo({
        findByClerkUserId: jest.fn().mockResolvedValue({ id: 'user-1', deactivatedAt: new Date() }),
      });
      const service = new UserProvisioningService(repo);

      await service.deactivateByClerkUserId('clerk-1');

      expect(repo.deactivateByClerkUserId).not.toHaveBeenCalled();
    });
  });
});
