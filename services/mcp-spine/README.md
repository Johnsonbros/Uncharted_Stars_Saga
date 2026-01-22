# MCP Spine Service (Scaffold)

This folder seeds the MCP Spine service runtime using **Node.js + TypeScript**, aligned with the system architecture and MVP checklist.

## Goals (Phase 1 - Complete)
- Provide a stable service boundary for MCP resources/tools.
- Host a proposal-based workflow entrypoint (no canon writes).
- Establish a place to wire resource catalogs, proposal schemas, and validation pipelines.

## Local Development (Scaffold)
This is an early scaffold and does not yet run a server. It now includes a
configuration loader and structured logging for consistent startup output.

Planned next steps:
1. Add MCP server bootstrap + handshake.
2. Register resource catalog endpoints.
3. Implement proposal tool routes + validation stubs.

## Configuration
Startup reads the following environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `MCP_SPINE_PORT` | `7000` | Placeholder port value for future server binding. |
| `SERVICE_ENV` | `development` | Deployment environment (`development`, `staging`, `production`, `test`). |
| `LOG_LEVEL` | `info` | Logging verbosity (`debug`, `info`, `warn`, `error`). |

Invalid values fall back to defaults and emit a startup warning in the logs.

## Logging
The scaffold emits JSON logs to stdout with a consistent shape:

```json
{
  "timestamp": "2026-01-20T12:00:00.000Z",
  "level": "info",
  "service": "mcp-spine",
  "message": "MCP spine scaffold initialized.",
  "environment": "development",
  "port": 7000
}
```

## Structure
```
services/mcp-spine/
  src/
    index.ts
    config.ts
    logger.ts
  package.json
  README.md
```
