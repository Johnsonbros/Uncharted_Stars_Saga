# Narrative Engine API Surface & Canon/Draft Rules

> **Scope:** Creator Operating System → Narrative Engine (private). This document defines the API surface for narrative state and the rules that enforce canon vs. draft integrity.

## Purpose

The Narrative Engine is the authoritative source of truth for story state. It exposes a small set of stateful resources and actions for events, knowledge states, and promises, while enforcing canon immutability and proposal-based canon changes.【F:ARCHITECTURE.md†L213-L289】

---

## Core Resources (State)

### Events

Events are the atomic units of story truth. They are timestamped, referenced by dependencies (DAG), and become immutable once canonized.【F:ARCHITECTURE.md†L219-L243】

```ts
interface Event {
  id: string;
  timestamp: DateTime;
  type: EventType;
  participants: CharacterId[];
  location: LocationId;
  description: string;
  dependencies: EventId[];
  impacts: Impact[];
  canonStatus: 'draft' | 'proposed' | 'canon';
}
```

### Knowledge States

Knowledge states track who knows what, when, and at what certainty level; they prevent illegal knowledge access in narrative timelines.【F:ARCHITECTURE.md†L245-L260】

```ts
interface KnowledgeState {
  characterId: string;
  eventId: string;
  learnedAt: DateTime;
  certainty: 'known' | 'suspected' | 'rumored' | 'false';
  source: 'witnessed' | 'told' | 'inferred';
}
```

### Promises (Listener Commitments)

Promises represent explicit commitments to the audience and must be tracked through fulfillment states.【F:ARCHITECTURE.md†L262-L275】

```ts
interface Promise {
  id: string;
  type: 'plot_thread' | 'mystery' | 'character_arc' | 'prophecy';
  establishedIn: SceneId;
  description: string;
  status: 'pending' | 'fulfilled' | 'broken' | 'transformed';
  fulfilledIn?: SceneId;
}
```

---

## API Surface (Resource-Oriented)

The Narrative Engine is accessed via MCP resources (read-only) and tools (proposal-based writes). The following API surface is the minimal MVP contract for the subsystem.

### Read Resources (MCP)

- `story://project/{id}/canon`
  - Canonized events, knowledge states, promises (immutable).
- `story://project/{id}/drafts`
  - Draft events and draft-only states (mutable).

### Write/Action Tools (MCP)

#### Draft Creation & Mutation

- `events.createDraft`
- `events.updateDraft`
- `events.deleteDraft`
- `knowledge.updateDraft`
- `promises.updateDraft`

**Rule:** Draft actions are allowed only against `canonStatus: 'draft'`.

#### Proposal Workflow

- `proposal.create`
  - Creates a proposal object for canon-affecting changes.
- `proposal.validate`
  - Runs continuity checks, dependency DAG analysis, promise impact assessment, and listener confusion audit.
- `proposal.apply`
  - Applies validated proposals to canon (creator-only scope).

**Rule:** Canon changes must go through proposals; direct canon writes are forbidden.【F:ARCHITECTURE.md†L490-L524】

---

## Canon vs. Draft Data Rules (Validation + Persistence)

### Status Lifecycle

```
draft → proposed → canon (immutable)
```

### Canon Rules (Immutable)

- Canon events are immutable once applied.
- Canon updates require a validated proposal and creator approval.
- Canon data is the only source for publish/export pipelines.

### Draft Rules (Mutable)

- Drafts can be created, edited, and deleted freely.
- Drafts must never be exposed to listener-facing outputs.
- Draft updates must not alter canon state or derived artifacts.

### Proposal Rules (Gatekeeping)

- Proposals are the sole pathway to canon changes.
- Validation must pass:
  - Continuity checks
  - Dependency DAG integrity
  - Promise impact assessment
  - Listener confusion audit
- Failure blocks apply and returns structured validation results.

---

## Canon/Draft Persistence Constraints

**Minimum constraints enforced at persistence layer:**

- `canonStatus` is required for all narrative entities.
- Canon entities are immutable (reject update/delete at DB layer or service guard).
- Proposal apply transaction is atomic and audit-logged.
- Draft data and canon data are stored in separate logical namespaces.

---

## Responsibilities & Non-Responsibilities

**Responsibilities**
- Maintain event graph integrity.
- Track knowledge propagation rules.
- Enforce canon gates and proposal lifecycle.

**Non-Responsibilities**
- Text generation.
- Audio production.
- Listener-facing delivery.【F:ARCHITECTURE.md†L276-L290】
