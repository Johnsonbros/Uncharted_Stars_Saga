# API System Reference

This document defines the **authoritative API system** for Uncharted Stars Saga and keeps endpoint naming in sync with the architecture and subsystem docs. It is intentionally implementation-agnostic but names stable routes that services must provide.

## 0) Conventions (Applies to All APIs)

- **Auth:** Creator OS APIs require creator auth; Listener Platform APIs require listener auth except public marketing routes (none listed here). Publish API uses service-to-service auth.
- **Base URL:** Examples assume `/api` as the base path for Next.js routes or service gateways.
- **Errors:** Use the structured error payload and severity taxonomy from `docs/error_taxonomy.md`.
- **Idempotency:** Any write endpoint that can be triggered by webhooks or publish jobs must support idempotency keys.

## 1) Creator Operating System (Private)

### 1.1 Narrative Engine API

Provides canon-safe operations for events, knowledge, and promises as defined in `docs/narrative_engine_api.md`.

**Events**
- `POST /api/narrative/events` → Create draft event.
- `GET /api/narrative/events` → Query events by `eventId`, `characterId`, `timeline`, `canonStatus`, `dependency`.
- `PATCH /api/narrative/events/{eventId}` → Update draft event (draft-only).
- `POST /api/narrative/events/{eventId}/propose` → Propose canonization.

**Proposals**
- `POST /api/narrative/proposals/{proposalId}/reject` → Reject/Archive proposal with reason.

**Knowledge States**
- `POST /api/narrative/knowledge` → Record knowledge acquisition.
- `GET /api/narrative/knowledge` → Query by `characterId`, `eventId`, time window.
- `POST /api/narrative/knowledge/invalidate` → Invalidate knowledge entries after causal edits.

**Promises**
- `POST /api/narrative/promises` → Create promise.
- `PATCH /api/narrative/promises/{promiseId}` → Transition status (pending → fulfilled/broken/transformed; transformed → fulfilled).
- `GET /api/narrative/promises` → Query by `status`, `type`, `character`, `timeline`.

### 1.2 Audio Engine API (Private, Internal)

Audio Engine endpoints are internal-only and will be documented once the Audio Scene Object schema is finalized. Until then, the Narrative Engine and Publish API are the only stable contracts.

## 2) Publish API (One-Way, COS → Listener Platform)

Only the Publish API writes into listener-facing stores. It receives canonized metadata and audio asset references.

- `POST /api/publish/releases` → Publish a canonized release package (chapters, metadata, dependencies).
- `POST /api/publish/assets` → Register immutable audio assets + storage URLs.
- `POST /api/publish/catalog-sync` → Idempotent catalog sync for listener DB (used by batch jobs).

## 3) Listener Platform (Public)

### 3.1 Auth & Entitlements

- `POST /api/webhooks/stripe` → Stripe webhook receiver (idempotent, signature-verified).
- `POST /api/entitlements/grant` → Grant entitlement (internal, called by webhook handler).
- `GET /api/entitlements` → Verify listener entitlements for gated content.

### 3.2 Library API

- `GET /api/library` → List available chapters/releases for the authenticated listener.
- `GET /api/library/{chapterId}` → Retrieve chapter metadata.
- `GET /api/library/{chapterId}/stream-url` → Return a signed streaming URL for the chapter.

### 3.3 Playback API

- `POST /api/playback/position` → Persist playback position (chapterId, positionSeconds).
- `GET /api/playback/position` → Fetch playback position for a chapter.

---

## 4) Alignment Notes

- Narrative Engine operations and validation rules are detailed in `docs/narrative_engine_api.md`.
- The Publish API is the only bridge between Creator OS and Listener Platform.
- Listener Platform playback flows are illustrated in `docs/audio_streaming_access_flow.md`.
