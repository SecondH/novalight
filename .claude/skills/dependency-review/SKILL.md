---
name: dependency-review
description: Evaluate whether a new third-party dependency is justified, correctly scoped in the monorepo, and does not introduce unreviewed vendor coupling or security risk. Use before adding any new package.
---

# Dependency Review

## Purpose

Prevent unjustified or architecturally-inconsistent dependencies from entering the monorepo, per the Engineering Constitution's "no dependencies without justification" rule and ADR-014 (avoid premature over-engineering).

## Use When

- Adding any new third-party package to `apps/*` or `packages/*`.
- Replacing an existing dependency.

## Required Inputs

- The package name, its purpose, and the alternative(s) considered (if any).

## Preconditions

- Confirm the dependency isn't already satisfied by an existing package in the monorepo (once `packages/` exists).

## Workflow

1. State the justification: what requirement does this dependency satisfy that isn't already met?
2. Check placement: does it belong in an `apps/*` package (app-specific) or `packages/*` (shared)? Packages must never depend on applications.
3. If the dependency is a vendor for auth/storage/AI, confirm it sits behind the documented abstraction interface (ADR-007/008/009) rather than being called directly from application code.
4. Check for known security concerns (unmaintained package, known CVEs) — flag if uncertain rather than asserting safety without evidence.
5. Confirm it doesn't duplicate functionality already provided by an existing chosen technology (e.g. don't add a second validation library when Zod is the target; don't add a second ORM when Prisma is ADR-selected).

## Validation Checklist

- [ ] Justification stated explicitly, not just "it's useful."
- [ ] Correct monorepo placement (`apps/*` vs `packages/*`).
- [ ] Vendor dependencies (auth/storage/AI) go through an abstraction interface.
- [ ] No duplication of an ADR-selected technology.
- [ ] Security posture considered, not assumed.

## Outputs

- Approve / Approve-with-placement-correction / Reject, with reasoning.

## Escalation Conditions

- The dependency would replace an ADR-selected technology (e.g. swapping Prisma, Express, Next.js) — this is a major change requiring a superseding ADR and explicit user approval.

## Prohibited Actions

- Do not add a dependency "just in case" for future use ahead of an approved requirement.
- Do not let `packages/*` depend on `apps/*`.
