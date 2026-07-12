# NovaLight Backend Architecture Specification

> Source document: `docs/architecture/010-backend-architecture.docx`

## Document Metadata

| Field              | Value                                             |
| ------------------ | ------------------------------------------------- |
| Source             | `docs/architecture/010-backend-architecture.docx` |
| Document Version   | 1.0                                               |
| Status             | Foundation Architecture                           |
| Architecture Style | Clean Architecture + Modular Design               |
| Language           | English                                           |
| Converted On       | 2026-07-11                                        |
| Conversion Type    | Word to Markdown                                  |
| Source Preserved   | Yes                                               |

## 1. Purpose

This document defines the backend architecture standards for NovaLight.

The goal is to create a scalable, secure, maintainable, and extensible backend foundation suitable for a world-class SaaS platform.

The backend must support:

- rapid feature development
- independent domain expansion
- secure API delivery
- future AI integrations
- enterprise scalability

## 2. Backend Technology Stack

Core Technologies:

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM

Supporting Technologies:

- Zod validation
- Pino structured logging
- Jest testing
- Supertest API testing

## 3. Architectural Principles

### Clean Architecture

The backend must separate:

- domain logic
- application logic
- infrastructure
- external integrations

Dependencies must always point toward the core application layers.

### Modular Architecture

The backend must be organized by business domains.

Each domain must be independently maintainable.

### Separation of Responsibilities

Each layer has a clear responsibility.

No layer should perform another layer's responsibility.

## 4. Backend High-Level Structure

The backend follows:

```text
Request
  ↓
Middleware Layer
  ↓
Route Layer
  ↓
Controller Layer
  ↓
Service Layer
  ↓
Repository Layer
  ↓
Database / External Provider
```

## 5. Repository Structure

Backend location:

```text
apps/api/
src/
├── app.ts
├── server.ts
├── config/
├── modules/
├── routes/
├── controllers/
├── services/
├── repositories/
├── validators/
├── middlewares/
├── providers/
├── database/
├── utils/
├── types/
└── tests/
```

## 6. Application Entry Layer

### server.ts

Responsibilities:

- start HTTP server
- initialize application
- handle process lifecycle

Must not contain:

- business logic
- database operations

### app.ts

Responsibilities:

- configure Express
- register middleware
- register routes
- configure error handling

## 7. Module Architecture

Future business capabilities must be implemented as modules.

Example:

```text
modules/
├── users/
├── organizations/
├── brands/
├── content/
├── analytics/
├── ai/
```

Each module follows:

```text
module/
├── controllers/
├── services/
├── repositories/
├── validators/
├── types/
├── routes/
└── tests/
```

## 8. Controller Layer

Responsibilities:

- receive HTTP requests
- validate request context
- call services
- return responses

Controllers must not:

- contain business rules
- directly access database
- call external APIs

Example responsibility:

- **Good:** "Create user request and call `UserService`"
- **Bad:** "Create user and directly insert into database"

## 9. Service Layer

Responsibilities:

- application logic
- workflow orchestration
- business operations

Services:

- coordinate repositories
- apply rules
- interact with providers through interfaces

Services must not:

- depend on Express objects
- handle HTTP responses directly

## 10. Repository Layer

Responsibilities:

- database access
- persistence operations
- query management

Repositories abstract:

- Prisma
- database implementation details

Business logic must not exist inside repositories.

## 11. Validation Layer

All external input must be validated.

Validation technologies:

- Zod

Validation applies to:

- request body
- query parameters
- route parameters
- external responses

Invalid input must fail safely.

## 12. Middleware Architecture

Required middleware:

### Security Middleware

Responsibilities:

- secure headers
- request protection

### Authentication Middleware

Responsibilities:

- validate identity
- attach user context

### Authorization Middleware

Responsibilities:

- permission checks

### Logging Middleware

Responsibilities:

- request tracking
- structured logs

### Error Middleware

Responsibilities:

- centralized error handling

## 13. API Architecture

API standard: `/api/v1`

Example:

```text
GET /api/v1/users
POST /api/v1/users
PATCH /api/v1/users/:id
DELETE /api/v1/users/:id
```

## 14. API Response Standards

Successful response:

```json
{
  "success": true,
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## 15. Error Handling Strategy

All errors must be centralized.

Error categories:

- **Validation Error** — Invalid input.
- **Authentication Error** — User identity problem.
- **Authorization Error** — Permission problem.
- **Business Error** — Domain rule violation.
- **System Error** — Unexpected infrastructure failure.

Sensitive internal details must never be exposed.

## 16. Dependency Management

External systems must use abstraction layers.

Examples:

Authentication:

```text
Auth Interface
  ↓
Clerk Provider
```

Storage:

```text
Storage Interface
  ↓
Supabase Provider
```

AI:

```text
AI Interface
  ↓
AI Provider
```

## 17. Configuration Management

All configuration must come from environment variables.

Rules:

- no secrets in code
- no hardcoded credentials
- validate required variables at startup

Example:

- `DATABASE_URL`
- `AUTH_PROVIDER_KEY`
- `STORAGE_CONFIG`

## 18. Logging Strategy

Logging must be:

- structured
- searchable
- production-safe

Never log:

- passwords
- tokens
- secrets
- private user data

## 19. Testing Strategy

Backend testing levels:

### Unit Tests

For:

- services
- utilities
- business rules

### Integration Tests

For:

- API endpoints
- database interaction

### End-to-End Tests

For:

- critical workflows

## 20. Security Requirements

Mandatory:

- input validation
- authentication checks
- authorization checks
- secure headers
- rate limiting
- secret management

## 21. Scalability Requirements

Backend must support future:

- horizontal scaling
- background workers
- queues
- caching
- distributed services

Initial architecture should remain simple while allowing future evolution.

## 22. Backend Development Rules

Before adding a module. Required:

- define domain responsibility
- define API contract
- define data requirements
- review security impact

Before merging. Required:

- tests considered
- documentation updated
- architecture consistency verified

## 23. Final Principle

NovaLight backend is not designed as a collection of APIs.

It is designed as a scalable application platform where new capabilities can be added safely and independently.
