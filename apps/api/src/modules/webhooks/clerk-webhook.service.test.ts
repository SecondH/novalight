const verify = jest.fn();

jest.mock('svix', () => ({
  Webhook: jest
    .fn()
    .mockImplementation(() => ({ verify: (...args: unknown[]) => verify(...args) })),
}));

jest.mock('../../config/env', () => ({
  env: {
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    CLERK_WEBHOOK_SIGNING_SECRET: 'not-a-real-secret',
  },
}));

jest.mock('../../audit/pino-audit-logger', () => ({
  auditLogger: { record: jest.fn().mockResolvedValue(undefined) },
}));

const upsertFromWebhook = jest.fn().mockResolvedValue(undefined);
const deactivateByClerkUserId = jest.fn().mockResolvedValue(undefined);

jest.mock('../../services/user-provisioning.service', () => ({
  UserProvisioningService: jest.fn().mockImplementation(() => ({
    upsertFromWebhook: (...args: unknown[]) => upsertFromWebhook(...args),
    deactivateByClerkUserId: (...args: unknown[]) => deactivateByClerkUserId(...args),
  })),
}));

import { ClerkWebhookService } from './clerk-webhook.service';
import { auditLogger } from '../../audit/pino-audit-logger';

const headers = { 'svix-id': 'msg_1', 'svix-timestamp': '123', 'svix-signature': 'v1,sig' };

describe('ClerkWebhookService', () => {
  const service = new ClerkWebhookService();

  beforeEach(() => {
    verify.mockReset();
    upsertFromWebhook.mockClear();
    deactivateByClerkUserId.mockClear();
    (auditLogger.record as jest.Mock).mockClear();
  });

  it('dispatches user.created to upsertFromWebhook with the primary email', async () => {
    verify.mockReturnValue({
      type: 'user.created',
      data: {
        id: 'clerk_1',
        primary_email_address_id: 'email_1',
        email_addresses: [{ id: 'email_1', email_address: 'user@example.com' }],
      },
    });

    await service.verifyAndDispatch(Buffer.from('{}'), headers);

    expect(upsertFromWebhook).toHaveBeenCalledWith({
      clerkUserId: 'clerk_1',
      email: 'user@example.com',
    });
    expect(auditLogger.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'webhook.clerk.received', result: 'success' }),
    );
    expect(auditLogger.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'webhook.clerk.verified',
        actor: 'clerk_1',
        result: 'success',
      }),
    );
  });

  it('dispatches user.updated the same way as user.created', async () => {
    verify.mockReturnValue({
      type: 'user.updated',
      data: {
        id: 'clerk_1',
        primary_email_address_id: 'email_1',
        email_addresses: [{ id: 'email_1', email_address: 'user@example.com' }],
      },
    });

    await service.verifyAndDispatch(Buffer.from('{}'), headers);

    expect(upsertFromWebhook).toHaveBeenCalledWith({
      clerkUserId: 'clerk_1',
      email: 'user@example.com',
    });
  });

  it('dispatches user.deleted to deactivateByClerkUserId, no email required', async () => {
    verify.mockReturnValue({ type: 'user.deleted', data: { id: 'clerk_1' } });

    await service.verifyAndDispatch(Buffer.from('{}'), headers);

    expect(deactivateByClerkUserId).toHaveBeenCalledWith('clerk_1');
  });

  it('no-ops on an unrecognized event type (forward-compatible)', async () => {
    verify.mockReturnValue({
      type: 'session.created',
      data: { id: 'sess_1', email_addresses: [] },
    });

    await service.verifyAndDispatch(Buffer.from('{}'), headers);

    expect(upsertFromWebhook).not.toHaveBeenCalled();
    expect(deactivateByClerkUserId).not.toHaveBeenCalled();
  });

  it('throws a 400 ApiError, and never calls provisioning, when signature verification fails', async () => {
    verify.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    await expect(service.verifyAndDispatch(Buffer.from('{}'), headers)).rejects.toMatchObject({
      statusCode: 400,
      category: 'authentication',
    });
    expect(upsertFromWebhook).not.toHaveBeenCalled();
    expect(deactivateByClerkUserId).not.toHaveBeenCalled();
    expect(auditLogger.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'webhook.clerk.rejected',
        actor: 'msg_1',
        result: 'failure',
      }),
    );
  });

  it('audit-logs webhook.clerk.rejected when no signing secret is configured', async () => {
    jest.resetModules();
    jest.doMock('../../config/env', () => ({
      // No CLERK_WEBHOOK_SIGNING_SECRET key at all -- simulates the unset-env-var case.
      env: { NODE_ENV: 'test', LOG_LEVEL: 'silent' },
    }));
    const { ClerkWebhookService: FreshService } = await import('./clerk-webhook.service');
    const { auditLogger: freshAuditLogger } = await import('../../audit/pino-audit-logger');
    const freshService = new FreshService();

    await expect(freshService.verifyAndDispatch(Buffer.from('{}'), headers)).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(freshAuditLogger.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'webhook.clerk.rejected', result: 'failure' }),
    );
  });

  it('audit-logs a failure and skips provisioning when user.created has no resolvable primary email', async () => {
    verify.mockReturnValue({
      type: 'user.created',
      data: { id: 'clerk_1', primary_email_address_id: 'missing', email_addresses: [] },
    });

    await service.verifyAndDispatch(Buffer.from('{}'), headers);

    expect(upsertFromWebhook).not.toHaveBeenCalled();
    expect(auditLogger.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'webhook.clerk.user.created', result: 'failure' }),
    );
  });
});
