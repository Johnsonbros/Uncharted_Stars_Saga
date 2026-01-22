# MCP Spine Integration with NAOS

## Overview

The MCP spine service has been integrated with the NAOS Narrative Engine and Audio Engine to provide AI-assisted continuity management. This document describes the integration architecture and how the components work together.

## Integration Architecture

```
┌──────────────────────────────────────┐
│         MCP Spine Service            │
│         (Port 7000)                  │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Resources (Read-Only)         │ │
│  │  - narrative.events            │ │
│  │  - narrative.canon             │ │
│  │  - narrative.knowledge         │ │
│  │  - audio.scene_index           │ │
│  │  - listener.summary            │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Tools (Proposal-Based)        │ │
│  │  - POST /mcp/tools/proposals   │ │
│  │  - POST /mcp/tools/proposals/  │ │
│  │           apply                │ │
│  └────────────────────────────────┘ │
└──────────────┬───────────────────────┘
               │ HTTP
               │
               ▼
┌──────────────────────────────────────┐
│      NAOS Web App (Next.js)          │
│      (Port 3000)                     │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Narrative Engine API          │ │
│  │  - GET  /api/narrative/state   │ │
│  │  - POST /api/narrative/events/ │ │
│  │         apply                  │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Narrative Engine (TypeScript) │ │
│  │  - buildNarrativeStateSnapshot │ │
│  │  - validateCanonGate           │ │
│  │  - createEventRecord           │ │
│  │  - updateEventCanonStatus      │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Audio Engine (TypeScript)     │ │
│  │  - generateRecordingPacket     │ │
│  │  - validateAudioScene          │ │
│  │  - auditListenerCognition      │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

## Completed Integration Work

### 1. Resource Integration (`resourceData.ts`)

The MCP spine's resource layer now fetches real data from the Narrative Engine API:

- **`narrative.events`**: Fetches all events from `/api/narrative/state`
- **`narrative.canon`**: Returns only canon-status events
- **`narrative.knowledge_snapshots`**: Returns knowledge states and issues
- **`audio.scene_index`**: Placeholder (to be implemented when Audio API exists)
- **`listener.summary`**: Placeholder (to be implemented when Listener API exists)

**Configuration:**
```bash
NAOS_WEB_API_BASE=http://localhost:3000  # Where NAOS web app is running
DEFAULT_PROJECT_ID=uncharted-stars       # Default project to query
```

### 2. Canon Gate Validation Integration (`validationPipeline.ts`)

The proposal validation pipeline now uses real canon gate validation:

**Flow:**
1. Fetch current narrative state from `/api/narrative/state`
2. Extract canon events, proposed events, and promises
3. Parse canon gate validation report from snapshot
4. Check for:
   - Dependency issues (missing dependencies, cycles)
   - Timestamp violations (events before their dependencies)
   - Promise integrity issues
   - Listener cognition problems

**Key Functions:**
- `transformProposalEventToNarrativeEvent()`: Converts MCP proposal events to Narrative Engine format
- `callCanonGateValidation()`: Fetches narrative state and validates proposals
- `validateProposal()`: Main validation entry point (now async)

### 3. Proposal Apply Integration (`narrativeIntegration.ts`, `proposalTool.ts`)

The proposal apply workflow now modifies the actual Narrative Engine:

**Flow:**
1. Check proposal validation status (must be "passed")
2. Call `applyProposalToNarrativeEngine()` integration function
3. For each event in proposal:
   - POST to `/api/narrative/events/apply` (to be created)
   - Event is created with "proposed" status
   - Event is transitioned to "canon" status (with canon gate check)
4. Update MCP proposal status to "applied"
5. Return list of applied event IDs

**Key Functions:**
- `applyProposalToNarrativeEngine()`: Orchestrates applying proposal events
- `ProposalTool.applyProposal()`: Now async, calls integration layer

## Required API Endpoints

### Existing (Already Implemented)

✅ **GET `/api/narrative/state?projectId={id}`**
- Returns complete narrative state snapshot
- Includes events, promises, canon gate report, knowledge states

### Required (To Be Implemented)

❌ **POST `/api/narrative/events/apply`**

Request body:
```json
{
  "projectId": "uncharted-stars",
  "proposalId": "prop_abc123",
  "event": {
    "id": "evt_xyz789",
    "type": "scene",
    "description": "Event description",
    "dependencies": ["evt_previous"],
    "participants": ["char_alice", "char_bob"],
    "location": "location_earth",
    "impacts": [],
    "knowledgeEffects": [],
    "timestamp": "2026-01-22T12:00:00Z",
    "canonStatus": "proposed"
  }
}
```

Response:
```json
{
  "ok": true,
  "eventId": "evt_xyz789",
  "canonStatus": "canon"
}
```

**Implementation Notes:**
- Should call `createEventRecord()` if event doesn't exist
- Should call `updateEventCanonStatus(eventId, "canon")` to canonize
- The `updateEventCanonStatus()` function already validates canon gate
- Should be idempotent (check if event already exists)

## Configuration

### Environment Variables

```bash
# MCP Spine Service
MCP_SPINE_PORT=7000
NAOS_WEB_API_BASE=http://localhost:3000
DEFAULT_PROJECT_ID=uncharted-stars
MCP_SPINE_ACCESS_TOKEN=optional_bearer_token
MCP_RATE_LIMIT_PER_MINUTE=60
SERVICE_ENV=development
LOG_LEVEL=info

