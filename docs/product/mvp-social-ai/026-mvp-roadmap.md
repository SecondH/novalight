# MVP Roadmap (MVP Track Stage 1–5)

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../../architecture/017-documentation-structure-for-product-verticals.md).

## Document Metadata

| Field            | Value                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document Version | 1.0                                                                                                                                                         |
| Status           | Proposed — pending human approval                                                                                                                           |
| Naming note      | See §3 below — this document deliberately does **not** name its stages "Phase 1–5," to avoid deepening an existing, already-flagged documentation conflict. |

## 1. Purpose

Defines the sequencing for the vertical MVP described in [017-product-vision.md](./017-product-vision.md), analogous in role to [009-roadmap.md](../009-roadmap.md) but scoped to this initiative specifically. Feature-level detail lives in [022-feature-roadmap.md](./022-feature-roadmap.md); this document is stage-level.

## 2. MVP Track Stages

### MVP Track Stage 1 — Content Assistant

**Objective:** Prove the core value proposition (brand-grounded content generation) for a single owner-operator, no automation, no multi-user.
**Scope:** [021-mvp-scope.md](./021-mvp-scope.md) §2. **Acceptance:** [023-acceptance-criteria.md](./023-acceptance-criteria.md).

### MVP Track Stage 2 — Brand Intelligence

**Objective:** Move brand grounding from a static intake form to a learning system informed by approval history and vertical patterns.
**Scope:** [022-feature-roadmap.md](./022-feature-roadmap.md) Stage 2.

### MVP Track Stage 3 — Publishing Automation

**Objective:** Introduce opt-in, scoped, revocable automation — the first stage requiring the RBAC taxonomy conflict ([019-personas.md](./019-personas.md) §4) to be resolved, since it introduces multi-user draft/approve flows.
**Scope:** [022-feature-roadmap.md](./022-feature-roadmap.md) Stage 3.

### MVP Track Stage 4 — Business Intelligence

**Objective:** Close the loop from content to measured outcome, feeding performance data back into generation.
**Scope:** [022-feature-roadmap.md](./022-feature-roadmap.md) Stage 4.

### MVP Track Stage 5 — Convergence with the Enterprise NovaLight Platform

**Objective:** Once multi-user roles (Stage 3) and organization-shaped needs (multi-brand accounts, teams) are real and validated by actual users — not speculative — this vertical product's platform requirements converge with [007-product-vision.md](../007-product-vision.md) Phase 1 "SaaS Foundation" and beyond. At this point the MVP Track and the core NovaLight roadmap are the same roadmap; this document's job is done.
**Scope:** [022-feature-roadmap.md](./022-feature-roadmap.md) Stage 5.

## 3. Relationship to Existing Phase 0–5 Naming — Flagged, Not Silently Resolved

`.claude/memory/known-risks.md` already records that [004-system-architecture.md](../../architecture/004-system-architecture.md) §10, [007-product-vision.md](../007-product-vision.md) §8, and [009-roadmap.md](../009-roadmap.md) each name Phases 1–5 differently. This document uses **"MVP Track Stage 1–5"** rather than "Phase 1–5" specifically to avoid introducing a fourth conflicting naming scheme. It is not a rename of the existing phases and does not resolve their disagreement — that remains an open item requiring a human decision, as before.

The relationship between the two sequences:

```text
Phase 0 (Engineering Foundation, all documents agree on this one)
  ↓
  ├─ Existing vision's Phase 1–5 (names vary by document — see known-risks.md)
  │
  └─ MVP Track Stage 1–5 (this document) — a vertical-first path that re-joins
     the existing sequence at Stage 5, once its own platform needs mature
```

MVP Track Stage 5 is a convergence point, not a claim that it equals any specific document's "Phase 5" — reconciling those still requires the human decision already on record as open.

## 4. Governance

Per [009-roadmap.md](../009-roadmap.md) §11: "Major changes should create an ADR or Product Decision Record." The strategic decision this roadmap depends on is recorded in [social-ai-platform/017-mvp-pivot-decision.md](../../architecture/social-ai-platform/017-mvp-pivot-decision.md).
