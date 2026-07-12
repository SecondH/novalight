# NovaLight System Architecture Document

> Source document: `docs/architecture/004-system-architecture.docx`

## Document Metadata

| Field              | Value                                            |
| ------------------ | ------------------------------------------------ |
| Source             | `docs/architecture/004-system-architecture.docx` |
| Document Version   | 1.0                                              |
| Status             | Foundation Architecture                          |
| Architecture Style | Cloud Native Modular SaaS                        |
| Language           | English                                          |
| Converted On       | 2026-07-11                                       |
| Conversion Type    | Word to Markdown                                 |
| Source Preserved   | Yes                                              |

## 1. Purpose

This document defines the high-level architecture of NovaLight.

The objective is to create a scalable, secure, and extensible foundation for an AI-native SaaS platform.

The architecture must support:

- rapid product evolution
- multiple organizations and users
- future AI capabilities
- external integrations
- enterprise-level reliability

## 2. Architecture Vision

NovaLight follows a modular cloud-native architecture.

The system is designed around:

- Frontend application
- Backend API platform
- Shared infrastructure packages
- Database layer
- External providers
- AI abstraction layer

High-level model:

```text
Users
  ↓
Web Application
  ↓
API Platform
  ↓
Application Services
  ↓
Domain Modules
  ↓
Infrastructure Layer
  ↓
Database / External Providers
```

## 3. Architectural Principles

### Modular Architecture

Each capability must be isolated as an independent module.

Future domains should be added without affecting existing functionality.

### API First

All backend capabilities must be exposed through clearly defined APIs.

### Provider Independence

External services must be accessed through abstraction layers.

Vendor replacement should not require major system changes.

### Cloud Native

The system must support:

- containerized deployment
- automated delivery
- environment separation

### Security by Design

Security controls are part of architecture, not an afterthought.

## 4. System Components

### 4.1 Web Application

Technology:

- Next.js
- React
- TypeScript

Responsibilities:

- user interface
- authentication experience
- dashboard
- client-side interactions
- API consumption

The frontend must not contain:

- business rules
- database logic
- sensitive operations

Architecture:

```text
Pages
  ↓
Features
  ↓
Components
  ↓
Shared UI
  ↓
API Client
```

### 4.2 API Platform

Technology:

- Node.js
- Express
- TypeScript

Responsibilities:

- API endpoints
- authentication validation
- authorization
- application orchestration
- integration management

Architecture:

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Repositories
  ↓
Database
```

### 4.3 Domain Layer

The domain layer contains future business capabilities.

Future modules:

- Organization Management
- User Management
- Content Management
- Campaign Management
- AI Assistant
- Analytics

> Cross-reference (added during MVP M1 planning): the Social AI MVP's near-term ownership entity is named `Account`, not `Organization` ([architecture/social-ai-platform/027-data-model-scope-decision.md](./social-ai-platform/027-data-model-scope-decision.md)) — see [012-database-architecture.md](./012-database-architecture.md) §10 for the same cross-reference. Convergence between the two terms is explicitly undecided, not silently assumed.

- Scheduling

Each domain must have:

- own models
- own services
- clear boundaries

### 4.4 Database Layer

Technology:

- PostgreSQL
- Prisma ORM

Responsibilities:

- persistence
- migrations
- data integrity

Rules:

- schema changes require migration
- direct database manipulation is prohibited

### 4.5 Authentication Layer

Future provider: Clerk

Architecture:

```text
Application
  ↓
Auth Interface
  ↓
Clerk Provider
```

The application depends on the interface, not the provider.

### 4.6 Storage Layer

Future provider: Supabase Storage

Architecture:

```text
Application
  ↓
Storage Interface
  ↓
Storage Provider
```

Supports future:

- images
- videos
- documents
- generated AI assets

### 4.7 AI Platform Layer

Purpose: Provide unified access to multiple AI providers.

Future providers:

- OpenAI
- Claude
- Gemini
- Flux
- Google Veo
- Kling

Architecture:

```text
AI Interface
  ↓
Provider Strategy
  ↓
Specific AI Provider
```

No application module should directly call AI vendors.

## 5. Deployment Architecture

Target:

- **Frontend:** Vercel
- **Backend:** Railway
- **Database:** Supabase PostgreSQL

Future:

- CDN
- Object Storage
- Monitoring Platform
- Queue System

## 6. Environment Strategy

Three environments:

### Development

Purpose: Local development

### Staging

Purpose: Testing and validation

### Production

Purpose: Customer-facing operation

Each environment must have:

- independent configuration
- independent secrets
- controlled deployment

## 7. Scalability Strategy

The architecture supports future scaling through:

### Horizontal Scaling

Stateless backend services.

### Database Optimization

- indexing
- migrations
- query optimization

### Background Processing

Future support:

- queues
- workers
- scheduled jobs

### Modular Expansion

New capabilities added as independent modules.

## 8. Security Architecture Principles

Mandatory:

- authentication
- authorization
- input validation
- secure secrets
- audit capability
- protected APIs

Sensitive operations require:

- permission checks
- logging
- traceability

## 9. Observability Strategy

Future architecture support:

- **Logging:** Structured logging
- **Metrics:** Application metrics
- **Tracing:** Distributed tracing
- **Error Monitoring:** Centralized error reporting

## 10. Future Architecture Evolution

Expected evolution:

- **Phase 0:** Engineering Foundation
- **Phase 1:** Identity and Organization
- **Phase 2:** Core SaaS Platform
- **Phase 3:** AI Capabilities
- **Phase 4:** Automation Engine
- **Phase 5:** Enterprise Platform

## 11. Architecture Constraint

The current implementation must not create unnecessary complexity.

Build only foundations required for future growth.

Every addition must justify:

- business value
- architectural impact
- maintenance cost

## 12. Final Architecture Principle

NovaLight is designed as an extensible AI SaaS platform.

The architecture must allow innovation without sacrificing reliability, security, or maintainability.
