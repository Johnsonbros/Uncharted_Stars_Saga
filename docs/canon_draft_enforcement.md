# Canon/Draft Enforcement Rules

## Canon Rules
- Canon events are immutable once published.
- Canon events must pass canon gate validation before being marked `canon`.
- Canon updates require a validated proposal.

## Draft Rules
- Draft events can be edited freely until submission.
- Draft data must never be returned in `narrative://summary` resources.
- Draft changes cannot affect production audio exports.

## Constraints & Triggers
- **Constraint:** `events.canon_status` can only transition `draft → canon` after proposal validation.
- **Trigger:** On `canon` transition, write audit log entry (`proposal_id`, `event_id`, timestamp).
- **Constraint:** `event_dependencies` must reference existing `events`.

## Enforcement Checklist
- Reject any direct DB update to canon tables outside MCP Spine.
- Maintain `proposal_id` on every canon event for traceability.
- On revert, mark new event with `replaces_event_id` rather than editing canon row.
