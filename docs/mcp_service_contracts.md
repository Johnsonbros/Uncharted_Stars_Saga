# MCP Spine Service Boundaries & Contracts

## Purpose
Define the MCP Spine service boundaries, the contracts for resources and tools, and permission scopes required for access.

## Service Boundary
**MCP Spine** is the sole gateway for:
- Reading narrative, audio, and listener summaries (read-only resources).
- Submitting proposals for canon changes (tools only; no direct canon writes).
- Enforcing access scopes for models and services.

**Out of Scope**
- Direct database writes for canon data.
- Rendering or storage operations (Audio Engine/Data Layer).

## Resource Contracts
Resources are read-only snapshots designed to be safe for model consumption.

| Resource | URI Pattern | Description | Scope |
| --- | --- | --- | --- |
| Narrative summary | `narrative://summary/{series_id}` | Canon summary and active promises. | `narrative:read` |
| Audio summary | `audio://summary/{series_id}` | Published scenes, versions, and audio health. | `audio:read` |
| Listener summary | `listener://summary/{series_id}` | Aggregated usage metrics (no PII). | `listener:read` |

**Contract Rules**
- All resources return `version`, `generated_at`, and `source_commit` metadata.
- No resource may expose PII or draft-only data.

## Tool Contracts
Tools produce proposals and validation outputs only.

| Tool | Name | Description | Scope |
| --- | --- | --- | --- |
| Create proposal | `proposal.create` | Create a draft proposal with payload. | `proposal:write` |
| Validate proposal | `proposal.validate` | Run validation pipeline. | `proposal:validate` |
| Submit proposal | `proposal.submit` | Move draft to submitted state. | `proposal:write` |
| Retrieve proposal | `proposal.get` | Read proposal details and status. | `proposal:read` |

**Response Envelope**
```json
{
  "proposal_id": "prop-88b",
  "status": "draft",
  "scope": "proposal:write",
  "metadata": {
    "created_at": "2026-01-20T10:00:00Z",
    "request_id": "req-123",
    "trace_id": "trace-456"
  }
}
```

## Permission Scopes
- `narrative:read`, `audio:read`, `listener:read`
- `proposal:write`, `proposal:read`, `proposal:validate`
- `admin:read` (internal staff dashboards)

**Scope Enforcement Rules**
- Models cannot access scopes they are not explicitly assigned.
- Tool execution requires scope match; resources require `*_read` scopes.

## Error Contracts
Responses must use the MCP error taxonomy:
- `MCP-403` for forbidden scope access.
- `MCP-422` for schema validation failures.
- `MCP-500` for internal errors with `owner` field populated.

## Versioning
- Resource responses include `resource_version`.
- Tool responses include `proposal_schema_version`.
