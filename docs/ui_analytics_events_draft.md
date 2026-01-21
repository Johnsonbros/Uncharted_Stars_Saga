# UI Analytics Events (Draft)

## Purpose
Define the analytics events required to measure funnel conversion and playback engagement.

## Scope
- Marketing pages
- Auth flow
- Checkout
- Library and player usage

## Event Categories (Outline)
- **Funnel**: landing view, CTA click, login start/complete, checkout start/complete
- **Playback**: play, pause, resume, completion
- **Error**: playback errors, auth failures

## Event Schema (Outline)
- Event name
- Timestamp
- Page or route
- User/session ID (non-PII)

## Open Questions
- Which analytics provider (if any) for Phase 1?
- Retention policy for analytics data?

## Update Triggers
- Funnel changes
- New UI features

## Related Docs
- docs/ui_mvp_documentation.md
- docs/visitor_conversion_funnel.md
