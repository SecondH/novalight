# MVP User Journeys

> Not a converted source document. Authored during the NovaLight MVP Pivot planning session, per [ADR-015](../../architecture/017-documentation-structure-for-product-verticals.md).

## Document Metadata

| Field            | Value                             |
| ---------------- | --------------------------------- |
| Document Version | 1.0                               |
| Status           | Proposed — pending human approval |

These journeys follow the style of [008-prd.md](../008-prd.md) §7 but are specific to this MVP's personas ([019-personas.md](./019-personas.md)) and features ([021-mvp-scope.md](./021-mvp-scope.md)).

## 1. Journey — Brand Setup / Brand Intelligence Capture

```text
Creates account
  ↓
Selects business vertical (beauty salon / restaurant / cafe / local service / retail)
  ↓
Answers guided brand-intake questions (tone, audience, visual style, offerings)
  ↓
Optionally connects existing social profiles/content as reference material
  ↓
Brand Strategist Agent produces an initial brand profile for review
  ↓
Owner reviews and confirms/edits the brand profile
```

Feeds: [022-brand-intelligence-layer.md](../../architecture/social-ai-platform/022-brand-intelligence-layer.md), [021-knowledge-model.md](../../architecture/social-ai-platform/021-knowledge-model.md).

## 2. Journey — Content Ideation & Generation

```text
Requests content ideas (or receives proactive suggestions)
  ↓
Content Planner Agent proposes ideas grounded in brand profile + vertical + calendar gaps
  ↓
Selects an idea
  ↓
Copywriter Agent drafts caption(s); Visual Prompt Engineer Agent drafts a visual prompt
  ↓
Reviews, edits, and approves the draft
```

Feeds: [020-ai-agent-specifications.md](../../architecture/social-ai-platform/020-ai-agent-specifications.md), [023-content-generation-pipeline.md](../../architecture/social-ai-platform/023-content-generation-pipeline.md).

## 3. Journey — Calendar Building

```text
Views current content calendar (populated from prior approvals + gaps)
  ↓
Content Planner Agent suggests a fill for upcoming gaps based on posting-cadence norms for the vertical
  ↓
Approves, reschedules, or discards suggestions
```

## 4. Journey — Review & Manual Publish (MVP Track Stage 1–2)

```text
Approved content appears in a "ready to post" queue
  ↓
Owner/staff manually posts to their own social platform(s) using the generated caption + visual
```

No platform publishing integration exists in Stage 1–2 — see [021-mvp-scope.md](./021-mvp-scope.md) Excluded and [026-future-social-api-integration.md](../../architecture/social-ai-platform/026-future-social-api-integration.md).

## 5. Journey — Engagement Feedback Loop (MVP Track Stage 4)

```text
Business reports or connects basic engagement outcomes
  ↓
Analytics Agent identifies what content types/timing performed better
  ↓
Recommendations feed back into Content Planner Agent's future suggestions
```

## 6. Journey — Gradual Automation Opt-In (MVP Track Stage 3+)

```text
Business has an established history of approving generated content without heavy edits
  ↓
Product offers scoped automation (e.g. auto-schedule pre-approved content types)
  ↓
Business opts in per content type/channel, not all-or-nothing
  ↓
Business can revoke automation at any time
```

This journey is explicitly staged after trust is established (see [017-product-vision.md](./017-product-vision.md) §5 "Trust must be earned before automation") and depends on the RBAC/permission resolution noted in [019-personas.md](./019-personas.md) §4 once publishing automation involves any multi-user approval flow.
