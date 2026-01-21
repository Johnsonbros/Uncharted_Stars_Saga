# Uncharted Stars Saga

> **A Narrative & Audio Operating System for Long-Running Story Universes**

## Overview

Uncharted Stars Saga is reimagined as **NAOS (Narrative & Audio Operating System)** - a solo-author, audiobook-first platform for creating and publishing living story universes. This is not a writing app. It is a **story simulation engine** with institutional memory, multi-model AI orchestration, and premium audiobook delivery.

### What This System Is

NAOS is designed as an **all-inclusive storytelling business platform** that combines:
- A **marketing website** and audience funnel for driving discovery and viewership
- A **ChatKit-enabled frontend** for interactive engagement
- An **Agent SDK-driven backend** for AI-assisted authoring and production workflows
- **Ebook + audiobook publishing** with clean streaming and reading experiences
- **Single-tier paid access** for published content via Stripe

### Why It Exists

This system exists to unify everything a solo creator needs to **launch, grow, and sustain** a long-running story universe:
- Reduce tool sprawl by consolidating marketing, publishing, and AI workflows
- Keep **ownership and control** over distribution, payments, and data
- Support **audiobook-first delivery** while maintaining readable ebook formats
- Enable **collaborative creation** without losing canon integrity or security

## The NAOS Vision

**Traditional platforms treat stories as documents. NAOS treats stories as state.**

NAOS enables a single creator to:
- Build **long-running story universes** that span years or decades
- Create **audiobook-native content** optimized for listening (not text-to-audio adaptation)
- Maintain **narrative consistency** through AI-enforced canon management
- Publish directly to a **dedicated listener community** via a $49 Founders Lifetime membership
- Leverage **multiple AI models** for different creative tasks via MCP integration

## Why NAOS is Different

| Traditional Platform | NAOS Approach |
|---------------------|---------------|
| Text-first, audio adapted | Audio-first, text as supporting view |
| Document-based writing | State-based story simulation (events, dependencies) |
| Manual continuity tracking | AI-enforced canon gates |
| Multi-author SaaS | Solo-author, long-horizon |
| Subscription tiers | Single $49 Founders Lifetime membership |
| Tools for writing | Operating system for narrative |

## Core Components

### 📖 Narrative Engine (Private)

The **authoritative source of truth** for story state:
- **Events**: Atomic units of "what happened" forming a directed acyclic graph
- **Knowledge States**: Track who knows what information, when
- **Promises**: Explicit commitments to listeners that must be fulfilled
- **Canon Management**: Immutable published truth vs. mutable exploration space
- **Dependency Graph**: Causal relationships between story events
- **Continuity Validation**: AI-assisted detection of contradictions

### 🎙️ Audio Engine (Private)

Transform narrative state into **performance-ready audio artifacts**:
- **Audio Scene Objects**: Performance-ready text with narration annotations
- **Beat Markers**: Pacing cues, pauses, emphasis for narration
- **Voice Profiles**: Consistent narrator characteristics across content
- **Recording Packets**: Complete packages for recording sessions
- **Listener Cognition Safeguards**: Prevent confusion in audio-only medium
- **Emotional Envelopes**: Guide emotional arc of performance

### 🔌 MCP Spine (Integration Layer)

**Controlled AI model access** via Model Context Protocol:
- **Resources**: Read-only views of narrative state
- **Tools**: Proposal-based modifications with validation gates
- **Canon Gates**: All changes must pass explicit validation before canonization
- **Multi-Model Support**: Different AI models for different tasks
- **Institutional Memory**: AI as long-term creative assistant
- **Scoped Permissions**: Fine-grained access control
- **Implementation Checklist**: See `SYSTEM_TODO.md` → MCP Spine for the detailed task list

### 🧠 Agentic Backend (Authoring + Operations)

The backend orchestrates AI and workflow services with fine-grained access control:
- **Agent SDK orchestration** for multi-step authoring, editing, and publishing flows
- **Multi-point MCP usage** to connect third-party services and internal tools
- **Remote MCP server** for writing and committing story content into the system
- **Generated auth keys** for scoped access (series, book, chapter, scene)
- **Future multi-tenant support** for editors or co-authors with custom permissions
- **Admin dashboard** for monitoring operations, usage, and publishing status

### 🎧 Listener Platform (Public)

