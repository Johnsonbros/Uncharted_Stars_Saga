# Data Lifecycle and Governance

This document defines the lifecycle of narrative, audio, and listener data, including immutability rules, retention expectations, and governance boundaries.

## Narrative Data Lifecycle

### Stages
1. **Draft**
   - Proposed events not yet canon.
   - Editable and subject to deletion.
2. **Proposed**
   - Submitted to canon gate for validation.
3. **Canonized**
   - Immutable event record.
   - Versioned snapshots are stored.
4. **Published**
   - Referenced in listener-facing metadata.
   - Locked from further modification.

### Governance Rules
- Canonized events are immutable.
- Corrections are modeled as new events, not edits.
- Canon snapshots are append-only.

## Audio Data Lifecycle

### Stages
1. **Generated**
   - Audio scenes produced from canon.
2. **Recorded**
   - Raw recordings stored as masters.
3. **Packaged**
   - Packets and derived assets prepared.
4. **Published**
   - Audio assets exposed via immutable URLs.

### Governance Rules
- Master audio is write-once.
- Derived audio assets are versioned per release.
- Published audio should never be overwritten in place.

## Listener Data Lifecycle

### Stages
1. **Account Created**
2. **Entitlement Granted**
3. **Playback State Tracked**
4. **Account Retention/Deletion**

### Governance Rules
- Entitlements are permanent for founders.
- Playback data is mutable and user-specific.
- Deletion requests must respect legal requirements.

## Cross-System Data Policies

### Separation of Concerns
- Narrative DB only contains creator data.
- Listener DB only contains listener data.
- Cross-read access is prohibited.

### Publish Boundary
- Only the publish pipeline can write listener-visible metadata.
- Publish actions are logged and auditable.

### Auditability
- Canonization and publishing events are logged with timestamps.
- Every release is traceable to specific canon snapshots.

## Retention & Compliance (Placeholder)

This section will be finalized once legal and compliance requirements are chosen.

**Proposed defaults:**
- Keep canon and release ledgers indefinitely.
- Allow user-initiated deletion of listener accounts and playback state.
- Retain purchase receipts for accounting and tax compliance.

