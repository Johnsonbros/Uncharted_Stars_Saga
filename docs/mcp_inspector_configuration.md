# MCP Inspector Configuration

> **Purpose:** Provide a baseline configuration for MCP Inspector debugging.

## Recommended Settings
- Target: `http://localhost:7000`
- Handshake path: `/mcp/handshake`
- Resources path: `/mcp/resources`
- Tools path: `/mcp/tools`

## Example Config File
See: `services/mcp-spine/mcp-inspector.json`

```json
{
  "name": "mcp-spine-local",
  "baseUrl": "http://localhost:7000",
  "handshakePath": "/mcp/handshake",
  "resourcesPath": "/mcp/resources",
  "toolsPath": "/mcp/tools",
  "headers": {
    "Authorization": "Bearer ${MCP_SPINE_ACCESS_TOKEN}"
  }
}
```
