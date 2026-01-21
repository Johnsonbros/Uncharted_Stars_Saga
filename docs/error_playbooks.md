# Error Playbooks

## Narrative Engine
**Immediate checks**
- Inspect canon gate logs for rejection reasons and proposal IDs.
- Validate event DAG for missing dependencies or cycles.
- Re-run knowledge propagation unit tests to confirm state transitions.

**Resolution steps**
- Identify the failing event or proposal and verify dependency ordering.
- If canon conflict exists, draft a proposal with explicit canon impact notes.
- Update continuity rules if the rejection is a false positive.

**Follow-up**
- Add or update a regression test for the failing scenario.
- Update related documentation if a rule changed.

## Audio Engine
**Immediate checks**
- Verify audio scene schema validation output for missing fields.
- Check listener confusion audit scores and threshold settings.
- Inspect render pipeline logs for missing voice profiles.

**Resolution steps**
- Correct invalid beat markers or missing voice profile references.
- Re-run scene validation and confusion audit.
- If systemic, update schema rules and revalidate affected scenes.

**Follow-up**
- Add a unit test covering the invalid scene pattern.
- Update audio schema documentation if validation rules changed.

## MCP Spine
**Immediate checks**
- Confirm scope authorization and token validation logs.
- Validate proposal schema against v1 rules.
- Inspect audit log entries for proposal lifecycle transitions.

**Resolution steps**
- Fix scope map mismatches or missing permissions.
- Re-submit proposal with corrected schema fields.
- Review validation pipeline output and adjust rule ordering if needed.

**Follow-up**
- Add a unit test for the failing scope or schema condition.
- Ensure audit log entries include required metadata.

## Listener Platform
**Immediate checks**
- Reproduce playback with signed URL refresh.
- Verify entitlement lookup for the user.
- Check client error logs for player failures.

**Resolution steps**
- Refresh or re-issue signed URLs if expired.
- Resolve entitlement mismatches and confirm access windows.
- If client issue, patch player state restoration and retest.

**Follow-up**
- Add an E2E test covering the playback scenario.
- Update UX flow docs if the user path changed.

## Payments
**Immediate checks**
- Confirm Stripe webhook signature verification.
- Verify entitlement creation for checkout sessions.
- Check idempotency keys for webhook retries.

**Resolution steps**
- Reprocess webhook events with corrected signatures.
- Backfill missing entitlements and verify user access.
- Fix idempotency handling and re-run payment tests.

**Follow-up**
- Add integration tests for webhook events.
- Update payment flow documentation if logic changed.
