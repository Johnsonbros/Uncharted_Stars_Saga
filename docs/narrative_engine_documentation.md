# Narrative Engine Documentation

This document completes the Narrative Engine documentation by describing the **API surface** and the **canon vs. draft data rules** referenced in `SYSTEM_TODO.md`. It is the authoritative narrative-engine doc alongside the system architecture overview in `ARCHITECTURE.md`.

## 1) API Surface (Events, Knowledge, Promises)

> Scope: This API surface is conceptual and describes the required data operations and validation behaviors. Concrete endpoints may vary by service implementation, but must provide equivalent capabilities.

### 1.1 Events API

**Purpose:** Manage the event DAG that represents canonical story truth.

**Core Operations**
- **Create Draft Event**
  - Input: event payload with participants, timestamp, dependencies, impacts.
  - Output: draft event with `canonStatus: draft` and stable `eventId`.
- **Propose Canonization**
  - Input: draft event ID(s) + optional justification and impacted promises.
  - Output: proposal object queued for canon gate validation.
- **Read Event(s)**
  - Filters: by `eventId`, `characterId`, `timeline`, `canonStatus`, `dependency`.
  - Output: full event record with dependency edges.
- **Update Draft Event**
  - Allowed only for `canonStatus: draft`.
  - Changes must re-run DAG and knowledge validations.
- **Reject/Archive Proposal**
  - Input: proposal ID + reason.
  - Output: proposal marked as rejected with audit trail.

**Event Contract (summary)**
- Required: `id`, `timestamp`, `type`, `participants`, `location`, `dependencies`, `impacts`, `canonStatus`.
- Canon transitions are one-way: `draft` → `proposed` → `canon`.

### 1.2 Knowledge States API

**Purpose:** Track “who knows what, when” without violating causal order.

**Core Operations**
- **Record Knowledge Acquisition**
  - Input: `characterId`, `eventId`, `learnedAt`, `source`, `certainty`.
  - Output: knowledge state entry.
- **Query Knowledge State**
  - Filters: `characterId`, `eventId`, time window.
  - Output: time-ordered knowledge entries.
- **Invalidate Knowledge States**
  - Triggered by event edits that affect causality.
  - Output: flagged knowledge entries requiring resolution.

**Knowledge Contract (summary)**
- `learnedAt` must be >= the referenced event’s timestamp.
- `source` must be one of: `witnessed`, `told`, `inferred`.

### 1.3 Promises API

**Purpose:** Track listener commitments and ensure they are fulfilled or explicitly resolved.

**Core Operations**
- **Create Promise**
  - Input: `type`, `description`, `establishedIn`, optional `owner`.
  - Output: `status: pending` promise record.
- **Transition Promise Status**
  - Allowed transitions:
    - `pending` → `fulfilled`
    - `pending` → `broken`
    - `pending` → `transformed`
    - `transformed` → `fulfilled`
  - Output: updated promise with audit trail.
- **Query Promises**
  - Filters: `status`, `type`, `character`, `timeline`.

**Promise Contract (summary)**
- `fulfilledIn` required for `fulfilled` status.
- `broken` and `transformed` must include a reason field.

---

## 2) Canon vs. Draft Data Rules (Validation + Persistence)

### 2.1 Canonization Rules

- **Canon is immutable.** Once an event is canonized, it may not be edited or deleted.
- **Drafts are mutable.** Draft events can be edited or deleted freely until proposed.
- **Proposals are gate-kept.** Any transition to canon must pass the canon gate pipeline:
  1. DAG continuity checks (acyclic, referential integrity).
  2. Knowledge timing checks (no pre-knowledge).
  3. Promise lifecycle validation (no dangling commitments).
  4. Listener cognition safeguards (clarity and cognitive load).

### 2.2 Validation Constraints

**Events**
- All dependencies must exist.
- Dependencies must be earlier in timeline (no backward causality).
- The event graph must remain acyclic.

**Knowledge States**
- Knowledge cannot precede the event it references.
- If an event is rejected or replaced, dependent knowledge entries must be invalidated.

**Promises**
- Promises must be resolved or explicitly broken/transformed before final arc closure.
- Canonization of a promise resolution must reference the fulfilling event/scene.

### 2.3 Persistence Constraints

- Canon and draft data are **physically separated** or **logically partitioned** to prevent leakage.
- Canon entries are write-once and must be version-audited.
- Draft edits must never mutate canon references; only proposals may reference canon.
- All proposal and canonization steps must emit **audit records**.

### 2.4 Required Audit Metadata

Each canon-related change must record:
- `proposalId`
- `authorId`
- `timestamp`
- `validationReportId` (with pass/fail details)
- `affectedEntities` (events, knowledge entries, promises)

---

## 3) Canon Gate Inputs and Outputs

**Inputs**
- Draft events or edits
- Promise lifecycle transitions
- Knowledge state changes

**Outputs**
- Canonized events (if all checks pass)
- Rejected proposals with actionable error list

---

## 4) Non-Goals

- Narrative text generation
- Audio production
- Listener-facing delivery

These are handled by other subsystems per `ARCHITECTURE.md`.
