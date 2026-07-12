---
description: Run the security review checklist against a change
---

# /security-review

## Purpose

Apply NovaLight's security architecture and threat-model checklist to a specific change.

## Workflow

1. Identify the change under review (diff, plan, or described design).
2. Invoke the `security-review` skill / `security-reviewer` agent.
3. Walk the threat model's pre-release checklist: Identity, Data, API, Infrastructure, AI (if applicable), Multi-tenant.
4. Cross-check against the STRIDE risk matrix in `docs/security/014-novalight-threat-model.md`.

## Output

Pass/Fail per checklist item with evidence; any Critical/High finding is called out explicitly per `CLAUDE.md` §15 escalation rules.

## Prohibited Actions

- Do not approve based on assumed-safe behavior without evidence.
- Do not weaken a documented security requirement to unblock the change.
