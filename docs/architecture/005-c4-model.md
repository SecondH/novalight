# NovaLight C4 Architecture Model

> Source document: `docs/architecture/005-c4-model.docx`

## Document Metadata

| Field            | Value                                 |
| ---------------- | ------------------------------------- |
| Source           | `docs/architecture/005-c4-model.docx` |
| Document Version | 1.0                                   |
| Status           | Foundation Architecture               |
| Model            | C4 Software Architecture Model        |
| Language         | English                               |
| Converted On     | 2026-07-11                            |
| Conversion Type  | Word to Markdown                      |
| Source Preserved | Yes                                   |

## 1. Purpose

This document describes NovaLight architecture using the C4 Model.

The purpose is to provide a common architectural understanding for:

- developers
- AI agents
- architects
- future engineering teams

The C4 Model includes:

- **Level 1:** System Context
- **Level 2:** Container Architecture
- **Level 3:** Component Architecture
- **Level 4:** Code Structure

## 2. Level 1 — System Context

### System Overview

NovaLight is an AI-powered Social Media Management SaaS platform.

The system enables organizations and creators to manage future social media workflows through intelligent automation.

### External Actors

#### User

A person who interacts with NovaLight through the web application.

Examples:

- Brand manager
- Content creator
- Marketing team member

#### Organization

A business entity using NovaLight services.

Future capabilities:

- multiple users
- roles
- permissions
- team collaboration

### External Systems

Future integrations:

#### AI Providers

Examples:

- OpenAI
- Claude
- Gemini
- Flux
- Veo
- Kling

Purpose: AI content generation and assistance.

#### Authentication Provider

Future: Clerk

Purpose: Identity management.

#### Storage Provider

Future: Supabase Storage

Purpose: Media asset management.

### Context Diagram

```text
                AI Providers
                     |
                     v
User ---> NovaLight Platform <--- Authentication Provider
                     |
                     v
              Storage Provider
```

## 3. Level 2 — Container Architecture

NovaLight consists of the following containers:

### Container 1 — Web Application

Technology:

- Next.js
- React
- TypeScript

Responsibility: Provides the user interface and client experience.

Communicates with: API Platform

Deployment: Vercel

---

### Container 2 — API Platform

Technology:

- Node.js
- Express
- TypeScript

Responsibility: Provides backend services and application APIs.

Responsibilities:

- request handling
- authentication validation
- business orchestration
- integration management

Deployment: Railway

---

### Container 3 — Database

Technology:

- PostgreSQL
- Prisma

Responsibility: Persistent data storage.

Contains:

- users
- organizations
- future domain data

Deployment: Supabase PostgreSQL

---

### Container 4 — Shared Packages

Technology: TypeScript packages

Purpose: Reusable capabilities across applications.

Includes:

- **`packages/ui`** — Shared components
- **`packages/utils`** — Common utilities
- **`packages/database`** — Database access layer
- **`packages/ai`** — AI abstraction
- **`packages/auth`** — Authentication abstraction
- **`packages/storage`** — Storage abstraction

### Container Diagram

```text
Users
  |
  v
Web Application
  |
  v
API Platform
 /     |      \
/      |       \
v       v        v
Database   AI      Storage

Shared Packages
```

## 4. Level 3 — Component Architecture

### Web Application Components

Structure:

```text
Web App
  |
  ├── App Router
  ├── Feature Modules
  ├── UI Components
  ├── State Management
  ├── API Client
  ├── Providers
  └── Utilities
```

Responsibilities:

#### App Router

Handles:

- routing
- layouts
- pages

#### Feature Modules

Contains future business features.

Examples:

- dashboard
- content
- campaigns

#### UI Package

Provides:

- reusable components
- design system
- theme

#### API Client

Responsible for:

- communication
- authentication headers
- error handling

### API Platform Components

Structure:

```text
API
  |
  ├── Routes
  ├── Controllers
  ├── Services
  ├── Repositories
  ├── Validators
  ├── Middleware
  ├── Providers
  └── Configuration
```

#### Routes

Defines API endpoints.

#### Controllers

Handles:

- HTTP requests
- responses

#### Services

Contains application operations.

#### Repositories

Handles data access.

#### Validators

Validates external input.

#### Middleware

Handles:

- security
- authentication
- logging
- errors

#### Providers

Handles external systems.

Examples:

- AI providers
- Auth providers
- Storage providers

## 5. Level 4 — Code Organization

Repository:

```text
novalight/
apps/
web/
api/
packages/
ui/
database/
utils/
ai/
auth/
storage/
docs/
architecture/
decisions/
development/
```

### Package Dependency Rules

Allowed:

```text
apps
  ↓
packages
  ↓
external libraries
```

Not allowed:

```text
packages
  ↓
apps
```

Packages must never depend on applications.

## 6. Domain Expansion Strategy

Future domains are added independently.

Example:

```text
apps/api/src/modules/
organization/
content/
campaign/
analytics/
automation/
ai/
```

Each module contains:

```text
module/
├── controllers
├── services
├── repositories
├── validators
├── types
└── tests
```

## 7. Data Flow Example

Future content generation workflow:

```text
User
  ↓
Web Application
  ↓
API Controller
  ↓
Content Service
  ↓
AI Interface
  ↓
AI Provider
  ↓
Database
  ↓
Response
```

## 8. Architectural Boundaries

The following boundaries are mandatory:

Frontend cannot:

- access database directly
- call AI providers directly
- contain business rules

Backend cannot:

- expose database models directly
- trust client input

Packages cannot:

- depend on applications

## 9. Evolution Principles

Architecture must support:

- additional applications
- mobile clients
- background workers
- AI agents
- enterprise integrations

without major restructuring.

## 10. Final Principle

The C4 model represents the architectural contract of NovaLight.

Future implementation must preserve these boundaries unless a formal architecture decision record approves changes.
