# Implementation Checklist

- [ ] Diff matches the approved plan's scope — no unrelated changes folded in.
- [ ] Follows existing patterns; no unjustified new abstraction.
- [ ] TypeScript strict-mode compliant (once TS exists); no `any`, no unsafe casting.
- [ ] No direct vendor coupling (auth/storage/AI) — abstraction interface used.
- [ ] No secrets introduced; no sensitive data logged.
- [ ] Tests added/updated alongside the change.
- [ ] Documentation updated if behavior changed.
- [ ] Diff reviewed in full before considering the task done.
- [ ] Whatever lint/type-check/test/build tooling actually exists was run — not invented, not skipped silently.
