---
description: Assess a proposed structural change against ADRs and C4 boundaries
---

# /architecture-review

## Purpose

Assess a proposed structural/module/dependency change against NovaLight's Clean Architecture rules, C4 model, and accepted ADRs.

## Workflow

1. Invoke the `architecture-review` skill / `solution-architect` agent.
2. Identify affected layers/containers.
3. Check dependency direction and vendor-abstraction compliance.
4. Assess modularity, coupling, scalability, and whether complexity is justified (ADR-014).
5. Determine whether a new/superseding ADR is required.

## Output

Verdict: Compliant / Compliant-with-conditions / Requires-ADR / Rejected, with the specific rule(s) cited.

## Prohibited Actions

- Do not approve a boundary violation "temporarily."
