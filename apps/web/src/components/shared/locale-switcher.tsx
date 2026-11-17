'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const LOCALE_LABELS: Record<AppLocale, string> = {
  fa: 'فارسی',
  en: 'English',
};

/**
 * Switching locale keeps the user on the same route (`usePathname`/`useRouter` here are
 * next-intl's locale-aware versions from `@/i18n/navigation`, not `next/navigation`'s) and sets
 * the `NEXT_LOCALE` cookie so the choice persists across reloads and future visits -- see
 * ADR-033 "Locale detection and persistence".
 */
export function LocaleSwitcher() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      role="group"
      aria-label={t('localeSwitcherLabel')}
      className="flex items-center gap-0.5 rounded-full border border-border/70 p-0.5"
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          aria-pressed={loc === locale}
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
            loc === locale
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {LOCALE_LABELS[loc]}
        </button>
      ))}
    </div>
  );
}
