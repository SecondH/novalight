---
name: visual-content-generation
description: Construct a professional, ready-to-use visual-generation prompt (for ChatGPT Image Generation, DALL-E, Midjourney, Canva AI, Figma AI, or presentation tools) from a NovaLight product, business, technical, marketing, or executive-communication need. Produces the prompt only — never generates the image itself, never modifies repository files, never invents brand facts NovaLight hasn't established.
---

# Visual Content Generation Skill

## Purpose

Turn an abstract visual need into a structured, professional prompt that a human can paste directly into an external visual-generation tool — grounded in NovaLight's actual documented product, architecture, and (currently nonexistent) brand facts, never in invented ones.

## When To Use

- A UI screen, dashboard, mobile app concept, user journey, or UX concept needs to be visualized.
- A business model, ecosystem diagram, value chain, process map, or infographic is needed.
- A system/cloud architecture diagram, data flow, or AI agent workflow needs a visual.
- Marketing content is needed: brand visuals, campaign assets, social media graphics, presentation visuals.
- Executive communication needs a visual: board presentation, investor deck, strategy document graphic.
- Backing skill for the `visual-intelligence-prompt-engineer` agent, and directly usable by the main thread for a single quick prompt without spawning the agent.

## Do Not Use When

- The request is for repository documentation (use `documentation-maintenance`), a real ADR diagram already described in `docs/architecture/005-c4-model.md` in text form (link to the existing doc instead of generating a redundant visual), or actual code/UI implementation (use `implementation`).

## Inputs Required

- The visual need in the requester's own words: what it's for, who will see it, where it will be used.
- Any existing reference material already available (an existing deck, a described layout, a named architecture document).

## Prompt Construction Method

1. Identify which category the request falls under: Product Design, Business Visualization, Technical Visualization, Marketing Content, or Executive Communication.
2. Read the documentation relevant to that category before drafting anything (per the agent's "Required Context" — product docs for product/business visuals, architecture docs for technical visuals, `docs/project/001-project-charter.md` §5 for any visual implying current capability).
3. Check for established brand facts (color, logo, typography) in `docs/product/`. **As of Phase 0, none exist** — if the request needs one, say so explicitly and default to a generic, professional, enterprise-neutral style rather than inventing one.
4. Build the prompt using the 11-part framework, in order: Objective, Audience, Visual Type, Composition, Information Hierarchy, Style Direction, Color Strategy, Typography Guidance, Technical Details, Output Format, Negative Constraints.
5. For any visual touching Phase-0-excluded capability (AI generation features, social platform integrations, customer business workflows — see `docs/project/001-project-charter.md` §5) or a future/aspirational architecture path (most of `docs/architecture/`, since no monorepo exists yet), label the visual as "vision/concept" rather than "current product/system," and say so in the Persian explanation too.
6. For technical diagrams, cross-check every depicted component/integration/data flow against the actual architecture documents — do not draw a connection the documents prohibit (e.g. frontend directly to database) or a component that isn't documented, unless explicitly marked speculative.

## Quality Checklist

- [ ] Professional composition and information clarity.
- [ ] Enterprise design standard appropriate to an audience of brands/marketing teams/creators (per `docs/product/007-product-vision.md` target users).
- [ ] Realistic proportions; no visual clutter.
- [ ] Accessible (sufficient contrast implied in the style direction; no reliance on color alone to convey meaning).
- [ ] Brand-consistent **only** where a real brand fact exists — otherwise generic-professional, explicitly labeled as such.
- [ ] Scalable across the intended output formats (e.g. a slide visual should still read at deck-thumbnail size).

## Output Format

For each prompt produced:

- **English prompt** (ready to paste).
- **Persian explanation (توضیح فارسی)** of what it produces and why.
- **Intended usage**.
- **Recommended aspect ratio**.
- **Recommended iteration strategy** (what to change first if the first generation misses).

## Validation Rules

- No NovaLight fact (product capability, architecture detail, brand element) appears in the prompt unless it is evidenced in `docs/` or explicitly labeled as a generic/placeholder assumption.
- No Phase-0-excluded capability is depicted as currently shipped.
- No technical diagram contradicts `docs/architecture/`.
- Aspect ratio and format recommendation match the stated destination tool/medium.

## Prohibited Practices

- Do not invent a NovaLight color palette, logo, or typography system — none is established; state that explicitly instead.
- Do not generate the image yourself or claim a visual was produced — this skill's output is the prompt and its explanation only.
- Do not modify any repository file as a side effect of this skill.
- Do not depict fabricated data, metrics, or testimonials in an infographic or marketing visual.
