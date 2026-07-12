# Code Review Checklist

- [ ] Correctness: logic matches intent; edge cases considered.
- [ ] Architecture: Controller/Service/Repository layering respected; dependency direction preserved.
- [ ] No direct vendor coupling (auth/storage/AI called only through an abstraction interface).
- [ ] Security: input validated, no secrets, no unsafe logging, authz checks present where required.
- [ ] Performance: no obvious inefficiency (N+1 queries, unnecessary re-renders).
- [ ] Maintainability: naming, duplication, dead code.
- [ ] Every finding has file/line, evidence, and severity (P0–P3) — no vague findings.
- [ ] Reviewer is not the same reasoning pass that implemented the change, where feasible.
