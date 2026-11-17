import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/account-setup/components/AccountSetupForm', () => ({
  AccountSetupForm: () => <div data-testid="account-setup-form" />,
}));

import AccountSetupPage from './page';

describe('AccountSetupPage', () => {
  it('renders a localized heading and the account-setup form', async () => {
    render(await AccountSetupPage());

    expect(screen.getByRole('heading', { name: 'Tell us about your business' })).toBeTruthy();
    expect(screen.getByTestId('account-setup-form')).toBeTruthy();
  });
});
