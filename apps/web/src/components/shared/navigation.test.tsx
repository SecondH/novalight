import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { wrapWithIntl } from '@/test/i18n-test-utils';

const usePathname = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  usePathname: () => usePathname(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  Link: ({ href, children, ...props }: React.ComponentProps<'a'>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Minimal stubs -- this suite tests Navigation's own structure/interaction, not Clerk's
// signed-in/signed-out logic (that's Clerk's own, already covered by ADR-029/030's backend
// activation tests). `Show` renders only the "signed-out" branch, matching a default logged-out
// visitor -- the case the landing page's marketing nav actually matters for.
vi.mock('@clerk/nextjs', () => ({
  Show: ({ when, children }: { when: string; children: React.ReactNode }) =>
    when === 'signed-out' ? children : null,
  SignInButton: ({ children }: { children: React.ReactNode }) => children,
  SignUpButton: ({ children }: { children: React.ReactNode }) => children,
  UserButton: () => <div data-testid="clerk-user-button-stub" />,
}));

import { Navigation } from './navigation';

describe('Navigation', () => {
  it('shows the marketing links only on the landing page', () => {
    usePathname.mockReturnValue('/');
    render(wrapWithIntl(<Navigation />));

    expect(screen.getAllByRole('link', { name: 'Product' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'How it works' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'For businesses' }).length).toBeGreaterThan(0);
  });

  it('hides the marketing links on every other route', () => {
    usePathname.mockReturnValue('/brand-setup');
    render(wrapWithIntl(<Navigation />));

    expect(screen.queryByRole('link', { name: 'Product' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'How it works' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'For businesses' })).toBeNull();
  });

  it('still shows the wordmark and Clerk auth controls on non-landing routes', () => {
    usePathname.mockReturnValue('/sign-in');
    render(wrapWithIntl(<Navigation />));

    // Auth controls render twice below sm (once inline for >= sm, once inside the mobile
    // drawer) -- see the responsive-overflow fix in this component's doc comment.
    expect(screen.getByRole('link', { name: /novalight/i })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /sign in/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /start creating/i }).length).toBeGreaterThan(0);
  });

  it('shows the locale switcher on every route', () => {
    usePathname.mockReturnValue('/sign-in');
    render(wrapWithIntl(<Navigation />));

    expect(screen.getAllByRole('group', { name: 'Language' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'فارسی' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'English' }).length).toBeGreaterThan(0);
  });

  it('closes the mobile menu disclosure after a link is clicked', () => {
    usePathname.mockReturnValue('/');
    render(wrapWithIntl(<Navigation />));

    // The mobile nav renders a second copy of each link (desktop nav + mobile disclosure) --
    // the mobile one is the second in document order, inside the <details>.
    const mobileLink = screen.getAllByRole('link', { name: 'How it works' })[1];
    const details = mobileLink.closest('details');
    expect(details).not.toBeNull();

    details!.open = true;
    fireEvent.click(mobileLink);

    expect(details!.open).toBe(false);
  });

  it('every marketing link points to a real in-page anchor', () => {
    usePathname.mockReturnValue('/');
    render(wrapWithIntl(<Navigation />));

    const hrefs = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))
      .filter((href): href is string => Boolean(href) && href !== '/');

    for (const href of hrefs) {
      expect(href.startsWith('#')).toBe(true);
    }
  });
});
