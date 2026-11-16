# ADR-033 — Bilingual (Persian/English) Internationalization Architecture

> Not a converted source document. Authored during the NovaLight full bilingual UI/UX rebuild session, following the ADR pattern in [006-initial-architecture-decisions.md](./006-initial-architecture-decisions.md). Numbered `033` in the flat top-level sequence, immediately following [ADR-032](./032-web-design-foundation.md) / [031](../operations/031-local-cloudflare-tunnel.md).

## Document Metadata

| Field            | Value                                                                                                                                                                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document Version | 1.0                                                                                                                                                                                                                                             |
| Status           | **Accepted** — approved by the repository owner in-session (2026-07-14) as part of authorizing the bilingual rebuild mandate, conditional on consistency with repository-discovery evidence and `CLAUDE.md` constraints (both confirmed below). |
| Document Purpose | Record why `next-intl` was chosen, the locale routing/detection strategy, RTL/LTR handling, translation structure, font strategy, and the migration plan for the four existing routes.                                                          |

## Context

Repository discovery (2026-07-14) confirmed: `apps/web` has **zero i18n infrastructure** — no `next-intl`, `react-i18next`, or `next-translate` dependency; `layout.tsx` hardcodes `lang="en"` and no `dir` attribute; no locale-aware routing exists. This is greenfield, not an extension of partial work. Stack facts that constrain the decision: Next.js `^15.4.6` App Router, React `^19.1.0`, `@clerk/nextjs ^7.5.17` with a single `apps/web/src/middleware.ts` running `clerkMiddleware`, Tailwind v4, shadcn/ui (`components.json` currently has `"rtl": false`), only 3 shadcn primitives installed (`button`, `badge`, `card`), Vitest + React Testing Library (no Playwright yet — added separately per the module/testing plan).

Four real routes exist today and must migrate: `/`, `/sign-in/[[...sign-in]]`, `/sign-up/[[...sign-up]]`, `/(onboarding)/brand-setup`. A fifth route family (`(dashboard)/content`, `(dashboard)/calendar`) is planned per [ADR-034](./034-application-shell-and-module-scope.md) and must be built i18n-native from the start.

## Decision

Adopt **`next-intl`** with **locale-prefixed routing** (`/fa/...`, `/en/...`) under an `app/[locale]/` segment, **Persian (`fa`) as the default locale**, explicit (non-negotiated) locale selection, and Tailwind logical-property RTL/LTR styling.

### Why `next-intl`, not the alternatives

- **`react-i18next`**: mature but not App-Router-native — no built-in Server Component message loading, no `generateMetadata` integration, requires manual provider plumbing per route segment. Would fight the framework rather than use it.
- **Custom roll-your-own** (a `messages` object + `useContext`): rejected — reinvents ICU plural/select formatting, number/date formatting, and ecosystem test-utilities `next-intl` already provides correctly; violates ADR-014's "don't build unnecessary complexity."
- **`next-intl`**: purpose-built for the exact stack in use (Next.js 15 App Router, Server + Client Components, `generateMetadata`), has a documented Clerk-middleware composition pattern (needed here — see below), ICU message format, `useFormatter` for locale-aware dates/numbers, and a documented testing harness for Vitest/RTL. Actively maintained, single dependency, no fork risk.

### Route strategy

```text
app/
├── [locale]/                       # 'fa' | 'en' — generateStaticParams for both
│   ├── layout.tsx                  # <html lang dir>, ClerkProvider, NextIntlClientProvider, Navigation
│   ├── page.tsx                    # landing (was app/page.tsx)
│   ├── sign-in/[[...sign-in]]/page.tsx
│   ├── sign-up/[[...sign-up]]/page.tsx
│   ├── (onboarding)/
│   │   ├── account-setup/page.tsx  # new — see ADR-034
│   │   └── brand-setup/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx              # app shell — see ADR-034
│       ├── content/page.tsx
│       └── calendar/page.tsx
└── layout.tsx                      # minimal passthrough (no <html>/<body> — required file only)
```

`localePrefix: 'always'` (not `'as-needed'`): both locales get an explicit, unambiguous, indexable URL (`/fa`, `/en`) — satisfies the SEO-compatibility requirement and avoids the ambiguity of a bare `/` meaning "whichever locale the server guessed." `/` itself 307-redirects to `/fa`.

### Locale detection and persistence

`localeDetection: false` in `next-intl`'s middleware config — the middleware does **not** negotiate from `Accept-Language`. Rationale: the mandate requires "Persian is the default locale," full stop, not "whichever locale the browser reports" (which is a different, weaker guarantee and would surprise a Persian business owner whose OS is in English). A first-time visitor always lands on `/fa`. Explicit locale selection (via the locale switcher) sets the `NEXT_LOCALE` cookie, which `next-intl`'s middleware then honors on every subsequent request, including the bare-`/` redirect target. This satisfies "locale selection must persist across navigation and reloads" without silently overriding the mandated default for new visitors.

### Composing with Clerk middleware

