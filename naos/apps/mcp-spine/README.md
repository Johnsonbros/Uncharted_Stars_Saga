# MCP Spine Service (Foundation)

This service is a **foundation scaffold** for the NAOS MCP Spine. It exposes a minimal JSON-RPC interface over HTTP for:

- MCP initialization handshake
- Resource listing and reading (read-only)
- Tool listing (with input schemas) and proposal-based tool calls
- Proposal lifecycle transitions and audit log
- Prompt templates for common workflows

> **Note:** This is intentionally lightweight and uses in-memory storage for proposals and audit logs.

## Local Run

```bash
node src/index.js
```

## JSON-RPC Methods

### Initialize

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": { "role": "opus" }
}
```

### List Resources

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "resources/list",
  "params": { "role": "haiku" }
}
```

### Read Resource

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "resources/read",
  "params": { "role": "haiku", "uri": "story://project/uncharted-stars/canon" }
}
```

### List Tools

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/list",
  "params": { "role": "opus" }
}
```

Tool definitions include input schema + required scopes so MCP clients can validate inputs before calling.

### Call Tool (Proposal)

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "role": "opus",
    "name": "scene.propose_patch",
    "sceneId": "ch1-s1",
    "changes": [{ "type": "replace", "path": "/events/0", "value": "New detail" }],
    "reason": "Clarify motivation"
  }
}
```

## Next Steps

- Wire persistent storage for proposals + audit log
- Implement canon gate validation pipeline
- Replace stubbed resource resolvers with real data access
- Add rate limiting and auth middleware
