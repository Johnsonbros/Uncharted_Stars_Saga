# Deployment Runbooks

## MCP Spine
1. Build and run migrations.
2. Deploy service with environment variables for scopes and token secrets.
3. Run smoke tests: proposal create + validate.

## Listener Platform
1. Deploy web app.
2. Verify auth and entitlements endpoints.
3. Validate playback streaming with signed URLs.

## Audio Engine
1. Deploy render workers.
2. Validate audio scene schema input.
3. Export a test scene and verify CDN delivery.

## Rollback Plan
- Roll back to last green release.
- Re-run smoke tests.
- Confirm audit logs intact.
