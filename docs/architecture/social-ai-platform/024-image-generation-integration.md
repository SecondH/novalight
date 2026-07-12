# Image Generation Integration

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../017-documentation-structure-for-product-verticals.md).

## Document Metadata

| Field            | Value                                                                                                                                                                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document Version | 1.0                                                                                                                                                                                                                                             |
| Status           | Proposed — pending human approval                                                                                                                                                                                                               |
| Scope note       | This document defines architecture direction only. No image-generation vendor is selected here — that remains an implementation-time decision under the existing [ADR-009](../006-initial-architecture-decisions.md) provider-abstraction rule. |

## 1. Two Distinct Capabilities — Not to Be Conflated

1. **Visual prompt generation** (text output) — the Visual Prompt Engineer Agent's responsibility ([020-ai-agent-specifications.md](./020-ai-agent-specifications.md) §4), already an `packages/ai-core` text-generation use case, no new architecture needed.
2. **Image rendering** (turning that text prompt into an actual image) — a separate capability, not yet decided whether/when it is built into the MVP or left as a prompt the business copies into an external tool (ChatGPT Image Generation, Canva AI, Midjourney, etc., per the existing [visual-content-generation skill](../../../.claude/skills) pattern already used elsewhere in this workspace for non-product visuals).

## 2. MVP Track Staging

- **Stage 1:** visual prompt text only. The business can paste the prompt into an external tool themselves. This avoids taking on image-generation vendor cost/complexity before Stage 1's core value (brand-grounded ideation/copy) is validated.
- **Stage 2+:** if validated demand exists, integrated image rendering becomes a candidate feature — to be added via a new ADR selecting a specific vendor (Flux, Veo, Kling, or others already named as future AI providers in [ADR-009](../006-initial-architecture-decisions.md)/[Engineering Constitution §11](../../engineering/002-engineering-constitution.md)), not decided speculatively here.

## 3. Architecture When Rendering Is Added (Directional, Not Decided)

```text
Visual Prompt Engineer Agent output (text)
  ↓
ModelProvider (image-generation-capable strategy, ADR-009 — new provider registration, not new abstraction)
  ↓
Generated image
  ↓
Storage Interface (ADR-008) → Storage Provider (future: Supabase Storage)
  ↓
packages/storage (does not yet exist — see 018-saas-architecture.md §2; this would be its first real consumer)
```

This reuses two existing abstractions (`packages/ai-core` provider strategy, `packages/storage`'s not-yet-created but already-decided interface pattern from ADR-008) rather than inventing a new one — consistent with [ADR-014](../006-initial-architecture-decisions.md).

## 4. Explicitly Not Decided Here

- Which image-generation vendor, if any, is used.
- Whether image rendering ships in Stage 1 or is deferred to Stage 2+ (default assumption above is deferred, pending product validation).
- Cost model for image generation (feeds into [product/mvp-social-ai/024-pricing-model.md](../../product/mvp-social-ai/024-pricing-model.md) if/when this ships).
