# ADR-015 — Documentation Structure for Major Product Verticals

> Not a converted source document. Authored directly following the ADR pattern established in [006-initial-architecture-decisions.md](./006-initial-architecture-decisions.md), per the "ADR Maintenance Rule" in that document and [CLAUDE.md §9](../../CLAUDE.md#9-documentation-obligations).

## Document Metadata

| Field            | Value                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| Document Version | 1.0                                                                                                        |
| Status           | **Accepted** (2026-07-11) — human acceptance confirmed at M1 implementation start                          |
| Document Purpose | Record a deviation from the flat, globally-sequential `docs/<category>/<NNN>-name.md` numbering convention |
| Language         | English                                                                                                    |
| Author           | Claude Code, on explicit instruction during the NovaLight MVP Pivot planning session                       |
| Date             | 2026-07-11                                                                                                 |

## Context

[CLAUDE.md §9](../../CLAUDE.md#9-documentation-obligations) states: "New documentation follows the existing convention: `docs/<category>/<NNN>-<kebab-case-name>.md`, numbered sequentially across the whole `docs/` tree." Until now the only exceptions were `docs/ai-workspace/` and `docs/readiness/`, and both are exceptions because they document the Claude Code workspace itself or point-in-time assessments — not the NovaLight product — so [docs/README.md](../README.md) explicitly excludes them from the numbered sequence.

The NovaLight MVP Pivot (see [social-ai-platform/017-mvp-pivot-decision.md](./social-ai-platform/017-mvp-pivot-decision.md) and [product/mvp-social-ai/017-product-vision.md](../product/mvp-social-ai/017-product-vision.md)) introduces a substantial, cohesive set of product and architecture documents — a vertical go-to-market initiative within the core NovaLight product, not a workspace or assessment artifact. Flattening ~20 new documents directly into `docs/product/` and `docs/architecture/` alongside the 16 existing core documents would harm discoverability and invite exactly the kind of documentation sprawl [CLAUDE.md §9](../../CLAUDE.md#9-documentation-obligations) and [ADR-014](./006-initial-architecture-decisions.md) (avoid unnecessary complexity) exist to prevent.

## Decision

Major product verticals — cohesive, multi-document initiatives within the core NovaLight product (not workspace or assessment artifacts) — may be grouped under a named subdirectory of `docs/product/` and/or `docs/architecture/`.

Files inside such a subdirectory use **domain-local** NNN numbering, independent of the global flat sequence used at the top level of `docs/product/` and `docs/architecture/`. The first vertical-initiative subdirectories (`docs/product/mvp-social-ai/`, `docs/architecture/social-ai-platform/`) both start their local sequence at `017` — matching, by coincidence of timing, the next available number in the global sequence, but not bound to stay in lockstep with it going forward. Each subdirectory's own numbering is internally sequential and restarts independently of any other subdirectory or the top-level sequence.

This is additive: the existing flat top-level convention for `docs/product/001–009` and `docs/architecture/004–006, 010–012` (and this ADR itself, `docs/architecture/017-...`, which stays in the flat top-level sequence as a cross-cutting governance decision) is unchanged. `docs/ai-workspace/` and `docs/readiness/` remain their own, separately-documented exceptions (no NNN numbering at all).

## Alternatives Considered

1. **Flat, globally-sequential files with descriptive prefixes** (e.g. `docs/product/017-mvp-social-ai-product-vision.md`) — fully compliant with the letter of CLAUDE.md §9, but produces long, repetitive filenames and mixes a vertical-specific initiative into the same flat list as foundational, always-relevant documents.
2. **Subdirectories with no numbering** (matching `ai-workspace/`/`readiness/` exactly) — rejected because those two directories are exceptions specifically because they are _not_ part of the numbered NovaLight product-document sequence; this initiative _is_ part of that sequence and benefits from preserving traceable, ordered numbering within its own scope.
3. **Subdirectories with domain-local numbering (chosen)** — preserves ordering and traceability within each initiative while keeping the top-level `docs/product/` and `docs/architecture/` listings uncluttered.

## Consequences

Positive:

- Future major verticals follow a documented, repeatable pattern instead of ad hoc structure decisions.
- `docs/product/` and `docs/architecture/` top-level listings stay scannable as the product grows.
- Numbering within an initiative remains traceable and ordered.

Trade-off:

- NNN numbers are no longer globally unique across the entire `docs/` tree — `docs/architecture/017-...` (this file) and `docs/architecture/social-ai-platform/017-...` (a different file) coexist. Anyone citing a document must include the full path, not just the number, to avoid ambiguity. This is called out explicitly here rather than left implicit.
- `docs/README.md` and [CLAUDE.md §2](../../CLAUDE.md#2-repository-map) must be kept current with each new subdirectory (done as part of this same change — see those files).

## Status Note

This ADR is recorded as part of a documentation-only pass; it governs documentation structure, not source code, and does not require the CI/CD or RBAC gates tracked in [docs/readiness/development-entry-checklist.md](../readiness/development-entry-checklist.md). It is marked **Proposed** rather than **Accepted** (unlike ADR-001–014) because, unlike those, it was authored by Claude Code rather than pre-approved by the team before this session — human confirmation is still expected.
