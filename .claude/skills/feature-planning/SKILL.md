---
name: feature-planning
description: Turn a requirement into an implementation-ready plan without modifying source code. Use for any medium-or-larger change per the Claude Code Operating Model's change classification, before writing any implementation.
---

# Feature Planning

## Purpose

Produce a complete, implementation-ready plan for a requirement — scope, acceptance criteria, affected components, sequencing, testing, security implications, and required approvals — without touching source code.

## Use When

- A new feature, module, or medium/major change is requested.
- Backing skill for the `/plan-feature` command.

## Do Not Use When

- The change is classified Minor (typo, formatting, isolated utility per [Claude Code Operating Model §8](../../../docs/engineering/003-claude-code-operating-model.md)) — proceed directly instead.

## Required Inputs

- The requirement or feature request in the user's own words.
- Any acceptance criteria already known.

## Preconditions

- Read the relevant documents per [CLAUDE.md §3 routing table](../../../CLAUDE.md#3-authoritative-documentation).
- Run `repository-analysis` to confirm what currently exists.

## Workflow

1. Define: Problem, Goal, Scope, Non-Scope, Acceptance Criteria ([Development Workflow](../../../docs/development/015-development-workflow.md) requirement-phase fields).
2. Inspect affected modules/paths (verified, not assumed).
3. Identify dependencies, risks, security impact, and performance impact.
4. Run `architecture-review` if the change touches module boundaries, new packages, or vendor integrations.
5. Propose an implementation sequence (smallest coherent steps).
6. Define a testing strategy (unit/integration/e2e as applicable) — see `test-design`.
7. Identify documentation that will need updating.
8. Identify required approvals per [CLAUDE.md §15](../../../CLAUDE.md#15-escalation-rules) risk matrix.
9. State all assumptions explicitly — never fill a documentation gap with an invented requirement.

## Validation Checklist

- [ ] Acceptance criteria are concrete and testable.
- [ ] Every affected component was verified to exist (or explicitly flagged as needing to be created).
- [ ] Assumptions are listed separately from facts.
- [ ] Required approvals identified per the risk matrix.

## Outputs

- Summary, Assumptions, Affected components, Implementation plan, Test plan, Security implications, Risks, Required approvals.

## Escalation Conditions

- Requirements are ambiguous or conflict with existing documentation — stop and ask before finalizing the plan.
- The plan would require an ADR — flag it as a plan prerequisite, don't implement first and document later.

## Prohibited Actions

- Do not write or edit source/config files during planning.
- Do not invent acceptance criteria not implied by the request or documentation.
