---
description: Create an implementation-ready feature plan without modifying source code
argument-hint: <feature or requirement description>
---

# /plan-feature

## Purpose

Create an implementation-ready feature plan without modifying source code, using the `feature-planning` skill.

## Workflow

1. Invoke the `feature-planning` skill against the requirement given in `$ARGUMENTS`.
2. Read relevant product and architecture documents per the `CLAUDE.md` §3 routing table.
3. Run `repository-analysis` to confirm affected modules/paths actually exist.
4. Identify dependencies and risks; run `architecture-review` if module boundaries or vendor integrations are touched.
5. Define acceptance criteria.
6. Propose an implementation sequence and testing strategy (`test-design`).
7. Identify documentation changes and required approvals (`CLAUDE.md` §15 risk matrix).

## Output

- Summary
- Assumptions
- Affected components
- Implementation plan
- Test plan
- Security implications
- Risks
- Required approvals

## Prohibited Actions

- Do not modify any source, config, or documentation file during planning.
