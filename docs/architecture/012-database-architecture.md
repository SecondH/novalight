# NovaLight Database Architecture Specification

> Source document: `docs/architecture/012-database-architecture.docx`

## Document Metadata

| Field              | Value                                                 |
| ------------------ | ----------------------------------------------------- |
| Source             | `docs/architecture/012-database-architecture.docx`    |
| Document Version   | 1.0                                                   |
| Status             | Foundation Architecture                               |
| Architecture Style | Relational Data Architecture + Domain-Oriented Design |
| Language           | English                                               |
| Converted On       | 2026-07-11                                            |
| Conversion Type    | Word to Markdown                                      |
| Source Preserved   | Yes                                                   |

## 1. Purpose

This document defines the database architecture standards for NovaLight.

The objective is to create a secure, scalable, maintainable, and evolution-ready data foundation.

The database architecture must support:

- SaaS multi-tenant growth
- future AI workloads
- large-scale user activity
- reliable data operations
- controlled schema evolution

## 2. Database Technology Stack

- **Primary Database:** PostgreSQL
- **ORM:** Prisma ORM
- **Database Hosting:** Supabase PostgreSQL
- **Migration System:** Prisma Migrations

## 3. Database Architecture Principles

### Data Ownership

Each domain owns its data model.

Modules should avoid unnecessary direct access to other domain tables.

Example:

Content module owns:

- content records
- content versions
- content metadata

Organization module owns:

- organizations
- memberships
- permissions

## 4. Domain-Oriented Data Design

Future database domains:

```text
Identity
  ↓
Organization
  ↓
Brand
  ↓
Content
  ↓
Publishing
  ↓
Analytics
  ↓
AI
```

Each domain should have:

- clear ownership
- defined relationships
- documented schema decisions

## 5. Initial Database Scope

Phase 0 database scope is intentionally minimal.

Only create: User model

No business entities should be implemented before their requirements are approved.

## 6. Schema Design Principles

### Naming Convention

Database: Use `snake_case`

Examples:

- `users`
- `created_at`
- `organization_members`

### Primary Keys

Preferred: UUID

Reason:

- distributed system readiness
- security
- scalability

Example: `id UUID PRIMARY KEY`

## 7. Timestamp Requirements

Core entities should include:

- `created_at`
- `updated_at`

Purpose:

- auditing
- synchronization
- analytics
- debugging

## 8. Soft Delete Strategy

For important business entities, consider `deleted_at` instead of immediate deletion.

Benefits:

- data recovery
- audit preservation
- compliance support

Soft delete must be introduced only where business value exists.

## 9. Relationship Design

Relationships must be explicit.

Avoid:

- hidden relationships
- duplicated data
- uncontrolled references

Foreign keys must be used where appropriate.

## 10. Multi-Tenancy Readiness

NovaLight is designed as a SaaS platform.

Future architecture must support:

```text
Organization
  |
  Users + Resources
```

Future business tables should consider `organization_id` when ownership is organization-based.

> Cross-reference (added during MVP M1 planning): the Social AI MVP introduces an `Account` entity as its near-term ownership root ([architecture/social-ai-platform/027-data-model-scope-decision.md](./social-ai-platform/027-data-model-scope-decision.md)) rather than `Organization`/`organization_id`. Whether `Account` converges with, is renamed to, or remains distinct from `Organization` is explicitly left open ([architecture/social-ai-platform/018-saas-architecture.md](./social-ai-platform/018-saas-architecture.md) §1.2) — not decided here, flagged so a future reader of this section isn't surprised by the different term.

## 11. Data Isolation Principles

Tenant data must be isolated.

Required future capabilities:

- authorization checks
- scoped queries
- access policies

No user should access another organization's data.

## 12. Prisma Architecture

Database package:

```text
packages/database/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── client.ts
├── helpers/
└── types/
```

Responsibilities:

### Prisma Schema

Defines database structure.

### Prisma Client

Provides type-safe database access.

### Helpers

Provides reusable database utilities.

## 13. Migration Strategy

All schema changes require migrations.

Process:

```text
Schema Change
  ↓
Migration Creation
  ↓
Migration Review
  ↓
Testing
  ↓
Deployment
```

Never modify production schema manually.

## 14. Indexing Strategy

Indexes should be created based on query patterns.

Common candidates:

- foreign keys
- frequently searched fields
- timestamps
- status fields

Avoid unnecessary indexes.

Every index has a storage and write-performance cost.

## 15. Data Validation Strategy

Validation happens at multiple levels:

- **Application Layer:** User input validation
- **Database Layer:** Data integrity constraints

Examples:

- required fields
- unique constraints
- foreign keys

## 16. Security Requirements

Database security rules:

Never:

- expose database directly
- store secrets
- allow uncontrolled access

Required:

- restricted credentials
- environment-based configuration
- access control

## 17. Backup and Recovery

Production database must support:

- automated backups
- recovery procedures
- migration rollback planning

Recovery strategy must be documented before production launch.

## 18. Performance Strategy

Database performance depends on:

- query design
- indexes
- connection management
- caching strategy

Avoid:

- unnecessary queries
- N+1 query problems
- uncontrolled data loading

## 19. Database Access Rules

Application code must access data through:

```text
Service Layer
  ↓
Repository Layer
  ↓
Prisma Client
```

Direct Prisma usage inside controllers is prohibited.

## 20. Data Lifecycle Management

Future large datasets require:

- archival strategy
- retention policy
- cleanup jobs

Examples:

- generated AI assets
- analytics data
- activity logs

## 21. Future AI Data Considerations

Future AI capabilities may require:

- prompt history
- generated content
- model metadata
- evaluation results

These should be introduced as separate domains.

## 22. Database Testing Requirements

Database changes require:

- migration validation
- integration tests
- rollback consideration

## 23. Final Principle

The NovaLight database is not only a storage layer.

It is the foundation of a scalable SaaS platform and must evolve with discipline, security, and architectural consistency.