Next.js 15 permits exactly one `middleware.ts`. `next-intl`'s own documented pattern for this wraps `createMiddleware` inside `clerkMiddleware`'s callback. **Correction (2026-07-14, after independent architecture review found this section didn't match the shipped code):** the actual implementation runs `auth.protect()` **first**, against the _raw, locale-prefixed_ pathname (not locale-stripped), using an `isPublicRoute` matcher list that is itself locale-prefix-aware (`/`, `/:locale`, `/:locale/sign-in(/.*)?`, `/:locale/sign-up(/.*)?`); `intlMiddleware(req)` runs second, as the function's return value. This still fully preserves the protected-by-default posture (ADR-029) — the matcher was written to understand locale prefixes directly rather than relying on `next-intl` to strip them first — but the order and mechanism described in the original version of this section were wrong. Both orderings are architecturally valid; this document now reflects the one actually shipped in `apps/web/src/middleware.ts`.

### RTL/LTR handling

- `app/[locale]/layout.tsx` sets `<html lang={locale} dir={locale === 'fa' ? 'rtl' : 'ltr'}>` — computed from the route param, not a client-side effect, so there is no flash of wrong direction.
- Tailwind: adopt **logical properties** (`ms-*`/`me-*`/`ps-*`/`pe-*`, `start-*`/`end-*`, `text-start`/`text-end`) in place of physical `ml-*`/`mr-*`/`pl-*`/`pr-*`/`left-*`/`right-*` for every new and touched component — Tailwind v4 supports these natively and they flip automatically with `dir`. Existing components (`button`, `badge`, `card`, the landing/shared set) are audited and converted where they use physical properties, as part of the page-redesign pass (ADR-034/task list), not deferred.
- `components.json`'s `"rtl": false` is flipped to `"rtl": true` so any future `shadcn add` generates RTL-aware component code by default.
- **Icon mirroring**: only _directional_ icons (chevrons/arrows that indicate navigation direction, e.g. "next," "back," "expand") mirror; a small `mirrorInRtl` convention (a one-line `rtl:-scale-x-100` utility applied at the call site, not a global icon wrapper) is used per-usage so each case is a deliberate, reviewable decision. Logo, status/semantic icons (check, alert, star), media-player icons, and chart icons never mirror.

### Translation structure

`apps/web/messages/{fa,en}.json`, namespaced by feature, matching the route/feature structure (not one flat file): `common`, `nav`, `landing`, `auth`, `onboarding`, `brandSetup`, `dashboard`, `content`, `calendar`, `validation`, `a11y`. Keys are semantic (`brandSetup.tone.question`, not `brandSetup.field1`). `next-intl`'s ICU support is used for pluralization/interpolation (e.g., `"{count, plural, one {# idea} other {# ideas}}"`). A CI-time key-parity check (`fa.json` and `en.json` must have identical key sets) is added to the lint step so a missing translation fails fast rather than silently falling back.

### Fonts

Geist Sans (current) covers Latin only and has no professional Persian glyph support. Add **Vazirmatn** (a widely-used, professional, variable Persian/Latin webfont family — self-hosted via `next/font/local` or `next/font/google` if available, not a CDN `<link>`, to avoid an external-request CSP/perf issue) as the `fa`-locale font; keep Geist Sans for `en`. `app/[locale]/layout.tsx` conditionally applies the font-variable class based on `locale`. Numbers use Western Arabic digits (0–9) in both locales — matching common practice in Persian SaaS/tech products (not Extended Arabic-Indic digits) — flagged here as a product-copywriting decision, revisit if native-Persian-digit preference is expressed later.

### Metadata and dates/numbers

`generateMetadata` per `[locale]/page.tsx` produces locale-specific `<title>`/`<description>` from the `landing` translation namespace, plus `alternates.languages` pointing at the `fa`/`en` counterpart URLs (hreflang). Dates/numbers use `next-intl`'s `useFormatter` (`format.dateTime`, `format.number`), never hand-rolled `Intl` calls or string concatenation.

### Testing

A shared `renderWithIntl(ui, { locale })` test helper (wrapping `NextIntlClientProvider` with the real message files, not mocked strings, so a missing key fails the test) replaces bare RTL `render` for every component test touching user-facing copy. Existing tests (`page.test.tsx` ×4, `BrandSetupForm.test.tsx`, `navigation.test.tsx`) are migrated to this helper as part of the route migration, not left on the old un-localized assertions.

## Consequences

**Positive**: SEO-correct locale URLs, no client-side-only translation flicker, single source of truth for copy (enables the "no hardcoded bilingual strings in components" requirement), extensible to a third locale by adding one messages file + one routing entry.

**Trade-offs / migration cost**: every existing route file moves one directory level (`app/page.tsx` → `app/[locale]/page.tsx`, etc.) — a mechanical but repo-wide change touching all 4 existing routes' tests and the root `layout.tsx`/`middleware.ts`. All hardcoded English strings in `BrandSetupForm.tsx`, `navigation.tsx`, landing components, etc. must be extracted to message keys — the largest single chunk of migration work. `components.json`'s `"rtl": true` flip means any _already-generated_ component (the 3 existing primitives) needs a manual audit, since the flag only affects future `shadcn add` output, not retroactively.

**Explicitly not done**: no third locale is added now (architecture supports it, scope doesn't require it); no server-side Persian-calendar (Jalali) date system — Gregorian dates formatted in Persian digits/words via `next-intl`, not a Jalali calendar library, since no product document requires Jalali dates and introducing one would be scope creep beyond this mandate.
