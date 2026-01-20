# Implementation Granularity: Subsystems, Modules, and Interfaces

This document breaks the NAOS system into implementable subsystems, internal modules, and interface contracts. It is intended to guide engineering tasks and schema/API definition once coding begins.

## Creator Operating System (Private)

### Narrative Engine

**Modules**
- **Event Graph Service**
  - Creates, links, and queries events in a DAG.
  - Ensures causal integrity and time ordering.
- **Knowledge State Service**
  - Maintains per-entity knowledge timelines.
  - Answers “who knows what, when.”
- **Promise Tracker**
  - Records explicit narrative promises.
  - Tracks status: pending, fulfilled, broken.
- **Canon Gate**
  - Validates proposals.
  - Enforces immutability after canonization.
- **Continuity Validator**
  - Detects contradictions across events and knowledge.
  - Emits issues with severity and affected entities.

**Primary Data Entities**
- `Event`
- `EventDependency`
- `KnowledgeState`
- `Promise`
- `CanonSnapshot`
- `ContinuityIssue`

**Interfaces**
- `POST /narrative/events` (propose event)
- `POST /narrative/canonize` (canonize proposal)
- `GET /narrative/state` (read state view)
- `GET /narrative/continuity` (issues and warnings)

### Audio Engine

**Modules**
- **Scene Composer**
  - Builds audio scene objects from narrative state.
  - Adds narration cues and beat markers.
- **Voice Profile Registry**
  - Stores narrator and character voice metadata.
  - Enforces consistency rules.
- **Recording Packet Generator**
  - Produces recording bundles and checklists.
  - Includes metadata for performance guidance.
- **Listener Cognition Audit**
  - Detects potential confusion in audio-only delivery.

**Primary Data Entities**
- `AudioScene`
- `BeatMarker`
- `VoiceProfile`
- `RecordingPacket`
- `CognitionIssue`

**Interfaces**
- `POST /audio/scenes` (generate audio scenes)
- `GET /audio/packets/:id` (retrieve recording packet)
- `POST /audio/voices` (register voice profile)

### MCP Spine

**Modules**
- **Resource Gate**
  - Read-only access to narrative state.
  - Strict scoping by resource type.
- **Tool Gate**
  - Proposal-based modifications.
  - Mandatory validation workflows.
- **Prompt Orchestrator**
  - Workflow definitions and routing rules.

**Interfaces**
- `GET /mcp/resources/*`
- `POST /mcp/tools/*`
- `GET /mcp/prompts/*`

## Listener Platform (Public)

### Marketing & Membership

**Modules**
- **Landing Site**
  - Core messaging and CTA.
- **Checkout Flow**
  - Stripe checkout for $49 lifetime membership.
- **Entitlement Service**
  - Validates membership status.
  - Issues access tokens for streaming.

**Primary Data Entities**
- `ListenerAccount`
- `Entitlement`
- `PurchaseReceipt`

**Interfaces**
- `POST /checkout/start`
- `POST /webhooks/stripe`
- `GET /entitlements/me`

### Audiobook Player

**Modules**
- **Library Service**
  - Fetches all published chapters for a user.
- **Playback Service**
  - Streams audio and updates progress.
- **Resume Tracker**
  - Stores last position per chapter.

**Primary Data Entities**
- `Chapter`
- `PlaybackState`
- `StreamingAsset`

**Interfaces**
- `GET /library`
- `GET /stream/:chapterId`
- `POST /playback/:chapterId`

## Publish Pipeline (One-Way)

**Modules**
- **Publish Package Builder**
  - Exports canonized narrative snapshots.
  - Generates listener-facing metadata.
- **Publish Gate**
  - Requires validation and audit success.
  - Prevents partial publish.
- **Release Ledger**
  - Records what was published and when.

**Primary Data Entities**
- `PublishPackage`
- `Release`
- `ReleaseAudit`

**Interfaces**
- `POST /publish/build`
- `POST /publish/release`
- `GET /publish/releases`

## Cross-Cutting Concerns

### Auth & Authorization
- Creator OS: creator-only access with strict role.
- Listener Platform: user auth with entitlement checks.
- MCP tools: scoped permissions per tool/resource.

### Observability
- Centralized logging for creator and listener systems.
- Structured event tracing for publish pipeline.
- Alerts on failed canonization or publish attempts.

### Data Governance
- Immutable canon state after publish.
- Strict write boundaries between systems.
- Explicit migration policies for schema changes.

