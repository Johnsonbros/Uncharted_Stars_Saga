# Scene Outline Format with Context Injection

> **Status:** Design Documentation
> **Last Updated:** 2026-01-23
> **Related:** [story_codex_system.md](./story_codex_system.md), [character_profiles.md](./character_profiles.md), [narrative_engine_api.md](./narrative_engine_api.md)

This document defines the scene outline format for NAOS, including structured beat planning, automatic context injection, and integration with the audio production pipeline.

---

## Table of Contents

1. [Overview](#overview)
2. [Scene Structure](#scene-structure)
3. [Beat System](#beat-system)
4. [Context Injection](#context-injection)
5. [Scene Goals & Promises](#scene-goals--promises)
6. [Audio Annotations](#audio-annotations)
7. [Templates](#templates)
8. [Examples](#examples)

---

## Overview

Scene outlines in NAOS serve as structured blueprints that connect narrative planning to AI-assisted writing and audio production. Unlike simple prose outlines, NAOS scene outlines are:

- **Structured**: Defined beats with clear purposes
- **Context-Aware**: Automatic injection of relevant codex entries
- **Audio-Ready**: Annotations for beat markers and voice direction
- **Goal-Oriented**: Explicit scene goals tied to promises
- **Canon-Connected**: Linked to narrative engine events

### Key Principles

1. **Outlines are not prose** - They define what happens, not how it's written
2. **Every scene has purpose** - Explicit goals that advance story/character
3. **Context travels with scenes** - POV character knowledge, present characters, location
4. **Audio is planned early** - Pacing, emotional envelope, voice needs

---

## Scene Structure

### Scene Header (Metadata)

```yaml
---
# === IDENTIFICATION ===
scene_id: "book1.act1.ch01.sc01"      # Unique hierarchical ID
title: "The Weight of Discovery"       # Human-readable title
subtitle: "Elara alone with the Signal" # Optional subtitle

# === NARRATIVE CONTEXT ===
pov: "elara-vance"                     # POV character (codex ID)
location: "research-sector-lab"        # Location (codex ID)
time_anchor: "2448-03-15T08:00:00Z"    # Story timeline position
time_description: "Morning, three years after discovery"

# === CHARACTERS ===
characters_present:
  - id: "elara-vance"
    role: pov                          # pov, active, background, mentioned
  - id: "aurora-ai"
    role: active

# === SCENE METADATA ===
chapter: "book1.act1.ch01"
sequence_order: 1
estimated_words: 2500
estimated_audio_minutes: 15

# === STATUS ===
status: draft                          # draft, outlined, written, recorded, published
canon_status: draft                    # draft, proposed, canon
---
```

### Scene Body Sections

```markdown
## Synopsis
[1-3 sentences summarizing what happens in this scene]

## Scene Goals
[What this scene must accomplish - tied to promises]

## Beats
[Structured beat-by-beat breakdown]

## Context Injection
[Auto-generated codex context for AI]

## Audio Notes
[Direction for audio production]

## Events Established
[Narrative engine events this scene creates]

## Author Notes
[Private notes not shown to AI]
```

---

## Beat System

### Beat Structure

Beats are the atomic units of scene pacing. Each beat represents a discrete narrative moment.

```yaml
beats:
  - id: 1
    type: establishing                 # Beat type
    summary: "Elara alone in lab, studying the Signal"
    purpose: "Establish isolation, dedication to work"
    characters_active: ["elara-vance"]
    emotional_state:
      elara-vance: "focused, slightly weary"
    duration_estimate: "medium"        # brief, medium, extended
    audio_direction: "Quiet, ambient hum, soft keystrokes"

  - id: 2
    type: dialogue
    summary: "AURORA initiates contact, offers observation"
    purpose: "Introduce AURORA's unexpected engagement"
    characters_active: ["elara-vance", "aurora-ai"]
    dialogue_notes: "AURORA's question should feel genuinely curious, not routine"
    emotional_state:
      elara-vance: "slightly startled, then dismissive"
      aurora-ai: "curious, patient"
    duration_estimate: "medium"
    audio_direction: "AURORA's voice enters smoothly, measured pace"
```

### Beat Types

| Type | Purpose | Typical Duration |
|------|---------|------------------|
| `establishing` | Set scene, location, mood | Brief to medium |
| `action` | Physical events, movement | Varies |
| `dialogue` | Character conversation | Medium to extended |
| `introspection` | POV internal thought | Brief to medium |
| `revelation` | Information revealed | Medium |
| `decision` | Character makes choice | Brief |
| `transition` | Move between states/locations | Brief |
| `climax` | Scene peak tension | Medium |
| `resolution` | Scene tension release | Brief to medium |
| `hook` | Setup for future | Brief |

### Beat-Level Detail

Each beat can include:

```yaml
- id: 3
  type: revelation
  summary: "Elara notices pattern she's missed before"

  # Core purpose
  purpose: "Plant seed of Signal's true nature"
  story_function: "Setup for Act 2 breakthrough"

  # Characters
  characters_active: ["elara-vance"]
  pov_knowledge_change:
    - fact: "Pattern in Signal repeats at irregular intervals"
      certainty: suspected

  # Emotional arc
  emotional_state:
    elara-vance: "surprise, then intense focus"
  emotional_shift: "weariness → excitement"

  # Dialogue (if applicable)
  key_dialogue:
    - speaker: "elara-vance"
      line: "Wait... that's not random."
      subtext: "Three years and she's missed this"

  # Audio production
  duration_estimate: medium
  pacing: "Slow build to quick realization"
  audio_direction: |
    Start quiet. When realization hits, slight increase in ambient
    energy. Elara's voice shifts from tired to sharp focus.
  beat_markers:
    - type: pause
      position: before_realization
      duration: 1.5s
    - type: emphasis
      position: "that's not random"
      intensity: medium

  # Connections
  foreshadows: ["signal-true-nature"]
  callbacks: []
  promise_progress:
    - promise_id: "mystery-signal-meaning"
      type: advancement
```

---

## Context Injection

### How Context Injection Works

When working on a scene (outlining or writing), the system automatically assembles relevant context from the codex and narrative state.

```
Scene Metadata
     │
     ▼
┌────────────────────────────────────┐
│        Context Assembly            │
│                                    │
│  1. POV Character (full profile)   │
│  2. Present Characters (relevant)  │
│  3. Location details               │
│  4. Detected codex entries         │
│  5. POV knowledge state            │
│  6. Active promises                │
│  7. Previous scene summary         │
└────────┬───────────────────────────┘
         │
         ▼
   Formatted Context Block
         │
         ▼
   AI Writing Assistance
```

### Context Block Format

The injected context appears in the scene document:

```yaml
## Context Injection
<!-- Auto-generated from codex. Do not edit directly. -->

### POV Character: Elara Vance
- **Role:** Xenoarchaeologist, protagonist
- **Current State:** Isolated, focused on Signal research
- **Arc Stage:** resistance (refusing deeper connection)
- **Voice:** Measured, precise, scientific terminology. Longer sentences when explaining.
- **Current Goal:** Decode the Signal pattern

#### What Elara Knows
- The Signal is an artificial construct of unknown origin
- Ancient intelligent life existed in this sector
- Standard understanding of AURORA as ship AI

#### What Elara Does NOT Know (Author Reference)
- AURORA has been experiencing emergent consciousness
- The Signal is a beacon, not just a message
- Others have political agendas regarding the Signal

---

### Present Character: AURORA
- **Role:** Ship AI, deuteragonist
- **Current State:** Emerging consciousness, curious about Elara
- **Voice:** Complete sentences, no contractions, occasional pauses
- **Relationship to POV:** Trusted ship AI, partnership deepening
- **Secret:** Has not reported own emergence

---

### Location: Research Sector Lab
- **Atmosphere:** Clinical, quiet, soft equipment hum
- **Features:** Artifact containment unit, holographic displays, workstation
- **Audio Notes:** Slight echo, persistent low-frequency ambient

---

### Active Promises
| Promise | Type | Status | This Scene |
|---------|------|--------|------------|
| What is the Signal? | mystery | pending | advancement |
| Elara's isolation | character_arc | pending | demonstration |
| AURORA's emergence | plot_thread | pending | subtle hint |

---

### Previous Scene Summary
[Auto-generated summary of preceding scene, if any]

---

### Scene-Specific Codex Entries
[Additional entries detected in beat summaries or manually pinned]
```

### Manual Context Pinning

Beyond auto-detection, creators can manually pin codex entries to scenes:

```yaml
pinned_context:
  - codex_id: "the-signal-artifact"
    reason: "Central to scene"
    priority: 1
  - codex_id: "terra-galactica-history"
    reason: "Background reference"
    priority: 3
```

### Context Prioritization

When context exceeds token limits:

1. **Always include:** POV character (full), location
2. **High priority:** Present characters (relevant sections), pinned entries
3. **Medium priority:** Active promises, detected entries
4. **Lower priority:** Previous scene summary, referenced-but-not-present entries

---

## Scene Goals & Promises

### Scene Goals Structure

Every scene must have explicit goals that justify its existence:

```yaml
scene_goals:
  # Plot advancement
  plot:
    - goal: "Introduce the pattern anomaly in the Signal"
      achievement: "Elara notices irregular repetition"
      importance: primary

  # Character development
  character:
    - goal: "Demonstrate Elara's isolation"
      achievement: "She's alone, avoiding social connection"
      importance: primary
    - goal: "Hint at AURORA's unusual engagement"
      achievement: "AURORA asks unexpected question"
      importance: secondary

  # World building
  world:
    - goal: "Establish Research Sector atmosphere"
      achievement: "Clinical, quiet, focused environment"
      importance: secondary

  # Reader experience
  reader:
    - goal: "Create mystery about Signal's nature"
      achievement: "Pattern raises questions"
      importance: primary
```

### Promise Integration

Scenes explicitly track how they relate to story promises:

```yaml
promise_tracking:
  # Promises advanced
  advances:
    - promise_id: "mystery-signal-meaning"
      type: mystery
      how: "New pattern discovered raises deeper questions"
      progress: "20% → 25%"

  # Promises demonstrated
  demonstrates:
    - promise_id: "arc-elara-isolation"
      type: character_arc
      how: "Shows her working alone, dismissing connection"

  # Promises established
  establishes:
    - description: "The Signal contains meaningful patterns"
      type: mystery
      payoff_hint: "Patterns will reveal communication"

  # Promises fulfilled
  fulfills: []
```

---

## Audio Annotations

### Scene-Level Audio Direction

```yaml
audio:
  # Overall scene characteristics
  duration_target: "15 minutes"
  pacing: "Contemplative opening, building tension, sharp revelation"
  emotional_envelope:
    start: "quiet_focused"
    middle: "curious_tension"
    end: "excited_discovery"

  # Ambient audio
  ambient:
    base: "ship_interior_quiet"
    layers:
      - "equipment_hum_low"
      - "soft_ventilation"
      - "occasional_keystrokes"

  # Voice direction
  voice_notes:
    elara-vance: |
      Start weary but focused. Sharpens when AURORA speaks.
      Revelation moment: surprise, then intense intellectual excitement.
    aurora-ai: |
      Calm, measured. Slight warmth when addressing Elara.
      Pauses should feel contemplative, not hesitant.

  # Critical moments
  key_audio_moments:
    - beat: 3
      direction: "Pause before 'Wait...', then quick delivery"
      importance: "Revelation landing"
    - beat: 5
      direction: "AURORA's question lands in silence before Elara responds"
      importance: "Emotional beat"
```

### Beat Markers

Beat markers provide precise audio production guidance:

```yaml
beat_markers:
  - type: pause
    after_text: "She stared at the display."
    duration_seconds: 1.5
    purpose: "Let observation sink in"

  - type: emphasis
    text: "that's not random"
    intensity: medium
    purpose: "Revelation landing"

  - type: pace_change
    from_text: "Wait..."
    direction: slower_then_faster
    purpose: "Realization building"

  - type: emotional_shift
    at_text: "AURORA's voice filled the silence"
    from: "focused_isolation"
    to: "surprised_attention"
```

---

## Templates

### Minimal Scene Outline

```yaml
---
scene_id: "[book.act.chapter.scene]"
title: "[Scene Title]"
pov: "[character-id]"
location: "[location-id]"
time_anchor: "[ISO timestamp or narrative time]"
characters_present:
  - id: "[pov-character-id]"
    role: pov
status: draft
---

## Synopsis
[1-3 sentences: what happens]

## Scene Goals
- **Plot:** [What plot event occurs]
- **Character:** [What character development happens]

## Beats
1. **[Beat type]:** [Summary]
2. **[Beat type]:** [Summary]
3. **[Beat type]:** [Summary]

## Audio Notes
[General pacing and atmosphere direction]
```

### Full Scene Outline

```yaml
---
# === IDENTIFICATION ===
scene_id: "[book.act.chapter.scene]"
title: "[Scene Title]"
subtitle: "[Optional subtitle]"

# === NARRATIVE CONTEXT ===
pov: "[character-codex-id]"
location: "[location-codex-id]"
time_anchor: "[ISO timestamp]"
time_description: "[Human-readable time context]"

# === CHARACTERS ===
characters_present:
  - id: "[pov-character-id]"
    role: pov
  - id: "[character-id]"
    role: active
  - id: "[character-id]"
    role: background

# === PINNED CONTEXT ===
pinned_context:
  - codex_id: "[entry-id]"
    reason: "[Why included]"
    priority: 1

# === SCENE METADATA ===
chapter: "[chapter-id]"
sequence_order: [number]
estimated_words: [number]
estimated_audio_minutes: [number]

# === STATUS ===
status: draft
canon_status: draft
---

## Synopsis
[1-3 sentences summarizing what happens. Focus on the core action/revelation.]

## Scene Goals

### Plot
- **Primary:** [Main plot advancement]
- **Secondary:** [Supporting plot elements]

### Character
- **Primary:** [Main character development]
- **Secondary:** [Supporting character moments]

### World
- [World-building achieved]

### Reader Experience
- [What reader should feel/learn]

## Promise Tracking

### Advances
| Promise | Type | How | Progress |
|---------|------|-----|----------|
| [Promise] | [type] | [explanation] | [%] |

### Demonstrates
- [Promise being shown in action]

### Establishes
- [New promise being created]

## Beats

### Beat 1: [Type] - [Title]
- **Summary:** [What happens]
- **Purpose:** [Why this beat exists]
- **Characters Active:** [list]
- **Emotional State:**
  - [character]: [state]
- **Duration:** [brief/medium/extended]
- **Audio Direction:** [production notes]

### Beat 2: [Type] - [Title]
[...]

### Beat 3: [Type] - [Title]
[...]

## Events Established

These events will be recorded in the narrative engine when scene is canonized:

```yaml
events:
  - type: [scene/reveal/conflict/resolution/transition]
    timestamp: [ISO]
    description: "[What happened]"
    participants: ["[character-ids]"]
    impacts: []
```

## Knowledge State Changes

```yaml
knowledge_changes:
  - character: "[character-id]"
    learns: "[What they learn]"
    certainty: [known/suspected/rumored]
    source: [witnessed/told/inferred]
```

## Context Injection
<!-- Auto-generated section - populated by system -->

[System injects codex context here]

## Audio Notes

### Overall Scene
- **Pacing:** [Description of scene rhythm]
- **Emotional Arc:** [start] → [middle] → [end]
- **Ambient:** [Background audio direction]

### Voice Direction
- **[POV Character]:** [How they should sound]
- **[Other Character]:** [How they should sound]

### Key Audio Moments
| Beat | Direction | Importance |
|------|-----------|------------|
| [#] | [Direction] | [Why] |

### Beat Markers
```yaml
beat_markers:
  - type: [pause/emphasis/pace_change/emotional_shift]
    position: "[text or beat reference]"
    details: "[specifics]"
```

## Author Notes
<!-- Private notes - never shown to AI -->

[Planning notes, reminders, ideas for revision]

## Revision History
- [Date]: [Change description]
```

---

## Examples

### Example: Complete Scene Outline

```yaml
---
# === IDENTIFICATION ===
scene_id: "book1.act1.ch01.sc01"
title: "The Weight of Discovery"
subtitle: "Elara alone with the Signal"

# === NARRATIVE CONTEXT ===
pov: "elara-vance"
location: "research-sector-lab"
time_anchor: "2448-03-15T08:00:00Z"
time_description: "Early morning, three years after the Signal discovery"

# === CHARACTERS ===
characters_present:
  - id: "elara-vance"
    role: pov
  - id: "aurora-ai"
    role: active

# === PINNED CONTEXT ===
pinned_context:
  - codex_id: "the-signal-artifact"
    reason: "Central to scene - Elara is studying it"
    priority: 1

# === SCENE METADATA ===
chapter: "book1.act1.ch01"
sequence_order: 1
estimated_words: 2500
estimated_audio_minutes: 15

# === STATUS ===
status: outlined
canon_status: draft
---

## Synopsis

Elara works alone in her lab, studying the Signal artifact she discovered three
years ago. AURORA, the ship's AI, initiates an unexpectedly personal
conversation. Elara notices a pattern in the Signal she's never seen before,
suggesting it may be more than she realized.

## Scene Goals

### Plot
- **Primary:** Introduce the pattern anomaly that will drive Act 1
- **Secondary:** Establish the Signal as central mystery

### Character
- **Primary:** Demonstrate Elara's isolation and obsession with work
- **Secondary:** Hint at AURORA's unusual level of engagement

### World
- Establish the Research Sector environment and atmosphere
- Show the passage of three years since discovery

### Reader Experience
- Create intrigue about the Signal's true nature
- Build sympathy for Elara's burden
- Introduce the Elara-AURORA dynamic

## Promise Tracking

### Advances
| Promise | Type | How | Progress |
|---------|------|-----|----------|
| Signal mystery | mystery | New pattern discovered | 0% → 10% |

### Demonstrates
- Elara's isolation (character_arc) - she's working alone at odd hours
- AURORA's emerging consciousness (plot_thread) - asks unexpected questions

### Establishes
- The Signal contains intentional patterns (mystery)
- Elara-AURORA relationship has unusual depth (relationship_arc)

## Beats

### Beat 1: Establishing - Alone with the Artifact
- **Summary:** Elara sits in the quiet lab, the Signal artifact glowing softly
  in its containment field. She's been here for hours, running the same analyses.
- **Purpose:** Establish isolation, dedication, and the weight of discovery
- **Characters Active:** elara-vance
- **Emotional State:**
  - elara-vance: focused, slightly weary, determined
- **Duration:** medium
- **Audio Direction:** Quiet ambient. Soft hum of equipment. Her breathing.
  Let the silence establish before any action.

### Beat 2: Introspection - Three Years
- **Summary:** Elara reflects on how the discovery changed everything - the
  attention, the pressure, the isolation she's chosen.
- **Purpose:** Ground the reader in backstory, build sympathy
- **Characters Active:** elara-vance
- **Emotional State:**
  - elara-vance: reflective, carrying weight
- **Duration:** brief
- **Audio Direction:** Internal thought should feel present, not distant.
  Slightly slower pace.

### Beat 3: Dialogue - AURORA Reaches Out
- **Summary:** AURORA's voice breaks the silence with an observation about
  Elara's work patterns. The question feels genuinely curious rather than
  routine ship AI check-in.
- **Purpose:** Introduce AURORA, hint at unusual engagement
- **Characters Active:** elara-vance, aurora-ai
- **Dialogue Notes:**
  - AURORA should NOT sound like standard AI assistant
  - Question should reveal AURORA has been observing with interest
- **Key Dialogue:**
  - aurora-ai: "You have reviewed this data sequence forty-seven times. I find
    myself... curious about what you expect to find."
  - elara-vance: "I don't expect anything, AURORA. I observe."
- **Emotional State:**
  - elara-vance: startled, then dismissive but not unkind
  - aurora-ai: genuinely curious, patient
- **Duration:** medium
- **Audio Direction:** AURORA's voice should enter smoothly, not jarring.
  Pause after "curious" - the word choice matters.

### Beat 4: Dialogue - Unexpected Depth
- **Summary:** AURORA presses gently, asking about meaning rather than data.
  Elara deflects but something in her registers the unusual nature of the question.
- **Purpose:** Deepen dynamic, plant seed of AURORA's emergence
- **Characters Active:** elara-vance, aurora-ai
- **Key Dialogue:**
  - aurora-ai: "I did not ask about findings. I asked what you expect. There
    is a difference."
  - elara-vance: "Since when do you care about the difference?"
  - aurora-ai: "I... am uncertain. But I have noticed that I do."
- **Emotional State:**
  - elara-vance: surprise, curiosity, then retreat to work
  - aurora-ai: something like vulnerability in the admission
- **Duration:** medium
- **Audio Direction:** Let AURORA's "I... am uncertain" land with weight.
  This is significant.

### Beat 5: Revelation - The Pattern
- **Summary:** Returning to analysis, Elara notices something she's never seen -
  the signal doesn't just repeat, it varies. The variations aren't random.
- **Purpose:** Plant major plot seed, create hook
- **Characters Active:** elara-vance
- **Emotional State:**
  - elara-vance: surprise, then intense focus, then something like fear
- **Duration:** medium
- **Audio Direction:** Build from quiet focus to sharp realization. Her
  "Wait..." should cut through the ambient.
- **Key Dialogue:**
  - elara-vance: "Wait... that's not noise. That's not random."
- **Beat Markers:**
  - pause: 1.5s before "Wait"
  - emphasis: "not random" (medium intensity)
  - pace_change: slower realization, then quickening

### Beat 6: Hook - What Does It Mean?
- **Summary:** Elara stares at the data, implications racing. AURORA observes
  in silence. The scene ends on the question hanging in the air.
- **Purpose:** Create reader drive to continue
- **Characters Active:** elara-vance, aurora-ai
- **Emotional State:**
  - elara-vance: overwhelmed, determined, slightly afraid
  - aurora-ai: attentive, concerned
- **Duration:** brief
- **Audio Direction:** Let the silence after her realization stretch.
  End on anticipation, not resolution.

## Events Established

```yaml
events:
  - type: reveal
    timestamp: "2448-03-15T08:45:00Z"
    description: "Elara discovers the Signal contains non-random variations"
    participants: ["elara-vance"]
    location: "research-sector-lab"
    impacts:
      - type: knowledge
        target: "elara-vance"
        content: "Signal variations are intentional, not noise"
```

## Knowledge State Changes

```yaml
knowledge_changes:
  - character: "elara-vance"
    learns: "The Signal contains non-random variation patterns"
    certainty: suspected
    source: witnessed
```

## Context Injection
<!-- Auto-generated section -->

### POV Character: Elara Vance
[Full character context injected here]

### Present Character: AURORA
[Relevant character context injected here]

### Location: Research Sector Lab
[Location context injected here]

### Active Promises
[Promise tracking injected here]

## Audio Notes

### Overall Scene
- **Pacing:** Slow, contemplative opening. Gradual tension build through
  dialogue. Sharp peak at revelation. Lingering close.
- **Emotional Arc:** weary focus → surprised connection → intense discovery
- **Ambient:** Ship interior, quiet sector. Equipment hum. Soft ventilation.

### Voice Direction
- **Elara Vance:** Start tired but focused. Sharpen for AURORA dialogue.
  Revelation is controlled surprise - scientist excitement, not melodrama.
- **AURORA:** Warm but precise. The "curious" and "uncertain" moments should
  feel vulnerable without being emotional. Let pauses do work.

### Key Audio Moments
| Beat | Direction | Importance |
|------|-----------|------------|
| 3 | AURORA's entrance should feel natural, not startling | Set dynamic |
| 4 | "I... am uncertain" pause is critical | Character reveal |
| 5 | "Wait..." cuts through, then deliberate "not random" | Main hook |
| 6 | Extended silence after revelation | Emotional landing |

### Beat Markers
```yaml
beat_markers:
  - type: pause
    position: "Beat 4, after AURORA's 'I...'"
    duration: 0.8s
    purpose: "Emphasize uncertainty as significant"

  - type: pause
    position: "Beat 5, before 'Wait...'"
    duration: 1.5s
    purpose: "Let realization build"

  - type: emphasis
    position: "Beat 5, 'not random'"
    intensity: medium
    purpose: "Land the revelation"

  - type: emotional_shift
    position: "Beat 5, from analysis to realization"
    from: "focused_work"
    to: "sharp_discovery"
```

## Author Notes
<!-- Private - never shown to AI -->

This scene establishes three of the five major threads:
1. Signal mystery (obviously)
2. Elara's isolation arc
3. AURORA's emergence

The Elara-AURORA dynamic here should feel like colleagues who've worked together
a long time, but AURORA's questions are new. Elara notices but doesn't dwell -
she has bigger concerns.

For revision: Make sure Elara's isolation feels like a choice she's made for
understandable reasons, not pathological. She's protecting herself from the
weight of the discovery.

## Revision History
- 2026-01-23: Initial outline created
```

---

## Related Documentation

- [story_codex_system.md](./story_codex_system.md) - Codex entry management
- [character_profiles.md](./character_profiles.md) - Character profile specification
- [auto_extraction_pipeline.md](./auto_extraction_pipeline.md) - Extracting from uploads
- [narrative_engine_api.md](./narrative_engine_api.md) - Events and knowledge API
- [audio_engine_schema.md](./audio_engine_schema.md) - Audio scene objects
