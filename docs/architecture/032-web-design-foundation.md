# 032 — Web Design Foundation (R1/R2: Design System + Landing Page)

> Not a converted source document. Authored during the NovaLight UI/UX transformation session (R1: Design Foundation, R2: Premium Landing Page). Numbered `032` in the flat top-level sequence, following `031-local-cloudflare-tunnel.md`.

## Document Metadata

| Field   | Value                                                                                                                                                                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Status  | Point-in-time implementation record                                                                                                                                                                                                        |
| Scope   | `apps/web` only — no backend, API contract, Clerk logic, Groq integration, or database schema touched                                                                                                                                      |
| Related | Design Maturity Audit (a Claude Artifact delivered in-session, not a file in this repository — no stable link to record here), [ADR-007](./006-initial-architecture-decisions.md), [Frontend Architecture](./011-frontend-architecture.md) |

## 1. Why this exists

Before this session, `apps/web` had four real routes (`/`, `/sign-in`, `/sign-up`, `/brand-setup`), and the landing page was the unmodified `create-next-app` boilerplate — no design system, no shadcn/ui, no icon library, no motion. A design maturity audit conducted earlier in this session scored the honest baseline at **14/100** against a 95+ target. This document records what R1 (Design Foundation) and R2 (Premium Landing Page) actually built, not what future milestones (Dashboard, Content Calendar, AI Workspace, Settings, Profile) will need — those don't exist yet and are explicitly out of scope here.

## 2. Design direction

Cool-neutral foundation with a single indigo/violet accent (oklch hue 277), restrained gradients, hairline borders over heavy shadows, generous whitespace. Directly informed by two tool passes run earlier in this session:

- **`ui-ux-pro-max` skill** (`--design-system` search): converged on "Minimalism & Swiss Style" ("Enterprise apps, dashboards, SaaS platforms, professional tools," WCAG AAA, Tailwind 10/10 compatibility) over the tool's own "Liquid Glass" and "Dark Mode OLED" alternatives. Color search across SaaS/fintech/B2B palettes converged on indigo as the recurring credible accent for this product category.
- **21st.dev search** (3 components reviewed, ideas extracted not copied): a glass-nav SaaS hero pattern (idea taken: one moment of visual richness, not applied everywhere), a dual-palette dashboard shell (idea taken: name light/dark as distinct considered systems, not a mechanical inversion), a workbench sidebar (idea explicitly rejected for global use: glass as the default card style would violate the "never flashy" brief).

### Rejected approaches

- Purple-to-blue gradient hero — common AI-SaaS default, explicitly avoided.
- Glassmorphism as the default card style — used nowhere in the shipped landing page; reserved as a future option for exactly one focal moment per screen, not adopted here.
- A second display typeface — character comes from weight/tracking on the existing Geist Sans, not an added font dependency.
- Framer Motion — evaluated and rejected for R1/R2. `tw-animate-css` (pulled in automatically by `shadcn init`) provides `motion-safe:animate-in`/`fade-in`/`slide-in-from-*` utilities, which covered every animation need in this release (hero entrance, staggered step reveal) without a new runtime dependency. Revisit only if a future page needs orchestration `tw-animate-css` can't express.

## 3. Design tokens

Defined in `apps/web/src/app/globals.css`, layered on top of shadcn/ui's generated token scheme (`shadcn init` used the "base-nova" style with Base UI + Lucide). Values only were changed — the variable _names_ shadcn generates were kept as-is, so every shadcn component continues to work without modification.

Neutrals carry a deliberate slight cool bias toward the accent hue (277) rather than pure achromatic gray — e.g. `--background: oklch(0.99 0.003 277)`, not `oklch(0.99 0 0)`. Semantic colors (`--success`, `--warning`, `--destructive`) are independent hues from the accent and never doubled as decoration.

**Bug fixed during this work:** `shadcn init` wrote `--font-sans: var(--font-sans)` — a circular reference. This project's actual Next.js font variable (set in `layout.tsx` via `next/font/google`) is `--font-geist-sans`, not `--font-sans`. Corrected to `--font-sans: var(--font-geist-sans)`.

