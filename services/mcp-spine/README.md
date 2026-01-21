# MCP Spine Service (Scaffold)

This folder seeds the MCP Spine service runtime using **Node.js + TypeScript**, aligned with the system architecture and MVP checklist.

## Goals (Phase 1)
- Provide a stable service boundary for MCP resources/tools.
- Host a proposal-based workflow entrypoint (no canon writes).
- Establish a place to wire resource catalogs, proposal schemas, and validation pipelines.

## Local Development (Scaffold)
This is an early scaffold and does not yet run a server.

Planned next steps:
1. Add MCP server bootstrap + handshake.
2. Register resource catalog endpoints.
3. Implement proposal tool routes + validation stubs.

## Structure
```
services/mcp-spine/
  src/
    index.ts
  package.json
  README.md
```
