# Phase 1 Source of Truth: Foundation Build

> **Phase Window:** Months 1-2  
> **Purpose:** Establish the canonical data model, MCP spine skeleton, and foundational schemas so narrative state can exist as enforceable system state.

## 1) Phase Definition

### 1.1 Goals
- Implement the **Narrative Engine core** as the single authoritative state system for story events and canon.
- Stand up **MCP Spine** as the controlled interface for read-only access and proposal-based changes.
- Define **database schemas** for narrative, audio metadata, and listener systems (structure only).
- Establish **validation gates and state transitions** for canon vs. draft.
- Ship **baseline governance** (audit trails, permissions scope map, and system-level error taxonomy alignment).

### 1.2 Non-Goals
- No audio scene generation or recording packet pipelines.
- No listener platform UI or payments.
- No end-to-end publishing to a public platform.

### 1.3 Dependencies & Constraints
- Must follow separation of concerns between Creator OS, Listener Platform, and Data Layer.
- Canon changes require explicit proposals and validation gates.
- Maintain audio-first metadata even if no audio outputs are generated in Phase 1.

---

## 2) High-Level Systems In Scope

### 2.1 Narrative Engine Core
- Event model + event DAG
- Canon vs. draft separation
- Knowledge states (who knows what, when)
- Promise tracking (commitments to listeners)
- Continuity checks (basic, deterministic)
- Canon validation gate and audit trail

### 2.2 MCP Spine (Foundation)
- MCP server skeleton
- Read-only resources for narrative state
- Proposal creation tools (no auto-apply)
- Scope-based permissions and access tokens
- Request lifecycle logging and rate limiting baseline

### 2.3 Data Layer (Schemas Only)
- Narrative DB schema (events, scenes, dependencies, knowledge)
- Audio metadata schema (future-facing)
- Listener DB schema (accounts, entitlements)
- IDs, foreign keys, and indexing strategy

### 2.4 Governance & Reliability
- Error taxonomy alignment
- Canon audit log structure
- Change validation reports
- Minimal observability hooks (structured logging stubs)

---

## 3) High-Level Feature Inventory (Phase 1)

### 3.1 Narrative Engine Features
- Event creation, retrieval, and linking
- Event dependency validation (acyclic, causal)
- Canonization workflow (draft → proposal → validation → canon)
- Knowledge state propagation on event commit
- Promise state creation and completion tracking

### 3.2 MCP Spine Features
- Resource endpoints (story events, knowledge states, promises)
- Tool endpoints (proposal creation, continuity check)
- Access token scopes (read:story, propose:canon)
- Request logging with correlation IDs

### 3.3 Schema & Data Features
- Narrative tables: events, dependencies, knowledge_states, promises, canon_audits
- Audio metadata tables: scenes, voice_profiles (schemas only)
- Listener tables: accounts, entitlements (schemas only)

---

## 4) Program States (Phase 1)

### 4.1 Story State Lifecycle
- **Draft**: mutable, unvalidated event set
- **Proposed**: submitted for canon validation
- **Validated**: passed checks, ready to canonize
- **Canon**: immutable published truth
- **Rejected**: failed validation, retains audit trail

### 4.2 Knowledge State Lifecycle
- **Unknown** → **Known** → **Revealed** → **Contested** (if conflicts appear)

### 4.3 Promise State Lifecycle
- **Unmade** → **Made** → **In-Progress** → **Fulfilled** → **Violated**

### 4.4 System Environment States
- **Local Dev**: stub secrets, local DB
- **Shared Dev**: isolated test data, full validation
- **Staging**: read-only narrative snapshots
- **Production**: canonical data, strict gates

### 4.5 MCP Request States
- **Authenticated** → **Authorized** → **Processed** → **Logged** → **Responded**

---

## 5) Tasks and Subtasks (Ordered)

### 5.1 Narrative Engine Core
1. **Event Model Implementation**
   - Define event data structure and required fields
   - Implement event creation and retrieval interfaces
   - Add validation for required fields and references
2. **Dependency Graph System**
   - Model dependency edges
   - Enforce DAG constraints
   - Add causal ordering checks
3. **Canon vs. Draft Separation**
   - Define canon fields and immutability rules
   - Implement state transitions (draft → proposed → validated → canon)
   - Add audit logging for all transitions
4. **Knowledge State Tracking**
   - Define knowledge state schema
   - Implement propagation rules on event commit
   - Add contradiction detection (basic)
5. **Promises Tracking**
   - Define promise schema
   - Add create/resolve workflows
   - Link promises to triggering events

### 5.2 MCP Spine Foundation
1. **MCP Server Skeleton**
   - Bootstrapped server with health checks
   - Base request/response envelopes
2. **Resource Endpoints**
   - Read-only endpoints for events, knowledge, promises
   - Pagination and filtering stubs
3. **Proposal Tools**
   - Proposal creation endpoint
   - Canon validation stub (no auto-apply)
4. **Permissions & Access**
   - Token scopes
   - Scope enforcement middleware
5. **Request Logging**
   - Correlation IDs
   - Structured log output for all calls

### 5.3 Database Schemas
1. **Narrative DB Schema**
   - Events, dependencies, knowledge_states, promises, canon_audits
   - Indexes for event lookup and dependency traversal
2. **Audio Metadata Schema**
   - Scene, beat marker, voice profile (schemas only)
3. **Listener DB Schema**
   - Accounts, entitlements (schemas only)

### 5.4 Governance & Docs
1. **Canon Gate Definition**
   - Validation rules checklist
   - Required audit metadata fields
2. **Error Taxonomy Alignment**
   - Map common failure modes to severity levels
3. **Docs & Reference Updates**
   - Update SYSTEM_TODO links where needed
   - Note phase completion criteria

---

## 6) Phase 1 Definition of Done

- Narrative engine core supports event DAG, canon gating, knowledge, and promises.
- MCP spine offers read-only resources and proposal submission with permission scopes.
- Narrative, audio metadata, and listener schemas are documented and reviewed.
- Canon lifecycle states are enforced with audit trails.
- Foundational logs exist for MCP requests and canon transitions.

