# Phase 2 Source of Truth: Audio Engine

> **Phase Window:** Months 2-3  
> **Status:** Current  
> **Purpose:** Transform narrative state into audio-first artifacts with enforceable quality gates and MCP tooling.

## 1) Phase Definition

### 1.1 Goals
- Implement **audio scene objects** as structured, performance-ready artifacts.
- Establish **beat markers** and **voice profiles** with consistent application rules.
- Generate **recording packets** tied to narrative state and canon gates.
- Provide **MCP audio tools** for generation and listener confusion audits.
- Define **audio production workflow states** and validation gates.

### 1.2 Non-Goals
- No public listener platform UI.
- No payment integration.
- No automated publishing to public CDN (only internal packaging).

### 1.3 Dependencies & Constraints
- Requires Phase 1 canon gate and narrative event DAG.
- All audio objects must reference immutable canon events.
- Audio-first clarity and cognitive load rules must be enforceable at build time.

---

## 2) High-Level Systems In Scope

### 2.1 Audio Engine Core
- Audio scene object model
- Beat marker system
- Voice profile catalog
- Recording packet generator
- Listener confusion audit rules

### 2.2 MCP Audio Tools
- Tool: `audio_packet.generate`
- Tool: `listener_confusion.audit`
- Resource: `story://scene/{id}/audio`
- Permissions: generate vs. audit scopes

### 2.3 Data Layer Additions
- Audio scene storage (tables + object storage mapping)
- Voice profile definitions
- Beat marker annotations

### 2.4 Quality Gates & Governance
- Audio readiness validation (clarity, attribution, pacing)
- Canon linkage validation (must reference canon events only)
- Audit trail for audio generation requests

---

## 3) High-Level Feature Inventory (Phase 2)

### 3.1 Audio Engine Features
- Audio scene object creation from canonical narrative events
- Beat marker insertion and timing metadata
- Voice profile assignment (narrator + characters)
- Recording packet export (bundle of scenes + instructions)
- Listener confusion audit scoring and feedback

### 3.2 MCP Features
- Audio packet generation endpoint
- Confusion audit endpoint
- Read-only audio scene resource
- Structured response payloads for downstream tooling

### 3.3 Storage & Metadata Features
- Audio scene metadata tables
- Beat marker annotations
- Voice profile catalog
- Storage pointers for rendered audio (placeholders)

---

## 4) Program States (Phase 2)

### 4.1 Audio Scene Lifecycle
- **Unbuilt** → **Generated** → **Reviewed** → **Approved** → **Recorded** → **Mastered**

### 4.2 Beat Marker State
- **Draft** → **Applied** → **Locked**

### 4.3 Voice Profile State
- **Draft** → **Validated** → **Active** → **Deprecated**

### 4.4 Recording Packet State
- **Assembled** → **Queued** → **Recorded** → **Delivered**

### 4.5 Listener Confusion Audit State
- **Pending** → **Passed** → **Flagged** → **Resolved**

### 4.6 MCP Audio Request State
- **Authenticated** → **Authorized** → **Generated** → **Audited** → **Logged**

---

## 5) Tasks and Subtasks (Ordered)

### 5.1 Audio Scene Object Model
1. **Define Audio Scene Schema**
   - Required fields (narration, dialogue, attribution, timing)
   - Canon event references
2. **Scene Generation Rules**
   - Transform narrative events into audio scenes
   - Enforce attribution clarity
3. **Scene Validation**
   - Validate required fields and canon references
   - Reject ambiguous speaker attribution

### 5.2 Beat Marker System
1. **Beat Marker Definitions**
   - Allowed marker types (pause, emphasis, tempo)
   - Timing metadata structure
2. **Beat Marker Application**
   - Rules for attaching markers to scene segments
   - Validation to prevent overlapping conflicts

### 5.3 Voice Profile Catalog
1. **Profile Schema**
   - Required fields (tone, cadence, pronunciation rules)
2. **Assignment Rules**
   - Narrator default and character overrides
   - Consistency checks across scenes

### 5.4 Recording Packet Generator
1. **Packet Structure**
   - Scene bundles, performance notes, and metadata
2. **Packet Export**
   - Export format specification
   - Versioning strategy for re-records

### 5.5 Listener Confusion Audit
1. **Audit Criteria**
   - Attribution clarity, cognitive load thresholds
2. **Audit Engine**
   - Score calculation and flagged segments
3. **Resolution Workflow**
   - Feedback loop into scene edits

### 5.6 MCP Audio Tools
1. **Tool: audio_packet.generate**
   - Input validation
   - Output schema for recording packet
2. **Tool: listener_confusion.audit**
   - Audit report output schema
   - Status updates
3. **Resource: story://scene/{id}/audio**
   - Read-only access with pagination

### 5.7 Storage & Metadata
1. **Audio Metadata Tables**
   - Scenes, beat markers, voice profiles
2. **Object Storage Mapping**
   - Placeholder for rendered audio file pointers

### 5.8 Quality Gates & Governance
1. **Audio Readiness Gate**
   - Required fields and validation rules
2. **Canon Link Validation**
   - Ensure all audio objects map to canon events
3. **Audit Logging**
   - Store generation request metadata

---

## 6) Phase 2 Definition of Done

- Audio scene objects, beat markers, and voice profiles are defined and validated.
- Recording packets can be generated and audited via MCP tools.
- Listener confusion audits produce actionable feedback and status tracking.
- Audio metadata tables and storage pointers are established.
- Audio lifecycle states and quality gates are enforced with audit trails.
