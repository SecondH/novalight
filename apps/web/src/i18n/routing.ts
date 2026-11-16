import { defineRouting } from 'next-intl/routing';

/**
 * `localePrefix: 'always'` gives both locales an explicit, indexable URL (`/fa`, `/en`) --
 * required for the locale-aware metadata/hreflang requirement. `localeDetection: false` means
 * a first-time visitor always lands on `fa` (the mandated default) rather than whatever the
 * browser's Accept-Language header negotiates to -- see ADR-033.
 */
export const routing = defineRouting({
  locales: ['fa', 'en'],
  defaultLocale: 'fa',
  localePrefix: 'always',
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
