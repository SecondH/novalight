import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// No server-side Clerk auth() call to mock -- the page no longer fetches a token itself
// (BrandSetupForm fetches its own fresh token client-side at submit time; src/middleware.ts is
// the actual protection boundary for this route, unaffected by this page's own render logic).
vi.mock('@/features/brand-setup/components/BrandSetupForm', () => ({
  BrandSetupForm: () => <div data-testid="brand-setup-form" />,
}));

import BrandSetupPage from './page';

describe('BrandSetupPage', () => {
  it('renders a localized heading and the brand-setup form', async () => {
    render(await BrandSetupPage());

    expect(screen.getByRole('heading', { name: 'Build your brand profile' })).toBeTruthy();
    expect(screen.getByTestId('brand-setup-form')).toBeTruthy();
  });
});
