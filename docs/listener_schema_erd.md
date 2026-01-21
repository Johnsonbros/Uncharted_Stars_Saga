# Listener Schema ERD

## Purpose
Provide an ERD for the listener database, including users, entitlements, and playback state.

## Scope
- Listener accounts and authentication linkage.
- Entitlements and access windows.
- Playback position tracking.

## Entities (Summary)
- `users`
- `entitlements`
- `playback_positions`

## ERD
```mermaid
erDiagram
  users {
    uuid user_id PK
    text email
    timestamptz created_at
    text status
  }

  entitlements {
    uuid entitlement_id PK
    uuid user_id FK
    text product_id
    timestamptz access_start
    timestamptz access_end
    text status
  }

  playback_positions {
    uuid position_id PK
    uuid user_id FK
    text asset_id
    int position_seconds
    timestamptz updated_at
  }

  users ||--o{ entitlements : grants
  users ||--o{ playback_positions : saves
```

## Relationship Notes
- A user can have multiple entitlements.
- Playback positions are scoped to `user_id` + `asset_id`.

## Update Triggers
- Listener schema changes.
- Entitlement logic changes.
- Playback position retention policy updates.

## Related Docs
- [docs/listener_db_documentation.md](./listener_db_documentation.md)
- [docs/payments_entitlements.md](./payments_entitlements.md)
