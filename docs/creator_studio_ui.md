# Creator Studio UI (Draft)

This document tracks the first-pass Creator Studio user experience for non-technical short story
creators. The focus is a low-friction workflow: minimal clicks, clear language, and live updates as
people type.

## Goals

- Make it easy for a one-off storyteller to turn a single idea into a ready-to-record short story.
- Provide instant feedback while they type so nothing feels “saved behind the scenes.”
- Keep every action obvious and reversible, especially when AI suggestions touch canon.

## Pages

### `/studio` — Creator Dashboard

- **Story brief builder** with live updates as the creator types the title, idea, and tone.
- **Quick actions** list so the next step is always one click away.
- **Project snapshot** that shows the current state of outline, draft, and audio plan.

### `/studio/intake` — Story Intake

- Guided prompts for the creator’s promise, audience, delivery plan, and emotional arc.
- A live “creative brief” preview that updates instantly.
- A single CTA to save and generate the first outline.

### `/studio/scenes/[sceneId]` — Scene Editor

- Side-by-side current vs. proposed text with live word counts.
- Rationale field to capture why a change is being proposed.
- Single action to create the proposal and send it for approval.

### `/studio/proposals` — AI Proposals

- Clear table view of AI suggestions with approval actions.
- Status and last sync indicators to confirm updates are current.

## Next UI Additions

- Listener preview of narration pacing and beat markers.
- One-click publishing checklist for short stories and mini-series.
- Inline comments to help the AI understand creator intent.
