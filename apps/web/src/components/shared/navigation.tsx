'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { Menu } from 'lucide-react';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Logo } from '@/components/shared/logo';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';
import { Button } from '@/components/ui/button';

/** Shared link list markup -- desktop and mobile only differ in wrapper layout, not link rendering. */
function NavLinks({
  linkClassName,
  onLinkClick,
  labels,
}: {
  linkClassName: string;
  onLinkClick?: () => void;
  labels: { href: string; label: string }[];
}) {
  return (
    <>
      {labels.map((link) => (
        <a key={link.href} href={link.href} onClick={onLinkClick} className={linkClassName}>
          {link.label}
        </a>
      ))}
    </>
  );
}

/**
 * Single site-wide header (rendered once, from the locale layout). Marketing anchor links only
 * make sense on the landing page, so they're shown only when pathname is "/" -- `usePathname`
 * here is next-intl's locale-aware version (`@/i18n/navigation`), which already strips the
 * locale prefix.
 *
 * Below `sm` (640px), the locale switcher and signed-out auth controls move into the same
 * disclosure drawer as the marketing links, rather than staying inline in the top bar --
 * real Playwright evidence (mobile viewport screenshot, this session) showed Logo + hamburger +
 * locale-switcher pills + "Sign in" + "Start creating" all fighting for ~412px of width and
 * clipping the last button off-screen. The drawer is now the general "mobile menu," not just a
 * marketing-links-only affordance, and renders on every route (not only the landing page).
 */
export function Navigation() {
  const t = useTranslations('nav');
  const ta11y = useTranslations('a11y');
  const pathname = usePathname();
  const isLanding = pathname === '/';
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  const marketingLinks = [
    { href: '#product', label: t('product') },
    { href: '#how-it-works', label: t('howItWorks') },
    { href: '#audience', label: t('forBusinesses') },
  ];

  function closeMobileMenu() {
    if (mobileMenuRef.current) {
      mobileMenuRef.current.open = false;
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6 sm:px-8">
        <Logo />

        {isLanding ? (
          <nav
            aria-label={ta11y('primaryNavigation')}
            className="hidden items-center gap-7 md:flex"
          >
            <NavLinks
              labels={marketingLinks}
              linkClassName="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            />
          </nav>
        ) : null}

        {/* Inline on >= sm; moves into the drawer below sm. */}
        <div className="hidden items-center gap-2.5 sm:flex">
          <LocaleSwitcher />
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">
                {t('signIn')}
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm">{t('signUp')}</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <Show when="signed-in">
            <UserButton />
          </Show>

          {/*
            Native <details>/<summary> disclosure -- keyboard-accessible and dismissable by
            default with zero JS and no new component dependency.
          */}
          <details ref={mobileMenuRef} className="relative">
            <summary
              className="flex size-9 list-none items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&::-webkit-details-marker]:hidden"
              aria-label={t('openMenu')}
            >
              <Menu className="size-5" aria-hidden="true" />
            </summary>
            <div className="absolute end-0 top-full z-50 mt-2 flex w-56 flex-col gap-3 rounded-lg border border-border bg-popover p-3 shadow-lg">
              {isLanding ? (
                <nav aria-label={ta11y('primaryNavigation')} className="flex flex-col gap-1">
                  <NavLinks
                    labels={marketingLinks}
                    linkClassName="rounded-md px-3 py-2 text-sm font-medium text-popover-foreground transition-colors hover:bg-muted"
                    onLinkClick={closeMobileMenu}
                  />
                </nav>
              ) : null}
              <div className="flex flex-col gap-2 border-t border-border/70 pt-3 first:border-t-0 first:pt-0">
                <LocaleSwitcher />
                <Show when="signed-out">
                  <div className="flex flex-col gap-2">
                    <SignInButton mode="modal">
                      <Button variant="ghost" size="sm" className="justify-start">
                        {t('signIn')}
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button size="sm">{t('signUp')}</Button>
                    </SignUpButton>
                  </div>
                </Show>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
