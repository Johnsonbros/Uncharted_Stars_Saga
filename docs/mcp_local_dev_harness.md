# MCP Local Dev Harness

> **Purpose:** Provide a lightweight local workflow for validating MCP Spine
> behavior without a full client stack.

## Prerequisites
- Node 18+
- MCP Spine running locally (`npm run dev` or equivalent)

## Sample Requests

### 1) Handshake
```bash
curl http://localhost:7000/mcp/handshake
```

### 2) Resource Resolve
```bash
curl -X POST http://localhost:7000/mcp/resources/resolve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MCP_SPINE_ACCESS_TOKEN" \
  -d '{
    "resource_id": "narrative.summary.v1",
    "role": "creator",
    "model": "opus"
  }'
```

### 3) Create Proposal
```bash
curl -X POST http://localhost:7000/mcp/tools/proposals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MCP_SPINE_ACCESS_TOKEN" \
  -d '{
    "role": "creator",
    "model": "sonnet",
    "title": "Sample proposal",
    "author": { "model": "sonnet", "role": "creator" },
    "payload": {
      "canon_events": [
        {
          "event_id": "evt_001",
          "type": "scene",
          "dependencies": ["evt_000"],
          "content": { "summary": "A test event." }
        }
      ]
    }
  }'
```

### 4) Apply Proposal
```bash
curl -X POST http://localhost:7000/mcp/tools/proposals/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MCP_SPINE_ACCESS_TOKEN" \
  -d '{
    "role": "automation_service",
    "model": "opus",
    "proposal_id": "<proposal_id>"
  }'
```
