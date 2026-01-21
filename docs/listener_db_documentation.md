# Listener DB Documentation

## Schema Overview
### `users`
- `user_id` (PK)
- `email`
- `created_at`
- `status`

### `entitlements`
- `entitlement_id` (PK)
- `user_id` (FK → users)
- `product_id`
- `access_start`
- `access_end`
- `status`

### `playback_positions`
- `position_id` (PK)
- `user_id` (FK → users)
- `asset_id`
- `position_seconds`
- `updated_at`

## Relationships
- A user can have multiple entitlements.
- Playback positions are scoped to `user_id` + `asset_id`.

## Data Retention & Deletion Policy
- Playback positions retained for 24 months of inactivity.
- Entitlements retained for 7 years for billing/audit.
- User deletion request triggers:
  - Remove PII from `users` within 30 days.
  - Anonymize `playback_positions` by removing `user_id`.
  - Keep aggregated analytics with no PII.
