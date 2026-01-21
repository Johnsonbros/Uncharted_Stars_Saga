# MCP Rate Limiting & Abuse Safeguards

> **Purpose:** Protect MCP Spine endpoints from abuse and noisy clients while
> preserving predictability for approved automation services.

## Rate Limit Policy
- **Default window:** 60 seconds.
- **Default limit:** 60 requests/minute per (scope, model, role, IP).
- **Burst behavior:** Requests beyond the limit return HTTP `429` with a reset timestamp.

## Enforcement Rules
1. Apply rate limits to proposal tools and resource resolve endpoints.
2. Rate limits are keyed by: `scope + role + model + source IP`.
3. Blocked requests must return a structured error with `request_id` for tracing.

## Abuse Safeguards
- Log rate-limit violations as `warn` events with correlation IDs.
- Alert if violations exceed 5/minute for a single scope.
- Rotate tokens or tighten limits for abusive clients.

## Configuration
- `MCP_RATE_LIMIT_PER_MINUTE`: Overrides the default limit.
