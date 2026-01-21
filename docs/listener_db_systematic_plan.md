# Listener DB Systematic Implementation Approach

This plan lays out a step-by-step approach to deliver the listener data layer work items:
- Listener DB schema for accounts, entitlements, playback positions
- Data retention/deletion workflow
- Migration + playback position integration tests
- Listener schema ERD diagram

## 1) Discovery & Alignment
- Review existing listener data expectations in:
  - `ARCHITECTURE.md` (baseline schema + separation rules).
  - `docs/DATA_LIFECYCLE_AND_GOVERNANCE.md` (retention and deletion principles).
  - `docs/PROCESS_WORKFLOWS.md` (publish + listener delivery workflows).
- Confirm constraints:
  - Strict separation from Creator OS data.
  - Minimal data collection (email + playback position only).
  - Audio-first UX requirements for resume behavior.

**Output:** short list of confirmed requirements + open questions (if any).

## 2) Listener DB Schema Definition
**Goal:** Produce a concrete, versioned schema and migration plan.

**Steps:**
1. Convert the baseline schema in `ARCHITECTURE.md` into a runnable SQL schema file (e.g., `docs/listener_db_schema.sql`).
2. Expand fields as needed for:
   - `listeners`: auth identifiers, unique email, timestamps.
   - `entitlements`: entitlement type, Stripe payment references, lifecycle timestamps (granted/revoked), audit fields.
   - `playback_positions`: per-chapter position + timestamp, optimistic update support.
3. Add indexes + constraints for fast lookup and data integrity.
4. Define migration ordering and seed data (if any).

**Acceptance criteria:**
- Schema reflects the architecture baseline and security constraints.
- All tables use appropriate primary keys and foreign keys.
- Indexes cover the critical query paths (by listener_id, chapter_id).

## 3) Data Retention & Deletion Workflow
**Goal:** Implement a compliant data lifecycle policy that is easy to operate.

**Steps:**
1. Extend `docs/DATA_LIFECYCLE_AND_GOVERNANCE.md` with listener-specific rules:
   - Retention windows (default + after account deletion).
   - Immediate deletion paths for user-initiated removal.
   - Soft-delete vs hard-delete decision (with rationale).
2. Document a deletion workflow that includes:
   - Request intake (listener initiated, admin initiated).
   - Deleting/anon’ing playback positions.
   - Revoking entitlements while keeping audit trails where required.
3. Define a scheduled cleanup job + manual runbook.

**Acceptance criteria:**
- A clear timeline for what data is kept and for how long.
- Defined responsibilities (listener platform vs platform ops).
- Workflow does not violate the “minimal data collection” principle.

## 4) Migration + Integration Tests (Playback Positions)
**Goal:** Ensure schema migrations and playback resume behavior are reliable.

**Steps:**
1. Add migration tests that verify:
   - Schema creates without errors.
   - Constraints are enforceable (FKs, PKs, unique, not null).
2. Add integration tests that validate:
   - Insert playback position for a listener + chapter.
   - Update playback position (idempotent or last-write-wins behavior).
   - Retrieve playback position for resume.
   - Delete listener and ensure dependent playback positions are removed or anonymized per policy.

**Acceptance criteria:**
- Tests cover new migration files and end-to-end playback position flow.
- Tests are runnable locally per `TESTING_STRATEGY.md` (or documented if not yet automated).

## 5) Listener Schema ERD Diagram
**Goal:** Provide a clear visual representation of listener data relationships.

**Steps:**
1. Generate an ERD using the final schema (e.g., Mermaid or dbdiagram format).
2. Store the diagram in `docs/` and reference it in `ARCHITECTURE.md` or the new schema file.
3. Ensure relationships are explicit (1:N from listeners to entitlements and playback positions).

**Acceptance criteria:**
- Diagram matches the schema exactly.
- Diagram is easy to read and documented.

## 6) Review & Traceability
**Goal:** Ensure each task is traceable and validated.

**Steps:**
1. Update `SYSTEM_TODO.md` checklist to include these deliverables with owners/status.
2. Add cross-links between:
   - Schema file ↔ ERD
   - Data lifecycle policy ↔ deletion workflow
   - Tests ↔ migration docs
3. Summarize gaps or future work if any step cannot be completed.

**Acceptance criteria:**
- Each task has a documented artifact.
- Clear traceability between docs, schema, and tests.

## Proposed Execution Order
1. Schema definition + migration scaffold
2. ERD diagram from schema
3. Retention/deletion workflow
4. Migration + playback integration tests
5. Update SYSTEM_TODO.md with tracking items

## Definition of Done
- Listener DB schema file added and referenced.
- Data retention/deletion workflow documented.
- Migration + playback position integration tests written.
- Listener ERD diagram added and linked.
- System checklist updated.
