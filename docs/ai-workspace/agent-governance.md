# Agent Governance

Governs the subagents in `.claude/agents/` and, where applicable, the skills in `.claude/skills/` that produce review-style findings.

## Agent ownership and boundaries

| Agent                                 | Owns                                                                                                                               | Does not own                                                                                                                     |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `repository-mapper`                   | Filesystem-state facts                                                                                                             | Architectural or security judgment                                                                                               |
| `solution-architect`                  | Module/boundary/dependency-direction/ADR compliance                                                                                | Code-level correctness, security specifics                                                                                       |
| `security-reviewer`                   | Auth, authz, data protection, threat-model compliance                                                                              | General code quality, architecture boundaries unrelated to security                                                              |
| `api-contract-reviewer`               | REST versioning, response shape, layering                                                                                          | Business logic correctness, database schema                                                                                      |
| `data-architect`                      | Schema/migration compliance, Phase-scope gating                                                                                    | API contract shape, general security                                                                                             |
| `documentation-reviewer`              | Link integrity, cross-document consistency                                                                                         | Architectural correctness of documented content                                                                                  |
| `risk-reviewer`                       | Cross-cutting risk synthesis from other agents' findings                                                                           | Fixing the risks it identifies                                                                                                   |
| `quality-gate-reviewer`               | Final pre-merge correctness/quality gate                                                                                           | Re-doing a full architecture or security review from scratch                                                                     |
| `visual-intelligence-prompt-engineer` | Constructing visual-generation prompts (product/business/technical/marketing/executive); grounding them in evidenced `docs/` facts | Generating the image itself; inventing brand identity NovaLight hasn't established; reviewing another agent's or person's prompt |

Each agent's full input/output contract is in its own file under `.claude/agents/`.

### Generative vs. review agents

All agents above `visual-intelligence-prompt-engineer` in the table are **review** agents: they assess a change someone else authored and are bound by the reviewer-independence rule below. `visual-intelligence-prompt-engineer` is a **generative** agent — it produces a deliverable (a prompt) rather than reviewing one, so reviewer independence does not apply to it. It has its own equivalent discipline instead: never assert a NovaLight fact (product capability, architecture detail, brand element) that isn't evidenced in `docs/`, and never depict a Phase-0-excluded capability as currently shipped. See `.claude/agents/visual-intelligence-prompt-engineer.md` for the full rule set.

## Reviewer independence

**Rule**: an agent (or reasoning pass) that authored or implemented a change must not be the sole approver of that same change. This applies specifically to `security-reviewer`, `solution-architect`, `api-contract-reviewer`, `data-architect`, and `quality-gate-reviewer` — each is designed to be invoked as a separate pass from `implementation`.

**Why**: per [docs/engineering/003-claude-code-operating-model.md §8](../engineering/003-claude-code-operating-model.md), major changes require an ADR and architecture review — a review that shares the implementer's blind spots doesn't satisfy that requirement in substance, only in form.

## Review chain (for changes that warrant it)

```text
feature-planning (Planner)
  → implementation (Implementer)
    → test-design (Test Reviewer, alongside implementation)
      → security-reviewer (Security Reviewer, if auth/data/integration touched)
        → solution-architect (Architecture Reviewer, if boundaries/dependencies touched)
          → quality-gate-reviewer (Final Quality Gate)
```

Do not run the full chain for a Minor change (per the classification in [claude-operating-model.md](./claude-operating-model.md)). Match effort to the risk-based routing matrix below.

## Risk-based routing matrix (full detail; summarized in `CLAUDE.md` §15)

| Change type                                |     Risk | Required workflow                                                                                          | Approval required                          |
| ------------------------------------------ | -------: | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Documentation typo/formatting              |      Low | `documentation-maintenance`                                                                                | No                                         |
| Local UI adjustment (once frontend exists) |      Low | `implementation` + targeted tests                                                                          | No                                         |
| New feature                                |   Medium | `feature-planning` + `implementation` + `test-design` + `code-review`                                      | No, unless it touches a Medium+ area below |
| API contract change                        |     High | `architecture-review` + `api-contract-reviewer` + tests + `security-reviewer`                              | Yes, for breaking changes                  |
| Database schema change                     |     High | `data-architect` + migration review + rollback plan                                                        | Yes, for destructive migrations            |
| Authentication/authorization change        | Critical | `security-reviewer` + `solution-architect` + tests                                                         | Yes, always                                |
| Production infrastructure change           | Critical | DevOps-equivalent review (no dedicated agent yet — escalate to user) + `security-reviewer` + rollback plan | Yes, always                                |

## Escalation

Per [CLAUDE.md §15](../../CLAUDE.md#15-escalation-rules): any Critical-risk change, any destructive operation, and any change contradicting an accepted ADR requires explicit user approval before proceeding — regardless of what an agent's review concludes. An agent can recommend; it cannot self-authorize a Critical-risk action.

## Output contracts

Every review-producing skill/agent must state findings with evidence (file/line or described behavior) and, where applicable, a severity (P0–P3 for code review, Critical/High/Medium for security per the threat model's risk matrix). A finding without evidence is not a finding — it's speculation, and should be labeled as such if included at all.

## Conflict resolution

If two agents disagree (e.g. `solution-architect` approves a boundary crossing that `security-reviewer` flags as a data-exposure risk), do not silently pick one — surface both positions to the user. This mirrors the documentation-conflict rule in [CLAUDE.md §3](../../CLAUDE.md#3-authoritative-documentation): report, don't silently resolve.

## Deprecation rules

An agent/skill/command is deprecated (not deleted outright) when its responsibility is superseded — leave a note in the file pointing to its replacement, and remove it only after confirming nothing in `CLAUDE.md`, another component, or an open task still references it. Use `/workspace-audit` to check for stale references before deletion.

## Quality expectations

- No fabricated file paths, line numbers, or behavior in any finding.
- Facts (verified) must be visibly distinguished from assumptions (stated but unverified).
- An agent must not silently expand its own scope into another agent's owned area — if a security concern surfaces during an architecture review, name it and recommend `security-reviewer`, don't attempt to resolve it unilaterally.
