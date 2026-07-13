import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/nextjs', () => ({
  SignUp: () => <div data-testid="clerk-sign-up-stub" />,
}));

import SignUpPage from './page';

describe('SignUpPage', () => {
  it('renders the Clerk hosted SignUp component', () => {
    render(<SignUpPage />);
    expect(screen.getByTestId('clerk-sign-up-stub')).toBeTruthy();
  });
});
