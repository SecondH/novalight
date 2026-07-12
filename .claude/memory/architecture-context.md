# Architecture Context

Source of truth: [System Architecture](../../docs/architecture/004-system-architecture.md), [C4 Model](../../docs/architecture/005-c4-model.md), [ADRs](../../docs/architecture/006-initial-architecture-decisions.md), [Backend Architecture](../../docs/architecture/010-backend-architecture.md), [Frontend Architecture](../../docs/architecture/011-frontend-architecture.md), [Database Architecture](../../docs/architecture/012-database-architecture.md). This file summarizes; it does not replace those documents. **Everything in this file describes a target architecture — none of it is implemented yet.**

## System architecture summary

Architecture style: Cloud Native Modular SaaS, Clean Architecture + Domain Driven Design. Layers: Web Application → API Platform → Domain Layer → Database Layer, with Authentication, Storage, and AI Platform as abstracted side-layers.

## Runtime components (C4 Level 2 — containers, all future)

1. **Web Application** — Next.js 15, React 19, TypeScript. Deployment: Vercel. Must not contain business rules, database logic, or sensitive operations.
2. **API Platform** — Node.js, Express, TypeScript. Deployment: Railway. Handles request routing, auth validation, authorization, orchestration, integrations.
3. **Database** — PostgreSQL via Prisma. Deployment: Supabase PostgreSQL.
4. **Shared Packages** (TypeScript, monorepo): `packages/ui`, `packages/utils`, `packages/database`, `packages/ai`, `packages/auth`, `packages/storage`.

## Service/module boundaries

- Backend request flow: Routes → Controllers → Services → Repositories → Database.
- Backend module shape (future, e.g. `apps/api/src/modules/{users,organizations,brands,content,analytics,ai}`): each module owns controllers/, services/, repositories/, validators/, types/, routes/, tests/.
- Frontend: feature-based, not type-based — `features/{authentication,dashboard,organizations,content,analytics}`, not a global `components/`/`services/`/`pages/` dump. Route groups: `app/(marketing)/`, `app/(auth)/`, `app/(dashboard)/`, `app/api/`.
- Domain sequence (data ownership order): Identity → Organization → Brand → Content → Publishing → Analytics → AI.

## Main data flows

- Future content-generation flow: User → Web Application → API Controller → Content Service → AI Interface → AI Provider → Database → Response.
- Package dependency direction: `apps → packages → external libraries` only. Packages must never depend on applications.

## Integrations (all future, all behind abstraction interfaces per ADR-007/008/009)

- **Auth**: Application → Auth Interface → Clerk Provider.
- **Storage**: Application → Storage Interface → Supabase Storage Provider.
- **AI**: AI Interface → Provider Strategy → AI Vendor (OpenAI, Claude, Gemini, Flux, Google Veo, Kling). No application module may call an AI vendor directly.

## Deployment topology (future)

Frontend: Vercel. Backend: Railway. Database: Supabase PostgreSQL. Environments: Development, Staging, Production — each with independent config and secrets. Future additions: CDN, object storage, monitoring platform, queue system.

## Architectural invariants (must hold once code exists)

- Dependencies point inward (Clean Architecture); business rules independent of frameworks/infrastructure.
- Frontend cannot access the database or call AI providers directly.
- Backend cannot expose database models directly or trust client input unvalidated.
- Direct Prisma usage inside controllers is prohibited — access only via Service → Repository → Prisma Client.
- API is versioned: `/api/v1`. Response contract: `{"success": true, "data": {}}` / `{"success": false, "error": {"code","message"}}`.
- Database naming: `snake_case`; UUID primary keys; `created_at`/`updated_at` on core entities; schema changes only via Prisma migrations, never manual production edits.
- Multi-tenancy: business tables should carry `organization_id` when ownership is org-based; no cross-tenant data access.

## Known architectural gaps (evidenced, not assumed)

- No monorepo/build tooling (Turborepo) has actually been set up — ADR-001/002 specify it, but nothing exists on disk.
- No recovery/backup strategy is documented yet — [Database Architecture](../../docs/architecture/012-database-architecture.md) states explicitly: "Recovery strategy must be documented before production launch."
- `docs/decisions/` and `docs/api/` are referenced by several source documents (`003`, `005`, `006`, `015`) but do not exist. ADRs actually live at `docs/architecture/006-initial-architecture-decisions.md`.
- Phase-naming conflict across `004-system-architecture.md` §10, `007-product-vision.md` §8, and `009-roadmap.md` — see [[known-risks]].
