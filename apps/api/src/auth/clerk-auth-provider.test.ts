import { ClerkAuthProvider } from './clerk-auth-provider';

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
  const provider = new ClerkAuthProvider('sk_test_fake');

  beforeEach(() => {
    verifyToken.mockReset();
    getUser.mockReset();
    revokeSession.mockReset();
  });

  describe('verifySession', () => {
    it('returns the AuthenticatedIdentity shape on a valid token', async () => {
      verifyToken.mockResolvedValue({ sub: 'user_123', sid: 'sess_456' });
      getUser.mockResolvedValue({
        primaryEmailAddressId: 'email_1',
        emailAddresses: [{ id: 'email_1', emailAddress: 'owner@example.test' }],
      });

      const identity = await provider.verifySession('a-valid-token');

      expect(identity).toEqual({ userId: 'user_123', email: 'owner@example.test' });
      expect(verifyToken).toHaveBeenCalledWith('a-valid-token', { secretKey: 'sk_test_fake' });
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
