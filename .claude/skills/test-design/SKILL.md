---
name: test-design
description: Define what should be tested for a change — unit, integration, and end-to-end — and at what level, per NovaLight's testing principles. Use during feature-planning and before/alongside implementation.
---

# Test Design

## Purpose

Define a concrete, appropriately-scoped test plan for a change, without inventing coverage thresholds the documentation does not specify.

## Use When

- During `feature-planning`, to define the Test Plan section.
- Before/alongside `implementation`, to confirm test coverage matches the plan.

## Required Inputs

- The feature/change description and its acceptance criteria.

## Preconditions

- Confirm what test tooling actually exists in the repository (none does yet, as of Phase 0) — do not invent commands or frameworks not established by repository configuration.

## Workflow

1. Map acceptance criteria to test levels:
   - **Unit tests** — utilities, services, business rules.
   - **Integration tests** — API behavior, database interaction.
   - **End-to-end tests** — critical user workflows only, not every path.
2. For frontend changes: component tests for UI logic, integration tests for feature flows, e2e for critical journeys only (tooling is "recommended," not mandated: Vitest, React Testing Library, Playwright).
3. For backend changes: unit tests for services/business rules, integration tests for API + DB (target tooling: Jest, Supertest).
4. Identify what should explicitly NOT be tested (over-testing trivial code, testing framework internals).
5. State any coverage expectation as qualitative ("critical path covered") — do not assert a numeric percentage; none is defined in the documentation.

## Validation Checklist

- [ ] Every acceptance criterion maps to at least one test.
- [ ] Test level (unit/integration/e2e) matches what's actually being verified — no e2e test standing in for a unit test.
- [ ] No invented test framework or command not present in repository configuration.
- [ ] No fabricated coverage percentage.

## Outputs

- A test plan: list of test cases grouped by level, mapped to acceptance criteria.

## Escalation Conditions

- The change has no clear way to be tested (e.g. undefined acceptance criteria) — stop and clarify via `feature-planning` before proceeding.

## Prohibited Actions

- Do not claim a numeric coverage threshold is required — none is documented.
- Do not skip tests for a change class the Engineering Constitution requires them for (services, business rules, API behavior, critical workflows).
