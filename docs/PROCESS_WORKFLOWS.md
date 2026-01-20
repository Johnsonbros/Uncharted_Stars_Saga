# Process Workflows

This document describes the end-to-end workflows that connect the narrative engine, audio engine, publish pipeline, and listener delivery. These workflows are intended to be validated before implementation.

## 1) Narrative Creation Workflow (Creator OS)

**Objective:** Convert raw story intent into canonized events.

1. **Draft Event Proposal**
   - Creator writes a proposed event with context and intent.
2. **MCP-Assisted Review**
   - MCP tools analyze continuity and dependencies.
3. **Canon Gate Validation**
   - Validates conflicts, promise impacts, and time ordering.
4. **Canonization**
   - Event becomes immutable canon.
5. **State Update**
   - Knowledge states and dependencies are updated.

**Outputs**
- Canonized `Event`
- Updated `KnowledgeState`
- `ContinuityIssue` list (if any warnings)

## 2) Audio Scene Generation Workflow (Creator OS)

**Objective:** Generate performance-ready audio assets from canon.

1. **Select Canon Window**
   - Choose the set of canonized events to render.
2. **Compose Audio Scenes**
   - Scene Composer creates `AudioScene` objects with cues.
3. **Beat & Emotion Pass**
   - Adds beat markers and emotional envelope metadata.
4. **Cognition Audit**
   - Detects listener confusion risk.
5. **Recording Packet Assembly**
   - Bundles scenes, notes, and metadata.

**Outputs**
- `AudioScene` and `RecordingPacket`
- `CognitionIssue` list

## 3) Publishing Workflow (One-Way)

**Objective:** Publish canon and audio to the listener platform without backflow.

1. **Build Publish Package**
   - Assemble narrative metadata + audio references.
2. **Release Audit**
   - Validate completeness and audio availability.
3. **Release Gate**
   - Lock the release to prevent partial writes.
4. **Publish Execution**
   - Write to listener DB and expose audio URLs.
5. **Release Ledger Update**
   - Record release version and timestamp.

**Outputs**
- `PublishPackage`
- `Release` entry in ledger
- Listener-visible `Chapter` metadata

## 4) Listener Access Workflow (Public)

**Objective:** Deliver audio access to paid listeners.

1. **Membership Purchase**
   - Checkout creates `PurchaseReceipt`.
2. **Entitlement Grant**
   - Listener DB records entitlement.
3. **Library Fetch**
   - Listener requests library list.
4. **Streaming Playback**
   - Player streams audio and updates progress.

**Outputs**
- `Entitlement`
- `PlaybackState`

## 5) Issue Resolution Workflow

**Objective:** Handle continuity or cognition issues before publish.

1. **Issue Detection**
   - Validator flags conflict or confusion.
2. **Author Review**
   - Creator inspects affected canon.
3. **Resolution Proposal**
   - Proposed event or correction created.
4. **Canon Gate**
   - Re-validate with new changes.
5. **Resolution Recorded**
   - Issue marked resolved or deferred.

**Outputs**
- Updated canon state
- Issue status updates

