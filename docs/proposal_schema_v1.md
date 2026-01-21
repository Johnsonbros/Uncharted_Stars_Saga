# Proposal Schema v1

## Purpose
Define the canonical proposal payload submitted through MCP Spine. Proposals are the only allowed path for canon changes.

## Lifecycle
`draft` → `submitted` → `validated` → `applied` → `archived`

## Required Fields
| Field | Type | Description |
| --- | --- | --- |
| `proposal_id` | string | Unique proposal identifier. |
| `schema_version` | string | Proposal schema version (`v1`). |
| `status` | string | Lifecycle state. |
| `title` | string | Human-readable summary. |
| `author` | object | Model or service metadata. |
| `payload` | object | Canon change payload. |
| `validation` | object | Validation outcomes and warnings. |
| `created_at` | string | ISO-8601 timestamp. |
| `updated_at` | string | ISO-8601 timestamp. |

## Schema Example
```json
{
  "proposal_id": "prop-88b",
  "schema_version": "v1",
  "status": "draft",
  "title": "Add canon event for corridor encounter",
  "author": {
    "model": "opus",
    "role": "narrative-editor",
    "request_id": "req-123"
  },
  "payload": {
    "canon_events": [
      {
        "event_id": "evt-991",
        "type": "scene_add",
        "dependencies": ["evt-870"],
        "content": {
          "summary": "Crew enters the corridor.",
          "knowledge_updates": ["kn-004"]
        }
      }
    ]
  },
  "validation": {
    "status": "pending",
    "errors": [],
    "warnings": []
  },
  "created_at": "2026-01-20T10:00:00Z",
  "updated_at": "2026-01-20T10:00:00Z"
}
```

## Validation Rules
- `schema_version` must be `v1`.
- `status` must be one of: `draft`, `submitted`, `validated`, `applied`, `archived`.
- `payload.canon_events[*].dependencies` must reference existing canon events.
- `payload.canon_events[*].event_id` must be unique within the proposal.
- `validation.status` must be `pending`, `passed`, or `failed`.

## Lifecycle Transitions
- `draft` → `submitted` only after minimal schema validation.
- `submitted` → `validated` only after full validation pipeline passes.
- `validated` → `applied` only with canon gate approval.
- `applied` → `archived` after persistence and audit logging.
