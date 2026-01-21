# Error Playbooks

## Narrative Engine
- Check canon gate logs for rejection reason.
- Validate event DAG for missing dependencies.
- Re-run knowledge propagation unit tests.

## Audio Engine
- Verify audio scene schema validation output.
- Check listener confusion audit scores.
- Inspect render pipeline logs for missing voice profiles.

## MCP Spine
- Confirm scope authorization checks.
- Validate proposal schema against v1.
- Inspect audit log for proposal lifecycle transitions.

## Listener Platform
- Reproduce playback with signed URL refresh.
- Verify entitlement lookup for the user.
- Check client error logs for player failures.

## Payments
- Confirm Stripe webhook signature verification.
- Verify entitlement creation for checkout session.
- Check idempotency keys for webhook retries.