# NAOS Web App
PORT=3000
DATABASE_URL=postgresql://...
```

## Running the Integrated System

### 1. Start NAOS Web App

```bash
cd naos/apps/web
npm install
npm run dev  # Starts on port 3000
```

### 2. Start MCP Spine Service

```bash
cd services/mcp-spine
npm install
npm run dev  # Starts on port 7000
```

### 3. Test Integration

**Fetch Narrative State via MCP:**
```bash
curl -X POST http://localhost:7000/mcp/resources/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "resource_id": "narrative.events",
    "role": "creator",
    "model": "opus"
  }'
```

**Create a Proposal:**
```bash
curl -X POST http://localhost:7000/mcp/tools/proposals \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test narrative event",
    "author": {
      "model": "sonnet",
      "role": "creator",
      "request_id": "req_test"
    },
    "payload": {
      "canon_events": [{
        "event_id": "evt_test_001",
        "type": "scene",
        "dependencies": [],
        "content": {
          "description": "A test event for integration",
          "participants": ["char_test"]
        }
      }]
    }
  }'
```

**Apply a Validated Proposal:**
```bash
curl -X POST http://localhost:7000/mcp/tools/proposals/apply \
  -H "Content-Type: application/json" \
  -d '{
    "proposal_id": "prop_...",
    "role": "automation_service",
    "model": "opus"
  }'
```

## Integration Status

| Component | Status | Notes |
|-----------|--------|-------|
| Resource: narrative.events | ✅ Complete | Fetches from `/api/narrative/state` |
| Resource: narrative.canon | ✅ Complete | Filters canon-only events |
| Resource: narrative.knowledge | ✅ Complete | Returns knowledge states |
| Resource: audio.scene_index | ⏳ Pending | Needs Audio Engine API endpoint |
| Resource: listener.summary | ⏳ Pending | Needs Listener Platform API |
| Validation: Canon Gate | ✅ Complete | Uses real `validateCanonGate()` |
| Apply: Narrative Engine | ⏳ Pending | Needs `/api/narrative/events/apply` endpoint |
| Tests: Integration | ⏳ Pending | End-to-end workflow testing needed |

## Next Steps

1. **Implement `/api/narrative/events/apply` endpoint** in NAOS web app
   - Use existing `createEventRecord()` and `updateEventCanonStatus()` functions
   - Add idempotency checks
   - Return applied event details

2. **Add Audio Engine API endpoints**
   - `/api/audio/scenes` - List audio scenes
   - `/api/audio/scenes/:id` - Get specific audio scene
   - Wire to `audio.scene_index` resource

3. **Add end-to-end integration tests**
   - Test proposal creation with validation
   - Test proposal apply workflow
   - Test resource resolution with real data

4. **Add persistent storage for MCP proposals**
   - Currently in-memory only
   - Add PostgreSQL persistence
   - Sync with Narrative Engine proposal system

5. **Deploy both services**
   - Configure environment variables
   - Set up service discovery
   - Add monitoring and observability

## Troubleshooting

### MCP Spine Can't Reach NAOS Web App

**Problem:** `Failed to fetch narrative state: ECONNREFUSED`

**Solution:**
- Ensure NAOS web app is running on port 3000
- Check `NAOS_WEB_API_BASE` environment variable
- Verify network connectivity between services

### Canon Gate Validation Always Fails

**Problem:** Validation reports errors even for valid proposals

**Solution:**
- Check narrative state has existing canon events
- Ensure proposal events have correct dependencies
- Verify timestamp ordering (events must come after their dependencies)
- Check that all referenced events exist

### Proposal Apply Fails

**Problem:** `Failed to apply proposal: HTTP 404`

**Solution:**
- The `/api/narrative/events/apply` endpoint needs to be implemented
- Until then, proposal apply will fail
- Create the endpoint following the specification above

## References

- [MCP Spine Architecture](docs/mcp_spine_architecture_block_diagram.md)
- [Narrative Engine Documentation](docs/narrative_engine_diagrams.md)
- [Proposal Modification Flow](docs/proposal_modification_flow.md)
- [MCP Service Contracts](docs/mcp_service_contracts.md)
