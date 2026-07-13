import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const getToken = vi.fn();
const authMock = vi.fn(() => Promise.resolve({ getToken }));

vi.mock('@clerk/nextjs/server', () => ({
  auth: () => authMock(),
}));

vi.mock('@/features/brand-setup/components/BrandSetupForm', () => ({
  BrandSetupForm: ({ token }: { token: string }) => (
    <div data-testid="brand-setup-form">{token}</div>
  ),
}));

import BrandSetupPage from './page';

describe('BrandSetupPage', () => {
  it('renders the form with the session token when signed in', async () => {
    getToken.mockResolvedValue('session-token-1');

    const element = await BrandSetupPage();
    render(element);

    expect(screen.getByTestId('brand-setup-form').textContent).toBe('session-token-1');
  });

  it('renders a fallback when no token is available (defensive -- middleware normally blocks this first)', async () => {
    getToken.mockResolvedValue(null);

    const element = await BrandSetupPage();
    render(element);

    expect(screen.getByText(/sign in to continue/i)).toBeTruthy();
  });
});
