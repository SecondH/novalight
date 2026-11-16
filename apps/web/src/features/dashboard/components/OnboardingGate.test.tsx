import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { wrapWithIntl } from '@/test/i18n-test-utils';
import { OnboardingGate } from './OnboardingGate';
import * as apiClient from '@/lib/api-client';

const getToken = vi.fn();
vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ getToken }),
}));

const replace = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

describe('OnboardingGate', () => {
  beforeEach(() => {
    getToken.mockReset();
    getToken.mockResolvedValue('test-token');
    replace.mockReset();
  });

  it('redirects to /account-setup when the user has no Account yet', async () => {
    vi.spyOn(apiClient, 'apiRequest').mockImplementation(async (path) => {
      if (path === '/accounts/me') {
        return {
          success: false,
          error: { code: 'BUSINESS_ERROR', message: 'No account exists for this user yet' },
        };
      }
      throw new Error(`unexpected path ${path}`);
    });

    render(wrapWithIntl(<OnboardingGate>{'dashboard content'}</OnboardingGate>));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/account-setup'));
  });

  it('redirects to /brand-setup when the Account exists but Brand intake is not done (data: null)', async () => {
    vi.spyOn(apiClient, 'apiRequest').mockImplementation(async (path) => {
      if (path === '/accounts/me') return { success: true, data: { id: 'account-1' } };
      if (path === '/brands/me') return { success: true, data: null };
      throw new Error(`unexpected path ${path}`);
    });

    render(wrapWithIntl(<OnboardingGate>{'dashboard content'}</OnboardingGate>));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/brand-setup'));
  });

  it('renders children once both Account and Brand exist', async () => {
    vi.spyOn(apiClient, 'apiRequest').mockImplementation(async (path) => {
      if (path === '/accounts/me') return { success: true, data: { id: 'account-1' } };
      if (path === '/brands/me') return { success: true, data: { id: 'brand-1' } };
      throw new Error(`unexpected path ${path}`);
    });

    render(wrapWithIntl(<OnboardingGate>{'dashboard content'}</OnboardingGate>));

    expect(await screen.findByText('dashboard content')).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });
});
