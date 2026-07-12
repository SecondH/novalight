---
name: security-review
description: Apply NovaLight's security architecture and threat model checklist to a change touching authentication, authorization, sensitive data, or external integrations. Use before implementing or merging any such change.
---

# Security Review

## Purpose

Verify a change against [Security Architecture](../../../docs/security/013-security-architecture.md) and [Threat Model](../../../docs/security/014-novalight-threat-model.md) requirements before it proceeds.

## Use When

- Authentication or authorization changes.
- Sensitive data handling (PII, credentials, tokens).
- New external integration (AI provider, storage provider, auth provider, any third-party API).
- Any change [Security Architecture](../../../docs/security/013-security-architecture.md) flags as requiring review.

## Required Inputs

- The change (plan or diff) under review.

## Preconditions

- Read [Security Architecture](../../../docs/security/013-security-architecture.md) and [Threat Model](../../../docs/security/014-novalight-threat-model.md).

## Workflow

Apply the threat-model's pre-release checklist directly:

1. **Identity** — authentication reviewed? authorization reviewed independently of authentication? permissions tested?
2. **Data** — sensitive data identified? access controlled? logging reviewed for leakage?
3. **API** — input validated? errors handled without leaking internals? rate limits considered?
4. **Infrastructure** — secrets protected (env vars only)? configuration reviewed per environment?
5. **AI** (if applicable) — data sharing with AI providers reviewed? output handling reviewed (no blind trust of AI output)?
6. **Multi-tenant** (if organizations/data ownership involved) — is tenant context enforced on every query? Cross-tenant access is rated **Critical** in the threat model — treat any gap here as blocking.
7. Cross-check against the STRIDE risk matrix in the threat model; note which threat categories the change affects.

## Validation Checklist

- [ ] No secret, credential, or token appears in code, logs, or documentation.
- [ ] Authorization is checked independently of authentication.
- [ ] All external input is validated before use.
- [ ] Vendor calls (auth/storage/AI) go through the documented abstraction interface, not directly.
- [ ] Tenant isolation preserved if organizations/multi-tenant data is involved.

## Outputs

- Pass/Fail per checklist item, with specific evidence; any Fail is a blocking finding.

## Escalation Conditions

- Any finding rated Critical or High in the threat model's risk matrix (auth bypass, tenant data leakage, secret exposure) — stop and require explicit user approval before proceeding, per [CLAUDE.md §15](../../../CLAUDE.md#15-escalation-rules).

## Prohibited Actions

- Do not approve a security-sensitive change based on assumed-safe behavior — require evidence.
- Do not weaken a documented security requirement to unblock a change.
