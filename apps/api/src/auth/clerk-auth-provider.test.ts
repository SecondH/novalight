import { ClerkAuthProvider } from './clerk-auth-provider';
import type { UserProvisioningService } from '../services/user-provisioning.service';

/**
 * No live Clerk account/keys exist in this environment (see docs/operations/025-m1.6-
 * operational-activation-report.md) -- these tests mock @clerk/backend's SDK surface to verify
 * ClerkAuthProvider's own logic (mapping, error handling, the AuthProvider contract) without
 * a real network call. They do not prove Clerk's actual JWT verification works; that requires
 * a live account, per the same report.
 */
const verifyToken = jest.fn();
const getUser = jest.fn();
const revokeSession = jest.fn();

jest.mock('@clerk/backend', () => ({
  createClerkClient: () => ({
    users: { getUser: (...args: unknown[]) => getUser(...args) },
    sessions: { revokeSession: (...args: unknown[]) => revokeSession(...args) },
  }),
  verifyToken: (...args: unknown[]) => verifyToken(...args),
}));

describe('ClerkAuthProvider', () => {
  const resolveOrProvisionLocalUserId = jest.fn();
  const userProvisioningService = {
    resolveOrProvisionLocalUserId,
  } as unknown as UserProvisioningService;
  const provider = new ClerkAuthProvider('sk_test_fake', userProvisioningService);

  beforeEach(() => {
    verifyToken.mockReset();
    getUser.mockReset();
    revokeSession.mockReset();
    resolveOrProvisionLocalUserId.mockReset();
  });

  describe('verifySession', () => {
    it("returns the AuthenticatedIdentity shape with the local User.id, not Clerk's sub, on a valid token", async () => {
      verifyToken.mockResolvedValue({ sub: 'user_123', sid: 'sess_456' });
      getUser.mockResolvedValue({
        primaryEmailAddressId: 'email_1',
        emailAddresses: [{ id: 'email_1', emailAddress: 'owner@example.test' }],
      });
      resolveOrProvisionLocalUserId.mockResolvedValue('local-uuid-1');

      const identity = await provider.verifySession('a-valid-token');

      expect(identity).toEqual({ userId: 'local-uuid-1', email: 'owner@example.test' });
      expect(verifyToken).toHaveBeenCalledWith('a-valid-token', { secretKey: 'sk_test_fake' });
      expect(resolveOrProvisionLocalUserId).toHaveBeenCalledWith({
        clerkUserId: 'user_123',
        email: 'owner@example.test',
      });
    });

    it('returns null, not a thrown error, when the token fails verification (401 via requireAuthentication, no internal leak)', async () => {
      verifyToken.mockRejectedValue(new Error('Clerk: token expired'));

      const identity = await provider.verifySession('an-expired-token');

      expect(identity).toBeNull();
    });

    it('returns null if the Clerk user has no primary email address', async () => {
      verifyToken.mockResolvedValue({ sub: 'user_123', sid: 'sess_456' });
      getUser.mockResolvedValue({ primaryEmailAddressId: null, emailAddresses: [] });

      const identity = await provider.verifySession('a-valid-token');

      expect(identity).toBeNull();
      expect(resolveOrProvisionLocalUserId).not.toHaveBeenCalled();
    });

    it('returns null (fails closed) when the mapped local User is deactivated', async () => {
      verifyToken.mockResolvedValue({ sub: 'user_123', sid: 'sess_456' });
      getUser.mockResolvedValue({
        primaryEmailAddressId: 'email_1',
        emailAddresses: [{ id: 'email_1', emailAddress: 'owner@example.test' }],
      });
      resolveOrProvisionLocalUserId.mockResolvedValue(null);

      const identity = await provider.verifySession('a-valid-token');

      expect(identity).toBeNull();
    });
  });

  describe('invalidateSession', () => {
    it('revokes the session using the sid claim from the verified token, not the raw token', async () => {
      verifyToken.mockResolvedValue({ sub: 'user_123', sid: 'sess_456' });

      await provider.invalidateSession('a-valid-token');

      expect(revokeSession).toHaveBeenCalledWith('sess_456');
    });

    it('is a no-op if the token is already invalid', async () => {
      verifyToken.mockRejectedValue(new Error('invalid'));

      await provider.invalidateSession('bad-token');

      expect(revokeSession).not.toHaveBeenCalled();
    });
  });
});