**Contrast fix applied after independent review:** the first token pass had two WCAG AA failures — `--success`/`--success-foreground` computed to ≈3.66:1 (needs 4.5:1 for the badge's 12px text), and `--primary`/`--primary-foreground` computed to ≈4.45:1 (just under threshold). Both darkened: `--primary` from `oklch(0.585 0.233 277.1)` to `oklch(0.52 0.211 277.1)`; `--success` from `oklch(0.596 0.13 163.2)` to `oklch(0.508 0.118 165.6)` (Tailwind emerald-700-equivalent) with `--success-foreground` set to pure white. `--ring`, `--sidebar-primary`, `--sidebar-ring`, and `--chart-1`/`--chart-3` were updated in lockstep to stay internally consistent with `--primary`/`--success`.

Dark mode redefines every token under `.dark` (shadcn's class-based scheme, not a `prefers-color-scheme` media query) — verified as genuine perceptual adjustments, not naive inversion (e.g. `--primary` lightness goes _up_ and chroma _down_ in dark mode, the correct direction for a saturated color on a dark ground; `--card` in dark mode is lighter than `--background`, mirroring the light-mode elevation relationship rather than flipping `1−L`).

Since no theme-toggle UI exists yet in this release, `layout.tsx` sets the `dark` class from `window.matchMedia('(prefers-color-scheme: dark)')` via a small inline script that runs before first paint (avoids flash-of-wrong-theme; no `next-themes` dependency needed for this scope).

## 4. Typography

Geist Sans (already loaded in this codebase via `next/font/google`) for both display and body — no second family. Geist Mono reserved for tabular/data content. Type scale: display 34/700, heading 24/650, subhead 17/600, body 16/400, caption 13/500, mono 14. A small number of one-off sizes (`text-[15px]` on CTA buttons, `text-[10px]` on compact badges) sit outside this scale by deliberate choice for tight component-internal sizing — flagged by independent review as a minor, accepted deviation, not tracked as new tokens since they're isolated to two component contexts.

## 5. Spacing & layout

4/8/12/16/24/32/48/64/96px scale. `Container` (max-w-6xl, responsive gutter) and `Section` (py-20 sm:py-28 vertical rhythm) are the two primitives every landing block composes from — verified by independent review as genuinely reused (not copy-pasted) across `ProblemSolution`, `HowItWorks`, `Capabilities`, `Audience`, `FinalCta`, and (after a follow-up fix) `TrustStrip`.

## 6. Components introduced

**Shared** (`apps/web/src/components/shared/`): `Container`, `Section`, `SectionHeading`, `Logo` (text wordmark, no image asset — no real logo file exists to reference), `Navigation` (client component; marketing anchor links shown only on `/` via `usePathname()`, Clerk auth controls unchanged in logic, only restyled), `Footer`, `VisuallyHidden`.

**Landing** (`apps/web/src/components/landing/`): `Hero`, `TrustStrip`, `ProblemSolution`, `HowItWorks`, `Capabilities`, `Audience`, `FinalCta`.

**shadcn/ui primitives added**: `button`, `badge`, `card` (Base UI-based, not Radix — this is shadcn's current default). No component registry beyond these three was installed.

**Mobile navigation fix**: the marketing nav (`Product`/`How it works`/`For businesses`) was initially `hidden md:flex` with no fallback, making those links unreachable below the `md` breakpoint — a real accessibility/discoverability gap caught by independent review. Fixed with a native `<details>/<summary>` disclosure (zero JS, keyboard-accessible by default, no new component dependency) shown only below `md`.

## 7. Motion rules

`motion-safe:`-gated throughout (respects `prefers-reduced-motion` — nothing animates if the user has it set). Transform/opacity only, no layout-affecting properties animated. Durations: hero entrance 700ms, staggered `HowItWorks` steps 500ms with 90ms stagger delay (`animationFillMode: backwards` so items don't flash visible before their delay). One orchestrated entrance per view, not simultaneous motion everywhere.

## 8. Accessibility

Skip link (`layout.tsx`) targets `#main-content` (verified present on the landing page's `<main>`). Exactly one `<h1>` per page; heading hierarchy has no skipped levels (verified by grep across all landing components). Every decorative icon has `aria-hidden="true"` with zero exceptions. Focus-visible states come from shadcn's Base UI primitives by default. Color is never the only indicator (icon + text pairing throughout). `prefers-reduced-motion` respected via `motion-safe:` on every custom animation.

## 9. Responsive rules

Breakpoints: 375 / 768 (`sm`/`md`) / 1024 (`lg`) / 1440 and up, matching Tailwind's defaults. Every landing section has a real breakpoint-driven layout change (not just scaled type) — e.g. `TrustStrip` 2→4 columns, `HowItWorks` 1→2→4, `Audience` 1→3, `Hero` stacked→two-column at `lg`.

## 10. Landing page content architecture

Nav → Hero (headline, subhead, dual CTA, conceptual product preview) → TrustStrip (4 factual attributes) → ProblemSolution → HowItWorks (4 real pipeline steps: describe business → brand profile → content ideas → plan/refine) → Capabilities (explicit Available-now / Coming-next split, test-enforced) → Audience (3 scenario cards: beauty salons, cafés/restaurants, local service businesses) → FinalCta → Footer.

**No fabricated content**: zero customer counts, testimonials, ratings, logos, or usage statistics anywhere. The hero's product-preview card is explicitly labeled "Conceptual preview." Capabilities are split into what's genuinely built (AI brand profile, AI content ideas, AI-drafted captions, account isolation — each corresponding to a real, this-session-verified backend endpoint/agent) versus what isn't (calendar UI, publishing, analytics, image/video generation).

## 11. Measured maturity

Independent code-level review (fresh agent each round, no prior context, read-only — CLAUDE.md's reviewer-independence rule applied here the same way it applies to security review), run four times against the 100-point rubric as fixes landed:

| Round | Score        | Verdict           | What it found                                                                                                                                                                                         |
| ----- | ------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 77/100       | Not yet at bar    | 2 WCAG AA contrast failures (`--primary`, `--success`), this doc not existing yet (dangling reference), mobile marketing nav unreachable below `md`, 2 low-severity component-reuse notes             |
| 2     | 94/100       | Close             | All 6 required fixes from round 1 confirmed genuinely applied; new issue found: the mobile-nav fix itself didn't close the menu after a link was clicked                                              |
| 3     | 94.5/100     | Not yet at bar    | Menu-dismiss fix verified correct via DOM/event-ordering reasoning; remaining gap: zero test coverage on `navigation.tsx`, the file holding the just-fixed interactive bug                            |
| 4     | **96.5/100** | **Meets 95+ bar** | `navigation.test.tsx` added (5 tests, including a real `fireEvent.click` + `details.open` assertion, not a mocked spy) — closed the gap. Remaining findings are all cosmetic/low-severity (see below) |

**Explicit limitation, stated honestly, unchanged across all four rounds**: no browser/screenshot tool was available in this environment. All scoring — including contrast — was computed from source (Tailwind classes, oklch token math via an independently-written contrast calculator) rather than observed in a rendered browser. Actual rendered pixels, real computed contrast after browser color management, and real responsive behavior at physical viewport widths were not verified and should be spot-checked visually before this is considered production-ready.

> **Hero superseded (prototype, 2026-11-17):** the conceptual preview card in §10 is replaced on branch `feature/landing-hero-v2` by a phone feed of real agent output. See [ADR-036](./036-landing-hero-v2.md).

## 12. Remaining gaps

- No theme-toggle UI (system-preference-only dark mode) — acceptable for this release's scope, revisit if a manual toggle becomes a product requirement.
- No mobile-menu animation (the `<details>` disclosure opens instantly, no transition) — low priority, native semantics were prioritized over polish here.
- No click-outside-to-close on the mobile nav disclosure — only clicking a link closes it (fixed) or re-clicking the trigger; native `<details>` has no built-in outside-click dismissal and none was added.
- `VisuallyHidden` (`components/shared/visually-hidden.tsx`) is built per the Phase 1.5 primitives list but has no consumer yet — kept for future use, not removed.
- Visual/rendered verification (real browser, real viewports) still outstanding — see §11.
- ~~Dashboard, Content Calendar, AI Workspace, Idea Generator, Content Draft, Settings, and Profile pages remain unbuilt~~ — **superseded 2026-07-14 by [ADR-034](./034-application-shell-and-module-scope.md)**: a Dashboard shell with Content and Calendar pages is now built and wired to real, already-existing backend endpoints (the "blocked on backend routes that don't exist yet" premise above was already inaccurate at the time this line was written — see ADR-034's evidence table). ADR-034 also found no product-document basis for standalone "AI Workspace"/"Content Draft"/"Idea Generator" pages as separate modules and deliberately did not build them; Settings remains an honest inert placeholder (explicitly out of M1 scope, see ADR-034); no Profile page was built (Clerk's own `<UserButton>` covers this need — see ADR-034 module matrix).
