# NovaLight Engineering Constitution

> Source document: `docs/engineering/002-engineering-constitution.docx`

## Document Metadata

| Field            | Value                                                |
| ---------------- | ---------------------------------------------------- |
| Source           | `docs/engineering/002-engineering-constitution.docx` |
| Document Version | 1.0                                                  |
| Status           | Foundation Rulebook                                  |
| Language         | English                                              |
| Converted On     | 2026-07-11                                           |
| Conversion Type  | Word to Markdown                                     |
| Source Preserved | Yes                                                  |

## 1. Purpose

This document defines the non-negotiable engineering principles, standards, and operating rules for building NovaLight.

Every developer, AI agent, automation process, and future contributor must follow these rules.

NovaLight is developed as a production-grade SaaS platform, not as a prototype.

## 2. Core Engineering Philosophy

### Build for Scale

Every design decision must consider future growth in:

- users
- organizations
- data volume
- integrations
- AI capabilities
- operational complexity

### Prefer Simplicity

Choose the simplest architecture that satisfies current and foreseeable requirements.

Avoid unnecessary complexity.

### Design for Change

Systems must be modular and extensible.

Future capabilities should be added through extension, not rewriting.

### Documentation Before Complexity

Important architectural decisions must be documented before implementation.

## 3. Architecture Principles

### Clean Architecture

Dependencies must point inward.

Core business rules must not depend on:

- databases
- frameworks
- external APIs
- infrastructure

### Domain Driven Design

The system should evolve around business domains.

Future modules must have:

- clear ownership
- defined boundaries
- independent evolution

### Separation of Concerns

Each layer has a specific responsibility.

Example:

- **Controller:** API communication
- **Service:** Application logic
- **Repository:** Data access
- **Provider:** External integrations

## 4. Code Quality Rules

### Type Safety

TypeScript strict mode is mandatory.

Avoid:

- `any` type
- implicit assumptions
- unsafe casting

### Readability

Code must be understandable without additional explanation.

Prefer:

- meaningful names
- small functions
- clear structures

### Reusability

Duplicate logic must be avoided.

Common functionality belongs in shared packages.

### Maintainability

Code should optimize for future engineers, not only current implementation speed.

## 5. Repository Rules

The repository follows a monorepo architecture.

- **Applications:** `apps/`
- **Shared capabilities:** `packages/`
- **Documentation:** `docs/`

Every package must have:

- clear responsibility
- independent boundaries
- documented purpose

## 6. Development Rules

### Before Coding

Required:

1. Understand requirement
2. Review architecture impact
3. Define implementation approach
4. Identify risks

### During Coding

Required:

- follow existing patterns
- update documentation
- add tests where applicable

### After Coding

Required:

- lint check
- type check
- test execution
- architecture review

## 7. Testing Principles

Testing is part of development, not a final step.

Required levels:

### Unit Tests

For:

- utilities
- services
- business rules

### Integration Tests

For:

- API behavior
- database interaction

### End-to-End Tests

For:

- critical user workflows

New functionality should not reduce overall quality.

## 8. Security Principles

Security is a default requirement.

Mandatory:

- Never commit secrets
- Validate external input
- Protect authentication flows
- Avoid exposing internal errors
- Apply least privilege principle

Sensitive operations require:

- authorization
- audit capability
- validation

## 9. Database Rules

Database changes must:

- use migrations
- be reviewed
- preserve backward compatibility where possible

Avoid:

- direct production modifications
- destructive migrations without planning

## 10. API Rules

APIs must be:

- versioned
- documented
- predictable

Standards:

- consistent naming
- consistent error format
- validation before processing

Current API version: `/api/v1`

## 11. AI Integration Rules

AI capabilities must be isolated behind abstraction layers.

The application must not directly depend on a specific AI vendor.

Supported future providers:

- OpenAI
- Claude
- Gemini
- Flux
- Veo
- Kling

Provider replacement must not require application redesign.

## 12. Infrastructure Rules

All environments must be reproducible.

Required:

- environment variables
- infrastructure documentation
- automated deployment process

Never rely on undocumented local configuration.

## 13. Claude Code Operating Rules

Claude Code must behave as a senior engineering team member.

Before implementation:

- analyze existing architecture
- identify impact
- propose approach

Claude must not:

- create unnecessary files
- bypass architecture rules
- introduce dependencies without justification
- implement business logic outside defined scope

## 14. Architecture Decision Rules

Major decisions require an ADR.

Examples:

- framework changes
- database strategy
- authentication approach
- infrastructure changes
- architectural patterns

## 15. Definition of Done

A task is complete only when:

- Implementation exists
- Code quality requirements satisfied
- Tests considered
- Documentation updated
- Security impact reviewed
- Architecture remains consistent

## 16. Final Principle

NovaLight is built as a long-term technology platform.

Short-term speed must never compromise:

- architecture quality
- security
- maintainability
- scalability
