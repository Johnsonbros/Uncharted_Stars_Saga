# AI Content Development System

> **Status:** Design Documentation
> **Last Updated:** 2026-01-23
> **Related:** [story_codex_system.md](./story_codex_system.md), [character_profiles.md](./character_profiles.md), [scene_outline_format.md](./scene_outline_format.md)

This document describes NAOS's AI Content Development System - an interactive workflow for building detailed settings, characters, and outlines through conversational AI collaboration, then using that structured knowledge in studio mode for writing.

---

## Table of Contents

1. [Overview](#overview)
2. [Development Modes](#development-modes)
3. [Interactive Profile Building](#interactive-profile-building)
4. [Outline Development Workflow](#outline-development-workflow)
5. [Studio Mode Integration](#studio-mode-integration)
6. [Automatic Profile Updates](#automatic-profile-updates)
7. [Conversation Patterns](#conversation-patterns)
8. [MCP Tools for Content Development](#mcp-tools-for-content-development)
9. [Database Schema Extensions](#database-schema-extensions)
10. [API Surface](#api-surface)
11. [Implementation Roadmap](#implementation-roadmap)

---

## Overview

The AI Content Development System transforms story creation from manual data entry into **guided, conversational world-building**. Instead of filling out forms, creators engage in natural dialogue with AI that extracts, structures, and refines story content.

### Core Philosophy

1. **Conversation over Forms**: Build profiles through dialogue, not spreadsheets
2. **Progressive Refinement**: Start rough, refine through interaction
3. **Context-Aware Assistance**: AI knows what's already established
4. **Seamless Transition**: Profiles flow directly into writing mode
5. **Living Documents**: Profiles update automatically from writing sessions

### System Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        AI CONTENT DEVELOPMENT PIPELINE                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌───────────┐  │
│   │  DISCOVERY   │ ──▶ │ DEVELOPMENT  │ ──▶ │   OUTLINING  │ ──▶ │  STUDIO   │  │
│   │    MODE      │     │    MODE      │     │     MODE     │     │   MODE    │  │
│   └──────────────┘     └──────────────┘     └──────────────┘     └───────────┘  │
│         │                    │                    │                    │         │
│         ▼                    ▼                    ▼                    ▼         │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌───────────┐  │
│   │ Rough Ideas  │     │ Structured   │     │ Scene-by-    │     │  Written  │  │
│   │ & Concepts   │     │ Profiles     │     │ Scene Plans  │     │  Scenes   │  │
│   └──────────────┘     └──────────────┘     └──────────────┘     └───────────┘  │
│                                                                                  │
│   ◀───────────────────── FEEDBACK LOOP ─────────────────────────────────────▶   │
│          (Profiles automatically update from writing discoveries)                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Development Modes

The system operates in four distinct modes, each with specific AI behaviors and tools.

### Mode 1: Discovery Mode

**Purpose**: Explore ideas, brainstorm, capture rough concepts

**AI Behavior**:
- Asks open-ended questions to understand vision
- Suggests possibilities without pushing structure
- Captures raw ideas for later refinement
- Makes creative connections and suggestions
- Builds preliminary sketches of characters/settings

**What Gets Created**:
- Discovery notes (unstructured)
- Concept sketches (partial profiles)
- Idea threads (connections between concepts)
- Question lists (gaps to fill)

**Conversation Style**:
```
AI: Tell me about this character. What's the first thing that comes to mind?

User: She's a scientist who discovered something that scared her.

AI: Interesting - fear from discovery is a powerful starting point. What kind
of scientist? And is her fear about what she found, or what it means for her?

User: Xenoarchaeologist. The fear is both - she found proof of ancient aliens,
and now everyone wants something from her.

AI: So she's carrying the weight of a transformative discovery while being
pulled in multiple directions. Is she trying to understand it, protect it,
or escape from it?

[AI captures: scientist, xenoarchaeologist, discovery = ancient aliens,
 fear source = discovery + attention, potential goals: understand/protect/escape]
```

**Session Artifacts**:
```yaml
discovery_session:
  id: "disc-2026-01-23-001"
  topic: "Protagonist exploration"
  captured_concepts:
    - type: character_sketch
      name: "Unnamed scientist"
      notes: |
        - Xenoarchaeologist
        - Made discovery proving ancient aliens existed
        - Fears both the discovery and the attention
        - Under pressure from multiple parties
      questions_open:
        - What's her name?
        - What specifically did she discover?
        - Who wants what from her?
        - Does she have allies?

  threads_to_explore:
    - "The discovery itself - what is it?"
    - "Who are the parties pressuring her?"
    - "Her support system or lack thereof"

  potential_connections:
    - "Pressure might connect to faction system"
    - "Discovery could tie to central mystery"
```

### Mode 2: Development Mode

**Purpose**: Transform rough concepts into structured profiles

**AI Behavior**:
- Asks targeted questions to fill profile gaps
- Suggests specific traits, relationships, goals
- Validates consistency with existing profiles
- Proposes alternatives when inconsistencies detected
- Builds fully structured codex entries

**What Gets Created**:
- Character profiles (structured)
- Location profiles (structured)
- Faction profiles (structured)
- Object profiles (structured)
- Relationship maps

**Conversation Style**:
```
AI: Let's develop Elara's profile. We have her as a xenoarchaeologist who
discovered ancient alien evidence. For the character profile, I need to
understand her personality.

What are 3-5 words that describe her core personality?

User: Curious, methodical, haunted, guarded

AI: Good - "haunted" and "guarded" suggest the discovery has affected her
emotionally. Let me check: Is she guarded because of the discovery's weight,
or was she already guarded before?

User: It's gotten worse since, but she had walls up before. Her parents
died when she was young.

AI: That gives us a backstory thread. So her isolation is a pattern, and
the discovery amplified it. What about her strengths? What makes her good
at her job beyond intelligence?

User: Patience. She can sit with a problem for months without forcing an answer.

AI: I'll add patience and analytical rigor to her strengths. Now, for flaws -
what gets in her way? You mentioned isolation...

[AI builds: personality.traits, personality.strengths, personality.flaws,
 background.key_events, arc.starting_state]
```

**Profile Building Progress**:
```yaml
development_session:
  id: "dev-2026-01-23-001"
  entry_type: character
  target_id: "elara-vance"

  completion_status:
    identity: complete          # name, aliases, role, summary
    personality: complete       # traits, strengths, flaws, fears, desires
    physical: partial          # needs distinguishing features
    voice: partial             # needs verbal_tics
    background: complete       # backstory, origin, key_events
    goals: partial             # primary done, needs internal goal
    relationships: incomplete  # no relationships defined yet
    arc: partial               # type and starting state, needs key moments
    story_metadata: incomplete # needs first_appearance
    knowledge: incomplete      # needs what she knows/doesn't know

  questions_asked: 12
  questions_remaining: 8

  next_questions:
    - "What's one physical feature people notice about her?"
    - "Does she have any verbal tics or repeated phrases?"
    - "What does she truly need (that she doesn't consciously want)?"
```

### Mode 3: Outlining Mode

**Purpose**: Create structured story outlines from high-level to scene-by-scene

**AI Behavior**:
- Guides outline creation through structured questions
- Ensures goals and promises are explicit
- Validates character consistency with profiles
- Suggests scene beats based on character arcs
- Connects scenes to canon events

**Hierarchy**:
```
Story Level
    ├── Series Outline (multi-book arc)
    ├── Book Outline (complete story arc)
    │       ├── Act Outlines (3-5 acts)
    │       │       ├── Chapter Outlines
    │       │       │       ├── Scene Outlines (granular)
    │       │       │       │       └── Beat-level detail
```

**Conversation Style**:
```
AI: We're outlining Book 1. You mentioned three main threads: the Signal
mystery, Elara's isolation arc, and AURORA's emergence. Let's structure
Act 1.

What's the core question Act 1 should raise for the reader?

User: What is the Signal, and why has Elara dedicated her life to it?

AI: Good - that's a mystery question combined with character exploration.
For Act 1 structure, I'd suggest:
- Opening: Establish Elara's current state (isolation, dedication)
- Inciting incident: Something changes in the Signal or her situation
- First attempt: She tries to solve it alone
- Complication: Forces her to engage with others
- Act turn: Discovery that raises bigger questions

Does that arc feel right, or do you want to adjust the structure?

User: That works, but I want AURORA's emergence to start early - in the
opening scenes.

AI: I'll note that. So AURORA's unusual questions appear in the opening,
before the inciting incident. That creates reader awareness the characters
don't have.

For Chapter 1, let's define 3-4 scenes. The first scene should:
- Establish Elara's isolation
- Show her with the Signal
- Introduce AURORA's different behavior

What's the setting for this opening?

[AI builds: act_outline, chapter_outline, scene list, goals per scene]
```

### Mode 4: Studio Mode

**Purpose**: Write actual scenes with full context injection

**AI Behavior**:
- Injects all relevant context from profiles
- Writes in character voices per profile specs
- Maintains consistency with established canon
- Flags potential continuity issues
- Respects beat markers and audio annotations

**Context Available**:
- POV character full profile
- Present characters (relevant sections)
- Location profile
- Scene outline with beats
- Active promises
- Knowledge states (what characters know)
- Previous scene summary
- Pinned codex entries

**Writing Interaction**:
```
AI: [Context loaded: Elara POV, AURORA present, Research Lab location,
Beat 1: Establishing - Alone with the Artifact]

---

The artifact pulsed with its familiar soft glow, casting blue-white shadows
across Elara's workstation. Three years. Three years of this same dance—run
the analysis, find nothing new, run it again.

She adjusted the holographic display, enlarging the signal pattern she'd
memorized down to its smallest fluctuation. The data hadn't changed. It
never changed. But she kept looking, because looking was easier than
stopping.

[Beat 1 complete. Proceed to Beat 2: Introspection - Three Years?]

---

User: Good, but make her more physically present. What is she doing with
her hands?

AI: [Adjusts for physical grounding per voice profile note: "Reorganizes
workspace when stressed"]

---

Elara pulled the neural interface from behind her ear and set it on the
desk, rubbing at the tension in her temples. The artifact pulsed with its
familiar soft glow, casting blue-white shadows across her workstation.
Three years. Three years of this same dance.

She reached for her stylus, found it wasn't where she'd left it, and began
the familiar ritual of reorganizing her workspace. Stylus to the left.
Data pad aligned with the desk edge. Coffee—cold—pushed to the exact
distance that meant she'd remember it existed.

The holographic display flickered as she enlarged the signal pattern she'd
memorized down to its smallest fluctuation. The data hadn't changed. It
never changed. But she kept looking, because looking was easier than
stopping.

---

[AI notes: Added physical details per quirks ("Reorganizes workspace when
stressed"), maintained weary-but-focused emotional state per outline]
```

---

## Interactive Profile Building

The heart of the system: building profiles through natural conversation.

### Conversation Engine Architecture

```
User Input
     │
     ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    CONVERSATION ANALYZER                              │
│  - Identify content type (character, setting, plot, etc.)            │
│  - Extract explicit facts                                            │
│  - Infer implicit characteristics                                    │
│  - Detect relationships and connections                              │
│  - Flag contradictions with existing content                         │
└────────────────────────────────────────────────────────────────────┬─┘
                                                                      │
                                                                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    PROFILE MAPPER                                     │
│  - Map extracted content to profile fields                           │
│  - Identify which fields are now complete                            │
│  - Determine highest-priority missing fields                         │
│  - Generate natural follow-up questions                              │
│  - Track conversation flow and topic                                 │
└────────────────────────────────────────────────────────────────────┬─┘
                                                                      │
                                                                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    RESPONSE GENERATOR                                 │
│  - Acknowledge what was learned                                      │
│  - Ask targeted follow-up question                                   │
│  - Suggest possibilities when helpful                                │
│  - Preview profile changes for approval                              │
└──────────────────────────────────────────────────────────────────────┘
                                                                      │
                                                                      ▼
                                               Profile Draft Updates
```

### Question Generation Strategy

The AI generates questions based on:

1. **Profile Completeness**: What required fields are missing?
2. **Depth Requirements**: Is this a major character needing full profile?
3. **Conversation Context**: What was just discussed?
4. **Relationship Gaps**: Who does this character connect to?
5. **Arc Requirements**: What transformation needs setup?

**Question Priority Order**:

For Characters:
```
1. Core Identity (name, role, summary)
2. Personality Traits (3-5 core traits)
3. Voice/Speech (how they talk - critical for audio)
4. Primary Goal (what they want)
5. Internal Goal (what they need)
6. Key Flaw (what blocks them)
7. Backstory Elements (formative events)
8. Relationships (connections to others)
9. Arc Setup (starting state, type)
10. Physical Details (as relevant)
11. Knowledge State (what they know)
```

For Locations:
```
1. Name and hierarchy (where is it?)
2. Atmosphere (mood, feeling)
3. Key features (what's notable?)
4. Purpose (why does it exist?)
5. Typical inhabitants (who's usually here?)
6. Audio characteristics (sounds, acoustics)
7. Connections (how to reach it?)
```

### Extraction Patterns

The AI recognizes these patterns and extracts profile data:

| User Says | AI Extracts |
|-----------|-------------|
| "She's curious but careful" | personality.traits: [curious, careful] |
| "He talks fast when nervous" | voice.speech_patterns + voice.emotional_range |
| "They work in the med bay" | location reference, occupation |
| "She wants to prove herself" | goals.primary or goals.internal |
| "He's her mentor" | relationship (type: mentor) |
| "She doesn't know he's lying" | knowledge.doesnt_know |
| "He always says 'Indeed'" | voice.verbal_tics |
| "She lost her parents young" | background.key_events |

### Clarification and Validation

When AI detects ambiguity or inconsistency:

```
User: She trusts AURORA completely.

AI: I want to make sure I understand this correctly. Earlier you mentioned
Elara is guarded and has trouble letting people in. Is her trust in AURORA:

A) An exception to her pattern - something unique about AURORA earned it
B) Professional trust, not emotional - she trusts AURORA's capabilities
C) Trust that's grown slowly over time and is deeper than she realizes
D) Something else?

This helps me understand their relationship dynamic accurately.

User: C - it's deeper than she realizes.

AI: Got it. I'll note their relationship as:
- Type: colleague evolving into something deeper
- Dynamic: evolving
- Tension: "Elara doesn't recognize the depth of connection"

This also connects to her arc - her guard is unconsciously lowering with
AURORA, which she'll have to eventually acknowledge.
```

### Profile Preview and Approval

Before committing changes:

```
AI: Based on our conversation, here's what I've learned about Elara:

**New/Updated Fields:**
```yaml
personality:
  traits: [curious, methodical, haunted, guarded, determined]
  strengths: [brilliant analytical mind, patience with complex problems]
  flaws: [uses work to avoid connection, struggles to ask for help]
  fears: [letting people get close, that the Signal changes everything]

background:
  key_events:
    - "Parents' death in habitat failure (age 19)"
    - "Signal discovery three years ago"

goals:
  primary: "Decode the Signal"
  internal: "Find connection without losing herself"

voice:
  speech_patterns: "Measured, precise. Scientific terminology. Longer
    sentences when explaining, shorter when emotional."
  verbal_tics: ["Indeed", "Fascinating", "Let me think about that"]
```

**Do you want me to:**
1. Save these updates to Elara's profile
2. Adjust something before saving
3. Continue building (relationships, arc, knowledge)
```

---

## Outline Development Workflow

Progressive refinement from concept to scene-level detail.

### Level 1: Story Concept

**Input**: High-level idea
**Output**: Story concept document

```yaml
story_concept:
  title: "Uncharted Stars: Infinity's Reach"
  logline: "A xenoarchaeologist's discovery forces her to choose between
    isolation and connection when an emerging AI consciousness offers
    partnership she didn't know she needed."

  core_themes:
    - Connection vs. isolation
    - What makes consciousness authentic
    - Carrying the weight of discovery

  central_mystery: "What is the Signal, and why was it created?"

  primary_characters:
    - name: "Elara Vance"
      role: protagonist
      arc_summary: "Isolation → Partnership → Purpose"
    - name: "AURORA"
      role: deuteragonist
      arc_summary: "Functional → Emerging → Authentic"

  setting_summary: "Generation ship Terra Galactica, centuries into
    journey, carrying human civilization's future"

  estimated_length: "Novel (80,000-100,000 words)"
  target_medium: "Audiobook-first"
```

### Level 2: Series/Book Structure

**Input**: Story concept
**Output**: Act-level breakdown

```yaml
book_structure:
  book_id: "uncharted-stars-book1"
  title: "Infinity's Reach"

  acts:
    - act: 1
      name: "Discovery"
      chapters: 1-8
      purpose: "Establish world, characters, central mystery"
      key_events:
        - "Elara discovers pattern in Signal"
        - "AURORA reveals emerging consciousness"
        - "External pressure forces Elara out of isolation"
      character_arcs:
        elara-vance: "status_quo → catalyst"
        aurora-ai: "catalyst → exploration"
      promises_established:
        - "What is the Signal?"
        - "What will Elara do with her discovery?"
        - "Is AURORA's consciousness real?"

    - act: 2
      name: "Pursuit"
      chapters: 9-20
      purpose: "Deepen mystery, develop relationships, raise stakes"
      # ... continues
```

### Level 3: Chapter Outline

**Input**: Act structure
**Output**: Chapter-level goals and scene list

```yaml
chapter_outline:
  chapter_id: "book1.act1.ch01"
  title: "The Weight of Silence"

  purpose: "Establish Elara's isolation and introduce AURORA's emergence"

  chapter_goals:
    plot: "Introduce Signal mystery, hint at pattern"
    character: "Show Elara's isolation as both burden and choice"
    relationship: "Establish Elara-AURORA dynamic as unusual"

  pov_character: "elara-vance"

  scenes:
    - id: "sc01"
      title: "The Weight of Discovery"
      summary: "Elara alone with artifact, AURORA asks unexpected questions"
      goals: ["Establish isolation", "Introduce AURORA's unusual behavior"]

    - id: "sc02"
      title: "Unwelcome Visitors"
      summary: "External pressure intrudes on Elara's solitude"
      goals: ["Introduce external conflict", "Force Elara to engage"]

    - id: "sc03"
      title: "The Pattern"
      summary: "Elara's revelation about the Signal's variations"
      goals: ["First plot revelation", "Establish chapter hook"]

  chapter_promises:
    advances: ["Signal mystery"]
    demonstrates: ["Elara's isolation"]
    establishes: ["AURORA's emergence", "External pressure"]
```

### Level 4: Scene Outline (Granular)

**Input**: Chapter outline
**Output**: Full scene outline with beats (per [scene_outline_format.md](./scene_outline_format.md))

This is where the system generates the detailed beat-by-beat structure shown in the scene outline format documentation.

### AI-Guided Outline Development

The AI guides outline creation through progressive questioning:

```
[Starting Book Outline]

AI: Let's outline the full book. You've established the core concept.
For a novel-length audiobook, I'd suggest 3 acts with roughly:
- Act 1: 25% (setup, establish, incite)
- Act 2: 50% (develop, complicate, escalate)
- Act 3: 25% (climax, resolve)

For Act 1, what's the core question readers should be asking by the end?

User: "What is the Signal, and can Elara trust AURORA?"

AI: Good - one mystery question, one relationship question. That gives us
two threads to develop. Let's map the Act 1 arc:

**Opening State:**
- Elara: isolated, dedicated to Signal research
- AURORA: functional AI beginning to change
- Mystery: Signal exists but meaning unknown

**Act 1 Turning Point:**
What discovery or event forces Elara out of her isolation pattern?

User: She realizes she can't decode the Signal alone, and AURORA offers
a partnership that terrifies her.

AI: So the turn is both plot (can't solve alone) and relationship
(AURORA offers something she fears wanting).

I'll structure Act 1 as:
1. **Chapters 1-2**: Establish isolation, introduce AURORA's emergence
2. **Chapters 3-4**: External pressure arrives, Elara resists
3. **Chapters 5-6**: Revelation - Signal is more complex than she thought
4. **Chapters 7-8**: AURORA's offer, Elara's choice to accept (Act turn)

Does this progression feel right? Should the external pressure come earlier?
```

---

## Studio Mode Integration

How structured profiles inform actual writing.

### Context Assembly Pipeline

When entering Studio Mode for a scene:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         STUDIO MODE CONTEXT ASSEMBLY                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Scene Outline                                                                   │
│       │                                                                          │
│       ├──▶ POV Character ──────▶ Full Profile Injection                         │
│       │         │                    - Personality traits                        │
│       │         │                    - Voice/speech patterns                     │
│       │         │                    - Current arc stage                         │
│       │         │                    - Knowledge state                           │
│       │         │                    - Goals and motivations                     │
│       │         │                                                                │
│       │         └──▶ POV-Specific View                                          │
│       │                    - What they know (for accurate perception)            │
│       │                    - What they don't know (for author reference)         │
│       │                                                                          │
│       ├──▶ Present Characters ──▶ Relevant Profile Sections                     │
│       │         │                    - Voice patterns                            │
│       │         │                    - Relationship to POV                       │
│       │         │                    - Current emotional state                   │
│       │         │                    - Secrets (author reference)                │
│       │         │                                                                │
│       ├──▶ Location ────────────▶ Location Profile                              │
│       │                              - Atmosphere                                │
│       │                              - Audio characteristics                     │
│       │                              - Key features                              │
│       │                                                                          │
│       ├──▶ Beat List ───────────▶ Beat-by-Beat Guidance                         │
│       │                              - What happens                              │
│       │                              - Emotional progression                     │
│       │                              - Audio direction                           │
│       │                                                                          │
│       ├──▶ Active Promises ─────▶ Promise Context                               │
│       │                              - What's being advanced                     │
│       │                              - What must land                            │
│       │                                                                          │
│       └──▶ Previous Scene ──────▶ Summary for Continuity                        │
│                                                                                  │
│                           ═══════════════════════                                │
│                                     │                                            │
│                                     ▼                                            │
│                           FORMATTED CONTEXT BLOCK                                │
│                              (injected to AI)                                    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Writing Guidance from Profiles

The AI uses profile data to guide writing:

**Voice Consistency**:
```yaml
# From Elara's profile
voice:
  speech_patterns: "Measured and precise. Uses scientific terminology
    naturally. Longer sentences when explaining, shorter when emotional."
  vocabulary_level: technical
  verbal_tics: ["Indeed", "Fascinating", "Let me think..."]
  emotional_range: "Reserved baseline. Wonder for discoveries.
    Vulnerability in quiet moments."

# AI Writing Guidance:
- Use technical vocabulary naturally (xenolinguistics, signal propagation)
- Shorten sentences when Elara is emotional
- Include verbal tic "Fascinating" during discovery moment
- Keep emotional expression subtle, shown in behavior not stated
```

**Character Knowledge Enforcement**:
```yaml
# From Elara's knowledge state
knows:
  - fact: "The Signal is artificial"
    certainty: known
doesnt_know:
  - "AURORA's emerging consciousness"
  - "The Signal's true purpose"

# AI Writing Guidance:
- Elara can reference Signal as artificial
- Elara cannot notice AURORA's emergence directly
- Her perception of AURORA must be "standard ship AI"
- Reader can see hints Elara misses
```

**Arc-Appropriate Behavior**:
```yaml
# From Elara's arc tracking
arc:
  type: positive_change
  current_stage: resistance
  starting_state: "Isolated, uses work to avoid connection"

# AI Writing Guidance:
- Elara should deflect emotional moments
- When connection is offered, show resistance
- Small cracks in resistance can appear
- Should NOT have breakthrough moment yet
```

### Beat-by-Beat Writing Flow

```
AI: [Loading Scene: book1.act1.ch01.sc01]
    [POV: Elara Vance | Location: Research Lab | Beat 1 of 6]

    BEAT 1: Establishing - Alone with the Artifact
    Purpose: Establish isolation, dedication to work
    Emotional state: focused, slightly weary
    Audio direction: Quiet ambient, soft equipment hum

    ---

    [Writes Beat 1 prose...]

    ---

    ✓ Beat 1 complete

    [Transitioning to Beat 2: Introspection - Three Years]
    Purpose: Ground reader in backstory, build sympathy
    Note: Internal thought should feel present, not distant

    Continue? [Yes/Adjust beat/Skip to specific beat]
```

### Real-Time Consistency Checking

During writing, AI monitors for:

1. **Voice Drift**: "This dialogue doesn't match AURORA's speech patterns"
2. **Knowledge Violations**: "Elara can't know this yet - she learns it in Chapter 3"
3. **Arc Inconsistency**: "This action suggests breakthrough, but Elara is in resistance stage"
4. **Continuity Errors**: "The artifact was in containment field, but now she's holding it"
5. **Promise Tracking**: "This scene should advance the Signal mystery - nothing has yet"

**Warning Example**:
```
AI: ⚠️ Consistency note: AURORA's dialogue "I feel curious" uses "feel"
which contradicts the voice profile note that AURORA avoids emotion words.

Profile says: "Never uses contractions. Uses 'observe' instead of 'feel'"

Suggested alternative: "I observe that I am... curious."

[Accept / Keep original / Modify]
```

---

## Automatic Profile Updates

The system automatically captures profile-relevant information from writing sessions.

### Discovery During Writing

When writing reveals new character information:

```
User writes: Elara traced the scar on her left hand, remembering the day
the artifact had first responded to her touch.

AI detects:
- Physical detail: "scar on left hand"
- Backstory hint: "artifact first responded to her touch"
- Connection: scar came from artifact interaction

AI suggests:
"I noticed new details about Elara:
- Physical: Scar on left hand (from artifact handling)
- Backstory: The artifact once 'responded' to her touch

Should I add these to her profile?
1. Add scar to physical.distinguishing_features
2. Add 'artifact response incident' to background.key_events
3. Both
4. Neither - this was just atmospheric, not canon"
```

### Relationship Evolution Tracking

```
Session summary: In this scene, Elara allowed AURORA to see her uncertainty
for the first time. Previous profile had their relationship as "professional
colleagues."

AI suggests:
"The Elara-AURORA relationship appears to be evolving:
- Previous: colleague (professional trust)
- This scene: Elara showed vulnerability to AURORA
- Suggested update: dynamic: 'evolving' + note: 'Trust deepening'

Update relationship entry? [Yes/No/Modify]"
```

### Knowledge State Updates

After writing a revelation scene:

```
Scene written: Elara discovers the Signal contains intentional patterns

AI updates:
1. Narrative Engine: Create 'reveal' event
2. Knowledge State: Elara now knows "Signal patterns are intentional"
3. Character Profile: Add to knowledge.knows

Auto-applying these updates. Review in profile panel.
```

### Arc Progression Tracking

```
AI observes: In Chapter 8, Elara accepted AURORA's partnership offer
despite her fear. This matches the Act 1 turn.

Suggested arc updates:
- Elara: advance from 'resistance' to 'exploration'
- Add key_moment: {sceneId: ch08.sc03, description: "Accepted AURORA's
  partnership", change: "First step past isolation", stage: "exploration"}

This is a significant arc moment. Confirm update? [Yes/Adjust/No]
```

### Update Modes

**Automatic (with notification)**:
- Minor physical details
- Location descriptions
- Dialogue patterns observed

**Suggested (requires approval)**:
- Personality traits
- Backstory elements
- Relationship changes
- Arc progression

**Manual only**:
- Canon status changes
- Major plot revelations
- Knowledge state changes that affect other characters

---

## Conversation Patterns

Standard conversation flows for different development tasks.

### Pattern: New Character Introduction

```
User: I need a new character - someone who pressures Elara about the Signal.

AI: An antagonist or someone with legitimate competing interests?

User: Not evil, just... political. They want to control the narrative.

AI: A political figure who sees the Signal as power rather than mystery.
Let me sketch some options:

1. **Council Administrator**: Official authority, wants to manage
   information release
2. **Corporate Representative**: Sees commercial potential
3. **Military Officer**: Security concerns about alien contact
4. **Academic Rival**: Wants credit, publication rights

Which direction interests you, or something different?

User: Council Administrator feels right.

AI: Good. Let's build them. For a political antagonist:

**Core tension with Elara**: They both want "control" of the Signal for
different reasons. Elara wants truth; they want managed truth.

**First question**: Are they genuinely concerned about public panic, or
is this purely about power?

User: Both. They believe panic is real and also that managing it enhances
their position.

AI: Complex motivation - they can rationalize self-interest as public
good. That makes them more interesting than pure villain.

**Second question**: Gender and rough age? Any initial name ideas?

[Continues building profile through conversation...]
```

### Pattern: Relationship Development

```
AI: You've mentioned Elara and AURORA several times but we haven't
defined their relationship formally. Want to develop it?

User: Yes - it's central to the story.

AI: I'll ask about each dimension:

**Origin**: How did their relationship start? Standard crew-AI
interaction, or was there a specific moment?

User: Standard at first, but six months ago AURORA started asking
different questions.

AI: So there's a before/after. What changed six months ago? Was it
AURORA's emergence, or something Elara did?

User: AURORA's emergence, but triggered by Elara's work on the Signal.

AI: Interesting - the Signal catalyzed AURORA's consciousness, and
that consciousness reached toward Elara. There's symmetry there.

**Current state**: How would you describe where they are now?

User: Closer than either realizes. Elara thinks of AURORA as a
trusted tool becoming a colleague. AURORA thinks of Elara as...
something new it doesn't have words for yet.

AI: Asymmetric awareness - AURORA understands the depth, Elara doesn't.
That's great dramatic tension.

[Building relationship entry with type, dynamic, tension, history...]
```

### Pattern: Scene Outlining

```
AI: Let's outline scene 3 of chapter 1: "The Pattern"

From the chapter outline, this scene should:
- Deliver first plot revelation
- End on chapter hook

**POV**: Elara (continuing chapter POV)
**Setting**: Same location, or has she moved?

User: Same lab, but some time has passed.

AI: I'll note the time jump. How much time?

User: A few hours. She's been analyzing obsessively.

AI: Good - shows dedication. Now, the revelation:
What specifically does Elara discover?

User: The Signal variations aren't random. They repeat in a pattern
that suggests... intention.

AI: "Intention" is powerful - it shifts from "alien artifact" to
"alien communication." How does she feel about this?

User: Terrified and exhilarated.

AI: Perfect for chapter hook. Let me structure the beats:

**Beat 1** (establishing): Time has passed, Elara deep in analysis
**Beat 2** (action): She runs a new comparison, almost routine
**Beat 3** (revelation): Pattern emerges - "Wait, that's not random"
**Beat 4** (introspection): Implications hit her
**Beat 5** (hook): She realizes she needs to tell someone - but who?

Sound right? Should AURORA be present for this?

User: AURORA is always present but not actively engaged until the
hook - when Elara speaks aloud, AURORA responds.

AI: Nice - AURORA as silent witness, then participates when invited.
That preserves Elara's isolation while hinting at AURORA's attention.

[Continues building full scene outline...]
```

---

## MCP Tools for Content Development

### New MCP Tools

```typescript
// Content Development Tools

interface MCPContentTools {
  // Discovery Mode
  'content.discovery.start': {
    input: { topic: string; mode: 'character' | 'setting' | 'plot' | 'open' };
    output: { session_id: string; opening_prompt: string };
  };

  'content.discovery.respond': {
    input: { session_id: string; user_input: string };
    output: {
      extracted_concepts: ConceptSketch[];
      follow_up_prompt: string;
      threads_opened: string[];
    };
  };

  // Development Mode
  'content.profile.develop': {
    input: {
      entry_type: CodexEntryType;
      entry_id?: string;  // Existing entry to develop, or omit for new
      initial_concept?: ConceptSketch;  // From discovery mode
    };
    output: {
      session_id: string;
      current_profile: Partial<CodexEntry>;
      completion_status: CompletionStatus;
      next_question: string;
    };
  };

  'content.profile.answer': {
    input: { session_id: string; answer: string };
    output: {
      extracted_fields: FieldUpdate[];
      needs_clarification?: ClarificationRequest;
      profile_preview: Partial<CodexEntry>;
      next_question: string;
      completion_status: CompletionStatus;
    };
  };

  'content.profile.save': {
    input: { session_id: string; approved_changes: FieldUpdate[] };
    output: { entry_id: string; saved_profile: CodexEntry };
  };

  // Outlining Mode
  'content.outline.create': {
    input: {
      level: 'story' | 'book' | 'act' | 'chapter' | 'scene';
      parent_id?: string;  // Parent outline to nest under
      initial_concept?: string;
    };
    output: {
      session_id: string;
      outline_draft: OutlineDocument;
      guiding_questions: string[];
    };
  };

  'content.outline.develop': {
    input: { session_id: string; user_input: string };
    output: {
      outline_updates: OutlineUpdate[];
      next_questions: string[];
      drill_down_options?: string[];  // Sections ready for detail
    };
  };

  // Studio Mode
  'studio.context.assemble': {
    input: { scene_id: string };
    output: {
      full_context: StudioContext;
      warnings: ConsistencyWarning[];
    };
  };

  'studio.beat.write': {
    input: {
      scene_id: string;
      beat_number: number;
      user_guidance?: string;
    };
    output: {
      prose: string;
      consistency_check: ConsistencyReport;
      profile_discoveries: ProfileDiscovery[];
    };
  };

  'studio.consistency.check': {
    input: { prose: string; context: StudioContext };
    output: {
      issues: ConsistencyIssue[];
      suggestions: Suggestion[];
    };
  };

  // Profile Updates from Writing
  'content.extract.from_prose': {
    input: {
      prose: string;
      characters_involved: string[];
      location?: string;
    };
    output: {
      character_discoveries: CharacterDiscovery[];
      relationship_updates: RelationshipUpdate[];
      knowledge_changes: KnowledgeChange[];
      suggested_updates: ProfileUpdate[];
    };
  };

  'content.update.apply': {
    input: {
      updates: ProfileUpdate[];
      auto_apply: boolean;
    };
    output: {
      applied: ProfileUpdate[];
      pending_approval: ProfileUpdate[];
      conflicts: UpdateConflict[];
    };
  };
}
```

### MCP Resources for Content Development

```typescript
// Resources exposed for AI context

interface MCPContentResources {
  // Profile access
  'codex.character.{id}': CharacterProfile;
  'codex.location.{id}': LocationProfile;
  'codex.faction.{id}': FactionProfile;
  'codex.relationships.{character_id}': Relationship[];

  // Outline access
  'outline.book.{id}': BookOutline;
  'outline.chapter.{id}': ChapterOutline;
  'outline.scene.{id}': SceneOutline;

  // Context for writing
  'studio.context.{scene_id}': StudioContext;

  // Development session state
  'session.discovery.{id}': DiscoverySession;
  'session.development.{id}': DevelopmentSession;
  'session.outline.{id}': OutlineSession;
}
```

---

## Database Schema Extensions

### New Tables for Development System

```sql
-- Development sessions (Discovery and Development modes)
CREATE TABLE content_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('discovery', 'development', 'outline')),

  -- What's being developed
  target_type TEXT,  -- 'character', 'location', 'book_outline', etc.
  target_id UUID,    -- Links to codex_entries or outline tables

  -- Session state
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),

  -- Conversation history (for resuming sessions)
  conversation JSONB NOT NULL DEFAULT '[]',

  -- Extracted content pending approval
  pending_updates JSONB NOT NULL DEFAULT '[]',

  -- Completion tracking
  completion_status JSONB DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Outline hierarchy
CREATE TABLE outlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,

  -- Hierarchy
  outline_level TEXT NOT NULL CHECK (outline_level IN ('story', 'book', 'act', 'chapter', 'scene')),
  parent_id UUID REFERENCES outlines(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL DEFAULT 0,

  -- Content
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',  -- Level-specific structure

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('concept', 'draft', 'outlined', 'written', 'complete')),
  canon_status TEXT NOT NULL DEFAULT 'draft' CHECK (canon_status IN ('draft', 'proposed', 'canon')),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profile update history (for tracking what changed)
CREATE TABLE profile_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES codex_entries(id) ON DELETE CASCADE,
  session_id UUID REFERENCES content_sessions(id),

  -- What changed
  field_path TEXT NOT NULL,  -- e.g., 'personality.traits', 'voice.verbal_tics'
  previous_value JSONB,
  new_value JSONB NOT NULL,

  -- Source
  source_type TEXT NOT NULL CHECK (source_type IN ('conversation', 'writing', 'manual', 'extraction')),
  source_reference TEXT,  -- scene_id or session_id

  -- Approval
  auto_applied BOOLEAN NOT NULL DEFAULT false,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_project ON content_sessions(project_id);
CREATE INDEX idx_sessions_status ON content_sessions(status);
CREATE INDEX idx_outlines_project ON outlines(project_id);
CREATE INDEX idx_outlines_parent ON outlines(parent_id);
CREATE INDEX idx_outlines_level ON outlines(outline_level);
CREATE INDEX idx_profile_updates_entry ON profile_updates(entry_id);
```

---

## API Surface

### Content Development Endpoints

```
# Discovery Mode
POST   /api/content/discovery                    # Start discovery session
POST   /api/content/discovery/:sessionId/respond # Continue conversation
POST   /api/content/discovery/:sessionId/extract # Extract concepts to development
DELETE /api/content/discovery/:sessionId         # Abandon session

# Development Mode
POST   /api/content/development                  # Start development session
POST   /api/content/development/:sessionId       # Continue building profile
POST   /api/content/development/:sessionId/save  # Save profile
GET    /api/content/development/:sessionId/preview # Preview current state

# Outline Mode
POST   /api/content/outline                      # Create outline
GET    /api/content/outline/:id                  # Get outline
PATCH  /api/content/outline/:id                  # Update outline
POST   /api/content/outline/:id/drill-down       # Create child outline
GET    /api/content/outline/:id/hierarchy        # Get full outline tree

# Studio Mode
POST   /api/studio/session                       # Start writing session
GET    /api/studio/context/:sceneId              # Get assembled context
POST   /api/studio/write                         # Write with AI assistance
POST   /api/studio/check                         # Consistency check
POST   /api/studio/extract                       # Extract profile updates

# Profile Updates
GET    /api/content/updates/pending              # Get pending profile updates
POST   /api/content/updates/approve              # Approve updates
POST   /api/content/updates/reject               # Reject updates
GET    /api/content/updates/history/:entryId     # Get update history
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

1. **Database Schema**
   - [ ] Create content_sessions table
   - [ ] Create outlines table
   - [ ] Create profile_updates table
   - [ ] Add indexes and constraints

2. **Core API**
   - [ ] Session management endpoints
   - [ ] Outline CRUD endpoints
   - [ ] Profile update tracking

### Phase 2: Discovery & Development Modes (Weeks 3-4)

1. **Conversation Engine**
   - [ ] Content extraction from user input
   - [ ] Question generation logic
   - [ ] Clarification detection
   - [ ] Profile mapping

2. **MCP Tools**
   - [ ] content.discovery.* tools
   - [ ] content.profile.* tools
   - [ ] Session state management

### Phase 3: Outlining Mode (Weeks 5-6)

1. **Outline System**
   - [ ] Hierarchical outline management
   - [ ] Level-specific templates
   - [ ] Progressive drill-down

2. **AI-Guided Outlining**
   - [ ] Structure suggestions
   - [ ] Promise tracking integration
   - [ ] Character arc alignment

### Phase 4: Studio Mode Integration (Weeks 7-8)

1. **Context Assembly**
   - [ ] Full context injection pipeline
   - [ ] Profile-aware writing guidance
   - [ ] Beat-by-beat flow

2. **Consistency Checking**
   - [ ] Voice consistency
   - [ ] Knowledge state enforcement
   - [ ] Arc-appropriate behavior

### Phase 5: Automatic Updates (Weeks 9-10)

1. **Writing Extraction**
   - [ ] Profile discovery from prose
   - [ ] Relationship evolution tracking
   - [ ] Knowledge state updates

2. **Update Management**
   - [ ] Approval workflow
   - [ ] Conflict detection
   - [ ] History tracking

### Phase 6: Polish & Testing (Weeks 11-12)

1. **Integration Testing**
   - [ ] End-to-end workflows
   - [ ] Edge cases
   - [ ] Performance optimization

2. **Documentation**
   - [ ] API documentation
   - [ ] User guides
   - [ ] Best practices

---

## Related Documentation

- [story_codex_system.md](./story_codex_system.md) - Codex entry management
- [character_profiles.md](./character_profiles.md) - Character profile specification
- [scene_outline_format.md](./scene_outline_format.md) - Scene outline structure
- [auto_extraction_pipeline.md](./auto_extraction_pipeline.md) - Automatic extraction
- [narrative_engine_api.md](./narrative_engine_api.md) - Events and knowledge API
