# Studio Mode Implementation Roadmap

> **Last Updated:** 2026-01-22
> **Target:** Founders Launch (12 weeks)
> **Owner:** Nate Johnson + Claude

## Overview

This roadmap breaks down the Studio Mode implementation into 6 phases over 12 weeks, from foundation to production-ready system. Each phase has clear milestones, tasks, and success criteria.

---

## Phase 1: Foundation (Weeks 1-2)

**Goal:** Text-based Studio Mode with canon validation

### Week 1: Session Orchestrator

**Tasks:**
1. **Add Agent SDK Dependencies**
   - [ ] Add `@anthropic-ai/sdk` to `naos/apps/web/package.json`
   - [ ] Add TypeScript types
   - [ ] Configure API key in Replit secrets

2. **Implement Conversation Manager**
   - [ ] Create `lib/studio/conversationManager.ts`
   - [ ] Implement streaming message handling
   - [ ] Add conversation state tracking
   - [ ] Build tool calling infrastructure
   - [ ] Add error handling and retry logic

3. **Build Session State**
   - [ ] Create `lib/studio/sessionState.ts`
   - [ ] Define session schema (Zod)
   - [ ] Implement session persistence (PostgreSQL)
   - [ ] Add session CRUD operations
   - [ ] Build session resume capability

4. **Create Studio Tools**
   - [ ] Define tool schemas for narrative operations
   - [ ] `tool: create_event` - Propose new events
   - [ ] `tool: update_knowledge` - Modify knowledge states
   - [ ] `tool: track_promise` - Record commitments
   - [ ] Wire tools to MCP spine

**Files Created:**
- `naos/apps/web/lib/studio/conversationManager.ts`
- `naos/apps/web/lib/studio/sessionState.ts`
- `naos/apps/web/lib/studio/tools.ts`
- `naos/apps/web/lib/studio/types.ts`

**Tests:**
- [ ] Unit tests for conversation manager
- [ ] Unit tests for session state
- [ ] Integration test: Create session, send message, receive response
- [ ] Integration test: Tool calling workflow

**Success Criteria:**
- ✅ Can start/stop Studio session
- ✅ Can send text message and receive streaming response
- ✅ Can call tools to create narrative proposals
- ✅ Session state persists across restarts

---

### Week 2: Context Manager & Guardrails

**Tasks:**
1. **Implement Context Manager**
   - [ ] Create `lib/studio/contextManager.ts`
   - [ ] Build narrative state loader
   - [ ] Implement prompt caching for canon
   - [ ] Add context assembly pipeline
   - [ ] Create scene-specific context retrieval
   - [ ] Add context budget monitoring

2. **Wire Guardrails Engine**
   - [ ] Create `lib/studio/guardrails.ts`
   - [ ] Integrate canon gate validation from Narrative Engine
   - [ ] Add knowledge state validation
   - [ ] Implement character consistency checks
   - [ ] Build intervention system (block + suggest)
   - [ ] Add guardrail logging

3. **Build Studio UI (Text-based MVP)**
   - [ ] Create `/app/studio/page.tsx`
   - [ ] Add session controls (start, pause, save)
   - [ ] Display context panel (events, characters, knowledge)
   - [ ] Show guardrail status indicators
   - [ ] Add message input/output
   - [ ] Implement transcript view

4. **MCP Integration**
   - [ ] Wire Studio Mode to MCP Resources
   - [ ] Test proposal workflow
   - [ ] Add Studio-specific prompts to MCP
   - [ ] Configure scoped permissions

**Files Created:**
- `naos/apps/web/lib/studio/contextManager.ts`
- `naos/apps/web/lib/studio/guardrails.ts`
- `naos/apps/web/app/studio/page.tsx`
- `naos/apps/web/app/studio/components/ContextPanel.tsx`
- `naos/apps/web/app/studio/components/GuardrailStatus.tsx`
- `services/mcp-spine/src/prompts/studio-mode.ts`

**Tests:**
- [ ] Unit tests for context manager
- [ ] Unit tests for guardrails
- [ ] Integration test: Load context for session
- [ ] Integration test: Guardrail blocks canon violation
- [ ] E2E test: Full text-based Studio session

**Success Criteria:**
- ✅ Context loads in <1 second
- ✅ Prompt caching reduces token cost by 90%
- ✅ Guardrails block 100% of canon violations
- ✅ Can complete text-based Studio session from start to finish