**Premium audiobook delivery** for paid community:
- **Marketing Website**: Landing pages with audio trailer
- **Founders Membership**: $49 one-time lifetime access
- **Audiobook Player**: Web-based streaming with resume functionality
- **Library Interface**: Access to all published chapters
- **Clean Experience**: No ads, tracking, or distractions
- **Mobile-Friendly**: Responsive web design (native apps future consideration)

### 🔐 Access, Payments, and Content Delivery

- **Middleware for auth** to protect paid content and personalize access
- **Stripe payments** for a single-tier membership or lifetime access
- **Streaming audiobook delivery** with a frictionless player experience
- **Readable ebook views** with simple formatting for web consumption
- **Customer database** for member access, entitlements, and engagement tracking
## Storage & Data Strategy

The system needs **both high-level and granular storage** to support authoring and delivery:
- **High-level storage** for published books, audio masters, and public metadata
- **Granular storage** for scenes, beats, edits, and AI-generated artifacts
- **Customer data storage** for access control, payments, and communications

### 💳 Business Model

- **Single Tier**: $49 Founders Lifetime Membership
- **Permanent Access**: All current and future content in universe
- **Direct Relationship**: Creator-to-listener, no middlemen
- **Long-Term Alignment**: One-time payment aligns incentives
- **Community Building**: Committed listeners vs. transient subscribers

## Technology Stack

> **Status**: Architecture defined - See [ARCHITECTURE.md](./ARCHITECTURE.md) for details

**Platform:** Replit (all-in-one hosting and development)

**Core Technologies:**
- **Frontend**: Next.js 14+ (React) with Tailwind CSS
- **Backend**: Node.js with Express/Fastify
- **AI/ML**: Anthropic Claude via Agent SDK with MCP servers
- **Database**: Replit PostgreSQL (separate DBs for Creator OS and Listener Platform)
- **Storage**: Replit Object Storage (audio files with CDN delivery)
- **Auth**: Replit Auth or Supabase Auth
- **Payments**: Stripe Checkout and webhooks

**Why Replit:**
- Zero infrastructure configuration
- Built-in database and object storage
- Automatic deployments and HTTPS
- Secrets management
- Cost-effective for early stage
- Clear upgrade path to external services as scale demands

## System Architecture

> **Full details in [ARCHITECTURE.md](./ARCHITECTURE.md)**

```
┌────────────────────────────────────────────────────────────┐
│                    LISTENER PLATFORM                        │
│                  (Public - Next.js on Replit)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Marketing  │  │   Auth &     │  │   Audiobook  │    │
│  │   Website    │  │   Payments   │  │   Player     │    │
│  │   + Trailer  │  │   (Stripe)   │  │  (Streaming) │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────┬───────────────────────────────┘
                             │
                             │ Content Publish API
                             │
┌────────────────────────────┴───────────────────────────────┐
│                CREATOR OPERATING SYSTEM                     │
│                   (Private - Replit)                        │
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
│  │  - Events & Dependencies│   │  - Audio Scenes       │  │
│  │  - Knowledge States     │   │  - Voice Profiles     │  │
│  │  - Canon Management     │   │  - Beat Markers       │  │
│  │  - Promises Tracking    │   │  - Recording Packets  │  │
│  └────────────────────────┘   └───────────────────────┘  │
└─────────────────────────┬──────────────────────────────────┘
                          │
┌─────────────────────────┴──────────────────────────────────┐
│                  REPLIT DATA LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Narrative  │  │    Audio     │  │   Listener   │    │
│  │   PostgreSQL │  │   Object     │  │  PostgreSQL  │    │
│  │  (Events,    │  │   Storage    │  │ (Accounts,   │    │
│  │   Canon)     │  │  (Masters)   │  │ Entitlements)│    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘
```

**Key Separation:** Creator tools and listener platform are completely decoupled. Content flows one-way from Creator OS to Listener Platform.

## Who Is NAOS For?

### The Solo Author Building a Universe

NAOS is optimized for a single creator who:
- Is writing **serialized fiction** over years or decades
- Wants **audiobook-first** production (not text adapted to audio)
- Needs **AI assistance** for continuity and memory, not ghostwriting
- Values **direct relationship** with a dedicated listener community
- Is building a **living story universe** that evolves over time
- Wants to **own the platform** and relationship with audience

