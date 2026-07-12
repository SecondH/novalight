---
name: architecture-review
description: Assess a proposed or existing structural change (new module, package, dependency, or boundary change) against NovaLight's Clean Architecture rules, C4 model, and accepted ADRs. Use before creating new modules/packages, adding major dependencies, or changing module boundaries.
---

# Architecture Review

## Purpose

Evaluate whether a structural change preserves NovaLight's architectural contract: Clean Architecture layering, C4 container/component boundaries, and accepted ADRs (`docs/architecture/006-initial-architecture-decisions.md`).

## Use When

- A new module, package, or application is proposed.
- A dependency crosses a documented boundary (e.g. frontend → database, packages → apps).
- A major third-party dependency is being introduced.
- [Development Workflow](../../../docs/development/015-development-workflow.md) classifies the change as requiring an architecture review gate: new modules, new packages, database changes, authentication changes, external integrations, infrastructure changes.

## Required Inputs

- Description of the proposed change and its rationale.
- The affected area of the repository (verified via `repository-analysis`, not assumed).

## Preconditions

- Run `repository-analysis` first if the affected area hasn't been inspected this session.
- Read [System Architecture](../../../docs/architecture/004-system-architecture.md), [C4 Model](../../../docs/architecture/005-c4-model.md), and [ADRs](../../../docs/architecture/006-initial-architecture-decisions.md).

## Workflow

1. Identify which architectural layer(s) and container(s) the change touches.
2. Check dependency direction: does it violate `apps → packages → external` or Clean Architecture inward-pointing dependencies?
3. Check vendor coupling: does it bypass an abstraction interface for auth/storage/AI (ADR-007/008/009)?
4. Assess: modularity, cohesion, coupling, dependency direction, scalability, reliability, maintainability, security, data consistency, integration boundaries, operability, technical debt introduced.
5. Check against ADR-014 (avoid premature over-engineering) — is the change justified by current/approved requirements, or speculative?
6. Determine if the change requires a new ADR (major architecture modification, database redesign, authentication change, infrastructure change) per the change-classification rule in [CLAUDE.md §4](../../../CLAUDE.md#4-mandatory-pre-change-workflow).

## Validation Checklist

- [ ] Dependency direction preserved (no packages→apps, no frontend→DB/AI-vendor).
- [ ] Vendor coupling goes through an abstraction interface, not directly.
- [ ] Business value, architectural impact, and maintenance cost are each stated.
- [ ] Determined whether a new ADR is required.
- [ ] No contradiction with an existing accepted ADR without explicitly flagging it.

## Outputs

- Verdict: Compliant / Compliant with conditions / Requires ADR / Rejected — with the specific rule(s) it was checked against.

## Escalation Conditions

- The change contradicts an accepted ADR — do not proceed without either a new superseding ADR or explicit user approval.
- Architecture impact is unclear even after this review — stop and ask.

## Prohibited Actions

- Do not approve a change that violates a boundary rule "just this once."
- Do not silently supersede an ADR by implementing something different from what it states.
