# UI Error & Empty States (Draft)

## Purpose
Catalog error states and empty states across all public and authenticated UI pages.

## Scope
- Marketing and onboarding flows
- Library and playback
- Account and entitlements

## Page-Level States (Outline)
- Landing: trailer load failure
- Founders: checkout failure
- Login: invalid email / magic link expired
- Library: no chapters available
- Player: streaming error / expired signed URL
- Account: entitlement missing

## UX Guidance
- Clear recovery actions
- Non-blocking messaging where possible
- Audio-first wording guidelines

## Open Questions
- Which errors are handled inline vs full-page?
- Standard retry patterns?

## Update Triggers
- New routes or features
- Error taxonomy updates

## Related Docs
- docs/error_taxonomy.md
- docs/ui_mvp_documentation.md
