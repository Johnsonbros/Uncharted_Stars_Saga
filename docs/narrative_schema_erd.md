# Narrative Schema ERD

## Purpose
Provide an ERD for the narrative database, showing entities, relationships, and canon/draft constraints.

## Scope
- Events, knowledge states, promises, timelines.
- Canon vs draft separation.

## Entities
- `events`
- `event_dependencies`
- `knowledge_states`
- `promises`

## Relationship Notes
- Events are immutable once `canon_status = canon`.
- Dependencies form a DAG via `event_dependencies`.
- Knowledge states are anchored to events that established them.
- Promises are linked to the scene identifier where they are established.

## ERD
```mermaid
erDiagram
  events ||--o{ event_dependencies : depends_on
  events ||--o{ knowledge_states : updates
  events ||--o{ promises : establishes

  events {
    UUID id PK
    TEXT project_id
    TIMESTAMPTZ timestamp
    TEXT type
    TEXT[] participants
    TEXT location
    TEXT description
    JSONB impacts
    canon_status canon_status
    TIMESTAMPTZ created_at
    TIMESTAMPTZ updated_at
  }

  event_dependencies {
    UUID event_id FK
    UUID depends_on_event_id FK
  }

  knowledge_states {
    UUID id PK
    TEXT project_id
    TEXT character_id
    UUID event_id FK
    TIMESTAMPTZ learned_at
    knowledge_certainty certainty
    knowledge_source source
    canon_status canon_status
    TIMESTAMPTZ created_at
    TIMESTAMPTZ updated_at
  }

  promises {
    UUID id PK
    TEXT project_id
    promise_type type
    TEXT established_in_scene
    TEXT description
    promise_status status
    TEXT fulfilled_in_scene
    canon_status canon_status
    TIMESTAMPTZ created_at
    TIMESTAMPTZ updated_at
  }
```

## Canon/Draft Constraints
- `canon_status` is enforced on `events`, `knowledge_states`, and `promises`.
- Canon rows are immutable; updates are only allowed for `draft` or `proposed`.

## Update Triggers
- Narrative schema changes.
- Canon enforcement rule updates.

## Related Docs
- docs/narrative_db_documentation.md
- docs/canon_draft_enforcement.md
- docs/narrative_db_schema.sql
