# Database Change Checklist

Per `docs/architecture/012-database-architecture.md`:

- [ ] **Phase 0 scope gate**: if still Phase 0, change is limited to the `User` model unless requirements were explicitly approved otherwise.
- [ ] `snake_case` naming; UUID primary keys.
- [ ] `created_at`/`updated_at` present on core entities.
- [ ] Change is migration-based (Prisma), never a manual/direct schema edit.
- [ ] `organization_id` (or equivalent) present for organization-owned entities.
- [ ] Any new index is justified by an actual query pattern.
- [ ] Domain data ownership respected — not reaching into another domain's tables without justification.
- [ ] Destructive migrations have an explicit rollback plan and user approval.
