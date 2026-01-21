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
