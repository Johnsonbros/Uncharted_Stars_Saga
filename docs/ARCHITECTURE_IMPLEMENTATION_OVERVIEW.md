# Architecture Implementation Overview

This document describes how the NAOS system architecture will be implemented at a high level. It translates the conceptual architecture into concrete, implementation-oriented structures without diving into code.

## Goals

- Provide a practical blueprint for implementation without locking into premature details.
- Establish clear boundaries and responsibilities for each layer.
- Define the primary data flows between creator tooling and listener delivery.
- Clarify deployment topology and system-level separation.

## System Layers and Responsibilities

### 1) Creator Operating System (Private)

**Purpose:** Authoring, canon governance, and audio production orchestration.

**Core subsystems:**
- **Narrative Engine:** Event graph, knowledge states, promises, canonization workflow.
- **Audio Engine:** Audio scene objects, beat markers, voice profiles, recording packets.
- **MCP Spine:** Managed AI access for analysis, proposal generation, and validation.

**Implementation notes:**
- Runs on a private surface (authenticated author-only).
- Exposes internal APIs for creator tools and MCP tooling.
- Persists to the Narrative DB and Audio storage only.

### 2) Listener Platform (Public)

**Purpose:** Marketing site, membership, and audiobook delivery.

**Core subsystems:**
- **Marketing/Discovery:** Landing pages, story marketing, audio trailer.
- **Access & Entitlements:** Membership verification and access gating.
- **Audiobook Player:** Streaming, resume, chapter navigation.

**Implementation notes:**
- Runs as a separate public application.
- Only reads from the Listener DB and Audio storage.
- Receives published content via a one-way publish pipeline.

### 3) Data Layer

**Purpose:** Persistence and storage with strict separation.

**Core stores:**
- **Narrative Database:** Events, canon state, knowledge, promises.
- **Listener Database:** Accounts, entitlements, playback state.
- **Audio Storage:** Master audio files + derived assets.

**Implementation notes:**
- Separate databases for narrative vs. listener data.
- Write paths are tightly scoped to their owning subsystem.
- Audio storage is write-once for masters and immutable after publish.

## High-Level Deployment Topology

```
Creator OS (private)                 Listener Platform (public)
┌───────────────────────────┐        ┌──────────────────────────┐
│ Narrative Engine          │        │ Marketing + Player       │
│ Audio Engine              │        │ Access + Entitlements    │
│ MCP Spine                 │        └─────────────┬────────────┘
└─────────────┬─────────────┘                      │
              │ Publish API (one-way)              │
              └─────────────────────────────────────┘
                          Data Layer
┌──────────────────────────────────────────────────────────────┐
│ Narrative DB     Listener DB     Audio Storage (CDN)         │
└──────────────────────────────────────────────────────────────┘
```

## Primary Data Flows

### Authoring Flow (Private)
1. Creator defines or revises narrative events.
2. MCP tools generate or validate proposals.
3. Narrative engine canonizes events and updates state.
4. Audio engine generates audio scene objects and recording packets.
5. Audio assets are recorded and stored in Audio storage.

### Publishing Flow (One-Way)
1. Canonized content is packaged into publish-ready artifacts.
2. Publish API writes listener-facing metadata into Listener DB.
3. Audio storage assets are referenced via immutable URLs.
4. Listener platform reads and serves content to paid users.

### Listener Flow (Public)
1. User purchases membership via checkout.
2. Listener DB issues entitlements.
3. Player streams audio from storage with resume tracking.

## Boundary Rules

- Creator OS never reads listener data.
- Listener platform never writes to narrative data.
- Only the Publish API writes data into listener-facing stores.
- Canonized narrative state is immutable for listeners once published.

## Implementation Phases (Architecture-Aligned)

1. **Foundation:** Narrative engine core + schema + basic MCP spine.
2. **Audio Engine:** Audio objects + voice profiles + recording packets.
3. **Listener Platform:** Marketing, auth, membership, player.
4. **Publish Pipeline:** One-way canonized publishing with auditing.
5. **Hardening:** Testing, security, observability, performance.

