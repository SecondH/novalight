import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/nextjs', () => ({
  SignIn: () => <div data-testid="clerk-sign-in-stub" />,
}));

import SignInPage from './page';

describe('SignInPage', () => {
  it('renders the Clerk hosted SignIn component', () => {
    render(<SignInPage />);
    expect(screen.getByTestId('clerk-sign-in-stub')).toBeTruthy();
  });
});
