/**
 * Required by the App Router but intentionally minimal -- the real root layout (html/body,
 * fonts, ClerkProvider, NextIntlClientProvider, Navigation) lives in `[locale]/layout.tsx` per
 * ADR-033, since <html lang/dir> must be computed from the locale route param.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