### Not For
- Multi-author collaborative teams (by design - solo-first)
- Quick one-off book projects (built for long-horizon)
- Traditional ebook-only publishing
- Mass-market SaaS platform needs

## Implementation Roadmap

> **Detailed roadmap in [ARCHITECTURE.md](./ARCHITECTURE.md#12-implementation-roadmap)**

### Phase 1: Foundation (Months 1-2) - Current
- [x] Architecture definition (NAOS specification)
- [x] Technology stack selection (Replit + Next.js)
- [ ] Narrative Engine core (events, canon, dependencies)
- [ ] MCP Spine setup (resources, basic tools)
- [ ] Database schemas (narrative, audio, listener)

### Phase 2: Audio Engine (Months 2-3)
- [ ] Audio Scene Objects model
- [ ] Beat markers and voice profiles
- [ ] Recording packet generation
- [ ] MCP audio tools
- [ ] Listener confusion audits

### Phase 3: Listener Platform (Months 3-4)
- [ ] Public website (landing, trailer, story pages)
- [ ] Authentication (Replit Auth / Supabase)
- [ ] Stripe integration (checkout + webhooks)
- [ ] Audiobook player (streaming, resume)
- [ ] Library interface

### Phase 4: Integration & Polish (Months 4-5)
- [ ] Content publishing pipeline
- [ ] End-to-end testing
- [ ] Security audit
- [ ] Documentation (user guides, API docs)
- [ ] Performance optimization

### Phase 5: Founders Launch (Month 5-6)
- [ ] Beta testing with small group
- [ ] Bug fixes and refinements
- [ ] First chapters prepared and published
- [ ] Public launch of Founders membership
- [ ] Post-launch monitoring and iteration

### Long-Term Vision (Years 1-5+)
- Accumulate years of story state and institutional memory
- Multi-model creative control room
- Platform for living story universes across decades
- Mobile native apps (iOS, Android)
- Enhanced AI features (scenario exploration, visualization)
- Community features (optional discussions, bonus content)

## Getting Started

> **Note**: NAOS is in Phase 1 (Foundation). Setup instructions will be added as components are implemented.

**For Developers:**
1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for complete system design
2. Review [SYSTEM_TODO.md](./SYSTEM_TODO.md) for the system-wide build/test/diagram checklist
3. Review [CLAUDE.md](./CLAUDE.md) for development guidelines
4. Check [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for testing approach

**Development Environment:**
- Primary: Replit (all-in-one development and hosting)
- Version Control: GitHub
- AI Development: Claude Code CLI with MCP integration

## Contributing

This is a solo-author project. The repository follows a feature-branch workflow managed primarily via Claude Code. See [CLAUDE.md](./CLAUDE.md) for detailed AI assistant guidelines.

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Complete NAOS system architecture and design
- **[SYSTEM_TODO.md](./SYSTEM_TODO.md)**: System-wide TODOs, tests, diagrams, and traceability checklists
- **[docs/incident_response_flow.md](./docs/incident_response_flow.md)**: Incident response flowchart for tracing and resolving errors
- **[docs/narrative_engine_diagrams.md](./docs/narrative_engine_diagrams.md)**: Narrative event DAG and canon gate flow diagrams
- **[docs/auto_scene_generation_pipeline.md](./docs/auto_scene_generation_pipeline.md)**: Auto scene generation pipeline flowchart
- **[docs/listener_confusion_audit_decision_tree.md](./docs/listener_confusion_audit_decision_tree.md)**: Listener confusion audit decision tree
- **[CLAUDE.md](./CLAUDE.md)**: AI assistant guide for development
- **[TESTING_STRATEGY.md](./TESTING_STRATEGY.md)**: Testing approach and best practices
- **[docs/audio_storage_conventions.md](./docs/audio_storage_conventions.md)**: Audio storage paths, metadata, and CDN delivery contract
- **[docs/error_taxonomy.md](./docs/error_taxonomy.md)**: Unified error taxonomy, severity table, and ownership rules

## Project Status

**Current Phase**: Phase 1 - Foundation (Architecture Definition)
**Last Updated**: 2026-01-20
**Status**: ✅ NAOS architecture defined, ready for implementation
**Next Milestone**: Narrative Engine core implementation

## License

> **Status**: To be determined

## Contact

**Repository Owner**: Johnsonbros
**Project**: Uncharted Stars Saga

---

*A story simulation engine designed to outlive tools, models, and trends.*
