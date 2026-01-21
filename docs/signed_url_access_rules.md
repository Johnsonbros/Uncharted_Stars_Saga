# Signed URL Access Rules

## Scope
Signed URLs are required for streaming audio assets and must enforce access limits, expiry, and scope controls.

## Rules
- Signed URLs are generated per user and per asset.
- Default expiry: 15 minutes.
- Maximum expiry: 60 minutes.
- URLs must be scoped to `asset_type=stream` unless explicitly allowed.
- URLs must include `entitlement_id` in the claims payload.

## Validation
- Expired URLs return HTTP 403.
- Missing or invalid signature returns HTTP 401.
- Requests from unentitled users return HTTP 403 regardless of signature.

## Rotation
- Refresh signed URLs on playback start and every 10 minutes for long sessions.
- Revoke signed URLs on entitlement revocation.