**Milestone 1 Demo:**
```
User: "Let's create a scene where Alex discovers the signal"

Claude: [Loads context - 500 canon events cached]
        "I'll narrate this scene. Checking narrative state...
         Alex's knowledge at this point: basic sensor operations,
         no anomalies detected yet. Location: observation deck.

         'Captain Alex Martinez stood on the observation deck...' "

User: "She realizes this contradicts her mission briefing"

Claude: [Guardrail checks: Can Alex know about mission briefing?]
        ⚠️  GUARDRAIL: Alex's knowledge state doesn't include
            full mission briefing at this timestamp.

        Suggestion: "She realizes this contradicts what little
                     she knows about the dead zone..."

User: "Good, continue with that"

Claude: "She realizes this contradicts what little she knows
         about the dead zone. This sector was supposed to be
         empty, devoid of any signals for decades..."
```

---

## Phase 2: Audio Integration (Weeks 3-4)

**Goal:** Real-time audio narration with voice modulation

### Week 3: OpenAI Realtime Integration

**Tasks:**
1. **Add OpenAI Realtime Dependencies**
   - [ ] Add `openai` SDK to package.json
   - [ ] Configure API key in Replit secrets
   - [ ] Test basic Realtime API connection

2. **Implement Audio Session Manager**
   - [ ] Create `lib/studio/audio/realtimeSession.ts`
   - [ ] Initialize OpenAI Realtime session
   - [ ] Handle audio input stream (director)
   - [ ] Handle audio output stream (narrator)
   - [ ] Implement function calling
   - [ ] Add session event handlers

3. **Build Voice Profile System**
   - [ ] Create `lib/studio/audio/voiceProfiles.ts`
   - [ ] Define voice profile mapping (character → OpenAI voice)
   - [ ] Implement voice modulation parameters
   - [ ] Add voice switching logic
   - [ ] Create voice profile UI

4. **Audio Buffer Management**
   - [ ] Create `lib/studio/audio/buffer.ts`
   - [ ] Implement audio recording buffer
   - [ ] Add buffer overflow handling
   - [ ] Build audio segment tracking
   - [ ] Implement audio persistence

**Files Created:**
- `naos/apps/web/lib/studio/audio/realtimeSession.ts`
- `naos/apps/web/lib/studio/audio/voiceProfiles.ts`
- `naos/apps/web/lib/studio/audio/buffer.ts`
- `naos/apps/web/lib/studio/audio/types.ts`

**Tests:**
- [ ] Unit tests for audio session manager
- [ ] Unit tests for voice profiles
- [ ] Integration test: Audio input → transcription
- [ ] Integration test: Text → audio output
- [ ] Integration test: Voice switching

**Success Criteria:**
- ✅ Audio round-trip latency <500ms
- ✅ Can switch between 2+ character voices
- ✅ Audio buffer handles 60+ minute sessions
- ✅ No audio dropouts or glitches

---

### Week 4: Audio UI & Beat Markers

**Tasks:**
1. **Build Audio Interface**
   - [ ] Create `/app/studio/audio/page.tsx`
   - [ ] Add audio input controls (mic, push-to-talk)
   - [ ] Add audio output controls (volume, playback)
   - [ ] Implement waveform visualization
   - [ ] Add real-time transcript display
   - [ ] Build voice profile selector

2. **Implement Beat Marker Detection**
   - [ ] Create `lib/studio/audio/beatMarkerDetection.ts`
   - [ ] Detect pauses (silence detection)
   - [ ] Detect emphasis (volume spikes)
   - [ ] Detect tempo changes (speech rate)
   - [ ] Detect breaths (intake detection)
   - [ ] Map to beat marker schema

3. **Director Input Processing**
   - [ ] Create `lib/studio/audio/directorInput.ts`
   - [ ] Transcribe director cues
   - [ ] Extract directives (emphasis, voice, pause)
   - [ ] Parse commands ("switch to Marcus", "add pause")
   - [ ] Send to conversation manager

4. **Audio Validation**
   - [ ] Wire listener cognition audit
   - [ ] Validate speaker attribution in audio
   - [ ] Check beat marker density
   - [ ] Monitor speaker switches
   - [ ] Add real-time validation UI

**Files Created:**
- `naos/apps/web/app/studio/audio/page.tsx`
- `naos/apps/web/app/studio/audio/components/AudioControls.tsx`
- `naos/apps/web/app/studio/audio/components/Waveform.tsx`
- `naos/apps/web/lib/studio/audio/beatMarkerDetection.ts`
- `naos/apps/web/lib/studio/audio/directorInput.ts`

