# API Change Checklist

Per `docs/architecture/010-backend-architecture.md` and ADR-010:

- [ ] Route versioned under `/api/v1` (or a justified new version for breaking changes).
- [ ] Success response: `{"success": true, "data": {}}`.
- [ ] Error response: `{"success": false, "error": {"code": "...", "message": "..."}}`, category one of Validation/Authentication/Authorization/Business/System.
- [ ] Input validated before processing; failures don't leak internals.
- [ ] No business logic or direct database access in the Controller layer.
- [ ] Breaking changes to an existing contract are versioned, not silently applied.
