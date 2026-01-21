# MCP Access Token Strategy

> **Purpose:** Define how the MCP Spine validates service-to-service access tokens
> and how tokens are issued, rotated, and validated.

## Token Requirements
- **Short-lived tokens** (recommended: 15 minutes).
- **Service-to-service only**: human-facing clients must never hold MCP tokens.
- **Scoped usage**: tokens are tied to allowed MCP scopes and the caller role.

## Validation Rules
1. MCP Spine expects an `Authorization: Bearer <token>` header on protected routes.
2. Tokens must map to a known role and permitted scopes.
3. Tokens are rejected if expired or missing required claims.

## Rotation & Revocation
- Rotate signing keys every 90 days (or faster if compromised).
- Maintain a short overlap window to avoid downtime.
- Revoke tokens immediately on detected abuse.

## Environment Variables (Current Implementation)
- `MCP_SPINE_ACCESS_TOKEN`: Shared secret for local development and CI smoke tests.

> **Note:** Production should replace shared secrets with signed JWTs or a
> short-lived token minting service.