**Tests:**
- [ ] Unit tests for beat marker detection
- [ ] Unit tests for director input parsing
- [ ] Integration test: Director says "add pause" → beat marker added
- [ ] Integration test: Audio output passes cognition audit
- [ ] E2E test: Full audio Studio session

**Success Criteria:**
- ✅ Director can control narration via audio
- ✅ Beat markers auto-detected with 80%+ accuracy
- ✅ Audio output passes listener cognition audit
- ✅ Voice modulation sounds natural for 2+ characters

**Milestone 2 Demo:**
```
[User speaks into mic]
User: "Let's start with Alex discovering the signal"

[Claude begins narrating with audio]
Claude (voice: neutral female): "Captain Alex Martinez stood
       on the observation deck..."

[User interrupts]
User: "More tension in her voice - she's afraid"

[Claude adapts voice: slightly fearful, faster pace]
Claude: "This wasn't supposed to be here. Nothing was supposed
         to be here. The dead zone had been silent for decades..."

[System detects beat markers: pause before "Nothing", emphasis on "decades"]
[Transcript displays in real-time with beat markers annotated]
```

---

## Phase 3: Advanced Context Management (Weeks 5-6)

**Goal:** Intelligent context retrieval for extended sessions

### Week 5: Prompt Caching & RAG

**Tasks:**
1. **Implement Prompt Caching**
   - [ ] Create `lib/studio/context/promptCache.ts`
   - [ ] Build canon state serialization
   - [ ] Implement cache key generation
   - [ ] Add cache invalidation on publish
   - [ ] Monitor cache hit rates
   - [ ] Optimize cache size (target 150k tokens)

