import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '../../messages/en.json';
import fa from '../../messages/fa.json';

const MESSAGES = { en, fa } as const;
export type TestLocale = keyof typeof MESSAGES;

/**
 * Wraps a component under test with the *real* message files (not mocked strings), per
 * ADR-033 "Testing" -- a missing/renamed translation key fails the test the same way it would
 * fail in production, instead of silently passing against a hand-rolled stub.
 */
export function renderWithIntl(ui: ReactElement, { locale = 'en' }: { locale?: TestLocale } = {}) {
  return render(
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="Asia/Tehran">
      {ui}
    </NextIntlClientProvider>,
  );
}

export function wrapWithIntl(ui: ReactNode, { locale = 'en' }: { locale?: TestLocale } = {}) {
  return (
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="Asia/Tehran">
      {ui}
    </NextIntlClientProvider>
  );
}
