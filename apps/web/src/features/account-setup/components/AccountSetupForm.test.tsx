import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithIntl } from '@/test/i18n-test-utils';
import { AccountSetupForm } from './AccountSetupForm';
import * as apiClient from '@/lib/api-client';

const getToken = vi.fn();
vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ getToken }),
}));

const push = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

describe('AccountSetupForm', () => {
  beforeEach(() => {
    getToken.mockReset();
    getToken.mockResolvedValue('test-token');
    push.mockReset();
  });

  it('requires a vertical to be selected before submitting', () => {
    renderWithIntl(<AccountSetupForm />);
    const submitButton = screen.getByRole('button', { name: /create my account/i });
    expect((submitButton as HTMLButtonElement).disabled).toBe(true);
  });

  it('creates the account with the selected vertical and redirects to brand-setup', async () => {
    const apiRequestSpy = vi.spyOn(apiClient, 'apiRequest').mockResolvedValue({
      success: true,
      data: { id: 'account-1', vertical: 'CAFE' },
    });

    renderWithIntl(<AccountSetupForm />);

    fireEvent.click(screen.getByRole('button', { name: /café/i }));
    fireEvent.click(screen.getByRole('button', { name: /create my account/i }));

    await waitFor(() =>
      expect(apiRequestSpy).toHaveBeenCalledWith('/accounts', {
        method: 'POST',
        token: 'test-token',
        body: { vertical: 'CAFE' },
      }),
    );
    await waitFor(() => expect(push).toHaveBeenCalledWith('/brand-setup'));
  });

  it('shows the business error when an account already exists', async () => {
    vi.spyOn(apiClient, 'apiRequest').mockResolvedValue({
      success: false,
      error: { code: 'BUSINESS_ERROR', message: 'An account already exists for this user' },
    });

    renderWithIntl(<AccountSetupForm />);
    fireEvent.click(screen.getByRole('button', { name: /restaurant/i }));
    fireEvent.click(screen.getByRole('button', { name: /create my account/i }));

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('already exists'));
  });

  it('shows an error when no session token is available', async () => {
    getToken.mockResolvedValue(null);
    const apiRequestSpy = vi.spyOn(apiClient, 'apiRequest');

    renderWithIntl(<AccountSetupForm />);
    fireEvent.click(screen.getByRole('button', { name: /beauty salon/i }));
    fireEvent.click(screen.getByRole('button', { name: /create my account/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('session has expired'),
    );
    expect(apiRequestSpy).not.toHaveBeenCalled();
  });
});