2. **Build Query-Based Retrieval (MVP)**
   - [ ] Create `lib/studio/context/retrieval.ts`
   - [ ] Implement location-based retrieval
   - [ ] Implement character-based retrieval
   - [ ] Implement dependency-based retrieval
   - [ ] Add relevance scoring
   - [ ] Build retrieval UI (show what's loaded)

3. **Context Assembly Pipeline**
   - [ ] Create `lib/studio/context/assembly.ts`
   - [ ] Combine cached canon + retrieved context
   - [ ] Add session state
   - [ ] Implement context budget management
   - [ ] Add context compression (summarization)
   - [ ] Build context diff viewer

4. **Dynamic Context Updates**
   - [ ] Implement context refresh triggers
   - [ ] Add new events to session context
   - [ ] Update knowledge states mid-session
   - [ ] Refresh retrieved context periodically
   - [ ] Monitor context size growth

**Files Created:**
- `naos/apps/web/lib/studio/context/promptCache.ts`
- `naos/apps/web/lib/studio/context/retrieval.ts`
- `naos/apps/web/lib/studio/context/assembly.ts`
- `naos/apps/web/lib/studio/context/budget.ts`
- `naos/apps/web/app/studio/components/ContextViewer.tsx`

**Tests:**
- [ ] Unit tests for prompt caching
- [ ] Unit tests for retrieval
- [ ] Unit tests for assembly
- [ ] Integration test: Load 1000+ event project
- [ ] Integration test: Context stays under budget
- [ ] Performance test: Context loading <100ms

**Success Criteria:**
- ✅ Handles projects with 500+ canon events
- ✅ Context retrieval in <100ms
- ✅ Cache hit rate >80%
- ✅ No context window overflows
- ✅ Context budget stays under 180k tokens

---

### Week 6: Embeddings & Semantic Search (Future-Proofing)

**Tasks:**
1. **Set Up Vector Database (Optional)**
   - [ ] Evaluate: pgvector (free in Replit) vs Pinecone
   - [ ] Add pgvector extension to Replit PostgreSQL
   - [ ] Create events embeddings table
   - [ ] Set up embedding pipeline

2. **Implement Embedding Generation**
   - [ ] Create `lib/studio/context/embeddings.ts`
   - [ ] Add OpenAI text-embedding-3-small integration
   - [ ] Embed all canon events (batch process)
   - [ ] Store embeddings in vector DB
   - [ ] Add incremental embedding updates

3. **Build Semantic Retrieval**
   - [ ] Create `lib/studio/context/semanticRetrieval.ts`
   - [ ] Embed user queries
   - [ ] Search vector DB for similar events
   - [ ] Re-rank by relevance + recency
   - [ ] Combine with query-based retrieval

4. **Optimize Retrieval Strategy**
   - [ ] A/B test: query-based vs semantic
   - [ ] Hybrid approach: use both
   - [ ] Tune relevance/recency weights
   - [ ] Monitor retrieval quality

**Files Created:**
- `naos/apps/web/lib/studio/context/embeddings.ts`
- `naos/apps/web/lib/studio/context/semanticRetrieval.ts`
- `naos/apps/web/scripts/generateEmbeddings.ts`
- `naos/apps/web/drizzle/migrations/XXX_add_embeddings.sql`

**Tests:**
- [ ] Unit tests for embeddings
- [ ] Unit tests for semantic retrieval
- [ ] Integration test: Semantic search returns relevant events
- [ ] Performance test: Search <100ms for 1000+ events
- [ ] Quality test: Retrieval relevance >90%

**Success Criteria:**
- ✅ Semantic search returns relevant context
- ✅ Retrieval quality better than query-based alone
- ✅ Supports projects with 1000+ events
- ✅ Scales to 10,000+ events (future-proof)

**Milestone 3 Demo:**
```
[Project: 1,000 canon events, 50 characters, 100 locations]

User: "Let's work on the scene where the crew debates going back"

[System loads context in 80ms]
Context Loaded:
- Canon: 1,000 events (cached, 145k tokens)
- Retrieved: 15 relevant events (query: debate, crew, decision)
  • Event 234: First crew meeting
  • Event 456: Previous disagreement about mission
  • Event 789: Character dynamics (Marcus vs Elena)
- Session: Current scene (5k tokens)
- Budget: 175k / 200k tokens (87.5%)

[Claude has full context, narrates with awareness of all past debates]
```

---

## Phase 4: Guardrails & Validation (Weeks 7-8)

**Goal:** Intelligent guardrails that maintain narrative integrity

### Week 7: Guardrail Types & Intervention

**Tasks:**
1. **Implement Canon Gate Guardrails (BLOCKING)**
   - [ ] Create `lib/studio/guardrails/canonGate.ts`
   - [ ] Wire existing canon gate validation
   - [ ] Extract narrative changes from narration
   - [ ] Run validation before applying
   - [ ] Block violations with clear explanations
   - [ ] Generate correction suggestions

2. **Implement Character Consistency (WARNING)**
   - [ ] Create `lib/studio/guardrails/characterConsistency.ts`
   - [ ] Validate voice profile matches character
   - [ ] Check knowledge state consistency
   - [ ] Monitor behavior against character profile
   - [ ] Alert on out-of-character actions
   - [ ] Suggest character-appropriate alternatives

3. **Implement Promise Tracking (INFORMATIONAL)**
   - [ ] Create `lib/studio/guardrails/promiseTracking.ts`
   - [ ] Track commitments to listeners
   - [ ] Alert when promises are fulfilled
   - [ ] Alert when promises are at risk
   - [ ] Suggest moments to fulfill promises
   - [ ] Display promise status in UI

4. **Implement Listener Attribution (WARNING)**
   - [ ] Create `lib/studio/guardrails/attribution.ts`
   - [ ] Validate speaker clarity
   - [ ] Check narrator presence
   - [ ] Monitor beat marker density
   - [ ] Track speaker switch frequency
   - [ ] Suggest attribution improvements

**Files Created:**
- `naos/apps/web/lib/studio/guardrails/canonGate.ts`
- `naos/apps/web/lib/studio/guardrails/characterConsistency.ts`
- `naos/apps/web/lib/studio/guardrails/promiseTracking.ts`
- `naos/apps/web/lib/studio/guardrails/attribution.ts`
- `naos/apps/web/lib/studio/guardrails/types.ts`

**Tests:**
- [ ] Unit tests for each guardrail type
- [ ] Integration test: Canon violation blocked
- [ ] Integration test: Character inconsistency warned
- [ ] Integration test: Promise fulfillment tracked
- [ ] Integration test: Attribution issues flagged

**Success Criteria:**
- ✅ Canon violations blocked 100% of time
- ✅ Character consistency warnings surface real issues
- ✅ Promise tracking prevents forgotten commitments
- ✅ Attribution validation improves listener cognition

---

### Week 8: Intervention UI & Override System

**Tasks:**
1. **Build Intervention UI**
   - [ ] Create `app/studio/components/GuardrailIntervention.tsx`
   - [ ] Display intervention modal
   - [ ] Show violation details
   - [ ] Provide correction suggestions
   - [ ] Add user actions (accept, edit, override)
   - [ ] Implement intervention history

2. **Implement Override System**
   - [ ] Create `lib/studio/guardrails/override.ts`
   - [ ] Allow intentional canon breaks (with confirmation)
   - [ ] Log all overrides with reasoning
   - [ ] Flag overridden content for review
   - [ ] Add override authorization levels
   - [ ] Build override audit trail

3. **Guardrail Configuration**
   - [ ] Create guardrail settings UI
   - [ ] Allow enabling/disabling guardrail types
   - [ ] Add severity level configuration
   - [ ] Implement project-specific guardrails
   - [ ] Add character-specific rules
   - [ ] Build guardrail presets

4. **Guardrail Analytics**
   - [ ] Create `lib/studio/guardrails/analytics.ts`
   - [ ] Track intervention frequency
   - [ ] Monitor override rates
   - [ ] Measure false positive rate
   - [ ] Build guardrail dashboard
   - [ ] Generate guardrail reports

**Files Created:**
- `naos/apps/web/app/studio/components/GuardrailIntervention.tsx`
- `naos/apps/web/app/studio/components/GuardrailSettings.tsx`
- `naos/apps/web/lib/studio/guardrails/override.ts`
- `naos/apps/web/lib/studio/guardrails/analytics.ts`
- `naos/apps/web/app/studio/guardrails/page.tsx`

**Tests:**
- [ ] Unit tests for override system
- [ ] Integration test: Override with confirmation
- [ ] Integration test: Configure guardrail settings
- [ ] E2E test: Intervention workflow
- [ ] Quality test: False positive rate <5%

**Success Criteria:**
- ✅ Guardrail interventions are clear and actionable
- ✅ Override system allows intentional breaks
- ✅ False positive rate <5%
- ✅ Intervention time <30 seconds average

**Milestone 4 Demo:**
```
[Claude narrating]
Claude: "Chen accessed the classified Earth Command files..."

[Guardrail triggers]
┌─────────────────────────────────────────────────┐
│  🛡️  GUARDRAIL INTERVENTION                     │
├─────────────────────────────────────────────────┤
│  Type: CANON VIOLATION (Blocking)               │
│                                                  │
│  Issue: Chen accessing Earth Command files      │
│         contradicts knowledge state.            │
│                                                  │
│  At timestamp: 2287-03-15, Chen's knowledge     │
│  state shows NO awareness of Earth Command.     │
│                                                  │
│  Suggestion: "Chen checked the ship's database  │
│              but found no matching records..."  │
│                                                  │
│  [ Continue with Suggestion ]  [ Edit Manually ]│
│  [ Override (Requires Confirmation) ]           │
└─────────────────────────────────────────────────┘

[User clicks "Continue with Suggestion"]

Claude: "Chen checked the ship's database but found no
         matching records. Whatever this was, it predated
         their mission briefing..."
```

---

## Phase 5: Session Output Pipeline (Weeks 9-10)

**Goal:** Convert live sessions to production-ready Audio Scene Objects

### Week 9: Session Recording & Beat Markers

**Tasks:**
1. **Implement Session Recorder**
   - [ ] Create `lib/studio/output/sessionRecorder.ts`
   - [ ] Record audio buffer segments
   - [ ] Track transcript segments
   - [ ] Store voice profile assignments
   - [ ] Add metadata (timestamps, tags)
   - [ ] Implement checkpoint saves

2. **Enhance Beat Marker Detection**
   - [ ] Improve pause detection (silence thresholds)
   - [ ] Improve emphasis detection (volume analysis)
   - [ ] Add tempo detection (speech rate changes)
   - [ ] Add breath detection (intake patterns)
   - [ ] Improve accuracy to 90%+

3. **Build Audio Scene Object Generator**
   - [ ] Create `lib/studio/output/sceneGenerator.ts`
   - [ ] Convert session to AudioSceneObject schema
   - [ ] Apply beat marker authoring rules
   - [ ] Assign voice profiles to tracks
   - [ ] Generate metadata
   - [ ] Create deterministic fingerprints

4. **Implement Session Save/Load**
   - [ ] Add session checkpoint system
   - [ ] Save session state to PostgreSQL
   - [ ] Save audio buffers to Object Storage
   - [ ] Implement session resume
   - [ ] Add session versioning
   - [ ] Build session history UI

**Files Created:**
- `naos/apps/web/lib/studio/output/sessionRecorder.ts`
- `naos/apps/web/lib/studio/output/sceneGenerator.ts`
- `naos/apps/web/lib/studio/output/checkpoint.ts`
- `naos/apps/web/app/studio/sessions/page.tsx`

**Tests:**
- [ ] Unit tests for session recorder
- [ ] Unit tests for scene generator
- [ ] Integration test: Session → AudioSceneObject
- [ ] Integration test: Save/resume session
- [ ] Quality test: Beat marker accuracy >90%

**Success Criteria:**
- ✅ Session records all audio and metadata
- ✅ AudioSceneObject passes schema validation
- ✅ Beat markers detected with 90%+ accuracy
- ✅ Can save and resume sessions reliably

---

### Week 10: Cognition Audit & Recording Packets

**Tasks:**
1. **Wire Listener Cognition Audit**
   - [ ] Create `lib/studio/output/cognitionAudit.ts`
   - [ ] Run audit on generated AudioSceneObject
   - [ ] Check narrator presence
   - [ ] Validate speaker attribution
   - [ ] Check beat marker density
   - [ ] Monitor speaker switches
   - [ ] Generate audit report

2. **Implement Recording Packet Generation**
   - [ ] Wire existing audio engine function
   - [ ] Add context for voice director
   - [ ] Include beat markers
   - [ ] Add pronunciation notes
   - [ ] Generate fingerprint
   - [ ] Export to production format

3. **Build Session Review UI**
   - [ ] Create `/app/studio/review/[sessionId]/page.tsx`
   - [ ] Display audio playback with transcript
   - [ ] Show beat markers visually
   - [ ] Display cognition audit results
   - [ ] Add edit controls (re-record segments)
   - [ ] Implement publish workflow

4. **Add Post-Session Editing**
   - [ ] Allow text edits to transcript
   - [ ] Allow beat marker adjustments
   - [ ] Allow voice profile changes
   - [ ] Re-generate audio for edited segments
   - [ ] Track edit history

**Files Created:**
- `naos/apps/web/lib/studio/output/cognitionAudit.ts`
- `naos/apps/web/lib/studio/output/recordingPacket.ts`
- `naos/apps/web/app/studio/review/[sessionId]/page.tsx`
- `naos/apps/web/app/studio/review/components/AudioEditor.tsx`

**Tests:**
- [ ] Unit tests for cognition audit
- [ ] Unit tests for recording packet
- [ ] Integration test: Audit passes for good session
- [ ] Integration test: Audit fails for poor attribution
- [ ] E2E test: Session → Review → Publish

**Success Criteria:**
- ✅ Cognition audit catches attribution issues
- ✅ Recording packets are production-ready
- ✅ Post-session editing works smoothly
- ✅ Can publish AudioSceneObject to Narrative Engine

**Milestone 5 Demo:**
```
[After completing Studio session]

System: Generating Audio Scene Object...
        ✅ AudioSceneObject created (ID: scene-789)
        ✅ Beat markers authored (15 markers)
        ✅ Voice profiles assigned (Alex, Chen, Narrator)

        Running Listener Cognition Audit...
        ✅ Narrator present throughout
        ✅ Speaker attribution clear
        ⚠️  Beat marker density high at 02:15 (consider reducing)
        ✅ Speaker switches appropriate (3 switches)

        Overall: PASS (with 1 warning)

[Review UI displays]
- Audio player with waveform
- Transcript with beat markers annotated
- Edit controls for adjustments
- Publish button

[User reviews, makes minor edits, publishes]

System: Publishing AudioSceneObject...
        ✅ Added to Narrative Engine (event-123)
        ✅ Recording packet generated (packet-456)
        ✅ Saved to Object Storage (scene-789.json)

        Ready for production!
```

---

## Phase 6: Polish & Production (Weeks 11-12)

**Goal:** Production-ready Studio Mode for Founders launch

### Week 11: Performance & Error Handling

**Tasks:**
1. **Performance Optimization**
   - [ ] Profile audio latency (target <500ms)
   - [ ] Optimize context loading (target <100ms)
   - [ ] Cache frequently accessed data
   - [ ] Reduce unnecessary re-renders
   - [ ] Optimize database queries
   - [ ] Add query indexes

2. **Error Handling & Recovery**
   - [ ] Handle OpenAI API failures gracefully
   - [ ] Implement session state persistence
   - [ ] Handle audio buffer overflows
   - [ ] Recover from network interruptions
   - [ ] Add retry logic with exponential backoff
   - [ ] Display user-friendly error messages

3. **Monitoring & Logging**
   - [ ] Add session analytics
   - [ ] Log guardrail interventions
   - [ ] Track audio quality metrics
   - [ ] Monitor context cache hit rates
   - [ ] Add cost tracking
   - [ ] Build monitoring dashboard

4. **Testing & QA**
   - [ ] End-to-end Studio Mode sessions
   - [ ] Test guardrail scenarios
   - [ ] Test voice modulation quality
   - [ ] Test context retrieval accuracy
   - [ ] Load testing (multiple concurrent sessions)
   - [ ] Security audit

**Tests:**
- [ ] E2E test: Complete Studio session (text + audio)
- [ ] E2E test: Guardrail intervention workflow
- [ ] E2E test: Save/resume session
- [ ] E2E test: Review and publish
- [ ] Load test: 5 concurrent sessions
- [ ] Stress test: 60-minute session

**Success Criteria:**
- ✅ Audio latency <500ms (P95)
- ✅ Context loading <100ms (P95)
- ✅ Session failure rate <1%
- ✅ Graceful error recovery 100%
- ✅ Monitoring captures all key metrics

---

### Week 12: Documentation & Launch Prep

**Tasks:**
1. **User Documentation**
   - [ ] Write Studio Mode user guide
   - [ ] Create voice profile creation guide
   - [ ] Document guardrail configuration
   - [ ] Write troubleshooting guide
   - [ ] Create video tutorials
   - [ ] Build in-app onboarding

2. **Technical Documentation**
   - [ ] Document Studio Mode architecture
   - [ ] Write API documentation
   - [ ] Create runbooks for common issues
   - [ ] Document deployment process
   - [ ] Add monitoring guide
   - [ ] Write disaster recovery plan

3. **Founders Beta Prep**
   - [ ] Set up beta user accounts
   - [ ] Create beta feedback form
   - [ ] Plan beta testing schedule
   - [ ] Prepare support channels
   - [ ] Set up analytics tracking
   - [ ] Create beta announcement

4. **Launch Checklist**
   - [ ] All tests passing
   - [ ] Documentation complete
   - [ ] Monitoring in place
   - [ ] Error handling tested
   - [ ] Performance targets met
   - [ ] Security audit passed
   - [ ] Beta users onboarded

**Deliverables:**
- [ ] Studio Mode User Guide (docs/studio_mode_user_guide.md)
- [ ] Studio Mode Troubleshooting (docs/studio_mode_troubleshooting.md)
- [ ] Studio Mode Runbook (docs/studio_mode_runbook.md)
- [ ] Beta Feedback Form (Google Form or Replit form)
- [ ] Launch Announcement (email + website)

**Success Criteria:**
- ✅ All documentation complete
- ✅ 5 beta users onboarded
- ✅ Beta testing underway
- ✅ <1% failure rate in beta
- ✅ 90% user satisfaction rating

**Milestone 6: Founders Beta Launch**
```
[5 Founders beta users invited]
[Each completes 2+ Studio Mode sessions]
[Feedback collected and analyzed]

Metrics:
- Sessions completed: 12+
- Average session length: 25 minutes
- Guardrail interventions: 8 (67% accepted suggestions)
- Audio quality: 4.5/5 average rating
- User satisfaction: 90% "very satisfied"
- Issues found: 3 minor bugs (all fixed)

Status: READY FOR FULL FOUNDERS LAUNCH
```

---

## Post-Launch Roadmap (Weeks 13+)

### Phase 7: Multi-Voice System (Weeks 13-16)

**Goal:** Multiple AI voices in parallel for dialogue

**Key Tasks:**
- [ ] Multi-voice orchestration
- [ ] Audio mixing pipeline
- [ ] Synchronization logic
- [ ] Cost optimization
- [ ] Quality testing

**Success Criteria:**
- ✅ 3+ concurrent character voices
- ✅ Natural dialogue dynamics
- ✅ Acceptable cost increase (<2x)

---

### Phase 8: Multi-Agent System (Weeks 17-24)

**Goal:** Multiple AI agents (Narrator + Characters)

**Key Tasks:**
- [ ] Agent coordination framework
- [ ] Character agent personalities
- [ ] Emergent dialogue system
- [ ] Advanced audio mixing
- [ ] Cost control strategies

**Success Criteria:**
- ✅ Narrator + 2 character agents
- ✅ Emergent, believable dialogue
- ✅ Acceptable latency (<2 seconds)

---

### Phase 9: Voice Cloning (Weeks 25-28)

**Goal:** User's own voice for characters

**Key Tasks:**
- [ ] ElevenLabs voice cloning integration
- [ ] Voice sample collection UI
- [ ] Voice profile management
- [ ] Quality validation
- [ ] Cost management

**Success Criteria:**
- ✅ User can clone their voice
- ✅ Cloned voice quality high
- ✅ Voice switching works seamlessly

---

## Resource Allocation

### Developer Time Estimate

**Total:** 12 weeks (480 hours)

**Phase Breakdown:**
- Phase 1: 80 hours (2 weeks)
- Phase 2: 80 hours (2 weeks)
- Phase 3: 80 hours (2 weeks)
- Phase 4: 80 hours (2 weeks)
- Phase 5: 80 hours (2 weeks)
- Phase 6: 80 hours (2 weeks)

**Per Week:** ~40 hours (full-time)

---

## Cost Estimates

### Development Costs

**OpenAI API (Realtime):**
- Testing: ~$100/week × 12 weeks = $1,200
- Total: ~$1,200

**Anthropic API (Agent SDK):**
- Testing: ~$50/week × 12 weeks = $600
- Total: ~$600

**Replit Services:**
- Pro plan: $20/month × 3 months = $60
- Storage: ~$10/month × 3 months = $30
- Total: ~$90

**Total Development Cost:** ~$1,890

### Production Costs (Post-Launch)

**Per Hour of Studio Mode:**
- OpenAI Realtime: ~$18/hour
- Anthropic Claude: ~$4.30/hour
- Storage: negligible
- **Total:** ~$22-25/hour

**Revenue Context:**
- $49 Founders membership
- Break-even: ~2 hours of Studio Mode per member
- Profit margin: High after 2+ hours

---

## Risk Management

### Technical Risks

**Risk:** OpenAI Realtime API instability (new API)
**Mitigation:**
- Build fallback to ElevenLabs + Anthropic streaming
- Monitor API status closely
- Have contingency plan for outages

**Risk:** Context window overflow for large projects
**Mitigation:**
- Implement RAG early (Phase 3)
- Monitor context size closely
- Add context compression (summarization)

**Risk:** Audio latency exceeds targets
**Mitigation:**
- Profile early and often
- Optimize critical paths
- Use faster models when possible (Haiku)

**Risk:** Guardrails too aggressive (false positives)
**Mitigation:**
- Test with real Founders
- Tune thresholds based on feedback
- Add override system

### Business Risks

**Risk:** Users prefer traditional writing workflow
**Mitigation:**
- Build text-based mode as fallback (Phase 1)
- Offer both workflows
- Collect user feedback early

**Risk:** Costs exceed revenue
**Mitigation:**
- Monitor costs closely
- Implement usage limits if needed
- Consider tiered pricing for heavy users

**Risk:** Voice quality not good enough
**Mitigation:**
- Test multiple TTS providers
- Invest in voice cloning (Phase 9)
- Allow manual re-recording

---

## Success Metrics

### Phase 1 Metrics
- [ ] Session start success rate: 100%
- [ ] Tool calling success rate: 100%
- [ ] Guardrail accuracy: 100% (canon violations blocked)

### Phase 2 Metrics
- [ ] Audio latency (P95): <500ms
- [ ] Audio quality rating: 4+/5
- [ ] Voice switching success: 100%

### Phase 3 Metrics
- [ ] Context loading time (P95): <100ms
- [ ] Cache hit rate: >80%
- [ ] Project size supported: 500+ events

### Phase 4 Metrics
- [ ] False positive rate: <5%
- [ ] Intervention acceptance rate: >70%
- [ ] Intervention time: <30 seconds average

### Phase 5 Metrics
- [ ] Cognition audit pass rate: >90%
- [ ] Beat marker accuracy: >90%
- [ ] Session save/resume success: 100%

### Phase 6 Metrics
- [ ] Session failure rate: <1%
- [ ] User satisfaction: >90%
- [ ] Beta sessions completed: 10+

---

## Conclusion

This roadmap transforms Studio Mode from concept to production-ready feature in 12 weeks. Each phase builds on the previous, with clear milestones and success criteria.

**Key Milestones:**
- **Week 2:** Text-based Studio Mode working
- **Week 4:** Audio narration working
- **Week 6:** Extended context working
- **Week 8:** Guardrails production-ready
- **Week 10:** Session output pipeline complete
- **Week 12:** Founders beta launch

**Next Steps:**
1. Review and approve roadmap
2. Set up project tracking (GitHub Projects or similar)
3. Begin Phase 1: Foundation
4. Iterate based on learnings

---

**Document Maintenance:**
- Update weekly with progress
- Add blockers and dependencies
- Track actual vs estimated time
- Document lessons learned
