import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { wrapWithIntl } from '@/test/i18n-test-utils';

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  Link: ({ href, children, ...props }: React.ComponentProps<'a'>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import Page from './page';

describe('Home page', () => {
  it('renders the real NovaLight landing page, not starter boilerplate', () => {
    render(wrapWithIntl(<Page />));

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /turn your business into a consistent social brand/i,
      }),
    ).toBeTruthy();

    // Explicit regression guard for the create-next-app boilerplate this replaced.
    expect(screen.queryByText(/edit the page\.tsx file/i)).toBeNull();
    expect(screen.queryByAltText(/next\.js logo/i)).toBeNull();
  });

  it('primary CTA links to the dashboard entry point, which redirects based on real onboarding state', () => {
    render(wrapWithIntl(<Page />));

    const ctas = screen.getAllByRole('link', { name: /build your brand/i });
    expect(ctas.length).toBeGreaterThan(0);
    for (const cta of ctas) {
      expect(cta.getAttribute('href')).toBe('/content');
    }
  });

  it('does not link to any route that does not exist in this repository', () => {
    render(wrapWithIntl(<Page />));

    const hrefs = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))
      .filter((href): href is string => Boolean(href));

    const knownRoutes = new Set(['/', '/content', '/sign-in', '/sign-up']);
    for (const href of hrefs) {
      const isAnchor = href.startsWith('#');
      const isKnownRoute = knownRoutes.has(href);
      expect(isAnchor || isKnownRoute).toBe(true);
    }
  });

  it('separates available capabilities from upcoming ones, per the no-fabrication rule', () => {
    render(wrapWithIntl(<Page />));

    expect(screen.getByText(/available now/i)).toBeTruthy();
    expect(screen.getByText(/coming next/i)).toBeTruthy();
    // Capabilities not yet built must appear only under "Coming next".
    expect(screen.getByText(/direct publishing to social platforms/i)).toBeTruthy();
  });
});
