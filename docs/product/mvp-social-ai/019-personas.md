# MVP Personas

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../../architecture/017-documentation-structure-for-product-verticals.md).

## Document Metadata

| Field            | Value                             |
| ---------------- | --------------------------------- |
| Document Version | 1.0                               |
| Status           | Proposed — pending human approval |

## 1. Primary Persona — Owner-Operator ("Mira")

- **Role:** owns and runs the business day-to-day (e.g. salon owner, cafe owner, shop owner); the default account holder for the MVP.
- **Marketing background:** none formal; posts to social media herself, inconsistently, using her phone.
- **Goals:** look professional online, keep customers engaged between visits, drive bookings/visits, without spending evenings on content.
- **Frustrations:** doesn't know what to post; feels her posts look amateurish next to competitors; has tried generic AI tools and found the output generic or off-brand.
- **Primary journeys used:** brand setup, content ideation/generation, calendar building (see [020-user-journeys.md](./020-user-journeys.md) §1–3).

## 2. Secondary Persona — Delegated Content Staff ("Jae")

- **Role:** an employee given informal responsibility for social media on top of another job (e.g. a front-of-house staff member, a junior stylist).
- **Marketing background:** comfortable with social media as a personal user, not trained in marketing or copywriting.
- **Goals:** produce content the owner will approve without needing the owner's constant input; not be blamed for a post that misses brand tone.
- **Frustrations:** unsure what's "on brand"; wants guardrails, not a blank page.
- **Primary journeys used:** content ideation/generation, review/approval (see [020-user-journeys.md](./020-user-journeys.md) §2, §5).

## 3. Tertiary Persona (Noted, Not Designed For in MVP) — Freelance/Outsourced Social Manager ("Priya")

- **Role:** manages social media for several small, unrelated businesses as a side business or freelance service.
- **Why noted but out of scope:** her workflow (managing multiple unrelated brand profiles under one login, client billing/reporting) is closer to the agency use case explicitly deferred in [018-target-customer-definition.md](./018-target-customer-definition.md) §3. Listed here so the MVP's single-brand-per-account assumption (see [021-mvp-scope.md](./021-mvp-scope.md)) is a documented decision, not an oversight, and so [022-feature-roadmap.md](./022-feature-roadmap.md) can flag multi-brand-per-login as a plausible near-future feature rather than a surprise request.

## 4. Roles and Permissions — Explicitly Deferred

This document intentionally does **not** assign formal role names (e.g. "Admin," "Owner," "Viewer") to these personas. `.claude/memory/known-risks.md` records an unresolved conflict between the role taxonomy in [008-prd.md](../008-prd.md) §6 (Individual User / Team Member / Organization Owner / Administrator) and [013-security-architecture.md](../../security/013-security-architecture.md) §7 (Platform Administrator / Organization Owner / Organization Member / Viewer). Introducing a third naming scheme here — even informally — would deepen that conflict.

For the MVP specifically: the single-brand-per-account assumption in [021-mvp-scope.md](./021-mvp-scope.md) means the "Mira" persona needs only a single-owner account with no formal RBAC in the earliest stage, and "Jae" (if present) needs a permission boundary (can draft/suggest, cannot publish without owner approval) whose formal name and scope must be resolved by the same human decision that closes the RBAC conflict — not invented here. This is a blocking dependency for any stage of [026-mvp-roadmap.md](./026-mvp-roadmap.md) that introduces multi-user accounts (Stage 3 onward), not for Stage 1.
