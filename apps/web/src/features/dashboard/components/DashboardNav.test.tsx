import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { wrapWithIntl } from '@/test/i18n-test-utils';

const usePathname = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  usePathname: () => usePathname(),
  Link: ({ href, children, ...props }: React.ComponentProps<'a'>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { DashboardNav } from './DashboardNav';

describe('DashboardNav', () => {
  it('marks the current route active via aria-current', () => {
    usePathname.mockReturnValue('/content');
    render(wrapWithIntl(<DashboardNav />));

    expect(screen.getByRole('link', { name: /content/i }).getAttribute('aria-current')).toBe(
      'page',
    );
    expect(screen.getByRole('link', { name: /calendar/i }).getAttribute('aria-current')).toBeNull();
  });

  it('shows Settings as a non-interactive coming-soon item, not a dead link', () => {
    usePathname.mockReturnValue('/content');
    render(wrapWithIntl(<DashboardNav />));

    expect(screen.queryByRole('link', { name: /settings/i })).toBeNull();
    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('Coming soon')).toBeTruthy();
  });
});
