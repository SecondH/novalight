import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { Geist, Geist_Mono, Vazirmatn } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { faIR, enUS } from '@clerk/localizations';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Navigation } from '@/components/shared/navigation';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Geist Sans has no Persian glyph coverage -- Vazirmatn is the professional Persian/Latin
// webfont used for the `fa` locale. Self-hosted via next/font/google (bundled at build time,
// no external request at runtime), not a CDN <link> -- see ADR-033 "Fonts".
const vazirmatn = Vazirmatn({
  variable: '--font-vazirmatn',
  subsets: ['arabic', 'latin'],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'landing.meta' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      languages: { fa: '/fa', en: '/en' },
    },
  };
}

// Sets the `dark` class from system preference before first paint, so dark mode (driven by
// shadcn's `.dark`-class token scheme, not a media query) matches the OS without a flash of the
// wrong theme. No theme-toggle UI exists yet in this release -- system preference is the only
// signal, matching the scope of R1/R2.
const THEME_INIT_SCRIPT = `
  try {
    var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', d);
  } catch (e) {}
`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for this locale's Server Components -- next-intl requirement
  // when the locale comes from a route param rather than a single fixed locale.
  setRequestLocale(locale);

  const dir = locale === 'fa' ? 'rtl' : 'ltr';
  // Overrides globals.css's `--font-sans: var(--font-geist-sans)` per-locale, rather than
  // duplicating every font-family rule -- see ADR-033 "Fonts".
  const fontVars = {
    '--font-sans': locale === 'fa' ? 'var(--font-vazirmatn)' : 'var(--font-geist-sans)',
  } as CSSProperties;

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} h-full antialiased motion-safe:scroll-smooth`}
      style={fontVars}
      // The pre-paint theme script below adds `dark` to this element before React hydrates;
      // without this, every dark-mode visit logs a hydration mismatch. Applies to this element's
      // own attributes only, not its children.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <SkipLink locale={locale} />
          <ClerkProvider localization={locale === 'fa' ? faIR : enUS}>
            <Navigation />
            <div className="flex flex-1 flex-col">{children}</div>
          </ClerkProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

async function SkipLink({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'nav' });
  return (
    <a
      href="#main-content"
      className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:start-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-primary-foreground"
    >
      {t('skipToContent')}
    </a>
  );
}
