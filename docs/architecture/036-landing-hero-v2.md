# ADR-036 — Landing Hero v2: Show Real Output, Not a Concept

> Not a converted source document. Follows the ADR pattern in [006-initial-architecture-decisions.md](./006-initial-architecture-decisions.md). Numbered `036` in the flat top-level sequence, after [035](./035-agent-pipeline-real-provider-wiring.md). Builds on [032 — Web Design Foundation](./032-web-design-foundation.md).

## Document Metadata

| Field   | Value                                                                                                                                                                                                                                                                   |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status  | **Proposed (prototype)**: built on branch `feature/landing-hero-v2` at the repository owner's request (2026-11-17). It is not merged; it awaits the owner's visual review.                                                                                              |
| Scope   | `apps/web` landing hero only: `components/landing/hero*.tsx`, `typewriter-text.tsx`, `use-prefers-reduced-motion.ts`, `hero-samples.ts`, two design tokens and one keyframe in `globals.css`, and the `landing.hero` messages. No API, authentication or schema change. |
| Related | [ADR-033](./033-bilingual-i18n-architecture.md) (fa/en, RTL), [ADR-034](./034-application-shell-and-module-scope.md) (no fabricated states), [ADR-035](./035-agent-pipeline-real-provider-wiring.md) (the pipeline that produced the samples)                           |

## Context

The R2 hero ([032](./032-web-design-foundation.md) §10) paired the headline with a small, text-only card labeled "conceptual preview". NovaLight's value is a transformation: a few plain answers become a complete, on-brand social feed. The page described that transformation but never showed it.

## Decision

1. **Show real output.** A phone mockup shows a social-style profile, a featured post, a caption and an "up next" row. The content comes from NovaLight's own agent pipeline: each sample is a single run of the four agents. The samples were generated on 2026-11-16 with Groq `openai/gpt-oss-120b`, from fictional briefs for a café, a beauty salon and a restaurant, in Persian and English.
2. **Honest labeling.** The generated strings are used **unedited** (`hero-samples.ts`). Curation was limited to which three ideas fill the up-next row. Business names and handles are fictional and are the only hand-written values. The phone carries a "Real AI output" badge, and a note below it states that the brief was fictional and the output is unedited. The old "conceptual preview" card is removed.
3. **No live AI call on the public page.** The samples are static data. This keeps a public, unauthenticated page free of AI cost and of abuse risk; there is still no spend ceiling (ADR-035, security M3).
4. **Interaction.**
   - An accessible tablist (café, salon, restaurant) switches the sample. Arrow keys follow reading direction: in RTL, ArrowLeft moves forward. Home and End are also supported.
   - The sample auto-advances every 9 seconds until the visitor picks a business, and pauses on hover or focus.
   - The caption types itself in like a streaming AI response. It is split by grapheme, so emoji and Persian ZWNJ joins never break. Screen readers get the full caption through an `sr-only` copy, and the animated copy is `aria-hidden`.
   - On wide screens two floating cards echo the pipeline: the brand profile's tone and the English visual prompt.
5. **Motion without a new dependency.**
   - A scroll-linked tilt flattens the phone over the first 360 px of scroll. It uses `requestAnimationFrame` and transform only.
   - The entrance animation and the tilt sit on separate layers, because both use `transform`.
   - Everything else uses the existing `tw-animate-css` plus one `float` keyframe.
   - With `prefers-reduced-motion`, there is no tilt, no auto-advance and no typing.
   - Motion.dev was not needed for this scope. ADR-032's rejection of Framer Motion stands.
6. **Visual language.** A second, warm accent `--warm` (light `oklch(0.6 0.19 35)`, dark `oklch(0.76 0.15 45)`) is used only for the headline gradient and the background glow. It is never a semantic color. The headline highlight passes the 3:1 contrast bar for large text in both themes. The page background adds two blurred glows and a masked dot grid.

## Also fixed

`app/[locale]/layout.tsx` now sets `suppressHydrationWarning` on `<html>`. Without it, the existing pre-paint theme script added `dark` before hydration, and every dark-mode visit logged a React hydration mismatch. This was seen during verification of this change and predates it.

## Verification (2026-11-17)

- **Checks:** web lint, typecheck, 47/47 tests and the production build pass. The `/[locale]` route is 9.67 kB, with First Load JS of 142 kB and no new dependencies.
- **Tests:** `hero-showcase.test.tsx` has 8 tests: tabs, switching, labeling, the screen-reader caption, LTR and RTL arrow keys, auto-advance, and the reduced-motion static state.
- **Browser:** checked at 1440×900 in fa (light) and en (dark), and at 375×812 in fa. No horizontal overflow at 375 px. The tilt runs from 14° to 0° on scroll. There are no console errors after the hydration fix.

## Open items

- **Pipeline reliability.** While generating the samples, **4 of 10 pipeline runs failed output validation** and needed a retry. The validation is in `parse-model-output.ts`, and these are not hero failures. Real users would see a 502 at about that rate, so this needs investigating before launch: which agent fails, and whether the cause is the JSON shape, the format enum or caption length.
- **Invented offers.** The samples contain AI-invented offers, such as a 10% student discount. This is acceptable for fictional businesses and is the known `offeringsSummary` allow-list gap from ADR-035.
- **No real image.** The featured post uses abstract gradient art, because no image is rendered yet ([024](./social-ai-platform/024-image-generation-integration.md)). Rendering the visual prompt with an image model would make the hero far stronger.
- **Mobile tilt.** On mobile the phone sits below the copy, so it is already flat by the time it scrolls into view. The tilt is effectively a desktop effect.
- **Regenerating samples.** Regenerate rather than hand-edit. Run the four agents (as `npm run smoke:agents` does) on the briefs recorded in this ADR's history, then replace the strings in `hero-samples.ts`.
