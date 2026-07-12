# Project Context

Source of truth: [Project Charter](../../docs/project/001-project-charter.md), [Product Vision](../../docs/product/007-product-vision.md), [PRD](../../docs/product/008-prd.md). This file summarizes; it does not replace those documents.

## Purpose

NovaLight is a cloud-native, AI-powered Social Media Management SaaS platform. Vision: "Enable every brand to build, manage, and grow its digital presence through intelligent AI-powered workflows." It is designed to amplify human creativity through AI assistance, not replace it — stated principle: "Human strategy + AI execution = superior outcomes."

## Users

- **Primary (current target)**: Small and medium businesses (affordable social media management, automation, growth assistance), marketing teams (collaboration, workflow management, analytics), content creators (faster creation, audience understanding, consistency).
- **Future target**: Enterprise — multi-brand organizations, agencies, large marketing departments.

## Business scope

Combines: content intelligence, creative assistance, workflow automation, analytics, brand management, AI-powered decision support — all described as **future capabilities**, not present functionality.

## Core modules (per PRD §, sequenced by dependency)

1. Identity & Access Management (Priority: High, Dependencies: none)
2. Organization Management (Priority: High, Dependencies: Identity)
3. Brand Management (Priority: High, Dependencies: Organization)
4. Content Management (Priority: High, Dependencies: Brand Management)
5. Publishing Management (Priority: Medium, Dependencies: Content Management)
6. Analytics Platform (Priority: Medium, Dependencies: Publishing)
7. AI Assistant (Priority: Medium, Dependencies: AI Platform)
8. Automation Engine (Priority: Future, Dependencies: all major modules)

None of these modules are implemented. This list defines intended sequencing only.

## Main workflows (future user journeys, PRD §7 — not implemented)

1. Brand Setup: create account → create organization → define brand identity → start managing content.
2. Content Workflow: create content idea → AI assistance → review → schedule publication → analyze performance.
3. Automated Management: define goals → AI suggests strategy → automation executes → user reviews results.

## Non-goals (explicit exclusions)

- **Phase 0 excludes** (Project Charter §5): AI generation features, Instagram API integration, content automation, marketing workflows, user business logic, billing system, analytics engine, real customer features.
- **MVP excludes** (PRD §8): full autonomous agents, advanced automation, enterprise integrations, complex AI workflows.
- Product constraints (Product Vision): avoid unnecessary complexity, AI features without user value, vendor lock-in, poor security practices, short-term hacks.

## Terminology

- **Organization**: multi-user tenant containing users, roles, permissions (future).
- **Brand**: a managed digital identity owned by an Organization (future).
- **Domain** (architecture sense): a bounded business capability with its own models/services (e.g. Content, Campaign, Analytics) — see [[architecture-context]].
- **Phase 0 / Phase 1.../Phase 5**: roadmap stages. **Caution**: three source documents (`004-system-architecture.md` §10, `007-product-vision.md` §8, `009-roadmap.md`) name these phases differently in wording, though the substance is directionally similar. Do not treat any single document's phase names as canonical without flagging the discrepancy — see [[known-risks]].

## Critical constraints

- Repository currently contains **documentation only** — verify before assuming any application path exists.
- Phase 0 database scope is intentionally minimal: only a `User` model may be created; no other business entity without approved requirements ([Database Architecture §5](../../docs/architecture/012-database-architecture.md)).
- No numeric test-coverage threshold is defined anywhere in the documentation.
