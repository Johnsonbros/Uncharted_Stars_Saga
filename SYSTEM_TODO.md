# System-Wide TODO & Traceability Hub

> **Purpose:** Provide a single, system-wide backlog that any agentic system can query to understand build checklists, tests, diagrams, and flowcharts. This hub is the authoritative index for tracing and fixing errors quickly and consistently.

## How to Use This Document

- **All agentic systems** should start here to locate the relevant checklist for a component or workflow.
- **Each checklist item** is written as a testable, verifiable outcome.
- **Traceability** is maintained by linking tests, diagrams, and flowcharts to the system or subsystem.
- **Update rule:** When a feature is added or a workflow changes, update:
  1. The checklist for that subsystem
  2. The related test plan
  3. Any impacted diagram/flowchart

## Global Status Legend

- **[ ]** Not started
- **[~]** In progress
- **[x]** Complete

---

## 1) Creator Operating System (Private)

### 1.1 Narrative Engine

**Build Checklist**
- [ ] Event model implemented with immutable canon transitions
- [ ] Dependency DAG validation implemented (acyclic + referential integrity)
- [ ] Knowledge state tracking with temporal constraints
- [ ] Promise tracking (pending/fulfilled/broken/transformed)
- [ ] Canon vs. draft separation enforced at persistence layer
- [ ] Canon gate validation pipeline (continuity, promises, listener cognition)

**Tests**
- [ ] Unit: event creation, mutation rejection once canon
- [ ] Unit: DAG validator (cycle detection, missing nodes)
- [ ] Unit: knowledge state propagation rules
- [ ] Unit: promise lifecycle transitions
- [ ] Integration: canon gate rejects contradictory changes
- [ ] Integration: draft changes do not leak into canon

**Diagrams**
- [ ] Event dependency DAG example (diagram)
- [ ] Canon gate decision flow (flowchart)

---

### 1.2 Audio Engine

**Build Checklist**
- [ ] Audio Scene Object schema defined and validated
- [ ] Beat marker authoring and validation
- [ ] Voice profile definition + enforcement
- [ ] Recording packet generation with context blocks
- [ ] Listener cognition safeguards pass/fail rules

**Tests**
- [ ] Unit: beat marker insertion + ordering
- [ ] Unit: voice profile constraints
- [ ] Integration: recording packet output completeness
- [ ] Integration: listener confusion audit scoring

**Diagrams**
- [ ] Audio scene generation pipeline (flowchart)
- [ ] Listener confusion audit decision tree (flowchart)

---

### 1.3 MCP Spine

**Build Checklist**
- [ ] Define MCP spine service boundary + repo folder structure
- [ ] Establish MCP server runtime (Node/TS) + basic bootstrap
- [ ] Implement MCP server handshake and version negotiation
- [ ] Register core resource catalog (read-only narrative/audio/listener summaries)
- [ ] Implement resource resolver layer with access guards
- [ ] Define proposal schema (canonical JSON schema + versioning strategy)
- [ ] Build proposal lifecycle store (draft → submitted → validated → applied → archived)
- [ ] Tool endpoints for proposals only (no direct canon writes)
- [ ] Proposal validation pipeline (continuity, dependency DAG, canon gates)
- [ ] Scoped permissions enforcement (resource/tool scopes + model roles)
- [ ] Model registry with scoped capabilities (Opus/Sonnet/Haiku)
- [ ] Proposal audit log + validation report
- [ ] Canon gate integration hook (block apply on failed validation)
- [ ] Tool response templates with deterministic metadata (proposal_id, scope, status)
- [ ] MCP prompt templates for common workflows (continuity check, outline, recap)
- [ ] Access token strategy (service-to-service auth, short-lived tokens)
- [ ] Rate limiting + abuse safeguards per model and scope
- [ ] Error taxonomy mapping for MCP responses (codes, severity, owner)
- [ ] Observability hooks (structured logs, trace IDs, audit events)
- [ ] Local dev harness (mock resources + test proposals)
- [ ] MCP Inspector configuration for debugging
- [ ] Deployment config for MCP service (env vars, secrets, health checks)

**Tests**
- [ ] Unit: scope authorization checks
- [ ] Unit: proposal schema validation (happy + failure modes)
- [ ] Unit: resource resolver access guards
- [ ] Unit: tool response metadata consistency
- [ ] Integration: proposal workflow end-to-end (create → validate → apply)
- [ ] Integration: forbidden scope access rejection
- [ ] Integration: canon gate rejects invalid proposals
- [ ] Integration: audit log written on proposal lifecycle transitions
- [ ] Integration: rate limit enforcement and error response mapping

**Diagrams**
- [ ] Proposal-based modification flow (flowchart)
- [ ] MCP permissions scope map (diagram)
- [ ] MCP request lifecycle sequence (diagram)
- [ ] MCP spine architecture block diagram (diagram)

**Initial Setup Steps (Start Here)**
1. [ ] Confirm MCP server runtime choice and initialize service scaffold
2. [ ] Define resource catalog MVP (events, canon, knowledge snapshots)
3. [ ] Draft proposal JSON schema v1 + validation rules
4. [ ] Implement scope map v1 (roles → resources/tools)
5. [ ] Wire basic proposal tool endpoint returning proposal_id
6. [ ] Stub validation pipeline with placeholder checks + audit log

