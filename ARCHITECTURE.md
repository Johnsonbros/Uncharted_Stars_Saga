# Uncharted Stars Saga - System Architecture
## Narrative & Audio Operating System (NAOS)

> **Document Version:** 1.0
> **Last Updated:** 2026-01-20
> **Status:** Foundation Phase - Architecture Definition

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Vision](#2-system-vision)
3. [Core Design Principles](#3-core-design-principles)
4. [System Architecture Overview](#4-system-architecture-overview)
5. [Component Architecture](#5-component-architecture)
6. [MCP Integration Layer](#6-mcp-integration-layer)
7. [Data Architecture](#7-data-architecture)
8. [Audiobook Production Pipeline](#8-audiobook-production-pipeline)
9. [Listener Platform](#9-listener-platform)
10. [Business Model](#10-business-model)
11. [Technology Stack](#11-technology-stack)
12. [Security & Privacy](#12-security--privacy)
13. [Scalability & Performance](#13-scalability--performance)
14. [Implementation Roadmap](#14-implementation-roadmap)
15. [Open Questions & Future Considerations](#15-open-questions--future-considerations)

---

## 1. Executive Summary

Uncharted Stars Saga is being reimagined as a **Narrative & Audio Operating System (NAOS)** - a solo-author, audiobook-first platform for creating and publishing long-running story universes. This system prioritizes:

- **Audiobook-native creation** (not text-to-audio adaptation)
- **Canon integrity** across years of iteration
- **Multi-model AI orchestration** via MCP servers
- **Story simulation** with institutional memory
- **Clean listener experience** funded by a $49 Founders Lifetime membership

**This is not a writing app. It is a story simulation engine with memory, audio orchestration, and publishing infrastructure.**

### Key Differentiators

| Traditional Platform | NAOS Approach |
|---------------------|---------------|
| Text-first, audio adapted | Audio-first, text as view |
| Document-based | State-based (events & dependencies) |
| Manual continuity tracking | AI-enforced canon gates |
| Multi-author SaaS | Solo-author, long-horizon |
| Subscription tiers | Single lifetime membership |

---

## 2. System Vision

### 2.1 Purpose

NAOS enables a single creator to:
- Build **living story universes** that span years or decades
- Create **audiobook-native content** optimized for listening
- Maintain **narrative consistency** through AI-assisted canon management
- Publish directly to a **dedicated listener community**
- Leverage **multiple AI models** for different creative tasks

### 2.2 Core Philosophy

**Stories Are State, Not Documents**

In NAOS:
- **Events** are the source of truth (what happened)
- **Knowledge states** track who knows what, when
- **Promises** maintain commitments to listeners
- **Canon** is explicitly managed, not implicitly assumed
- **Text scenes** are derived representations of narrative state

This state-based approach enables:
- Continuity validation across thousands of scenes
- Branch/fork exploration without corrupting canon
- Temporal reasoning about story consistency
- AI-assisted detection of contradictions

### 2.3 Target User

**The Solo Author Building a Universe**

- Writing serialized fiction over years
- Publishing directly to audience
- Needs AI assistance for continuity, not ghostwriting
- Wants audiobook-quality production
- Building a lifetime relationship with listeners

---

## 3. Core Design Principles

### 3.1 Solo-First, Long-Horizon
- Optimized for **one creator** over **many years**
- Not designed for collaborative multi-author workflows
- System accumulates institutional memory over time

### 3.2 Stories Are State, Not Documents
- **Events** and **dependencies** are primary
- Text is a **view** of narrative state
- Canon is **explicitly enforced**, not implied

### 3.3 Audio Is Primary
- Everything designed for **listening first**
- Text supports audio production, not vice versa
- Narration quality gates prevent publish

### 3.4 Canon Is Enforced, Not Implied
- Changes must pass **explicit validation gates**
- No silent overwrites of established truth
- **Proposal-based** modification workflow

### 3.5 AI as Institutional Memory
- AI assists with **continuity**, **discovery**, and **delivery**
- Not for ghostwriting or creative decision-making
- Multiple models for different tasks via MCP

### 3.6 Clean Separation of Power
- **Creator OS** and **Listener Platform** are strictly decoupled
- No creator tools exposed to listeners
- No listener data mixed with creative workspace

---

## 4. System Architecture Overview

### 4.1 Three-Layer Architecture

```mermaid
flowchart TB
  subgraph LP[Listener Platform (Public Web)]
    LP_Marketing[Marketing Website]
    LP_Auth[Auth & Payments]
    LP_Player[Audiobook Player]
  end

  subgraph COS[Creator Operating System (Private)]
    COS_MCP[MCP Spine]
    COS_Narrative[Narrative Engine]
    COS_Audio[Audio Engine]
  end

  subgraph DL[Data Layer]
    DL_Narrative[Narrative Database]
    DL_Audio[Audio Storage]
    DL_Listener[Listener Database]
  end

  LP -->|Content Publish API| COS
  COS --> DL
```

```
┌────────────────────────────────────────────────────────────┐
│                    LISTENER PLATFORM                        │
│                      (Public Web)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Marketing  │  │   Auth &     │  │   Audiobook  │    │
│  │   Website    │  │   Payments   │  │   Player     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────┬───────────────────────────────┘
                             │
                             │ Content Publish API
                             │
┌────────────────────────────┴───────────────────────────────┐
│                    CREATOR OPERATING SYSTEM                 │
│                         (Private)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   MCP SPINE                          │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐   │  │
│  │  │ Resources  │  │   Tools    │  │  Prompts   │   │  │
│  │  │ (Read API) │  │(Proposals) │  │(Workflows) │   │  │
│  │  └────────────┘  └────────────┘  └────────────┘   │  │
│  └─────────────┬────────────────────────────┬──────────┘  │
│                │                            │              │
│  ┌─────────────┴──────────┐   ┌────────────┴──────────┐  │
│  │   NARRATIVE ENGINE      │   │    AUDIO ENGINE       │  │
│  │  - Events               │   │  - Audio Scene Objects│  │
│  │  - Knowledge States     │   │  - Voice Profiles     │  │
│  │  - Promises/Canon       │   │  - Beat Markers       │  │
│  │  - Dependencies         │   │  - Recording Packets  │  │
│  │  - Branches/Forks       │   │  - Continuity Audits  │  │
│  └────────────────────────┘   └───────────────────────┘  │
└─────────────────────────┬──────────────────────────────────┘
                          │
┌─────────────────────────┴──────────────────────────────────┐
│                    DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Narrative  │  │    Audio     │  │   Listener   │    │
│  │   Database   │  │   Storage    │  │   Database   │    │
│  │  (Events,    │  │  (Masters,   │  │ (Accounts,   │    │
│  │   Canon)     │  │   CDN URLs)  │  │  Entitlements│    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘
```

### 4.2 Separation of Concerns

| Layer | Responsibility | Access |
|-------|---------------|--------|
| **Listener Platform** | Deliver audio, manage access | Public (auth required) |
| **Creator OS** | Narrative creation, canon management | Private (creator only) |
| **MCP Spine** | AI model integration, tool access | Service-to-service |
| **Data Layer** | Persistence, storage | Backend only |

---

## 5. Component Architecture

### 5.1 Narrative Engine (Private)

#### Purpose
The **authoritative source of truth** for story state.

#### Core Concepts

**Events**
- Atomic units of "what happened"
- Timestamped and immutable once canonized
- Form a directed acyclic graph (DAG)

```typescript
interface Event {
  id: string;
  timestamp: DateTime;
  type: EventType;
  participants: CharacterId[];
  location: LocationId;
  description: string;
  dependencies: EventId[];  // Events this depends on
  impacts: Impact[];        // What changed as result
  canonStatus: 'draft' | 'proposed' | 'canon';
}
```

**Knowledge States**
- Tracks "who knows what, when"
- Critical for dramatic irony and reveals
- Prevents characters knowing things they shouldn't

```typescript
interface KnowledgeState {
  characterId: string;
  eventId: string;
  learnedAt: DateTime;
  certainty: 'known' | 'suspected' | 'rumored' | 'false';
  source: 'witnessed' | 'told' | 'inferred';
}
```

**Promises (Listener Commitments)**
- Explicit commitments made to audience
- Must be fulfilled or explicitly broken
- Tracked across entire story universe

```typescript
interface Promise {
  id: string;
  type: 'plot_thread' | 'mystery' | 'character_arc' | 'prophecy';
  establishedIn: SceneId;
  description: string;
  status: 'pending' | 'fulfilled' | 'broken' | 'transformed';
  fulfilledIn?: SceneId;
}
```

**Canon vs. Drafts**
- **Canon**: Immutable, published truth
- **Drafts**: Mutable exploration space
- **Proposals**: Changes awaiting validation

**Branches & Forks**
- Explore "what if" scenarios without corrupting canon
- Test narrative changes before commitment
- Merge or discard based on validation

#### Responsibilities
- Maintain event graph
- Validate causal dependencies
- Track knowledge propagation
- Enforce canon gates
- Detect contradictions

#### Not Responsible For
- Text generation
- Audio production
- Listener-facing delivery

---

### 5.2 Audio Engine (Private)

#### Purpose
Transform narrative state into **performance-ready audio artifacts**.

#### Core Concepts

**Audio Scene Object**
- The unit of audio production
- Not raw prose, but annotated, performance-ready text

```typescript
interface AudioSceneObject {
  sceneId: string;
  narrationText: string;          // Optimized for speaking
  beatMarkers: BeatMarker[];      // Pauses, emphasis
  emotionalEnvelope: Emotion[];   // Emotional arc of scene
  povAnchor: CharacterId;         // Whose perspective
  dialogueAttribution: DialogueMap;  // Clear speaker mapping
  listenerCognitionSafeguards: string[];  // Prevents confusion
  voiceProfileId: string;
}
```

**Beat Markers**
- Indicate pacing, pauses, emphasis
- Guide human or synthetic narration

```typescript
interface BeatMarker {
  position: number;  // Character offset in text
  type: 'pause' | 'emphasis' | 'tone_shift' | 'breath';
  duration?: number;  // For pauses
  intensity?: number; // For emphasis
}
```

**Voice Profiles**
- Define narration characteristics
- Consistent across scenes/chapters

```typescript
interface VoiceProfile {
  id: string;
  name: string;
  tempo: number;           // Words per minute baseline
  authority: number;       // Narrator authority level
  emotionalRange: Range;   // How much emotion to convey
  allowedQuirks: string[]; // Acceptable variations
  forbiddenPatterns: string[]; // Things to avoid
}
```

**Recording Packet**
- Complete package for recording session
- Includes all context needed for performance

```typescript
interface RecordingPacket {
  chapterId: string;
  scenes: AudioSceneObject[];
  voiceProfile: VoiceProfile;
  precedingContext: string;  // What came before
  overallTone: string;
  productionNotes: string;
}
```

#### Audio-First Writing Principles

1. **Clarity Over Cleverness**
   - Avoid visual puns, typography tricks
   - Everything must work when heard

2. **Attribution Must Be Obvious**
   - Listeners can't see quote marks
   - Speaker must be clear from context

3. **Cognitive Load Management**
   - Don't introduce too many names at once
   - Remind listener of context periodically

4. **Pacing for Listening**
   - Natural pause points
   - Emphasis cues for important information

#### Responsibilities
- Generate Audio Scene Objects
- Apply voice profiles
- Create recording packets
- Run "listener confusion" audits
- Export for recording

#### Not Responsible For
- Actual audio recording (human or synthetic)
- Final master production
- Distribution

---

### 5.3 MCP Spine (Integration Layer)

#### Purpose
Provide **controlled, auditable access** to Creator OS for multiple AI models and tools.

#### Architecture Philosophy

**Remote-First**
- MCP servers run as separate services
- Not embedded in client applications
- Scalable, maintainable, secure

**Proposal-Based Modification**
- All destructive actions create proposals
- Proposals must pass validation gates
- Creator explicitly approves canon changes

#### MCP Resources (Read-Only)

Resources expose **safe, inspectable views** of system state.

```
story://project/{id}/canon
story://project/{id}/drafts
story://scene/{id}/narrative
story://scene/{id}/audio
story://chapter/{id}/recording_packet
story://character/{id}/knowledge_state
story://character/{id}/voice_profile
story://event/{id}/dependencies
story://promise/{id}/status
```

**Example Resource Response:**
```json
{
  "uri": "story://scene/ch3-s2/narrative",
  "mimeType": "application/json",
  "content": {
    "sceneId": "ch3-s2",
    "events": ["evt-127", "evt-128"],
    "participants": ["char-alice", "char-bob"],
    "text": "...",
    "canonStatus": "canon"
  }
}
```

#### MCP Tools (Proposal-Based)

Tools enable **atomic, scoped actions** that create proposals.

**Core Tools:**

```typescript
// Propose a change to existing scene
scene.propose_patch({
  sceneId: string,
  changes: Patch[],
  reason: string
})

// Propose new event
event.propose_add({
  event: Event,
  dependencies: EventId[]
})

// Check continuity
continuity.check({
  scope: 'scene' | 'chapter' | 'book' | 'universe',
  targetId: string
})

// Semantic diff between versions
diff.semantic({
  versionA: string,
  versionB: string,
  outputFormat: 'narrative' | 'technical'
})

// Audit for listener confusion
listener_confusion.audit({
  sceneId: string,
  checkTypes: ['attribution', 'naming', 'context']
})

// Generate audio packet
audio_packet.generate({
  chapterId: string,
  voiceProfileId: string
})
```

#### Canon Gate Workflow

All canon-affecting changes follow this flow:

```
1. AI (or creator) calls tool to propose change
2. Proposal created with ID
3. System runs validation:
   - Continuity check
   - Dependency analysis
   - Promise impact assessment
   - Listener confusion audit
4. Results presented to creator
5. Creator approves, modifies, or rejects
6. On approval, proposal applies to canon
```

**Example Flow:**
```typescript
// Step 1: Propose change
const proposal = await mcp.tools.scene.propose_patch({
  sceneId: 'ch5-s3',
  changes: [{ type: 'replace', path: '/events/2/description', value: '...' }],
  reason: 'Clarify motivation for character action'
});

// Step 2: System validates
const validation = await proposal.validate();

// Step 3: Present to creator
console.log(validation.continuityIssues);  // []
console.log(validation.impactedPromises);  // [promise-42]
console.log(validation.listenerConfusion); // { score: 0.2, issues: [] }

// Step 4: Creator decision
if (creatorApproves) {
  await proposal.apply();  // Now part of canon
}
```

#### MCP Scopes

Fine-grained permission system:

- `read:story` - Read narrative state
- `read:audio` - Read audio production data
- `write:draft` - Create/modify drafts
- `write:proposal` - Create proposals for canon changes
- `analyze:continuity` - Run continuity checks
- `analyze:confusion` - Run listener audits
- `apply:canon` - Apply proposals to canon (creator only)

#### Multi-Model Support

Different AI models for different tasks:

| Task | Model | Why |
|------|-------|-----|
| Continuity checking | Claude Opus | Deep reasoning |
| Audio scene generation | Claude Sonnet | Balance of quality & speed |
| Quick lookups | Claude Haiku | Speed, cost efficiency |
| Semantic embedding | Voyage | Similarity search |

All models access system via same MCP interface.

---

## 6. Data Architecture

### 6.1 Narrative Database

**Purpose:** Store canonical story state

**Schema Concepts:**

```sql
-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  canon_status VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event dependencies (DAG edges)
CREATE TABLE event_dependencies (
  event_id UUID REFERENCES events(id),
  depends_on_event_id UUID REFERENCES events(id),
  PRIMARY KEY (event_id, depends_on_event_id)
);

-- Knowledge states
CREATE TABLE knowledge_states (
  id UUID PRIMARY KEY,
  character_id UUID NOT NULL,
  event_id UUID REFERENCES events(id),
  learned_at TIMESTAMPTZ NOT NULL,
  certainty VARCHAR(20) NOT NULL,
  source VARCHAR(50) NOT NULL
);

-- Promises
CREATE TABLE promises (
  id UUID PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  established_in_scene UUID NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  fulfilled_in_scene UUID
);

-- Scenes (derived from events)
CREATE TABLE scenes (
  id UUID PRIMARY KEY,
  chapter_id UUID NOT NULL,
  sequence_order INTEGER NOT NULL,
  narrative_text TEXT,
  canon_status VARCHAR(20) NOT NULL
);

-- Scene events (many-to-many)
CREATE TABLE scene_events (
  scene_id UUID REFERENCES scenes(id),
  event_id UUID REFERENCES events(id),
  PRIMARY KEY (scene_id, event_id)
);
```

### 6.2 Audio Storage

**Purpose:** Store produced audio files and metadata

**Structure:**
- Master audio files in object storage (R2, S3)
- Metadata in relational database
- CDN for delivery

For storage path and CDN delivery details, see [docs/audio_storage_conventions.md](./docs/audio_storage_conventions.md).

```sql
-- Audio masters
CREATE TABLE audio_masters (
  id UUID PRIMARY KEY,
  chapter_id UUID NOT NULL,
  storage_path TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  format VARCHAR(20) NOT NULL,
  sample_rate INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audio scene objects
CREATE TABLE audio_scene_objects (
  id UUID PRIMARY KEY,
  scene_id UUID REFERENCES scenes(id),
  narration_text TEXT NOT NULL,
  voice_profile_id UUID NOT NULL,
  beat_markers JSONB NOT NULL,
  emotional_envelope JSONB NOT NULL
);
```

### 6.3 Listener Database

**Purpose:** Manage listener accounts and entitlements

**Strict Separation:** Completely separate from Creator OS data

```sql
-- Listener accounts
CREATE TABLE listeners (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entitlements
CREATE TABLE entitlements (
  id UUID PRIMARY KEY,
  listener_id UUID REFERENCES listeners(id),
  entitlement_type VARCHAR(50) NOT NULL,  -- 'founders_lifetime'
  granted_at TIMESTAMPTZ NOT NULL,
  stripe_payment_intent_id VARCHAR(255)
);

-- Playback progress
CREATE TABLE playback_progress (
  listener_id UUID REFERENCES listeners(id),
  chapter_id UUID NOT NULL,
  position_seconds INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (listener_id, chapter_id)
);
```

### 6.4 Data Flow

```
Creator OS → Narrative DB (events, canon)
          ↓
     Audio Engine
          ↓
     Audio Storage (masters)
          ↓
     Publish API
          ↓
     Listener Platform (read-only audio access)
```

**Critical Principle:** Listener Platform never writes to Creator OS data.

---

## 7. Audiobook Production Pipeline

### 7.1 End-to-End Workflow

```
1. Narrative Finalization
   ├─ Events canonized
   ├─ Dependencies validated
   └─ Canon gate passed
          ↓
2. Audio Scene Generation
   ├─ Text optimized for listening
   ├─ Beat markers added
   ├─ Attribution clarified
   └─ Listener confusion audit
          ↓
3. Continuity Validation
   ├─ Character knowledge checked
   ├─ Promise tracking updated
   └─ Cross-reference verification
          ↓
4. Voice Profile Application
   ├─ Voice profile selected
   ├─ Emotional envelope applied
   └─ Pacing adjusted
          ↓
5. Recording Packet Export
   ├─ Complete recording instructions
   ├─ Context provided
   └─ Production notes included
          ↓
6. Audio Recording
   ├─ Human narration OR
   └─ Synthetic voice generation
          ↓
7. Master Audio Production
   ├─ Editing & cleanup
   ├─ Mastering for streaming
   └─ Quality check
          ↓
8. Publication
   ├─ Upload to audio storage
   ├─ CDN distribution
   └─ Make available to listeners
```

### 7.2 Quality Gates

Each stage has explicit quality gates:

| Stage | Gate | Failure Action |
|-------|------|----------------|
| Narrative | No unresolved dependencies | Block audio generation |
| Audio Scene | Listener confusion score < 0.3 | Revise attribution/clarity |
| Continuity | No promise violations | Flag for creator review |
| Recording | Production notes complete | Cannot export packet |
| Master | Meets technical specs | Reject and remaster |
| Publish | Entitlement logic correct | Block publication |

### 7.3 Audio Scene Object Example

```json
{
  "sceneId": "ch3-s5",
  "narrationText": "Alice hesitated at the threshold. [PAUSE:MED] She'd been here before—but not like this. [EMPHASIS] Not while he was watching.",
  "beatMarkers": [
    { "position": 34, "type": "pause", "duration": 0.8 },
    { "position": 82, "type": "emphasis", "intensity": 0.7 }
  ],
  "emotionalEnvelope": [
    { "position": 0, "emotion": "tense", "intensity": 0.6 },
    { "position": 50, "emotion": "uncertain", "intensity": 0.8 }
  ],
  "povAnchor": "char-alice",
  "dialogueAttribution": {},
  "listenerCognitionSafeguards": [
    "Character 'he' refers to Bob, established in ch3-s3",
    "Location context: outside Bob's apartment"
  ],
  "voiceProfileId": "voice-intimate-thriller"
}
```

---

## 8. Listener Platform

### 8.1 Purpose

Deliver a **premium, distraction-free audiobook experience** to paid listeners.

### 8.2 Core Features (MVP)

**Public Pages**
- Landing page with audio trailer
- Story overview page
- About page
- Founders checkout

**Authenticated Pages**
- Library (all available chapters)
- Chapter player with resume
- Account page (shows Founders status)

### 8.3 Access Model

**Founders Lifetime Membership**
- **Price:** $49 (one-time payment)
- **Access:** Permanent access to all current and future audiobooks in this universe
- **Non-transferable:** Tied to individual account
- **No tiers:** Single access level

**Why This Model?**
- Aligns creator and listener long-term
- No recurring billing complexity
- Builds committed community
- Funds development without subscription pressure

### 8.4 Technology Stack

**Frontend**
- Next.js (React framework)
- Tailwind CSS
- Audio player: HTML5 Audio with custom controls

**Backend**
- Next.js API routes
- Serverless functions

**Authentication**
- Supabase Auth (email-first)

**Payments**
- Stripe Checkout
- One-time payment intent

**Storage & CDN**
- Cloudflare R2 (object storage)
- Cloudflare CDN (audio delivery)

**Database**
- PostgreSQL (via Supabase)

### 8.5 Website Structure

```
/                         → Landing page
/story                    → Story overview
/about                    → About creator
/founders                 → Founders checkout
/login                    → Email auth
/library                  → [AUTH] All chapters
/listen/:chapterId        → [AUTH] Chapter player
/account                  → [AUTH] Account details
```

### 8.6 Audio Delivery Architecture

**Replit-Native Approach:**
```
User Request
    ↓
Next.js API Route (auth + entitlement check)
    ↓
Generate Signed URL (Replit Object Storage)
    ↓
Return URL to Client
    ↓
Browser fetches from Replit CDN
    ↓
Streaming playback
```

**Alternative (if Replit bandwidth becomes limiting):**
```
User Request
    ↓
Next.js API Route (Replit)
    ↓
Generate Signed URL (Cloudflare R2/AWS S3)
    ↓
Return URL to Client
    ↓
Browser fetches from CDN
    ↓
Streaming playback
```

**Key Points:**
- Start with Replit Object Storage for simplicity
- Backend never streams audio directly
- Signed URLs expire (e.g., 1 hour)
- Monitor bandwidth costs and switch to external CDN if needed
- Position tracking via API (stored in Replit PostgreSQL)

### 8.7 Marketing: Hybrid Audio Trailer

**Structure:**
1. **Out-of-world framing** (15-20s)
   - "Before you hear the story..."
   - Set tone, context
2. **Seamless transition**
   - No jarring break
3. **In-world excerpt** (60-80s)
   - Best representative scene
   - High-quality narration
4. **Soft close**
   - Natural ending point
   - No hard sell, just invitation

**Purpose:**
- Demonstrate audio quality
- Set atmospheric tone
- Convert through experience, not hype

---

## 9. Technology Stack

### 9.1 Creator OS (Private)

**Language:** TypeScript (Node.js)

**Frameworks:**
- Backend: Express or Fastify (Replit-hosted)
- MCP: Anthropic Agent SDK

**Database:**
- **Replit Database** (for early prototyping and small-scale data)
- **Replit PostgreSQL** (for structured narrative data, events, canon)
- Upgrade path to external PostgreSQL if needed

**AI Integration:**
- Anthropic API (Claude models)
- Voyage API (embeddings)

**Development:**
- MCP Inspector for debugging
- Jest for testing
- Replit's built-in development environment

### 9.2 Listener Platform (Public)

**Frontend:**
- Next.js 14+ (App Router) hosted on Replit
- React 18+
- Tailwind CSS
- Radix UI (accessible components)

**Backend:**
- Next.js API Routes (Replit-hosted)
- Node.js server functions

**Database:**
- **Replit PostgreSQL** (listener accounts, entitlements, playback state)
- Separate database from Creator OS for security

**Authentication:**
- **Replit Auth** (for initial MVP) OR
- Supabase Auth (if more features needed)
- Email-first authentication

**Payments:**
- Stripe Checkout
- Stripe Webhooks (for entitlement grants)
- Webhook endpoint hosted on Replit

**Storage:**
- **Replit Object Storage** (audio files) - Primary
- **Fallback:** Cloudflare R2 or AWS S3 if scale demands
- CDN: Use Replit's built-in CDN capabilities first

### 9.3 Infrastructure

**Hosting:**
- **Replit Deployments** (both Creator OS and Listener Platform)
- Single platform for all services
- Simplified deployment and management

**Replit-Native Features to Leverage:**
- Always-on deployments
- Built-in secrets management
- Environment variables
- Automatic HTTPS
- Web server routing

**Monitoring:**
- Replit's built-in logs and monitoring
- Sentry (optional, for advanced error tracking)
- Unified error taxonomy and severity table (see [docs/error_taxonomy.md](./docs/error_taxonomy.md))

**CI/CD:**
- Replit's automatic deployments from GitHub
- GitHub Actions (optional, for testing)

### 9.4 Development Tools

- **Replit IDE:** Primary development environment
- **MCP Inspector:** Debug MCP server interactions
- **Replit Database Viewer:** Inspect Replit DB and PostgreSQL
- **API Client:** Bruno, Postman, or Replit's built-in HTTP client
- **Audio Tools:** Audacity or Adobe Audition

### 9.5 Replit-Specific Architecture Considerations

**Why Start with Replit:**
- Zero infrastructure configuration
- Fast iteration and deployment
- Built-in database and storage
- Automatic scaling (within limits)
- Cost-effective for early stage
- Easy secrets management

**Upgrade Path:**
- Start with Replit native services
- Monitor performance and scale metrics
- Migrate specific services to dedicated hosting if needed:
  - Audio storage → Cloudflare R2 (if bandwidth becomes expensive)
  - Database → Managed PostgreSQL (if Replit limits reached)
  - Frontend → Vercel (if need edge functions)

**Replit Limitations to Monitor:**
- Audio file storage limits
- Database size and connection limits
- Bandwidth costs at scale
- Cold start times for free tier

**Architecture Optimized for Replit:**
```
┌─────────────────────────────────────────────────────┐
│              Replit Deployment                      │
│                                                      │
│  ┌────────────────────────────────────────────┐   │
│  │         Next.js Application                 │   │
│  │  ├─ Public Pages (Marketing, Landing)      │   │
│  │  ├─ Auth Pages (Login, Signup)             │   │
│  │  └─ Authenticated Pages (Library, Player)  │   │
│  └────────────────────────────────────────────┘   │
│                                                      │
│  ┌────────────────────────────────────────────┐   │
│  │         API Routes (Backend)                │   │
│  │  ├─ Auth endpoints                          │   │
│  │  ├─ Payment webhooks (Stripe)              │   │
│  │  ├─ Audio delivery (signed URLs)           │   │
│  │  └─ Playback tracking                       │   │
│  └────────────────────────────────────────────┘   │
│                                                      │
│  ┌────────────────────────────────────────────┐   │
│  │    Creator OS Backend (MCP Server)          │   │
│  │  ├─ Narrative Engine                        │   │
│  │  ├─ Audio Engine                            │   │
│  │  └─ MCP Spine                               │   │
│  └────────────────────────────────────────────┘   │
│                                                      │
│  ┌─────────────┐  ┌──────────────┐              │
│  │   Replit    │  │    Replit    │              │
│  │  PostgreSQL │  │   Object     │              │
│  │  (Databases)│  │   Storage    │              │
│  └─────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────┘
```

---

## 10. Security & Privacy

### 10.1 Threat Model

**Threats to Mitigate:**

1. **Unauthorized Audio Access**
   - Listeners sharing signed URLs
   - Non-paying users accessing content

2. **Payment Fraud**
   - Fake Stripe webhooks
   - Replay attacks

3. **Creator OS Exposure**
   - Accidental public exposure of creator tools
   - Unauthorized MCP access

4. **Data Leaks**
   - Listener personal info exposure
   - Unreleased story content leaks

### 10.2 Security Measures

**Authentication & Authorization**
- Supabase Auth with email verification
- JWT tokens for session management
- Entitlement checks on every audio request

**Signed URLs**
- Time-limited (1 hour expiry)
- Scoped to specific chapter
- Non-transferable (tied to session)

**Webhook Validation**
- Verify Stripe signature
- Idempotency checks
- Log all webhook events

**MCP Security**
- Scoped permissions per model
- Creator-only `apply:canon` scope
- Audit log of all proposals

**Data Separation**
- Creator OS and Listener Platform in separate databases
- No shared secrets
- API key rotation

### 10.3 Privacy

**Data Collection (Minimal):**
- Email for authentication
- Stripe payment info (not stored, tokenized)
- Playback position (for resume feature)
- No tracking, analytics, or third-party scripts

**Data Retention:**
- Account deletion removes all personal data
- Playback history deleted after 90 days of inactivity
- Payment records retained per legal requirements

---

## 11. Scalability & Performance

### 11.1 Scaling Strategy

**Phase 1: Founders Launch (0-500 listeners)**
- Single Replit deployment
- Replit PostgreSQL (single instance)
- Replit Object Storage + built-in CDN

**Phase 2: Growth (500-5,000 listeners)**
- Replit auto-scaling (if available on plan)
- Monitor database performance
- Consider read replicas if needed
- Evaluate external CDN (Cloudflare/AWS) if bandwidth costs spike

**Phase 3: Scale (5,000+ listeners)**
- Migrate audio storage to Cloudflare R2 or AWS S3
- Dedicated PostgreSQL instance (external)
- Database connection pooling
- Multi-region CDN
- Consider frontend migration to Vercel/edge functions

### 11.2 Performance Targets

| Metric | Target |
|--------|--------|
| Landing page load | < 2s |
| Player start time | < 1s |
| Audio buffer time | < 500ms |
| API response time | < 200ms |
| Database query time | < 100ms |

### 11.3 Bottleneck Analysis

**Potential Bottlenecks:**
1. **Audio streaming bandwidth** → Solved by CDN
2. **Database connections** → Use connection pooling
3. **Signed URL generation** → Cache for session duration
4. **Stripe webhook processing** → Queue-based processing

---

## 12. Implementation Roadmap

### Phase 1: Foundation (Months 1-2)

**Tracking Note:** System-wide build/test/diagram checklists live in [SYSTEM_TODO.md](SYSTEM_TODO.md).

**Narrative Engine Core**
- [ ] Event model implementation
- [ ] Dependency graph system
- [ ] Canon vs. draft separation
- [ ] Basic continuity checking

**MCP Spine Setup**
- [ ] MCP server skeleton
- [ ] Resource endpoints (read-only)
- [ ] Basic tool: `continuity.check`
- [ ] Scope-based permissions
- [ ] Reference full MCP Spine checklist in SYSTEM_TODO.md for detailed tasks

**Database Schema**
- [ ] Narrative database (events, scenes)
- [ ] Listener database (accounts, entitlements)
- [ ] Audio metadata schema

### Phase 2: Audio Engine (Months 2-3)

**Audio Scene Objects**
- [ ] Audio scene model
- [ ] Beat marker system
- [ ] Voice profile definition
- [ ] Recording packet export

**MCP Audio Tools**
- [ ] Tool: `audio_packet.generate`
- [ ] Tool: `listener_confusion.audit`
- [ ] Resource: `story://scene/{id}/audio`

**Audio Production Workflow**
- [ ] Quality gates definition
- [ ] Export format specification
- [ ] Integration with recording process

### Phase 3: Listener Platform (Months 3-4)

**Public Website**
- [ ] Landing page
- [ ] Audio trailer embed
- [ ] Story overview page
- [ ] About page

**Authentication**
- [ ] Supabase Auth integration
- [ ] Email verification flow
- [ ] Session management

**Payments**
- [ ] Stripe Checkout integration
- [ ] Webhook handling
- [ ] Entitlement grants

**Audio Player**
- [ ] HTML5 audio player
- [ ] Playback controls
- [ ] Resume functionality
- [ ] Position tracking

### Phase 4: Integration & Polish (Month 4-5)

**Content Publishing Pipeline**
- [ ] Creator OS → Audio Storage
- [ ] Audio Storage → CDN
- [ ] Publish toggle in admin

**Testing & QA**
- [ ] End-to-end tests
- [ ] Payment flow testing
- [ ] Audio delivery testing
- [ ] Security audit

**Documentation**
- [ ] Creator OS user guide
- [ ] API documentation
- [ ] Deployment runbooks

### Phase 5: Founders Launch (Month 5-6)

**Pre-Launch**
- [ ] Beta testing with small group
- [ ] Bug fixes and refinements
- [ ] Content preparation (first chapters)

**Launch**
- [ ] Public website live
- [ ] Founders membership open
- [ ] First audiobook chapters published

**Post-Launch**
- [ ] Monitor performance
- [ ] Gather feedback
- [ ] Iterate based on learnings

---

## 13. Open Questions & Future Considerations

### 13.1 Open Questions

1. **Audio Recording:**
   - Human narrator vs. synthetic voice?
   - If synthetic, which TTS provider?
   - Hybrid approach?

2. **Content Velocity:**
   - How many chapters to launch with?
   - Publication cadence?

3. **Community Features:**
   - Should there be listener forums/comments?
   - Or keep it pure content delivery?

4. **Mobile App:**
   - Launch web-only, or plan for native apps?
   - Progressive Web App sufficient?

5. **Multi-Series Future:**
   - Will there be multiple story universes?
   - How does Founders membership extend?

### 13.2 Future Enhancements

**Advanced AI Features**
- AI-assisted event graph visualization
- Automated "what if" scenario exploration
- Predictive continuity warnings

**Enhanced Audio**
- Multiple narrator options
- Sound effects and music integration
- Spatial audio support

**Reader Engagement**
- Optional chapter discussions
- Behind-the-scenes creator notes
- Exclusive bonus content for Founders

**Analytics**
- Listener engagement metrics
- Drop-off analysis
- Popular chapters/moments

**Mobile Native**
- iOS and Android apps
- Offline download support
- CarPlay / Android Auto integration

### 13.3 Long-Term Vision

Over 5-10 years, NAOS becomes:

1. **A Personal Narrative Memory**
   - Accumulates years of story state
   - AI with deep institutional knowledge
   - Continuity assistance across decades

2. **A Multi-Model Creative Control Room**
   - Different AI models for different tasks
   - Seamless model switching
   - Always using best tool for the job

3. **A Durable Platform for Living Universes**
   - Stories that span generations
   - Consistent quality over time
   - Listeners grow with the story

**This is a system designed to outlive tools, models, and trends.**

---

## 14. Appendix: Key Definitions

**Canon:** Immutable, published story truth that defines what "really happened"

**Event:** Atomic unit of story state; a thing that happened at a specific time with specific participants

**Knowledge State:** Record of who knows what information, when they learned it, and how certain they are

**Promise:** Explicit or implicit commitment made to listeners that must be tracked and fulfilled

**Audio Scene Object:** Performance-ready text with annotations for narration (beat markers, emotional cues, etc.)

**Recording Packet:** Complete package for audio recording session, including scenes, voice profile, and production notes

**MCP (Model Context Protocol):** Standard protocol for AI model integration, providing Resources, Tools, and Prompts

**Proposal:** Suggested change to canon that must pass validation gates before application

**Canon Gate:** Validation checkpoint that enforces continuity and promise-keeping before allowing canon changes

**Founders Lifetime Membership:** $49 one-time payment granting permanent access to all story universe content

---

## 15. Document Maintenance

This document should be updated when:
- Architecture decisions are made
- Technology choices are finalized
- Implementation reveals new insights
- System capabilities expand

**Maintainer:** Creator (Nate Johnson)
**Review Cadence:** Monthly during active development
**Version Control:** Track in git alongside code

---

**End of Architecture Document**

*This system is designed for the long term. Every decision prioritizes sustainability, clarity, and creator autonomy over short-term convenience.*
