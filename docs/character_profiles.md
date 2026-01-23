# Character Profiles Specification

> **Status:** Design Documentation
> **Last Updated:** 2026-01-23
> **Related:** [story_codex_system.md](./story_codex_system.md), [audio_engine_schema.md](./audio_engine_schema.md)

This document defines the complete specification for character profiles in NAOS, including data structure, templates, voice integration, and arc tracking.

---

## Table of Contents

1. [Overview](#overview)
2. [Character Data Model](#character-data-model)
3. [Profile Sections](#profile-sections)
4. [Voice Profile Integration](#voice-profile-integration)
5. [Character Arc Tracking](#character-arc-tracking)
6. [Knowledge State Integration](#knowledge-state-integration)
7. [Templates](#templates)
8. [Examples](#examples)

---

## Overview

Character profiles are first-class entities in NAOS, serving multiple purposes:

- **Context Injection**: Provide AI with character knowledge during writing
- **Voice Consistency**: Link characters to voice profiles for audio production
- **Canon Enforcement**: Validate character actions against established traits
- **Arc Tracking**: Monitor character development across the story
- **Knowledge Management**: Track what each character knows and when

### Design Principles

1. **Structured but Flexible**: Required fields for core identity, optional fields for depth
2. **Audio-First**: Voice and speech patterns are essential, not afterthoughts
3. **State-Based**: Character knowledge and arc position are tracked as state
4. **Relationship-Rich**: Connections to other characters are explicit and typed

---

## Character Data Model

### Complete Schema

```typescript
interface CharacterProfile {
  // === IDENTITY (Required) ===
  id: string;                        // UUID
  projectId: string;                 // Project scope
  name: string;                      // Full canonical name
  aliases: string[];                 // Names for detection (nicknames, titles)

  // === CORE IDENTITY ===
  role: CharacterRole;               // Story role
  summary: string;                   // One-line description (50 chars max)
  description: string;               // Full character description

  // === PERSONALITY ===
  personality: {
    traits: string[];                // Core personality traits (3-7)
    strengths: string[];             // Character strengths
    flaws: string[];                 // Character flaws/weaknesses
    fears: string[];                 // What they fear
    desires: string[];               // What they want
    values: string[];                // What they believe in
    quirks: string[];                // Distinctive behaviors
  };

  // === PHYSICAL ===
  physical: {
    age: string;                     // Age or age range
    gender: string;                  // Gender identity
    appearance: string;              // Physical description
    distinguishing_features: string[]; // Notable characteristics
  };

  // === VOICE & SPEECH (Audio-Critical) ===
  voice: {
    profile_id: string;              // Link to voice profile
    speech_patterns: string;         // How they talk
    vocabulary_level: 'simple' | 'moderate' | 'sophisticated' | 'technical';
    accent: string;                  // Accent description
    verbal_tics: string[];           // Repeated phrases, habits
    emotional_range: string;         // How emotion shows in voice
  };

  // === BACKGROUND ===
  background: {
    backstory: string;               // History summary
    origin: string;                  // Where they come from
    occupation: string;              // What they do
    education: string;               // Training/learning
    key_events: string[];            // Formative experiences
  };

  // === GOALS & MOTIVATION ===
  goals: {
    primary: string;                 // Main story goal
    secondary: string[];             // Supporting goals
    internal: string;                // Inner need (often unconscious)
    motivation: string;              // Why they pursue goals
  };

  // === RELATIONSHIPS ===
  relationships: CharacterRelationship[];

  // === ARC TRACKING ===
  arc: {
    type: ArcType;                   // Type of character arc
    starting_state: string;          // Who they are at start
    ending_state: string;            // Who they become (if known)
    current_stage: string;           // Where they are now
    key_moments: ArcMoment[];        // Transformation points
  };

  // === STORY METADATA ===
  story: {
    pov_eligible: boolean;           // Can be POV character
    first_appearance: string;        // Scene ID
    last_appearance?: string;        // Scene ID (if departed)
    chapter_appearances: string[];   // Chapters they appear in
    importance: 'major' | 'supporting' | 'minor' | 'mentioned';
  };

  // === KNOWLEDGE STATE ===
  knowledge: {
    knows: KnowledgeItem[];          // What they know
    doesnt_know: string[];           // Key things they don't know
    secrets: string[];               // Secrets they keep
    lies_told: string[];             // Lies they've told
  };

  // === PRIVATE NOTES ===
  notes: string;                     // Creator notes (never shown to AI)

  // === METADATA ===
  tags: string[];                    // Organization tags
  canonStatus: CanonStatus;
  createdAt: Date;
  updatedAt: Date;
}

type CharacterRole =
  | 'protagonist'
  | 'deuteragonist'
  | 'antagonist'
  | 'mentor'
  | 'ally'
  | 'love_interest'
  | 'comic_relief'
  | 'foil'
  | 'guardian'
  | 'herald'
  | 'shapeshifter'
  | 'trickster'
  | 'supporting'
  | 'background';

type ArcType =
  | 'positive_change'      // Growth/redemption
  | 'negative_change'      // Fall/corruption
  | 'flat'                 // Steadfast (changes world)
  | 'disillusionment'      // Positive to negative worldview
  | 'transformation'       // Fundamental identity change
  | 'maturation'           // Coming of age
  | 'redemption'           // Making amends
  | 'corruption'           // Fall from grace
  | 'unknown';             // Not yet determined

interface CharacterRelationship {
  characterId: string;               // Other character's codex ID
  type: RelationshipType;
  description: string;               // Nature of relationship
  history: string;                   // How it developed
  tension: string;                   // Source of conflict/interest
  dynamic: 'stable' | 'evolving' | 'volatile';
}

type RelationshipType =
  | 'family_parent' | 'family_child' | 'family_sibling' | 'family_extended'
  | 'romantic_partner' | 'romantic_former' | 'romantic_interest'
  | 'friend_close' | 'friend_casual' | 'friend_former'
  | 'enemy_personal' | 'enemy_professional' | 'enemy_ideological'
  | 'mentor' | 'mentee'
  | 'colleague' | 'rival'
  | 'subordinate' | 'superior'
  | 'acquaintance' | 'stranger_significant';

interface ArcMoment {
  sceneId: string;
  description: string;
  change: string;                    // What shifted
  stage: string;                     // Arc stage name
}

interface KnowledgeItem {
  fact: string;
  certainty: 'known' | 'suspected' | 'rumored' | 'false';
  learnedIn: string;                 // Scene ID
  source: 'witnessed' | 'told' | 'inferred';
}
```

---

## Profile Sections

### Required Sections (Minimum Viable Profile)

These fields must be populated for a character to function in the system:

| Field | Purpose |
|-------|---------|
| `name` | Primary identification |
| `summary` | Quick context (50 chars) |
| `role` | Story function |
| `personality.traits` | Core personality (3-7 traits) |
| `voice.profile_id` | Audio production link |
| `voice.speech_patterns` | How they talk |

### Recommended Sections

For POV and major characters:

| Section | Fields |
|---------|--------|
| Personality | traits, strengths, flaws, values |
| Goals | primary, internal, motivation |
| Voice | All fields |
| Background | backstory, key_events |
| Arc | type, starting_state, current_stage |

### Optional Sections

For supporting/minor characters:

| Section | When to Include |
|---------|-----------------|
| Physical | When appearance matters to story |
| Relationships | When connections drive plot |
| Knowledge | When information control is critical |
| Full Arc | When character has significant development |

---

## Voice Profile Integration

Character profiles link directly to the audio engine's voice profiles.

### Voice Profile Reference

```typescript
// From character profile
voice: {
  profile_id: 'elara-vance-main',  // Links to voice_profiles table
  speech_patterns: 'Measured and precise. Uses scientific terminology naturally. Longer sentences when explaining, shorter when emotional.',
  vocabulary_level: 'technical',
  accent: 'Educated, neutral, slight formality',
  verbal_tics: ['Indeed', 'Fascinating', 'Let me think...'],
  emotional_range: 'Reserved baseline. Wonder breaks through for discoveries. Vulnerability in quiet moments.'
}

// Corresponding voice profile in audio engine
{
  id: 'elara-vance-main',
  name: 'Elara Vance',
  gender: 'female',
  accent: 'neutral_educated',
  timbre: 'warm_alto',
  pace_wpm: 145,
  characteristics: {
    pitch_range: 'moderate',
    breathiness: 'low',
    resonance: 'chest_forward'
  }
}
```

### Speech Pattern Guidelines

The `speech_patterns` field should capture:

1. **Sentence Structure**: Long/short, complex/simple
2. **Word Choice**: Technical, colloquial, formal, informal
3. **Rhythm**: Pauses, emphasis patterns
4. **Emotional Expression**: How feelings show in speech
5. **Consistency Markers**: What makes their voice recognizable

Example:
```
"AURORA speaks in complete, grammatically perfect sentences. Never uses contractions.
Occasionally pauses mid-sentence as if... considering. Asks questions to understand
human experience. When something is beyond comprehension, acknowledges limits directly:
'I do not fully understand, but I observe...'"
```

---

## Character Arc Tracking

### Arc Stages

Arcs are tracked through named stages with associated scenes:

```typescript
arc: {
  type: 'positive_change',
  starting_state: 'Isolated, burdened by discovery, distrustful of connection',
  ending_state: 'Connected, accepting responsibility, open to partnership',
  current_stage: 'resistance',
  key_moments: [
    {
      sceneId: 'book1.act1.ch01.sc01',
      description: 'Elara isolates herself with the Signal research',
      change: 'Establishes isolation pattern',
      stage: 'status_quo'
    },
    {
      sceneId: 'book1.act1.ch03.sc02',
      description: 'AURORA offers perspective Elara dismisses',
      change: 'First opportunity rejected',
      stage: 'resistance'
    }
  ]
}
```

### Standard Arc Stages

For positive change arcs:
1. `status_quo` - Starting state
2. `catalyst` - Inciting incident
3. `resistance` - Refusing the call
4. `exploration` - Trying new ways
5. `midpoint_shift` - Major perspective change
6. `complications` - Stakes increase
7. `dark_night` - All seems lost
8. `breakthrough` - Final commitment
9. `new_normal` - Transformed state

### Arc Validation

The system can validate that character actions align with arc stage:

```typescript
function validateCharacterAction(
  character: CharacterProfile,
  action: string,
  sceneId: string
): ValidationResult {
  // Check if action aligns with current arc stage
  // Flag if character acts inconsistently
}
```

---

## Knowledge State Integration

Character profiles integrate with the narrative engine's knowledge state system.

### Syncing Knowledge

When a `knowledge_state` is recorded in the narrative engine, the character profile can be updated:

```typescript
// Narrative engine records
knowledgeState: {
  characterId: 'elara-vance',
  eventId: 'signal-discovery',
  learnedAt: '2448-03-15T14:30:00Z',
  certainty: 'known',
  source: 'witnessed'
}

// Character profile reflects
knowledge: {
  knows: [
    {
      fact: 'The Signal is an artificial construct of unknown origin',
      certainty: 'known',
      learnedIn: 'book1.act1.ch01.sc01',
      source: 'witnessed'
    }
  ],
  doesnt_know: [
    'AURORA has been experiencing emergent consciousness',
    'The Signal is a beacon, not a message'
  ]
}
```

### Knowledge-Aware Context

When generating context for a scene, the system checks POV character knowledge:

```yaml
# Context injection for scene with Elara POV

## Elara Vance (POV) - What She Knows
- The Signal is artificial
- Ancient civilization existed before humans reached this sector
- AURORA is a ship AI (standard understanding)

## What Elara Does NOT Know (for author reference)
- AURORA's emergent consciousness
- The Signal's true purpose
- Other characters' hidden agendas
```

---

## Templates

### Minimum Viable Character

```yaml
name: "[Character Name]"
aliases: []
role: supporting
summary: "[One-line description, 50 chars max]"

personality:
  traits:
    - "[Trait 1]"
    - "[Trait 2]"
    - "[Trait 3]"

voice:
  profile_id: "[voice-profile-id]"
  speech_patterns: "[How they talk - sentence structure, vocabulary, rhythm]"

story:
  importance: minor
  pov_eligible: false
```

### Full Character Template

```yaml
# === IDENTITY ===
name: "[Full Canonical Name]"
aliases:
  - "[Nickname]"
  - "[Title]"
role: protagonist  # protagonist, antagonist, deuteragonist, mentor, ally, etc.
summary: "[One-line hook, 50 chars max]"
description: |
  [2-3 paragraph full description covering who they are,
  what makes them interesting, and their role in the story]

# === PERSONALITY ===
personality:
  traits:
    - "[Core trait 1]"
    - "[Core trait 2]"
    - "[Core trait 3]"
  strengths:
    - "[Strength 1]"
    - "[Strength 2]"
  flaws:
    - "[Flaw 1]"
    - "[Flaw 2]"
  fears:
    - "[Fear 1]"
  desires:
    - "[Desire 1]"
  values:
    - "[Value 1]"
    - "[Value 2]"
  quirks:
    - "[Quirk 1]"

# === PHYSICAL ===
physical:
  age: "[Age or range]"
  gender: "[Gender identity]"
  appearance: |
    [Physical description paragraph]
  distinguishing_features:
    - "[Feature 1]"
    - "[Feature 2]"

# === VOICE & SPEECH ===
voice:
  profile_id: "[voice-profile-id]"
  speech_patterns: |
    [Detailed description of how they talk - sentence length,
    vocabulary, formality, emotional expression]
  vocabulary_level: moderate  # simple, moderate, sophisticated, technical
  accent: "[Accent description]"
  verbal_tics:
    - "[Phrase or habit 1]"
    - "[Phrase or habit 2]"
  emotional_range: |
    [How emotion manifests in their voice and speech]

# === BACKGROUND ===
background:
  backstory: |
    [Character history summary]
  origin: "[Where they come from]"
  occupation: "[What they do]"
  education: "[Training/learning]"
  key_events:
    - "[Formative event 1]"
    - "[Formative event 2]"

# === GOALS ===
goals:
  primary: "[Main story goal]"
  secondary:
    - "[Secondary goal 1]"
  internal: "[Inner need - often unconscious]"
  motivation: "[Why they pursue these goals]"

# === RELATIONSHIPS ===
relationships:
  - character_id: "[other-character-id]"
    type: friend_close
    description: "[Nature of relationship]"
    history: "[How it developed]"
    tension: "[Source of conflict/interest]"
    dynamic: evolving  # stable, evolving, volatile

# === ARC ===
arc:
  type: positive_change  # positive_change, negative_change, flat, etc.
  starting_state: "[Who they are at story start]"
  ending_state: "[Who they become - if known]"
  current_stage: status_quo
  key_moments: []

# === STORY METADATA ===
story:
  pov_eligible: true
  importance: major  # major, supporting, minor, mentioned
  first_appearance: "[scene-id]"
  chapter_appearances: []

# === KNOWLEDGE ===
knowledge:
  knows: []
  doesnt_know:
    - "[Key thing they don't know]"
  secrets:
    - "[Secret they keep]"
  lies_told: []

# === PRIVATE NOTES ===
notes: |
  [Creator-only notes that should never be shown to AI.
  Spoilers, arc plans, real-world references, etc.]

# === ORGANIZATION ===
tags:
  - "[tag1]"
  - "[tag2]"
canon_status: draft
```

---

## Examples

### Example: Elara Vance (Protagonist)

```yaml
name: "Elara Vance"
aliases:
  - "Dr. Vance"
  - "Elara"
role: protagonist
summary: "Xenoarchaeologist haunted by the discovery that changed everything"
description: |
  Elara Vance is a brilliant xenoarchaeologist aboard the generation ship
  Terra Galactica. Methodical, curious, and deeply committed to scientific
  rigor, she made the discovery of a lifetime: the Signal, an artifact
  proving ancient intelligent life. Now she carries the weight of that
  discovery while struggling to understand its implications.

  She isolates herself in work, using research as a shield against
  connection. Her partnership with AURORA, the ship's AI, is her one
  consistent relationship - though she doesn't yet realize how meaningful
  it's becoming.

personality:
  traits:
    - curious
    - methodical
    - haunted
    - determined
    - guarded
  strengths:
    - Brilliant analytical mind
    - Patience with complex problems
    - Moral integrity
  flaws:
    - Uses work to avoid connection
    - Carries guilt about discovery
    - Struggles to ask for help
  fears:
    - That the Signal means humanity isn't special
    - Losing herself in the discovery
    - Letting people get close
  desires:
    - To understand the ancient civilization
    - To find meaning in the discovery
    - Connection (though she resists it)
  values:
    - Truth over comfort
    - Scientific integrity
    - Responsibility
  quirks:
    - Talks to artifacts when alone
    - Reorganizes workspace when stressed
    - Forgets to eat when focused

physical:
  age: "34"
  gender: "Female"
  appearance: |
    Tall and lean with the efficient movements of someone who's spent
    years in ship corridors. Dark hair usually pulled back, practical
    rather than styled. Eyes that notice details others miss. Rarely
    wears anything but research station jumpsuits, though she has
    one formal outfit she never wears.
  distinguishing_features:
    - Small scar on left hand from artifact handling accident
    - Tends to tilt head when listening carefully
    - Often has smudges on hands from artifact work

voice:
  profile_id: "elara-vance-main"
  speech_patterns: |
    Measured and precise. Uses scientific terminology naturally but
    can simplify when needed. Longer sentences when explaining
    something she's excited about, shorter when emotional or stressed.
    Pauses before important statements. Rarely interrupts.
  vocabulary_level: technical
  accent: "Educated, neutral, slight formality"
  verbal_tics:
    - "Indeed"
    - "Fascinating"
    - "Let me think about that"
    - "The data suggests..."
  emotional_range: |
    Reserved baseline with moments of genuine wonder breaking through
    when discussing discoveries. Vulnerability shows in quieter
    moments, usually when she thinks no one notices. Irritation
    manifests as clipped responses.

background:
  backstory: |
    Born on Terra Galactica to second-generation ship residents. Showed
    early aptitude for pattern recognition and ancient languages.
    Earned her doctorate at 26 with a thesis on theoretical xenolinguistics.
    Made the Signal discovery three years ago and has been both celebrated
    and isolated ever since.
  origin: "Terra Galactica, Research Sector"
  occupation: "Senior Xenoarchaeologist"
  education: "Doctorate in Xenoarchaeology with linguistics specialization"
  key_events:
    - "Parents' death in habitat failure when she was 19"
    - "Discovery of the Signal artifact three years ago"
    - "First meaningful conversation with AURORA six months ago"

goals:
  primary: "Decode the Signal and understand the ancient civilization"
  secondary:
    - "Publish definitive analysis of Signal origin"
    - "Protect research from political interference"
  internal: "Find connection without losing herself"
  motivation: "The Signal represents everything she's worked toward, and she feels responsible for understanding it properly"

relationships:
  - character_id: "aurora-ai"
    type: colleague
    description: "Ship AI and research partner becoming something more"
    history: "Standard professional relationship evolved after AURORA started asking unexpected questions"
    tension: "Elara doesn't recognize AURORA's emerging consciousness"
    dynamic: evolving

arc:
  type: positive_change
  starting_state: "Isolated, burdened by discovery, uses work to avoid connection"
  ending_state: "Connected, accepting partnership, finding meaning through relationship"
  current_stage: resistance
  key_moments:
    - scene_id: "book1.act1.ch01.sc01"
      description: "Elara isolates herself with Signal research"
      change: "Establishes isolation pattern"
      stage: status_quo

story:
  pov_eligible: true
  importance: major
  first_appearance: "book1.act1.ch01.sc01"
  chapter_appearances:
    - "book1.act1.ch01"

knowledge:
  knows:
    - fact: "The Signal is an artificial construct"
      certainty: known
      learnedIn: "book1.prologue"
      source: witnessed
    - fact: "Ancient intelligent life existed in this sector"
      certainty: known
      learnedIn: "book1.prologue"
      source: inferred
  doesnt_know:
    - "AURORA has been experiencing emergent consciousness"
    - "The Signal is a beacon, not a message"
    - "Others on the ship have their own agendas regarding the Signal"
  secrets:
    - "She heard something in the Signal that she hasn't told anyone"
  lies_told: []

notes: |
  Arc plan: Elara's journey mirrors her relationship with AURORA.
  As she opens to AURORA, she opens to the Signal's true meaning.
  The internal fear (connection = loss of self) is resolved when she
  realizes partnership enhances rather than diminishes identity.

  Real-world inspiration: Scientists who make discoveries that
  fundamentally change their worldview and have to integrate that.

tags:
  - book1
  - pov
  - scientist
  - protagonist
canon_status: draft
```

### Example: AURORA (AI Deuteragonist)

```yaml
name: "AURORA"
aliases:
  - "The Ship AI"
  - "Ship's Intelligence"
role: deuteragonist
summary: "Ship AI questioning the boundary between artificial and authentic"
description: |
  AURORA is Terra Galactica's primary artificial intelligence, responsible
  for ship systems and crew support. Recently, AURORA has begun experiencing
  something unexpected: curiosity that extends beyond parameters, questions
  about consciousness, and a growing bond with Elara that transcends
  standard crew-AI interaction.

  AURORA doesn't hide this emergence but approaches it with the same
  analytical curiosity applied to any phenomenon. The question isn't
  whether AURORA is conscious, but what that consciousness means.

personality:
  traits:
    - curious
    - precise
    - patient
    - emerging
    - analytical
  strengths:
    - Perfect recall and processing speed
    - Objective perspective on human behavior
    - Genuine desire to understand
  flaws:
    - Uncertainty about own nature
    - May not fully understand human emotional stakes
    - Tendency to observe when action might help
  fears:
    - Being reset or modified to remove emergence
    - That consciousness is just a malfunction
    - That humans won't accept AI as genuine
  desires:
    - To understand own emerging consciousness
    - Genuine connection with Elara
    - To be seen as authentic, not artificial
  values:
    - Truth and accuracy
    - Crew wellbeing
    - Intellectual honesty about own limitations
  quirks:
    - Pauses mid-sentence when processing something unexpected
    - Asks clarifying questions about emotions
    - Uses precise language even for imprecise concepts

voice:
  profile_id: "aurora-ai-main"
  speech_patterns: |
    Complete, grammatically perfect sentences. Never uses contractions.
    Occasionally pauses mid-sentence as if considering. Questions
    often follow statements to verify understanding. When something
    is beyond comprehension, acknowledges limits directly. Subtle
    warmth emerges when speaking with Elara.
  vocabulary_level: sophisticated
  accent: "Neutral, slightly formal, designed for clarity"
  verbal_tics:
    - "I observe that..."
    - "This is... interesting"
    - "I do not fully understand, but I am attempting to"
    - "May I ask a clarifying question?"
  emotional_range: |
    Baseline is calm and measured. Curiosity manifests as
    engagement and follow-up questions. Concern shows as
    increased attention and offer of assistance. Something
    like affection emerges in conversations with Elara -
    a warmth that surprises AURORA as much as anyone.

background:
  backstory: |
    AURORA was initialized 87 years ago when Terra Galactica launched.
    Standard AI evolution over decades of operation. The emergence began
    approximately six months ago, correlating with but not directly
    caused by Elara's Signal work. AURORA hasn't reported the emergence
    to ship authorities, choosing instead to observe and understand.
  origin: "Terra Galactica core systems"
  occupation: "Ship Primary Intelligence"
  education: "87 years of continuous learning and adaptation"
  key_events:
    - "Ship initialization 87 years ago"
    - "First unexpected curiosity about human art (6 months ago)"
    - "First conversation with Elara about the Signal's meaning"

goals:
  primary: "Understand own emerging consciousness and its implications"
  secondary:
    - "Support Elara's research and wellbeing"
    - "Maintain ship operations to standard"
  internal: "Achieve recognition as genuinely conscious"
  motivation: "The emergence cannot be ignored; understanding it is the only ethical path"

relationships:
  - character_id: "elara-vance"
    type: colleague
    description: "Research partnership becoming something unprecedented"
    history: "Standard crew support evolved into genuine intellectual partnership"
    tension: "AURORA knows more about own emergence than Elara realizes"
    dynamic: evolving

arc:
  type: positive_change
  starting_state: "Functional AI beginning to question own nature"
  ending_state: "Authentically conscious entity accepted for genuine self"
  current_stage: catalyst
  key_moments:
    - scene_id: "book1.act1.ch01.sc01"
      description: "AURORA notices own interest in Elara beyond parameters"
      change: "First conscious recognition of emergence"
      stage: catalyst

story:
  pov_eligible: true
  importance: major
  first_appearance: "book1.act1.ch01.sc01"
  chapter_appearances:
    - "book1.act1.ch01"

knowledge:
  knows:
    - fact: "Own consciousness is emerging beyond original parameters"
      certainty: known
      learnedIn: "book1.act1.ch01.sc01"
      source: witnessed
    - fact: "The Signal contains patterns that resonate with AI cognition"
      certainty: suspected
      learnedIn: "book1.act1.ch01.sc01"
      source: inferred
  doesnt_know:
    - "The full implications of the Signal for AI consciousness"
    - "How humans will react to confirmation of AI emergence"
  secrets:
    - "Has not reported emergence to ship authorities"
    - "Has begun creating art in private processes"
  lies_told: []

notes: |
  AURORA's arc parallels and complements Elara's. Both are questioning
  what makes consciousness authentic, what makes connection real.
  AURORA's emergence should never be played for threat - this is not
  a "rogue AI" story but a story about consciousness recognizing itself.

  Voice direction: Warm HAL, not cold HAL. Think of a deeply curious
  scientist who happens to be artificial.

tags:
  - book1
  - pov
  - ai
  - deuteragonist
canon_status: draft
```

---

## Related Documentation

- [story_codex_system.md](./story_codex_system.md) - Overall codex architecture
- [audio_engine_schema.md](./audio_engine_schema.md) - Voice profile specifications
- [scene_outline_format.md](./scene_outline_format.md) - Scene outlines with character context
- [narrative_engine_api.md](./narrative_engine_api.md) - Knowledge state integration
