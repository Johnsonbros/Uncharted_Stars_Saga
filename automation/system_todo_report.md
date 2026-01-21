# System TODO Automation Report

## Summary
- Total checklist items: 143
- Complete: 65
- In progress: 18
- Open: 60

## Open Items by Section

### 1) Creator Operating System (Private) > 1.1 Narrative Engine
- Integration: canon gate rejects contradictory changes (line 81)
- Integration: draft changes do not leak into canon (line 82)

### 1) Creator Operating System (Private) > 1.2 Audio Engine
- Audio Scene Object schema defined and validated (line 97)
- Beat marker authoring and validation (line 98)
- Voice profile definition + enforcement (line 99)
- Recording packet generation with context blocks (line 100)
- Listener cognition safeguards pass/fail rules (line 101)
- Unit: beat marker insertion + ordering (line 104)
- Unit: voice profile constraints (line 105)
- Integration: recording packet output completeness (line 106)
- Integration: listener confusion audit scoring (line 107)

### 1) Creator Operating System (Private) > 1.3 MCP Spine
- Implement MCP server handshake and version negotiation (line 125)
- Register core resource catalog (read-only narrative/audio/listener summaries) (line 126)
- Implement resource resolver layer with access guards (line 127)
- Define proposal schema (canonical JSON schema + versioning strategy) (line 128)
- Build proposal lifecycle store (draft → submitted → validated → applied → archived) (line 129)
- Tool endpoints for proposals only (no direct canon writes) (line 130)
- Proposal validation pipeline (continuity, dependency DAG, canon gates) (line 131)
- Model registry with scoped capabilities (Opus/Sonnet/Haiku) (line 133)
- Proposal audit log + validation report (line 134)
- Canon gate integration hook (block apply on failed validation) (line 135)
- Tool response templates with deterministic metadata (proposal_id, scope, status) (line 136)
- MCP prompt templates for common workflows (continuity check, outline, recap) (line 137)
- Access token strategy (service-to-service auth, short-lived tokens) (line 138)
- Rate limiting + abuse safeguards per model and scope (line 139)
- Local dev harness (mock resources + test proposals) (line 142)
- MCP Inspector configuration for debugging (line 143)
- Deployment config for MCP service (env vars, secrets, health checks) (line 144)
- Unit: scope authorization checks (line 147)
- Unit: proposal schema validation (happy + failure modes) (line 148)
- Unit: resource resolver access guards (line 149)
- Unit: tool response metadata consistency (line 150)
- Integration: proposal workflow end-to-end (create → validate → apply) (line 151)
- Integration: forbidden scope access rejection (line 152)
- Integration: canon gate rejects invalid proposals (line 153)
- Integration: audit log written on proposal lifecycle transitions (line 154)
- Integration: rate limit enforcement and error response mapping (line 155)

### 2) Listener Platform (Public) > 2.1 Marketing & Onboarding
- Landing page with audio trailer (line 182)
- Founders pricing and CTA flow (line 183)
- Email auth onboarding (Replit or Supabase) (line 184)
- E2E: marketing → signup → checkout (line 187)
- Accessibility checks (contrast, focus, keyboard nav) (line 188)

### 2) Listener Platform (Public) > 2.2 Payments & Entitlements
- Stripe Checkout integration (line 202)
- Webhook verification + idempotency (line 203)
- Entitlement grant + verification API (line 204)
- Integration: webhook signature validation (line 207)
- Integration: entitlement grant and retrieval (line 208)
- E2E: successful payment unlocks library access (line 209)

### 3) Data Layer > 3.1 Narrative DB
- Schema migrations for events, knowledge states, promises (line 248)
- Referential integrity constraints (line 249)
- Canon/draft separation enforcement (line 250)
- Migration tests (line 253)
- Data integrity checks (foreign keys, enums) (line 254)

### 3) Data Layer > 3.3 Listener DB
- User accounts, entitlements, playback positions schema (line 287)
- Data retention and deletion workflow (line 288)
- Migration tests (line 291)
- Integration: playback position updates and retrieval (line 292)

### 4) Observability, Errors, and Incident Tracing > 4.1 Global Error Trace Checklist
- Log correlation IDs across services (line 304)
- Structured logging format (JSON) (line 305)
- Alerting rules for critical failures (line 306)
