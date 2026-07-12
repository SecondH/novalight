# Security Review: <change description>

Produced by the `security-review` skill / `/security-review` command. Checklist per `docs/security/014-novalight-threat-model.md`.

| Area                                                                          | Pass/Fail | Evidence |
| ----------------------------------------------------------------------------- | --------- | -------- |
| Identity (authn/authz reviewed independently, permissions tested)             |           |          |
| Data (sensitive data identified, access controlled, no logging leakage)       |           |          |
| API (input validated, errors don't leak internals, rate limits considered)    |           |          |
| Infrastructure (secrets from env vars only, per-environment config isolation) |           |          |
| AI (data sharing minimized, output not blindly trusted) — if applicable       |           |          |
| Multi-tenant (tenant context enforced) — if applicable                        |           |          |

## STRIDE categories affected

<Spoofing / Tampering / Repudiation / Information Disclosure / DoS / Elevation of Privilege — name which apply and cite the risk-matrix rating.>

## Blocking findings

<Any Critical/High finding per the threat model's risk matrix. State "none" explicitly if clean.>
