# NovaLight Development Workflow Specification

> Source document: `docs/development/015-development-workflow.docx`

## Document Metadata

| Field            | Value                                                            |
| ---------------- | ---------------------------------------------------------------- |
| Source           | `docs/development/015-development-workflow.docx`                 |
| Document Version | 1.0                                                              |
| Status           | Engineering Process Foundation                                   |
| Document Purpose | Define the standard software development lifecycle for NovaLight |
| Language         | English                                                          |
| Converted On     | 2026-07-11                                                       |
| Conversion Type  | Word to Markdown                                                 |
| Source Preserved | Yes                                                              |

## 1. Purpose

This document defines how NovaLight is designed, implemented, reviewed, tested, and delivered.

The goal is to create a predictable engineering process where every change is:

- intentional
- reviewed
- tested
- documented
- aligned with architecture principles

## 2. Development Philosophy

NovaLight follows:

- Documentation Driven Development
- Architecture First Development
- Incremental Delivery
- Continuous Quality Improvement

Development speed must never compromise:

- security
- maintainability
- scalability
- code quality

## 3. Development Lifecycle

Every meaningful change follows:

```text
Requirement
  ↓
Analysis
  ↓
Design
  ↓
Architecture Review
  ↓
Implementation
  ↓
Testing
  ↓
Security Review
  ↓
Documentation Update
  ↓
Release
```

## 4. Requirement Phase

Before implementation, every feature or change must define:

### Problem

What user or business problem is being solved?

### Goal

What outcome should be achieved?

### Scope

What is included?

### Non-Scope

What is intentionally excluded?

### Acceptance Criteria

How success is measured?

## 5. Analysis Phase

The engineer or Claude Code must analyze:

- existing architecture
- affected modules
- dependencies
- security impact
- performance impact
- testing requirements

Output: Implementation plan.

## 6. Architecture Review Gate

Architecture review is required for:

- new modules
- new packages
- database changes
- authentication changes
- external integrations
- infrastructure changes

Review questions:

### Design

Does the solution follow existing architecture?

### Boundaries

Are responsibilities correctly separated?

### Scalability

Can this evolve?

### Complexity

Is complexity justified?

## 7. Implementation Rules

During implementation. Required:

- follow existing patterns
- maintain type safety
- reuse existing components
- avoid duplicate logic
- update documentation

Forbidden:

- bypassing architecture boundaries
- adding unnecessary dependencies
- creating hidden logic
- skipping validation

## 8. Branch Strategy

Recommended Git workflow:

```text
main
  |
  ├── feature/*
  ├── bugfix/*
  ├── refactor/*
  └── docs/*
```

### Main Branch

Rules:

- production-ready
- protected
- reviewed changes only

### Feature Branch

Naming: `feature/`

Example: `feature/user-authentication`

## 9. Commit Standards

Commits should be:

- small
- focused
- meaningful

Recommended format: `type(scope): description`

Examples:

```text
feat(auth): add authentication interface
fix(api): handle validation error
docs(architecture): update ADR
```

## 10. Pull Request Process

Every significant change requires review.

PR should include:

### Summary

What changed?

### Reason

Why was it needed?

### Impact

Which areas are affected?

### Testing

How was it validated?

### Risks

Any known limitations?

## 11. Code Review Standards

Reviewers should evaluate:

### Correctness

Does it solve the intended problem?

### Architecture

Does it respect boundaries?

### Security

Does it introduce vulnerabilities?

### Performance

Could it create scaling problems?

### Maintainability

Will future engineers understand it?

## 12. Testing Workflow

Testing is part of implementation.

Required:

### Unit Testing

For:

- utilities
- services
- business rules

### Integration Testing

For:

- APIs
- database interactions

### End-to-End Testing

For:

- critical workflows

## 13. Quality Gates

Before merging, required checks:

```text
Lint
  ↓
Type Check
  ↓
Tests
  ↓
Build Validation
  ↓
Security Review
```

A failed quality gate blocks merge.

## 14. Documentation Requirements

Documentation must be updated when changing:

### Architecture

Update: `docs/architecture/`

### Decisions

Create or update: `docs/decisions/`

### APIs

Update: `docs/api/`

### Development Process

Update: `docs/development/`

## 15. Claude Code Workflow

Claude Code must follow:

### Before Coding

1. Read relevant documentation
2. Inspect existing implementation
3. Identify constraints
4. Propose approach

### During Coding

1. Make controlled changes
2. Follow architecture rules
3. Run validation

### After Coding

1. Review generated code
2. Run tests
3. Update documentation
4. Report remaining risks

## 16. Use of Claude Code Agents

Recommended workflow:

```text
Product Agent
  ↓
Architecture Agent
  ↓
Implementation Agent
  ↓
Security Agent
  ↓
QA Agent
  ↓
Review Agent
```

Each agent has a specific responsibility.

## 17. Technical Debt Management

Technical debt must be tracked.

Create: `docs/engineering/technical-debt.md`

Every debt item should include:

- description
- impact
- priority
- recommended solution

## 18. Release Process

Before release. Required:

- all tests pass
- documentation updated
- security review completed
- deployment validated

Release notes should document:

- features
- fixes
- breaking changes

## 19. Emergency Changes

Emergency fixes may bypass normal timing but must include:

- justification
- review afterward
- documentation update

## 20. Definition of Done

A task is complete only when:

- Requirement is satisfied
- Code follows architecture
- Tests are considered
- Security impact is reviewed
- Documentation is updated
- Quality checks pass

## 21. Final Principle

NovaLight development is a disciplined engineering process.

The objective is not maximum code production.

The objective is continuous delivery of reliable, scalable, and maintainable software.
