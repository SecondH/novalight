import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    // Explicit default avoids next-intl's ENVIRONMENT_FALLBACK warning/hydration-mismatch risk
    // for date/number formatting (`useFormatter`) -- Asia/Tehran matches the product's primary
    // market; not user-configurable yet since no per-account timezone setting exists.
    timeZone: 'Asia/Tehran',
  };
});
