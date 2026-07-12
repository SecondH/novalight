# Engineering Conventions

Source of truth: [Engineering Constitution](../../docs/engineering/002-engineering-constitution.md), [Backend Architecture](../../docs/architecture/010-backend-architecture.md), [Frontend Architecture](../../docs/architecture/011-frontend-architecture.md), [Database Architecture](../../docs/architecture/012-database-architecture.md), [Development Workflow](../../docs/development/015-development-workflow.md). No code exists yet — these are the conventions to apply the first time code is written, not observed patterns.

## Naming conventions

- Database: `snake_case` tables/columns (e.g. `users`, `created_at`, `organization_members`).
- Documentation files: `docs/<category>/<NNN>-<kebab-case-name>.md`, numbered sequentially across the whole `docs/` tree.
- Git branches: `feature/*`, `bugfix/*`, `refactor/*`, `docs/*` (e.g. `feature/user-authentication`).
- Commits: `type(scope): description` (e.g. `feat(auth): add authentication interface`, `fix(api): handle validation error`).

## File organization (target, not yet created)

- Monorepo: `apps/` (applications), `packages/` (shared capabilities), `docs/` (documentation).
- Backend module: `controllers/`, `services/`, `repositories/`, `validators/`, `types/`, `routes/`, `tests/` per module.
- Frontend: feature-based (`features/<capability>/{components,hooks,api,schemas,types,utils}`), not global type-based folders.

## Coding style

- TypeScript strict mode mandatory; avoid `any`, implicit assumptions, unsafe casting.
- Small, focused functions; meaningful names; no unnecessary abstraction.
- Reuse existing components/logic; no duplicated business logic.

## Error handling

- Backend error categories: Validation Error, Authentication Error, Authorization Error, Business Error, System Error. Never expose internal/sensitive details in error responses.
- Frontend: global error boundary + route-level + API error handling; user-friendly messages only, no raw technical detail surfaced to users.

## Logging

- Structured, production-safe logging (backend tooling target: Pino).
- Never log passwords, tokens, secrets, or private user data.
- Log entries should include timestamp, request identifier, operation context, error information.

## Configuration

- All configuration from environment variables; no hardcoded credentials; validate required variables at startup.
- Named example env vars from the docs: `DATABASE_URL`, `AUTH_PROVIDER_KEY`, `STORAGE_CONFIG` (illustrative, not a complete list).
- Development / Staging / Production environments each require independent config and secrets.

## API conventions

- Versioned under `/api/v1`.
- Response contract: success `{"success": true, "data": {}}`; error `{"success": false, "error": {"code": "ERROR_CODE", "message": "..."}}`.
- Input validation before processing (target tooling: Zod).

## Testing conventions

- Backend target tooling: Jest, Supertest.
- Frontend target tooling ("recommended," not mandated): Vitest, React Testing Library, Playwright.
- Required levels: unit (utilities/services/business rules), integration (API + DB interaction), end-to-end (critical workflows).

## Documentation conventions

- Update `docs/architecture/` for architecture changes, a new ADR in `docs/architecture/` for decisions (not `docs/decisions/`, which does not exist).
- PRs should state: summary, reason, impact, testing performed, known risks.
