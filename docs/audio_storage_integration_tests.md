# Audio Storage Integration Tests

These integration tests validate audio asset durability, metadata persistence, CDN delivery, and signed URL expiry.

## Test Environment Assumptions
- Object storage bucket: `audio-storage`.
- CDN distribution configured with cache rules described in `audio_storage_conventions.md`.
- Signed URL generator available with configurable expiry (e.g., 15 minutes).
- Metadata registry table `audio_assets` from `audio_storage_schema.sql`.

## Fixtures
- **Sample asset**: 10-second FLAC or AAC file.
- **Scene identifiers**:
  - `series_id`: `uss`
  - `season_number`: `1`
  - `episode_number`: `4`
  - `scene_id`: `scene-ch4-s3`
  - `scene_version`: `3`

## Integration Tests

### 1) Upload + Retrieval (Object Storage)
**Goal:** Confirm assets upload successfully and are retrievable via object storage path.

**Steps**
1. Upload the sample asset to:
   ```
   /audio/uss/season-1/episode-4/scene-scene-ch4-s3/v3/master/scene-scene-ch4-s3.v3.master.flac
   ```
2. Set required metadata headers from `audio_storage_conventions.md`.
3. Fetch the object directly from storage.

**Assertions**
- HTTP status 200 on GET.
- File size matches `naos-content-size-bytes`.
- `naos-checksum-sha256` matches computed checksum.

### 2) Metadata Persistence (Registry)
**Goal:** Confirm metadata written at upload persists in the registry.

**Steps**
1. Insert a row in `audio_assets` with metadata matching the uploaded asset.
2. Retrieve the row by `(series_id, season_number, episode_number, scene_id, scene_version, asset_type)`.

**Assertions**
- All required metadata fields match the object headers.
- `storage_path` matches upload path.

### 3) CDN Delivery (Immutable)
**Goal:** Confirm CDN delivers versioned assets with immutable cache headers.

**Steps**
1. Request the CDN URL for the versioned asset.
2. Inspect response headers.

**Assertions**
- `Cache-Control` includes `public, max-age=31536000, immutable`.
- Response is HTTP 200.

### 4) CDN Delivery (Mutable Alias)
**Goal:** Confirm `latest/` alias uses short TTL and updates after cache invalidation.

**Steps**
1. Upload a `latest/` alias asset pointing to version `v3`.
2. Request CDN URL for the alias path; capture ETag.
3. Upload version `v4` of the asset and update the `latest/` alias.
4. Purge CDN cache for the alias path.
5. Re-request CDN URL for the alias path.

**Assertions**
- `Cache-Control` includes `public, max-age=3600, must-revalidate`.
- ETag (or content hash) differs after invalidation.

### 5) Signed URL Expiry Enforcement
**Goal:** Ensure expired signed URLs deny access.

**Steps**
1. Generate a signed URL for the versioned asset with a 60-second expiry.
2. Immediately request the signed URL (expect success).
3. Wait for 70 seconds.
4. Re-request the same signed URL.

**Assertions**
- Initial request returns HTTP 200.
- Post-expiry request returns HTTP 401 or 403.

### 6) Signed URL TTL vs CDN TTL
**Goal:** Ensure signed URL TTL does not exceed CDN alias TTL and respects expiry.

**Steps**
1. Generate a signed URL for a `latest/` alias with a 15-minute expiry.
2. Request it before expiry (expect success).
3. Wait for expiry to pass.
4. Re-request the same signed URL.

**Assertions**
- Before expiry: HTTP 200.
- After expiry: HTTP 401 or 403.

## Reporting
- Record test execution timestamps.
- Log CDN cache purge IDs or request IDs.
- Store checksum validation outputs alongside the test run artifacts.
