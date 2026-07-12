---
name: api-review
description: Review a new or changed REST endpoint against NovaLight's API architecture standard (versioning, response contract, validation, error format). Use before creating an endpoint or changing an existing contract.
---

# API Review

## Purpose

Verify that an API endpoint follows [ADR-010](../../../docs/architecture/006-initial-architecture-decisions.md) and [Backend Architecture](../../../docs/architecture/010-backend-architecture.md) API standards.

## Use When

- Creating a new endpoint.
- Changing an existing endpoint's request/response contract.

## Required Inputs

- The endpoint's route, method, request shape, and response shape.

## Preconditions

- Read [Backend Architecture](../../../docs/architecture/010-backend-architecture.md) API sections and ADR-010.

## Workflow

1. Confirm the route is under `/api/v1` (or a justified new version if it's a breaking change).
2. Confirm the success response shape: `{"success": true, "data": {}}`.
3. Confirm the error response shape: `{"success": false, "error": {"code": "ERROR_CODE", "message": "..."}}` and that the error category is one of Validation / Authentication / Authorization / Business / System.
4. Confirm request validation happens before processing (target: Zod), and invalid input fails safely without leaking internals.
5. Confirm the endpoint sits in Controller (HTTP only) → Service (logic) → Repository (data) — no business logic or direct DB access in the controller.
6. Confirm naming consistency with existing endpoints (once any exist).
7. If the contract changes for an existing consumer, confirm this is treated as a breaking change requiring a new API version (ADR-010 consequence).

## Validation Checklist

- [ ] Route versioned under `/api/v1` (or justified new version).
- [ ] Response contract matches the documented success/error shape exactly.
- [ ] Input validated before any processing.
- [ ] No business logic or direct database access in the controller layer.
- [ ] Breaking changes are versioned, not silently applied to `/api/v1`.

## Outputs

- Pass/Fail per checklist item with the specific deviation, if any.

## Escalation Conditions

- A breaking change to an existing contract is proposed without a version bump — stop and flag before implementation.

## Prohibited Actions

- Do not approve an endpoint that returns raw database models directly to the client.
- Do not approve a non-standard response shape "just for this one endpoint."
