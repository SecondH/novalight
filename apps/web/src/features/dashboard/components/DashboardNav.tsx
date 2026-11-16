'use client';

import { useTranslations } from 'next-intl';
import { Sparkles, CalendarDays, Settings } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/content', key: 'content', icon: Sparkles },
  { href: '/calendar', key: 'calendar', icon: CalendarDays },
] as const;

/**
 * A 3-item horizontal tab bar, not a collapsible sidebar -- per ADR-014 ("don't build
 * unnecessary complexity ahead of approved requirements"), a full sidebar-rail pattern isn't
 * justified for exactly two real destinations (Content, Calendar) plus one honest placeholder
 * (Settings). Easily promoted to a sidebar later if the module count grows.
 */
export function DashboardNav() {
  const t = useTranslations('dashboard.nav');
  const tCommon = useTranslations('common');
  const pathname = usePathname();

  return (
    <nav
      aria-label={t('content')}
      className="flex items-center gap-1 overflow-x-auto border-b border-border/70 px-6 sm:px-8"
    >
      {TABS.map(({ href, key, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {t(key)}
          </Link>
        );
      })}
      <span
        aria-disabled="true"
        className="ms-auto flex items-center gap-2 px-3 py-3 text-sm font-medium text-muted-foreground/60"
      >
        <Settings className="size-4" aria-hidden="true" />
        {t('settings')}
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
          {tCommon('comingSoon')}
        </span>
      </span>
    </nav>
  );
}
