# Parallel Build Prompts: Narrative Engine & Narrative DB

These prompts are designed to let two teams work in parallel on adjacent systems with minimal coupling. The interface boundary is the shared data contracts for events, knowledge states, and promises.

## Prompt A — Narrative Engine (Creator OS)

**Objective:** Build the Narrative Engine’s domain logic for canonical story state, independent of storage implementation details.

**Prompt:**

Design and implement the **Narrative Engine** domain layer that enforces canonical story rules. Deliver the following outcomes:

1) **Event Model + Canon Rules**
   - Define an immutable **Event** model with canonical transitions.
   - Enforce **canon vs. draft separation** at the domain level (read/write semantics for both).
   - Ensure once an event is canonical, it cannot be mutated.

2) **Dependency DAG Validation**
   - Implement a dependency DAG validator that guarantees **acyclicity** and **referential integrity**.
   - Reject any event that references missing dependencies or introduces a cycle.

3) **Knowledge State Tracking**
   - Implement knowledge state tracking with **temporal constraints** (e.g., facts become known at specific times).
   - Provide deterministic propagation rules from events to knowledge state.

4) **Promise Lifecycle**
   - Implement promise tracking with explicit states: **pending / fulfilled / broken / transformed**.
   - Ensure transitions follow a defined state machine.

5) **Canon Gate Validation Pipeline**
   - Build a canon gate validation pipeline that checks **continuity, promises, and listener cognition**.
   - Output a structured validation report (pass/fail + reasons).

**Interfaces / Contracts (for parallel work):**
- Define **data contracts** only (not persistence):
  - `Event`, `KnowledgeState`, `Promise`, and `CanonValidationReport` schemas (fields + types).
- Publish a **DAG validation API signature** (input list of events + dependencies; output validation result).
- Do **not** implement database migrations or storage here.

**Non-Goals:**
- No database schema creation, migrations, or persistence logic.
- No MCP Spine, Audio Engine, or Listener Platform work.

---

## Prompt B — Narrative DB (Data Layer)

**Objective:** Build the Narrative DB schema and constraints that store narrative state safely, independent of domain logic implementation.

**Prompt:**

Design and implement the **Narrative DB** schema that supports canonical narrative state. Deliver the following outcomes:

1) **Schema Migrations**
   - Create migrations for **events**, **knowledge states**, and **promises** tables.
   - Include all necessary fields to capture domain concepts while remaining storage-first.

2) **Referential Integrity**
   - Enforce foreign keys and constraints to guarantee referential integrity (e.g., event dependencies must reference valid events).

3) **Canon vs Draft Separation**
   - Implement **canonical/draft separation** at the database level (e.g., status fields, partitioning, or separate tables).
   - Ensure constraints prevent canonical records from being overwritten.

4) **Migration & Integrity Tests**
   - Write migration tests and data-integrity checks for foreign keys, enum values, and canonical constraints.

**Interfaces / Contracts (for parallel work):**
- Define **table schemas and constraints** that align with the Narrative Engine’s published data contracts (`Event`, `KnowledgeState`, `Promise`).
- Expose a schema diagram or DDL snippet for the Engine team to validate field alignment.

**Non-Goals:**
- No domain rule implementation (DAG validation, canon gate, promise state machine, knowledge propagation).
- No Listener Platform, Audio Engine, MCP Spine, or Payments work.

---

## Prompt C — Audio Engine (Creator OS)

**Objective:** Build the Audio Engine’s domain logic for generating structured audio scenes, independent of storage and delivery infrastructure.

**Prompt:**

Design and implement the **Audio Engine** domain layer that produces listener-ready audio scene definitions. Deliver the following outcomes:

1) **Audio Scene Object Schema**
   - Define and validate the core **Audio Scene Object** schema (scene metadata, timing, narrator/character tracks).
   - Provide validation rules and error reporting for malformed scenes.

2) **Beat Marker Authoring**
   - Implement beat marker authoring with ordering rules and temporal constraints.
   - Ensure deterministic ordering and conflict resolution for overlapping markers.

3) **Voice Profiles**
   - Define voice profile schemas and enforce constraints (speaker identity, style, cadence).
   - Provide validation hooks to ensure profiles match scene requirements.

4) **Recording Packet Generation**
   - Generate recording packets with full context blocks (scene summary, speaker notes, beat markers).
   - Ensure packets are complete and reproducible from inputs.

5) **Listener Cognition Safeguards**
   - Implement pass/fail rules for listener cognition safeguards.
   - Output a structured audit report with reasons and recommendations.

**Interfaces / Contracts (for parallel work):**
- Define **data contracts** for Audio Scene Objects, Beat Markers, Voice Profiles, and Recording Packets.
- Publish a **scene validation API signature** (input scene object; output validation result).
- Do **not** implement object storage, CDN delivery, or signed URL logic here.

**Non-Goals:**
- No object storage paths, CDN configuration, or signed URL generation.
- No Listener Platform or Payments work.

---

## Prompt D — Audio Storage (Data Layer)

**Objective:** Build the Audio Storage schema and delivery conventions, independent of audio scene generation logic.

**Prompt:**

Design and implement **Audio Storage** conventions and integration tests that support audio asset durability and delivery. Deliver the following outcomes:

1) **Storage Paths & Metadata**
   - Define object storage paths and metadata conventions (series/season/episode/scene).
   - Include metadata for codec, duration, bitrate, and provenance.

2) **CDN Distribution & Caching**
   - Define CDN distribution and cache strategy (TTL rules, cache busting).
   - Document cache invalidation procedures for updated assets.

3) **Upload + Retrieval Integration Tests**
   - Implement integration tests for audio upload and retrieval.
   - Validate metadata persistence and retrieval accuracy.

4) **Signed URL Expiry Enforcement**
   - Implement integration tests to enforce signed URL expiry behavior.
   - Validate access denial after expiry windows.

**Interfaces / Contracts (for parallel work):**
- Define storage metadata fields that align with Audio Engine’s output contracts (scene identifiers, version tags).
- Publish storage path templates and expected metadata keys for the Audio Engine team.

**Non-Goals:**
- No audio scene generation, beat marker authoring, or voice profile logic.
- No Listener Platform or Payments work.
