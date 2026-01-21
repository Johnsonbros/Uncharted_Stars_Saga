# MCP Spine Deployment Configuration

> **Purpose:** Enumerate the environment variables, secrets, and health checks
> required to deploy the MCP Spine service safely.

## Required Environment Variables
- `MCP_SPINE_PORT` (default: 7000)
- `SERVICE_ENV` (development | staging | production | test)
- `LOG_LEVEL` (debug | info | warn | error)
- `MCP_SPINE_ACCESS_TOKEN` (shared secret for service-to-service auth)
- `MCP_RATE_LIMIT_PER_MINUTE` (optional override)

## Health Checks
- **Liveness:** `GET /health` should return 200.
- **Readiness:** `GET /mcp/handshake` should return protocol metadata.

## Secrets Handling
- Store secrets in the platform’s secrets manager (Replit Secrets or equivalent).
- Rotate secrets every 90 days or immediately after exposure.

## Deployment Notes
- Enforce HTTPS at the edge (TLS termination).
- Restrict inbound access to trusted services.
- Monitor error rates and rate-limit violations.
