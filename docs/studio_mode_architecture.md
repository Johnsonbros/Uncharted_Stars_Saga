# Studio Mode Architecture

> **Last Updated:** 2026-01-22
> **Status:** Design Phase
> **Innovation:** First real-time audio-directed AI story development system

## Table of Contents

1. [Overview](#overview)
2. [Core Innovation](#core-innovation)
3. [Technical Architecture](#technical-architecture)
4. [User Experience Flow](#user-experience-flow)
5. [Implementation Components](#implementation-components)
6. [Integration Points](#integration-points)
7. [Development Roadmap](#development-roadmap)
8. [Cost & Performance Considerations](#cost--performance-considerations)
9. [Future Enhancements](#future-enhancements)

---

## Overview

**Studio Mode** transforms audiobook creation into a real-time collaborative performance between creator and AI. Instead of writing text and converting to audio later, the creator acts as a **director**, providing live audio guidance while Claude performs the narration with adaptive character voices.

### Key Differentiator

Traditional audiobook workflow:
```
Write text → Review → Edit → TTS generation → Review audio → Publish
```

Studio Mode workflow:
```
Direct via audio → Claude narrates in real-time → Adjust on-the-fly → Session becomes audio scene object → Publish
```

This eliminates the writing-to-audio conversion gap and creates a more natural, performative creative process.

---

## Core Innovation

### The Director-Performer Paradigm

**User as Director:**
- Provides live audio direction during narration
- "More emphasis on that line"
- "Switch to Marcus's voice here"
- "Add a pause before revealing the twist"
- "Change the tone - he's lying"

**Claude as Adaptive Performer:**
- Narrates based on current narrative state
- Modulates voice for different characters
- Responds to director cues in real-time
- Maintains character consistency
- Applies beat markers automatically

**System as Stage Manager:**
- Feeds relevant context at the right moments
- Enforces canon guardrails
- Tracks session state
- Generates production-ready audio scene objects
- Validates listener cognition

### Why This Matters

1. **Natural Creative Flow:** Audio-first creators think in performance, not prose
2. **Immediate Feedback:** Hear the story as it develops, adjust instantly
3. **Voice-Native:** Character voices emerge naturally, not retrofitted
4. **Faster Production:** From idea to publishable audio in one session
5. **Institutional Memory:** AI remembers all canon details, creator focuses on direction

---

## Technical Architecture

### High-Level Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      Studio UI Layer                        │
│  (Audio Interface, Context Panel, Guardrail Status)         │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│              Session Orchestrator                           │
│  (Agent SDK, Conversation State, Tool Calling)              │
└─────┬──────────────────────┬──────────────────┬────────────┘
      │                      │                  │
┌─────▼─────────┐  ┌────────▼────────┐  ┌──────▼──────────┐
│  Real-Time    │  │  Context        │  │   Guardrails    │
│  Audio Layer  │  │  Manager        │  │   Engine        │
│               │  │                 │  │                 │
│ • OpenAI RT   │  │ • Prompt Cache  │  │ • Canon Gates   │
│ • Voice Mod   │  │ • RAG Retrieval │  │ • Validation    │
│ • Streaming   │  │ • Smart Assembly│  │ • Constraints   │
└───────────────┘  └─────────────────┘  └─────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
┌───────▼──────────┐              ┌──────────▼─────────┐
│  MCP Spine       │              │  NAOS Engines      │
│                  │              │                    │
│ • Resources      │              │ • Narrative Engine │
│ • Tools          │              │ • Audio Engine     │
│ • Proposals      │              │ • Validation       │
└──────────────────┘              └────────────────────┘
```

### Component Responsibilities

**1. Studio UI Layer**
- Audio input/output interface
- Real-time transcript display
- Context visibility (current scene, characters, knowledge states)
- Guardrail status indicators
- Quick edit controls (pause, retry, save checkpoint)

**2. Session Orchestrator**
- Manages multi-turn conversation with Claude
- Routes audio I/O to Real-Time Audio Layer
- Assembles context from Context Manager
- Enforces guardrails before allowing narration
- Converts session output to Audio Scene Objects
- Generates recording packets

**3. Real-Time Audio Layer**
- **Primary:** OpenAI Realtime API (voice-to-voice, lowest latency)
- **Alternative:** ElevenLabs TTS + Anthropic streaming
- Voice profile application and modulation
- Audio stream processing and recording
- Beat marker timing detection

**4. Context Manager**
- **Prompt Caching:** Canon state (events, knowledge, promises) cached in Claude's extended context
- **RAG Retrieval:** Scene-specific context retrieved dynamically
- **Smart Assembly:** Combines cached canon + retrieved drafts + session state
- **Dynamic Updates:** Adds new events/knowledge as session progresses

**5. Guardrails Engine**
- Canon gate validation before applying proposals
- Character consistency checks (voice, knowledge, behavior)
- Promise tracking (ensure commitments are fulfilled)
- Dependency validation (causal consistency)
- Listener attribution requirements (clear speaker identification)

**6. MCP Spine**
- Exposes narrative state via Resources
- Proposal workflow via Tools
- Scoped permissions for Studio Mode context
- Audit logging of all AI decisions

**7. NAOS Engines**
- Narrative Engine: Event DAG, knowledge states, canon transitions
- Audio Engine: Beat markers, voice profiles, cognition audits, recording packets
- Validation pipelines for all operations

---

## User Experience Flow

### Session Lifecycle

**1. Session Setup (30-60 seconds)**

```
User: Opens Studio Mode
System:
  - Loads project narrative state
  - Caches canon in Claude's context (prompt caching)
  - User selects:
    • Scene to work on (new or draft)
    • Character voices to use
    • Narrative constraints (guardrails)
  - Displays context panel with:
    • Current events
    • Active characters
    • Knowledge states
    • Promises to track
```

**2. Creative Performance (10-60 minutes)**

```
User: "Let's start with the scene where Alex discovers the signal"

Claude (narrating):
  "Captain Alex Martinez stood on the observation deck,
   the faint pattern in the sensor data catching her eye.
   It wasn't random noise—it had structure, intention..."

User (interrupting): "More tension in her voice—she's afraid"

Claude (adapting):
  [Voice modulates to fearful, breathing heavier]
  "This wasn't supposed to be here. Nothing was supposed
   to be here. The dead zone had been silent for decades..."

User: "Good. Now switch to First Officer Chen's perspective"

Claude:
  [Voice changes to Chen's profile - deeper, calm, analytical]
  "Commander Chen reviewed the data with clinical precision.
   'Captain, this matches no known pattern in our database...' "

System (background):
  - Tracks beat markers (pauses, emphasis, breath)
  - Validates speaker attribution
  - Ensures voice profiles match declared speakers
  - Checks for canon violations (would break story consistency)
  - Updates session state with new events/knowledge
```

**3. Guardrail Intervention (when needed)**

```
Claude (about to say):
  "Chen accessed the classified files from Earth Command..."

System (blocks):
  ⚠️ GUARDRAIL: Chen doesn't have knowledge of Earth Command
      at this timestamp. This violates knowledge states.

Claude (corrects):
  "Chen checked the ship's database, but found nothing.
   Whatever this was, it predated their mission briefing..."

User (approves): [Session continues]
```

**4. Session Completion (1-2 minutes)**

```
User: "That's a good stopping point. Save session."

System:
  - Generates Audio Scene Object from session:
    • Tracks with voice profiles
    • Beat markers with timings
    • Metadata (chapter, sequence, tags)
  - Runs listener cognition audit:
    ✅ Narrator present throughout
    ✅ Speaker attribution clear
    ✅ Beat marker density appropriate
    ✅ Speaker switches not excessive
  - Creates recording packet (production-ready)
  - Saves as draft for review/editing
  - Updates narrative state with new events

User: Reviews transcript, makes edits if needed, publishes
```

---

## Implementation Components

### Phase 1: Foundation (Weeks 1-2)

**Goal:** Basic Studio Mode session with text I/O (no audio yet)

**Tasks:**
1. **Session Orchestrator (Core)**
   - Add `@anthropic-ai/sdk` dependency
   - Implement conversation manager with streaming
   - Build session state tracking
   - Create tool calling for narrative operations

2. **Context Manager (MVP)**
   - Implement full narrative state loading
   - Add prompt caching for canon events
   - Build context assembly pipeline
   - Create scene-specific context retrieval

3. **Guardrails Engine (Integration)**
   - Wire existing canon gate validation
   - Add knowledge state validation
   - Implement character consistency checks
   - Create intervention system (block + suggest correction)

4. **Studio UI (Minimal)**
   - Text-based interface (terminal or simple web)
   - Show context panel (events, characters, knowledge)
   - Display guardrail status
   - Basic session controls (start, pause, save)

**Milestone:** Text-based Studio Mode session that validates against canon

---

### Phase 2: Audio Integration (Weeks 3-4)

**Goal:** Real-time audio narration with voice modulation

**Approach A: OpenAI Realtime API (Recommended)**

**Pros:**
- Lowest latency (voice-to-voice)
- Built-in voice activity detection
- Function calling support
- Streaming audio I/O
- Single vendor integration

**Cons:**
- Limited voice customization
- Newer API (less proven)
- OpenAI dependency

**Implementation:**
```typescript
// Pseudo-code structure
class OpenAIRealtimeStudio {
  async startSession(projectId: string, sceneId: string) {
    // 1. Load narrative context
    const context = await contextManager.assembleContext(projectId, sceneId);

    // 2. Initialize OpenAI Realtime session
    const session = await openai.realtime.create({
      model: "gpt-4o-realtime-preview",
      voice: "alloy", // Base voice
      instructions: this.buildStudioPrompt(context),
      tools: this.getStudioTools(),
      modalities: ["text", "audio"],
      temperature: 0.7
    });

    // 3. Stream audio I/O
    session.on("audio.input", (audio) => this.processDirectorInput(audio));
    session.on("audio.output", (audio) => this.handleNarration(audio));
    session.on("tool_call", (call) => this.handleToolCall(call));

    return session;
  }

  async processDirectorInput(audio: AudioBuffer) {
    // Transcribe director cues
    // Extract directives (emphasis, voice change, pause)
    // Send to orchestrator for interpretation
  }

  async handleNarration(audio: AudioBuffer) {
    // Apply voice profile modulation
    // Track beat markers (timing, emphasis)
    // Validate speaker attribution
    // Check guardrails
    // Record to session buffer
  }
}
```

**Approach B: ElevenLabs + Anthropic (Alternative)**

**Pros:**
- Better voice cloning and customization
- More control over voice profiles
- Proven TTS quality

**Cons:**
- Higher latency (two API calls)
- More complex integration
- Separate vendors

**Tasks:**
1. Integrate OpenAI Realtime API (or ElevenLabs + streaming)
2. Implement voice profile system
3. Add voice modulation for characters
4. Build audio recording and buffer management
5. Add beat marker timing detection
6. Update Studio UI with audio interface

**Milestone:** Audio-based Studio Mode with basic voice modulation

---

### Phase 3: Advanced Context Management (Weeks 5-6)

**Goal:** Intelligent context retrieval for extended sessions

**Problem:** Canon state can exceed Claude's context window (200k tokens) for large universes

**Solution: Hybrid Approach**

**1. Prompt Caching Layer:**
```
┌─────────────────────────────────────────┐
│     Cached Canon State (150k tokens)    │
│                                         │
│  • All canon events (immutable)         │
│  • All canon knowledge states           │
│  • All canon promises                   │
│  • Character profiles                   │
│                                         │
│  Updated: Once per session (or on publish)
└─────────────────────────────────────────┘
```

**2. RAG Retrieval Layer:**
```
┌─────────────────────────────────────────┐
│    Retrieved Context (20k tokens)       │
│                                         │
│  • Draft events related to scene        │
│  • Recent session history               │
│  • Relevant character interactions      │
│  • Scene-specific knowledge             │
│                                         │
│  Updated: Dynamically during session    │
└─────────────────────────────────────────┘
```

**3. Session State Layer:**
```
┌─────────────────────────────────────────┐
│     Active Session (10k tokens)         │
│                                         │
│  • Current scene transcript             │
│  • Director instructions                │
│  • Recent tool calls                    │
│  • Guardrail interventions              │
│                                         │
│  Updated: Every message                 │
└─────────────────────────────────────────┘
```

**Total Context Budget:** ~180k tokens, leaving 20k for response

**RAG Implementation:**
```typescript
class ContextManager {
  async assembleContext(projectId: string, sceneId: string): Promise<StudioContext> {
    // 1. Load and cache canon (once per session)
    const canon = await this.loadCanonState(projectId);
    const cachedCanon = this.cacheWithPromptCaching(canon);

    // 2. Retrieve scene-specific context
    const sceneContext = await this.retrieveSceneContext(projectId, sceneId);

    // 3. Build session context
    const sessionContext = {
      canon: cachedCanon,
      retrieved: sceneContext,
      session: this.sessionState,
      guardrails: await this.loadGuardrails(projectId, sceneId)
    };

    return sessionContext;
  }

  async retrieveSceneContext(projectId: string, sceneId: string): Promise<Context> {
    // For MVP: Query-based retrieval (no embeddings)
    // 1. Find events with matching location
    // 2. Find events with participating characters
    // 3. Find events this scene depends on
    // 4. Find events this scene impacts

    // For future: Embedding-based semantic retrieval
    // 1. Embed scene description
    // 2. Find semantically similar events
    // 3. Rank by relevance
  }
}
```

**Tasks:**
1. Implement prompt caching for canon state
2. Build scene-specific retrieval (query-based MVP)
3. Add context assembly pipeline
4. Create dynamic context updates
5. Add context budget monitoring
6. (Future) Add embedding-based RAG

**Milestone:** Extended context management for large universes

---

### Phase 4: Guardrails & Validation (Weeks 7-8)

**Goal:** Intelligent guardrails that maintain narrative integrity without breaking flow

**Guardrail Types:**

**1. Canon Gates (BLOCKING)**
- Prevents modifications that break established canon
- Validates dependency consistency
- Checks timestamp ordering
- Enforces knowledge state rules

**Example:**
```typescript
// Guardrail triggers during narration
async validateNarrationProposal(narration: string): Promise<ValidationResult> {
  // Extract narrative changes from narration
  const proposedChanges = await this.extractChanges(narration);

  // Run through canon gate
  const validation = await narrativeEngine.validateCanonGate(proposedChanges);

  if (!validation.valid) {
    return {
      allowed: false,
      reason: validation.errors,
      suggestion: await this.generateCorrection(validation)
    };
  }

  return { allowed: true };
}
```

**2. Character Consistency (WARNING)**
- Validates voice profile matches character
- Checks knowledge state consistency
- Monitors behavior against character profile
- Alerts on out-of-character actions

**3. Promise Tracking (INFORMATIONAL)**
- Tracks commitments to listeners
- Alerts when promises are fulfilled or at risk
- Suggests moments to fulfill pending promises

**4. Listener Attribution (WARNING)**
- Ensures speaker is always clear
- Validates narrator presence in ambiguous scenes
- Checks beat marker density for cognition
- Monitors speaker switch frequency

**Guardrail Intervention UX:**

```
┌─────────────────────────────────────────────────┐
│  🛡️  GUARDRAIL INTERVENTION                     │
├─────────────────────────────────────────────────┤
│  Type: CANON VIOLATION (Blocking)               │
│                                                  │
│  Issue: Chen accessing classified Earth Command │
│         files contradicts knowledge state.      │
│                                                  │
│  At timestamp: 2287-03-15, Chen's knowledge     │
│  state shows NO awareness of Earth Command.     │
│                                                  │
│  Suggestion: Chen checks ship's database but    │
│             finds no matching records.          │
│                                                  │
│  [ Continue with Suggestion ]  [ Edit Manually ]│
└─────────────────────────────────────────────────┘
```

**Tasks:**
1. Wire existing canon gate validation into session flow
2. Implement character consistency checks
3. Add promise tracking system
4. Build listener attribution validation
5. Create intervention UI with suggestions
6. Add guardrail override system (for intentional breaks)

**Milestone:** Production-ready guardrails that maintain narrative integrity

---

### Phase 5: Session Output Pipeline (Weeks 9-10)

**Goal:** Convert live session to production-ready Audio Scene Objects

**Pipeline:**

**1. Session Recording**
```typescript
class SessionRecorder {
  private audioBuffer: AudioBuffer[] = [];
  private transcript: TranscriptSegment[] = [];
  private beatMarkers: BeatMarker[] = [];
  private voiceProfiles: Map<Speaker, VoiceProfile> = new Map();

  recordSegment(audio: AudioBuffer, speaker: Speaker, timestamp: number) {
    this.audioBuffer.push(audio);
    this.transcript.push({
      speaker,
      text: transcribe(audio),
      startMs: timestamp,
      endMs: timestamp + audio.duration
    });

    // Detect beat markers from audio features
    const markers = this.detectBeatMarkers(audio);
    this.beatMarkers.push(...markers);
  }

  detectBeatMarkers(audio: AudioBuffer): BeatMarker[] {
    // Analyze audio features:
    // - Pauses (silence detection)
    // - Emphasis (volume spikes)
    // - Tempo changes (speech rate)
    // - Breaths (intake detection)
    return markers;
  }
}
```

**2. Audio Scene Object Generation**
```typescript
async generateAudioSceneObject(session: StudioSession): Promise<AudioSceneObject> {
  const scene: AudioSceneObject = {
    id: generateUUID(),
    chapterId: session.chapterId,
    sequence: session.sequence,
    startMs: session.startTime,
    endMs: session.endTime,

    tracks: session.speakers.map(speaker => ({
      speaker,
      voiceProfile: session.voiceProfiles.get(speaker),
      segments: session.transcript.filter(t => t.speaker === speaker)
    })),

    beatMarkers: audioEngine.authorBeatMarkers({
      markers: session.beatMarkers,
      sceneBounds: { start: session.startTime, end: session.endTime }
    }),

    metadata: {
      tags: session.tags,
      createdAt: new Date(),
      modifiedAt: new Date(),
      version: 1
    }
  };

  // Validate before returning
  await audioEngine.validateAudioScene(scene, session.voiceProfiles);

  return scene;
}
```

**3. Listener Cognition Audit**
```typescript
async auditSession(scene: AudioSceneObject): Promise<CognitionAuditResult> {
  const audit = await audioEngine.auditListenerCognition(scene);

  if (!audit.passed) {
    return {
      passed: false,
      issues: audit.issues,
      suggestions: [
        "Add narrator clarification at 00:45 (speaker unclear)",
        "Reduce beat marker density at 01:20 (too many pauses)",
        "Add speaker attribution at 02:15 (ambiguous 'he said')"
      ]
    };
  }

  return { passed: true };
}
```

**4. Recording Packet Generation**
```typescript
async generateRecordingPacket(scene: AudioSceneObject): Promise<RecordingPacket> {
  return audioEngine.generateRecordingPacket(
    scene,
    session.voiceProfiles,
    {
      includeContext: true,
      includeBeatMarkers: true,
      includeFingerprint: true
    }
  );
}
```

**Tasks:**
1. Build session recorder with audio buffering
2. Implement beat marker detection from audio features
3. Create Audio Scene Object generation pipeline
4. Wire listener cognition audit
5. Add recording packet generation
6. Implement session save/load system

**Milestone:** Production-ready audio scene objects from Studio sessions

---

### Phase 6: Polish & Production (Weeks 11-12)

**Goal:** Production-ready Studio Mode for Founders launch

**Tasks:**
1. **Performance Optimization**
   - Minimize audio latency
   - Optimize context loading
   - Cache frequently accessed data
   - Profile and optimize hot paths

2. **Error Handling**
   - Graceful API failure recovery
   - Session state persistence
   - Audio buffer overflow handling
   - Network interruption recovery

3. **Testing**
   - End-to-end Studio Mode sessions
   - Guardrail intervention scenarios
   - Voice modulation quality
   - Context retrieval accuracy
   - Audio scene object validation

4. **Documentation**
   - Studio Mode user guide
   - Voice profile creation guide
   - Guardrail configuration guide
   - Troubleshooting runbook

5. **Monitoring**
   - Session analytics
   - Guardrail intervention logging
   - Audio quality metrics
   - Context cache hit rates
   - Cost tracking

**Milestone:** Studio Mode ready for Founders beta

---

## Integration Points

### With NAOS Engines

**Narrative Engine:**
- Read: Current narrative state (events, knowledge, promises)
- Write: New events from Studio session (via proposals)
- Validate: Canon gate checks during narration

**Audio Engine:**
- Read: Voice profiles, beat marker rules
- Write: Audio scene objects, recording packets
- Validate: Listener cognition audits, voice profile matching

**MCP Spine:**
- Resources: `narrative.events`, `narrative.canon`, `narrative.knowledge_snapshots`
- Tools: `proposals.create`, `proposals.validate`, `proposals.apply`
- Prompts: `continuity-check`, `outline-expansion`

### With External Services

**OpenAI Realtime API:**
- Voice-to-voice streaming
- Function calling for tool use
- Audio I/O handling

**Anthropic Claude (via Agent SDK):**
- Conversation orchestration
- Prompt caching for canon
- Tool calling for narrative operations
- Streaming responses

**Replit Services:**
- Object Storage: Session recordings, audio scene objects
- PostgreSQL: Session state, narrative events, audio metadata
- Secrets: API keys for OpenAI, Anthropic

---

## Cost & Performance Considerations

### Cost Estimates (per hour of Studio session)

**OpenAI Realtime API:**
- Audio input: ~$0.06/minute = $3.60/hour
- Audio output: ~$0.24/minute = $14.40/hour
- **Total:** ~$18/hour of narration

**Anthropic Claude (Agent SDK):**
- Prompt caching (200k tokens): ~$0.30/hour (cached reads)
- Responses (10k tokens/turn, 20 turns): ~$4.00/hour
- **Total:** ~$4.30/hour

**Storage:**
- Audio recordings: ~10 MB/minute = 600 MB/hour
- Object Storage: $0.02/GB/month = ~$0.012/hour (negligible)

**Total Studio Mode Cost:** ~$22-25/hour of creative session

**Revenue Context:** $49 Founders membership → ~2 hours of Studio Mode to break even on membership (excluding infrastructure)

### Performance Targets

**Latency:**
- Audio round-trip: <500ms (OpenAI Realtime)
- Guardrail validation: <200ms
- Context retrieval: <100ms
- Total perceived latency: <800ms

**Throughput:**
- Support 1 concurrent Studio session initially
- Scale to 5-10 sessions with Replit autoscaling

**Context Budget:**
- Canon cache: 150k tokens (prompt caching)
- Retrieved context: 20k tokens
- Session state: 10k tokens
- Response budget: 20k tokens

---

## Future Enhancements

### Multi-Voice System (Phase 2)

**Current:** Single voice with modulation
**Future:** Multiple AI voices in parallel

**Implementation:**
```typescript
class MultiVoiceOrchestrator {
  private voices: Map<CharacterId, VoiceSession> = new Map();

  async narrateDialogue(scene: Scene) {
    // Each character gets dedicated voice session
    for (const character of scene.characters) {
      const voice = await this.initVoiceSession(character);
      this.voices.set(character.id, voice);
    }

    // Orchestrate multi-speaker narration
    for (const line of scene.dialogue) {
      const voice = this.voices.get(line.speaker);
      await voice.speak(line.text);

      // Apply beat markers between speakers
      await this.applyBeatMarker(line.beatMarker);
    }
  }
}
```

**Benefits:**
- More natural dialogue
- Distinct character voices
- Reduced voice modulation complexity

**Challenges:**
- Higher cost (multiple API calls)
- Synchronization complexity
- Audio mixing required

---

### Multi-Agent Audio System (Phase 3)

**Current:** Director + Single AI Narrator
**Future:** Director + Multiple AI Agents (Narrator + Characters)

**Concept:**
```
Director: "Start the council scene"

Narrator AI: "The council chamber fell silent as the evidence was presented..."

Character AI (Marcus): "This can't be right. The timeline doesn't match."

Character AI (Elena): "Unless someone altered the records."

Director: "Elena, make that sound more accusatory"

Character AI (Elena): [Adapts] "Unless... someone altered the records."

Narrator AI: "Marcus met her gaze, understanding the implication..."
```

**Architecture:**
```
Director Input
      │
      ▼
Session Orchestrator
      │
      ├──> Narrator Agent (coordinates scene)
      ├──> Character Agent (Marcus)
      ├──> Character Agent (Elena)
      └──> Audio Mixer (combines streams)
```

**Benefits:**
- True multi-character performances
- Emergent dialogue dynamics
- More realistic character interactions

**Challenges:**
- Agent coordination complexity
- Higher latency (multi-agent communication)
- Significant cost increase
- Need for sophisticated audio mixing

---

### Advanced Context Retrieval (RAG)

**Current:** Query-based retrieval
**Future:** Embedding-based semantic search

**Implementation:**
```typescript
class EmbeddingContextRetriever {
  private vectorDB: PineconeClient; // or pgvector in Replit PostgreSQL

  async retrieveRelevantContext(
    query: string,
    projectId: string
  ): Promise<Context> {
    // 1. Embed query
    const queryEmbedding = await this.embed(query);

    // 2. Search vector DB
    const results = await this.vectorDB.query({
      vector: queryEmbedding,
      topK: 20,
      filter: { projectId }
    });

    // 3. Re-rank by relevance + recency
    const ranked = this.rerank(results, {
      recencyWeight: 0.3,
      relevanceWeight: 0.7
    });

    // 4. Assemble context
    return this.assembleContext(ranked);
  }

  async embed(text: string): Promise<number[]> {
    // Use OpenAI text-embedding-3-small ($0.02/1M tokens)
    return await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text
    });
  }
}
```

**Benefits:**
- Better context relevance
- Handles semantic queries ("find similar conflicts")
- Scales to very large universes

**Costs:**
- Embedding API: ~$0.02/1M tokens
- Vector DB: Pinecone ~$70/month or pgvector (free in Replit PostgreSQL)

---

### Voice Cloning

**Current:** Preset voices with modulation
**Future:** User's own voice cloned for characters

**Implementation:**
```typescript
class VoiceCloner {
  async cloneVoice(
    userId: string,
    audioSamples: AudioBuffer[],
    voiceName: string
  ): Promise<VoiceProfile> {
    // 1. Upload samples to ElevenLabs
    const clonedVoice = await elevenLabs.voiceCloning.create({
      name: voiceName,
      samples: audioSamples,
      description: `Cloned voice for user ${userId}`
    });

    // 2. Create voice profile
    const profile: VoiceProfile = {
      id: generateUUID(),
      name: voiceName,
      providerId: clonedVoice.voice_id,
      provider: "elevenlabs",
      role: "character",
      tone: "neutral",
      pace: "medium",
      cadenceWPM: 150,
      styleTags: ["cloned"],
      pronunciationNotes: []
    };

    return profile;
  }
}
```

**Benefits:**
- Author can perform all characters
- Authentic voice consistency
- No TTS "robot voice" feel

**Challenges:**
- Requires audio samples (3+ minutes)
- Higher cost (cloning + generation)
- Quality depends on sample quality

---

### Guardrail Learning

**Current:** Rule-based guardrails
**Future:** ML-based guardrails that learn from user corrections

**Concept:**
```typescript
class AdaptiveGuardrails {
  async validateWithLearning(
    narration: string,
    context: Context
  ): Promise<ValidationResult> {
    // 1. Run rule-based validation
    const ruleResult = await this.ruleBasedValidation(narration, context);

    // 2. Run ML-based prediction
    const mlResult = await this.mlPrediction(narration, context);

    // 3. Combine results
    const combined = this.combineResults(ruleResult, mlResult);

    // 4. Learn from user feedback
    this.learnFromFeedback(combined, userFeedback);

    return combined;
  }

  async mlPrediction(narration: string, context: Context): Promise<Prediction> {
    // Fine-tuned model predicts violations based on past corrections
    return await this.model.predict({
      narration,
      context,
      history: this.userCorrectionHistory
    });
  }
}
```

**Benefits:**
- Learns user's preferences
- Adapts to creative style
- Reduces false positives

**Challenges:**
- Requires training data
- Potential for drift
- Complexity

---

## Success Metrics

### Phase 1 (MVP) Success Criteria

- ✅ Text-based Studio session with canon validation
- ✅ Context assembly with prompt caching
- ✅ Guardrails block canon violations
- ✅ Session generates valid Audio Scene Object

### Phase 2 (Audio) Success Criteria

- ✅ Real-time audio narration with <800ms latency
- ✅ Voice modulation for 2+ characters
- ✅ Beat markers detected from audio features
- ✅ Session recordings saved to Object Storage

### Phase 3 (Context) Success Criteria

- ✅ Handles 500+ canon events in context
- ✅ RAG retrieval in <100ms
- ✅ Context cache hit rate >80%
- ✅ No context window overflows

### Phase 4 (Guardrails) Success Criteria

- ✅ Canon violations blocked 100% of time
- ✅ Character consistency warnings surface issues
- ✅ Listener attribution validated in all scenes
- ✅ Guardrail false positives <5%

### Phase 5 (Output) Success Criteria

- ✅ Audio Scene Objects pass cognition audit
- ✅ Recording packets production-ready
- ✅ Session save/load works reliably
- ✅ No audio quality degradation

### Phase 6 (Production) Success Criteria

- ✅ Founders beta with 5 users
- ✅ 10+ hours of Studio sessions completed
- ✅ 90% user satisfaction rating
- ✅ <1% session failure rate

### Long-Term Success Metrics

- **Adoption:** 80% of Founders use Studio Mode
- **Efficiency:** 3x faster than traditional writing workflow
- **Quality:** 95% of Studio outputs published without major edits
- **Retention:** Studio Mode users 2x more likely to continue creating

---

## Conclusion

Studio Mode represents a fundamental shift in audiobook creation - from **writing-then-narrating** to **directing-then-capturing**. By leveraging real-time audio AI, extended context management, and intelligent guardrails, we enable creators to work in the medium of audio from the start.

This is the future of audio-first storytelling.

**Next Steps:**
1. Validate technical approach with prototype
2. Begin Phase 1 implementation (Foundation)
3. Test with initial users for feedback
4. Iterate based on real-world usage

---

**Document Maintenance:**
- Update as implementation progresses
- Add lessons learned from testing
- Refine cost/performance estimates with real data
- Document user feedback and feature requests
