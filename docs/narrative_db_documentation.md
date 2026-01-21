# Narrative DB Documentation

## Overview
The Narrative DB stores canon events, knowledge states, and promises. It enforces canon/draft separation and maintains referential integrity.

## Core Tables
### `events`
- `event_id` (PK)
- `type`
- `summary`
- `canon_status` (`canon` or `draft`)
- `created_at`

### `event_dependencies`
- `event_id` (FK → events)
- `depends_on_event_id` (FK → events)

### `knowledge_states`
- `knowledge_id` (PK)
- `event_id` (FK → events)
- `subject`
- `state`
- `effective_at`

### `promises`
- `promise_id` (PK)
- `event_id` (FK → events)
- `status` (`pending`, `fulfilled`, `broken`, `transformed`)
- `details`

## Relationships
- Events can depend on multiple events via `event_dependencies`.
- Knowledge states are anchored to a canonical event.
- Promises are bound to an event and lifecycle status.

## Indexing
- Index `events(canon_status, created_at)` for fast canon queries.
- Index `event_dependencies(event_id)` for DAG checks.
- Index `knowledge_states(event_id)` for propagation queries.
