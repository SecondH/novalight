# Security Checklist

Per `docs/security/014-novalight-threat-model.md` pre-release checklist:

- [ ] **Identity** — authentication reviewed; authorization reviewed independently of authentication; permissions tested.
- [ ] **Data** — sensitive data identified; access controlled; logging reviewed for leakage.
- [ ] **API** — input validated; errors don't leak internals; rate limits considered.
- [ ] **Infrastructure** — secrets only from environment variables; per-environment config isolation.
- [ ] **AI** (if applicable) — data shared with AI providers minimized; AI output not blindly trusted.
- [ ] **Multi-tenant** (if applicable) — tenant context enforced on every relevant query.
- [ ] Any Critical/High finding (per the STRIDE risk matrix) has explicit user approval before proceeding.
