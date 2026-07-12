---
name: database-change-review
description: Review a schema or migration change against NovaLight's database architecture rules (Prisma-only access, migrations required, Phase 0 minimal-scope constraint, multi-tenancy readiness). Use before any schema change.
---

# Database Change Review

## Purpose

Verify a proposed schema/migration change against [Database Architecture](../../../docs/architecture/012-database-architecture.md) and ADR-006.

## Use When

- Any new table/model, column change, or migration.
- Especially: any change during Phase 0, where scope is constrained to the `User` model only.

## Required Inputs

- The proposed schema change (model/migration).

## Preconditions

- Read [Database Architecture](../../../docs/architecture/012-database-architecture.md) in full — this document contains the explicit Phase 0 scope constraint.

## Workflow

1. **Phase 0 scope gate** — if the current phase is still Phase 0, confirm the change is limited to the `User` model. Any other business entity requires explicit approved requirements first ([Database Architecture §5](../../../docs/architecture/012-database-architecture.md)).
2. Confirm naming: `snake_case` tables/columns.
3. Confirm primary key strategy: UUID.
4. Confirm `created_at`/`updated_at` present on core entities.
5. Confirm the change goes through a Prisma migration — never a direct/manual schema edit.
6. If the entity is organization-owned, confirm an `organization_id` (or equivalent tenant column) is present for future multi-tenancy readiness.
7. Confirm indexing is justified by an actual query pattern, not added speculatively (index has storage/write cost).
8. Confirm data ownership: does this domain already own this data, or does the change reach into another domain's tables without justification?

## Validation Checklist

- [ ] Change is in-scope for the current phase (Phase 0 = User model only, unless requirements were explicitly approved otherwise).
- [ ] Migration-based, not manual.
- [ ] Naming and PK conventions followed.
- [ ] Tenant column present where ownership is organization-based.
- [ ] No unjustified index.

## Outputs

- Pass/Fail per checklist item, with the specific deviation if any.

## Escalation Conditions

- A destructive migration (data loss possible) — stop and require an explicit rollback plan and user approval before proceeding, per [CLAUDE.md §15](../../../CLAUDE.md#15-escalation-rules).
- A proposed entity exceeds Phase 0 scope — stop and confirm with the user rather than implementing it.

## Prohibited Actions

- Do not apply a schema change directly to a database without a migration.
- Do not implement a business entity ahead of Phase 0's approved minimal scope.
