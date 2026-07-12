# MVP Acceptance Criteria

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../../architecture/017-documentation-structure-for-product-verticals.md). Scoped to Stage 1 ("Content Assistant") per [021-mvp-scope.md](./021-mvp-scope.md) — later stages will get their own acceptance criteria once their features are implementation-ready, not invented speculatively here.

## Document Metadata

| Field            | Value                             |
| ---------------- | --------------------------------- |
| Document Version | 1.0                               |
| Status           | Proposed — pending human approval |

## Guided Brand Intake

- A new account cannot reach content generation without completing brand intake (vertical, tone, audience, visual style at minimum).
- Vertical selection is limited to the five defined in [018-target-customer-definition.md](./018-target-customer-definition.md); no free-text vertical entry in the MVP.
- The captured brand profile is presented to the user for review before being marked "confirmed."

## Brand Profile

- The brand profile is persisted and readable by all content-generation agents (see [020-ai-agent-specifications.md](../../architecture/social-ai-platform/020-ai-agent-specifications.md)).
- The user can edit any field of the brand profile after initial confirmation.
- Editing the brand profile does not retroactively alter previously generated content.

## Content Idea Generation

- Every generated idea references the current brand profile (vertical + tone + audience), not a generic template.
- The user can request regeneration of ideas without losing previously generated/approved content.
- No idea generation call is made directly against an AI vendor SDK — must go through `packages/ai-core` interfaces per [ADR-009](../../architecture/006-initial-architecture-decisions.md).

## Caption Generation

- Every caption is generated for a specific selected idea, not standalone.
- Caption tone is consistent with the confirmed brand profile (validated via the same brand-consistency mechanism defined in [022-feature-roadmap.md](./022-feature-roadmap.md) Stage 2, even if that scoring feature itself ships later — Stage 1 requires at minimum that the prompt sent to the model includes the brand profile).
- The user can edit or discard a generated caption before it is marked approved.

## Visual Prompt Generation

- A visual prompt is generated per approved or in-progress idea, textual only in Stage 1 (no image rendering guarantee — see [024-image-generation-integration.md](../../architecture/social-ai-platform/024-image-generation-integration.md)).
- The visual prompt references the brand profile's stated visual style.

## Content Calendar

- Approved content items appear on the calendar with their intended post date.
- The user can reschedule or discard any calendar item before it is marked "posted."
- Marking an item "posted" is a manual user action in Stage 1 — no automated publishing occurs (see [021-mvp-scope.md](./021-mvp-scope.md) §4 Excluded).

## Cross-Cutting

- No feature in this list stores or transmits more brand/business data to an AI provider than the feature requires, per [CLAUDE.md §7](../../../CLAUDE.md#7-security-and-privacy-rules) "AI providers must never receive unnecessary sensitive data." Concretely (added after independent security review asked for a checkable control, not just narrative intent): each agent's prompt-construction step in [020-ai-agent-specifications.md](../../architecture/social-ai-platform/020-ai-agent-specifications.md) must build its `PromptManager` input from an explicit per-agent field allow-list (e.g. Copywriter's prompt may include brand tone + the selected idea; it must not include unrelated fields like Approval History) — not by passing a full Brand/Content record to the model and trusting the prompt template to omit fields.
- No feature in this list requires a resolved RBAC taxonomy (Stage 1 is single-user only, per [021-mvp-scope.md](./021-mvp-scope.md) §2) — but every endpoint must still enforce that a user can only read/write their own account's Brand/ContentIdea/ContentDraft/CalendarEntry records. This is per-account ownership scoping, not RBAC, required from Stage 1's first endpoint, and — corrected after independent review — enforced at the **Repository layer** (`WHERE account_id = ...` on every query), not by `packages/auth`'s `AuthorizationProvider` interface alone (see [architecture/social-ai-platform/018-saas-architecture.md](../../architecture/social-ai-platform/018-saas-architecture.md) §4).