---

## 2) Listener Platform (Public)

### 2.1 Marketing & Onboarding

**Build Checklist**
- [ ] Landing page with audio trailer
- [ ] Founders pricing and CTA flow
- [ ] Email auth onboarding (Replit or Supabase)

**Tests**
- [ ] E2E: marketing → signup → checkout
- [ ] Accessibility checks (contrast, focus, keyboard nav)

**Diagrams**
- [ ] Visitor conversion funnel (flowchart)

---

### 2.2 Payments & Entitlements

**Build Checklist**
- [ ] Stripe Checkout integration
- [ ] Webhook verification + idempotency
- [ ] Entitlement grant + verification API

**Tests**
- [ ] Integration: webhook signature validation
- [ ] Integration: entitlement grant and retrieval
- [ ] E2E: successful payment unlocks library access

**Diagrams**
- [ ] Payment → entitlement flow (flowchart)

---

### 2.3 Audiobook Player & Library

**Build Checklist**
- [ ] Library page lists available chapters
- [ ] Player supports streaming + resume
- [ ] Signed URL generation for audio access
- [ ] Playback position persistence

**Tests**
- [ ] Unit: signed URL generation input validation
- [ ] Integration: playback position save + restore
- [ ] E2E: play, pause, resume, continue across session

**Diagrams**
- [ ] Audio streaming access flow (flowchart)

---

## 3) Data Layer

### 3.1 Narrative DB

**Build Checklist**
- [ ] Schema migrations for events, knowledge states, promises
- [ ] Referential integrity constraints
- [ ] Canon/draft separation enforcement

**Tests**
- [ ] Migration tests
- [ ] Data integrity checks (foreign keys, enums)

**Diagrams**
- [ ] Narrative schema ERD

---

### 3.2 Audio Storage

**Build Checklist**
- [x] Object storage paths and metadata conventions
- [x] CDN distribution and cache strategy

**Tests**
- [x] Integration: audio upload + retrieval
- [x] Integration: signed URL expiry enforcement

**Diagrams**
- [x] Storage → CDN delivery flow

---

### 3.3 Listener DB

**Build Checklist**
- [ ] User accounts, entitlements, playback positions schema
- [ ] Data retention and deletion workflow

**Tests**
- [ ] Migration tests
- [ ] Integration: playback position updates and retrieval

**Diagrams**
- [ ] Listener schema ERD

---

## 4) Observability, Errors, and Incident Tracing

### 4.1 Global Error Trace Checklist

- [ ] Unified error taxonomy (codes, severity, owner)
- [ ] Log correlation IDs across services
- [ ] Structured logging format (JSON)
- [ ] Alerting rules for critical failures
- [ ] Error playbooks for each subsystem

### 4.2 Incident Flowchart

```mermaid
flowchart TD
  A[Error Detected] --> B{Is it user-facing?}
  B -- Yes --> C[Capture user context + request ID]
  B -- No --> D[Capture system context + job ID]
  C --> E[Locate subsystem from error taxonomy]
  D --> E
  E --> F[Check subsystem checklist + recent changes]
  F --> G{Reproducible?}
  G -- Yes --> H[Write/Update test → fix → verify]
  G -- No --> I[Add observability → gather more evidence]
  H --> J[Postmortem + update checklist/tests]
  I --> J
```

### 4.3 Error Traceability Matrix

| Subsystem | Primary Logs | Correlation Keys | First-Line Tests |
|-----------|---------------|------------------|------------------|
| Narrative Engine | narrative-service | event_id, proposal_id | DAG validator, canon gate tests |
| Audio Engine | audio-service | scene_id, packet_id | packet generation tests |
| MCP Spine | mcp-service | proposal_id, tool_name | scope authorization tests |
| Listener Platform | web-app | user_id, session_id | auth + playback E2E |
| Payments | payments-service | stripe_event_id, user_id | webhook validation |

---

## 5) Diagrams & Flowcharts Inventory

**Required Diagrams (index)**
- [x] System architecture overview (high-level)
- [ ] Narrative event DAG example
- [ ] Canon gate decision flow
- [ ] Audio scene generation pipeline
- [ ] Listener confusion audit decision tree
- [ ] Payment → entitlement flow
- [ ] Audio streaming access flow
- [x] Storage → CDN delivery flow
- [ ] Incident response flow (see above)

---

## 6) Documentation Sync Checklist

When updating this system-wide list, update references in:
- [x] README.md (Documentation section)
- [x] CLAUDE.md (AI assistant entry points)
- [x] ARCHITECTURE.md (roadmap + cross-links)
- [x] TESTING_STRATEGY.md (test backlog alignment)

---

## 7) Near-Term Priority Queue

1. [ ] Create system diagrams listed in Section 5
2. [ ] Define unified error taxonomy + severity table
3. [ ] Draft subsystem playbooks for Narrative, Audio, MCP, Listener Platform
4. [ ] Align tests with build checklists for Phase 1 deliverables
5. [ ] Add instrumentation standards (log fields, trace IDs)
