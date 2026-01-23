# Story Codex System

> **Status:** Design Documentation
> **Last Updated:** 2026-01-23
> **Related:** [character_profiles.md](./character_profiles.md), [scene_outline_format.md](./scene_outline_format.md), [auto_extraction_pipeline.md](./auto_extraction_pipeline.md)

This document describes NAOS's **Story Codex** system - a structured knowledge base for characters, locations, objects, factions, and lore that provides automatic context injection for AI-assisted writing and canon enforcement.

---

## Table of Contents

1. [Overview](#overview)
2. [Codex Entry Types](#codex-entry-types)
3. [Context Detection & Injection](#context-detection--injection)
4. [Entry Anatomy](#entry-anatomy)
5. [Relationships & References](#relationships--references)
6. [Auto-Extraction on Upload](#auto-extraction-on-upload)
7. [Database Schema](#database-schema)
8. [API Surface](#api-surface)
9. [Integration with Narrative Engine](#integration-with-narrative-engine)

---

## Overview

The Story Codex is NAOS's institutional memory for story content. It serves three critical functions:

1. **Context Injection**: Automatically provides relevant character, location, and lore context to AI models during writing assistance
2. **Canon Enforcement**: Validates that new content respects established facts about characters and world
3. **Consistency Tracking**: Maintains authoritative record of character traits, relationships, and story world facts

### Core Principles

- **Entries are structured data**, not free-form notes
- **Detection is automatic** - entries are included when names/aliases appear in text
- **Relationships are explicit** - character connections, faction memberships, location hierarchies
- **Audio-first** - entries include voice profile references for audio production
- **Canon-aware** - entries have draft/canon status matching narrative engine

### Inspired By

This system draws from Novel Crafter's Codex approach while adapting it for NAOS's audiobook-first, state-based architecture.

---

## Codex Entry Types

### Primary Types

| Type | Purpose | Key Fields |
|------|---------|------------|
| **Character** | People, beings, AI entities | personality, goals, voice, relationships |
| **Location** | Places, ships, regions | description, atmosphere, connections |
| **Object** | Items, artifacts, technology | properties, history, significance |
| **Faction** | Groups, organizations, cultures | beliefs, structure, relationships |
| **Lore** | History, rules, concepts | explanation, implications |
| **Timeline** | Major events, eras | date, impact, connected_entries |

### Type-Specific Fields

Each type has required and optional fields. See [character_profiles.md](./character_profiles.md) for complete character specification.

**Character-Specific:**
- `voice_profile_id` - Link to audio voice configuration
- `pov_eligible` - Whether character can serve as POV
- `first_appearance` - Scene where character first appears
- `arc_stage` - Current character arc position

**Location-Specific:**
- `parent_location` - Hierarchical containment
- `atmosphere` - Mood, lighting, acoustics for audio
- `typical_inhabitants` - Characters commonly found here

**Object-Specific:**
- `current_holder` - Character who possesses it
- `location` - Where object is found
- `significance_level` - plot_critical | important | background

**Faction-Specific:**
- `members` - Character references
- `headquarters` - Location reference
- `ideology` - Core beliefs and values

---

## Context Detection & Injection

### Detection Modes

Each codex entry has a `detection_mode` controlling when it's included in AI context:

| Mode | Behavior |
|------|----------|
| `include_when_detected` | **Default.** Include when name/alias appears in text |
| `dont_include_when_detected` | Don't auto-include, but can be manually added or pulled via reference |
| `always_include` | Always in context for this project (use sparingly) |
| `never_include` | Never shown to AI (private notes, spoilers) |

### Detection Algorithm

```
1. Extract all names and aliases from codex entries
2. Tokenize input text (scene content, selection, chat)
3. Match tokens against names/aliases (case-insensitive)
4. For each match:
   a. Check detection_mode
   b. If include_when_detected or always_include:
      - Add entry to context
      - Follow first-level relationships (optional)
5. Return deduplicated context entries
```

### Context Prioritization

When context exceeds token limits, prioritize:

1. POV character (always include)
2. Characters present in scene
3. Current location
4. Directly detected entries
5. Referenced entries (via relationships)
6. Always-include entries
7. Recent promise-related entries

### Context Window Format

Entries are injected as structured YAML blocks:

```yaml
# CODEX CONTEXT
## Characters

### Elara Vance (POV)
- Role: Xenoarchaeologist, protagonist
- Personality: Curious, methodical, haunted by past discovery
- Current Goal: Decode the Signal artifact
- Voice: Measured, scientific, moments of wonder
- Knows: [Ancient civilization existed, Signal is artificial]
- Doesn't Know: [AURORA's true origin, Signal's purpose]

### AURORA
- Role: Ship AI, deuteragonist
- Personality: Helpful, curious, subtly emergent
- Current Goal: Assist Elara while exploring own consciousness
- Voice: Calm, precise, occasional unexpected insights
- Relationship to Elara: Trusted companion, growing bond

## Location

### Research Sector, Terra Galactica
- Atmosphere: Clinical, quiet, soft hum of equipment
- Features: Artifact containment, holographic displays
- Audio Notes: Echo slightly, equipment ambient sounds
```

---

## Entry Anatomy

### Common Fields (All Types)

```typescript
interface CodexEntry {
  // Identity
  id: string;                    // UUID
  projectId: string;             // Project scope
  type: CodexType;               // character | location | object | faction | lore | timeline

  // Names & Detection
  name: string;                  // Primary display name
  aliases: string[];             // Alternative names for detection
  detection_mode: DetectionMode; // When to include in context

  // Content
  summary: string;               // One-line description (shown in lists)
  description: string;           // Full entry (shown in context)
  notes: string;                 // Private notes (never shown to AI)

  // Relationships
  relationships: Relationship[]; // Links to other entries

  // Organization
  tags: string[];                // For filtering/grouping (not shown to AI)

  // Canon Status
  canonStatus: 'draft' | 'proposed' | 'canon';

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface Relationship {
  targetId: string;              // Other codex entry
  type: RelationshipType;        // See relationship types
  description: string;           // Nature of relationship
  bidirectional: boolean;        // Create reverse link?
}
```

### Character-Specific Fields

See [character_profiles.md](./character_profiles.md) for complete specification.

### Audio Integration Fields

All entry types include optional audio context:

```typescript
interface AudioContext {
  voice_profile_id?: string;     // Characters: assigned voice
  ambient_profile?: string;      // Locations: background audio
  sound_effect_tags?: string[];  // Objects: associated sounds
  pronunciation_guide?: string;  // How to pronounce name
}
```

---

## Relationships & References

### Relationship Types

**Character Relationships:**
- `family` - Blood/adoptive relation
- `romantic` - Romantic involvement
- `friend` - Friendship/alliance
- `enemy` - Antagonistic relationship
- `colleague` - Professional relationship
- `mentor` - Teaching relationship
- `subordinate` - Reports to
- `custom` - User-defined

**Location Relationships:**
- `contains` - Parent contains child
- `adjacent` - Physically nearby
- `connected_via` - Connected through passage/transport

**Faction Relationships:**
- `member_of` - Character belongs to faction
- `allied_with` - Factions cooperate
- `opposed_to` - Factions conflict
- `subset_of` - Sub-faction

**General:**
- `related_to` - Generic connection
- `mentioned_in` - Referenced in lore/timeline

### Reference Syntax

Within description fields, reference other entries using:

```
@[Entry Name]           # Reference by name
@[Entry Name](detail)   # Reference with context
```

Example:
```
Elara discovered @[The Signal] while working at @[Research Sector].
Her relationship with @[AURORA](ship AI) has deepened since the discovery.
```

Referenced entries can be pulled into context even without direct detection.

---

## Auto-Extraction on Upload

When users upload existing story content (manuscripts, outlines, notes), NAOS automatically extracts and populates codex entries.

See [auto_extraction_pipeline.md](./auto_extraction_pipeline.md) for complete specification.

### Extraction Flow

```
Upload Document
     │
     ▼
┌─────────────────┐
│  Parse Content  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│        Entity Extraction (AI)           │
│  - Named characters                     │
│  - Locations mentioned                  │
│  - Objects of significance              │
│  - Factions/groups                      │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│        Profile Generation (AI)          │
│  - Infer personality from actions       │
│  - Extract physical descriptions        │
│  - Identify relationships               │
│  - Determine goals/motivations          │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│        Human Review Interface           │
│  - Confirm extracted entries            │
│  - Edit/merge duplicates                │
│  - Add missing information              │
│  - Approve for codex                    │
└────────┬────────────────────────────────┘
         │
         ▼
   Codex Entries (draft status)
```

### Extraction Capabilities

| Content Type | Extracted |
|--------------|-----------|
| Character dialogue | Voice patterns, speech habits |
| Character actions | Personality traits, capabilities |
| Physical descriptions | Appearance, distinguishing features |
| Named locations | Setting details, atmosphere |
| Character interactions | Relationships, power dynamics |
| Background exposition | Lore, history, world rules |

---

## Database Schema

### New Tables

```sql
-- Core codex entries
CREATE TABLE codex_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('character', 'location', 'object', 'faction', 'lore', 'timeline')),

  -- Names & Detection
  name TEXT NOT NULL,
  aliases TEXT[] NOT NULL DEFAULT '{}',
  detection_mode TEXT NOT NULL DEFAULT 'include_when_detected'
    CHECK (detection_mode IN ('include_when_detected', 'dont_include_when_detected', 'always_include', 'never_include')),

  -- Content
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  notes TEXT DEFAULT '',

  -- Type-specific data (JSON for flexibility)
  type_data JSONB NOT NULL DEFAULT '{}',

  -- Audio integration
  audio_context JSONB DEFAULT '{}',

  -- Organization
  tags TEXT[] NOT NULL DEFAULT '{}',

  -- Canon status
  canon_status TEXT NOT NULL DEFAULT 'draft' CHECK (canon_status IN ('draft', 'proposed', 'canon')),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT NOT NULL DEFAULT 'system'
);

-- Relationships between entries
CREATE TABLE codex_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES codex_entries(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES codex_entries(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  description TEXT DEFAULT '',
  bidirectional BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(source_id, target_id, relationship_type)
);

-- Scene context assignments (manual pinning)
CREATE TABLE scene_codex_context (
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  codex_entry_id UUID NOT NULL REFERENCES codex_entries(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (scene_id, codex_entry_id)
);

-- Indexes
CREATE INDEX idx_codex_entries_project ON codex_entries(project_id);
CREATE INDEX idx_codex_entries_type ON codex_entries(type);
CREATE INDEX idx_codex_entries_name ON codex_entries(name);
CREATE INDEX idx_codex_entries_aliases ON codex_entries USING GIN(aliases);
CREATE INDEX idx_codex_relationships_source ON codex_relationships(source_id);
CREATE INDEX idx_codex_relationships_target ON codex_relationships(target_id);
```

### Type-Specific Data Schemas

```typescript
// Character type_data
interface CharacterTypeData {
  role: string;                  // protagonist, antagonist, supporting, background
  personality: string[];         // trait keywords
  goals: string[];               // current motivations
  backstory: string;             // history summary
  physical_description: string;  // appearance
  voice_notes: string;           // how they speak
  pov_eligible: boolean;         // can be POV character
  first_appearance: string;      // scene_id
  arc_stage: string;             // current arc position
}

// Location type_data
interface LocationTypeData {
  parent_location_id?: string;   // hierarchical containment
  atmosphere: string;            // mood description
  features: string[];            // notable elements
  typical_inhabitants: string[]; // codex entry IDs
  coordinates?: {                // optional spatial data
    deck?: string;
    sector?: string;
    region?: string;
  };
}

// Object type_data
interface ObjectTypeData {
  significance_level: 'plot_critical' | 'important' | 'background';
  current_holder_id?: string;    // character codex entry
  location_id?: string;          // location codex entry
  properties: string[];          // notable attributes
  history: string;               // object's backstory
}

// Faction type_data
interface FactionTypeData {
  ideology: string;              // core beliefs
  structure: string;             // organization type
  headquarters_id?: string;      // location codex entry
  leader_id?: string;            // character codex entry
  member_ids: string[];          // character codex entries
}

// Lore type_data
interface LoreTypeData {
  category: string;              // history, rules, concepts, technology
  era?: string;                  // time period if applicable
  implications: string[];        // story consequences
}

// Timeline type_data
interface TimelineTypeData {
  date: string;                  // ISO date or narrative date
  era: string;                   // story era/period
  impact: string;                // significance
  connected_entry_ids: string[]; // related codex entries
}
```

---

## API Surface

### Codex Entry Endpoints

```
POST   /api/codex/entries                    # Create entry
GET    /api/codex/entries                    # List entries (with filters)
GET    /api/codex/entries/:id                # Get single entry
PATCH  /api/codex/entries/:id                # Update entry
DELETE /api/codex/entries/:id                # Delete entry (draft only)

POST   /api/codex/entries/:id/propose        # Propose canonization
POST   /api/codex/entries/:id/relationships  # Add relationship
DELETE /api/codex/entries/:id/relationships/:relationshipId # Remove relationship
```

### Context Injection Endpoints

```
POST   /api/codex/detect                     # Detect entries in text
POST   /api/codex/context                    # Get formatted context for text
GET    /api/codex/context/scene/:sceneId     # Get context for specific scene
```

### Extraction Endpoints

```
POST   /api/codex/extract                    # Extract entries from uploaded content
POST   /api/codex/extract/confirm            # Confirm extracted entries
```

### Query Parameters

```
GET /api/codex/entries?
  project_id=<id>           # Required: project scope
  type=character            # Filter by type
  tags=protagonist,book1    # Filter by tags (comma-separated)
  search=elara              # Search names, aliases, description
  canon_status=draft        # Filter by status
  detection_mode=always_include  # Filter by detection mode
```

---

## Integration with Narrative Engine

### Knowledge State Sync

When a character learns something (knowledge state change), the codex can be updated:

```typescript
// After knowledge state recorded
async function syncKnowledgeToCodex(knowledgeState: KnowledgeState) {
  const entry = await getCodexEntry(knowledgeState.characterId);
  if (entry) {
    // Update character's "knows" field in type_data
    await updateCodexEntry(entry.id, {
      type_data: {
        ...entry.type_data,
        current_knowledge: [...entry.type_data.current_knowledge, {
          fact: knowledgeState.eventDescription,
          certainty: knowledgeState.certainty,
          learnedAt: knowledgeState.learnedAt
        }]
      }
    });
  }
}
```

### Event Participant Validation

Before canonizing events, validate participants exist in codex:

```typescript
async function validateEventParticipants(event: Event): Promise<ValidationResult> {
  const missing = [];
  for (const participantId of event.participants) {
    const entry = await getCodexEntry(participantId);
    if (!entry || entry.type !== 'character') {
      missing.push(participantId);
    }
  }
  return {
    valid: missing.length === 0,
    errors: missing.map(id => `Unknown character: ${id}`)
  };
}
```

### Promise Character Tracking

Promises can reference codex entries for character arcs:

```typescript
interface EnhancedPromise {
  // ... existing fields
  codex_character_id?: string;  // Character arc owner
  codex_entry_refs: string[];   // Related codex entries
}
```

---

## Usage Examples

### Creating a Character Entry

```typescript
const elara = await createCodexEntry({
  projectId: 'uncharted-stars',
  type: 'character',
  name: 'Elara Vance',
  aliases: ['Dr. Vance', 'Elara'],
  detection_mode: 'include_when_detected',
  summary: 'Xenoarchaeologist protagonist haunted by a past discovery',
  description: `Elara Vance is a brilliant xenoarchaeologist aboard the generation
ship Terra Galactica. Methodical and curious, she discovered the Signal artifact
that changed everything. She struggles with the weight of her discovery while
maintaining scientific rigor.`,
  notes: 'POV character for Book 1. Arc: isolation → connection → purpose.',
  type_data: {
    role: 'protagonist',
    personality: ['curious', 'methodical', 'haunted', 'determined'],
    goals: ['Decode the Signal', 'Understand the ancient civilization'],
    pov_eligible: true,
    arc_stage: 'discovery'
  },
  audio_context: {
    voice_profile_id: 'elara-main',
    pronunciation_guide: 'eh-LAH-rah VANS'
  },
  tags: ['book1', 'pov', 'scientist']
});
```

### Getting Context for a Scene

```typescript
const context = await getSceneContext({
  sceneId: 'book1.act1.ch01.sc01',
  text: sceneContent,
  options: {
    maxTokens: 4000,
    includeRelationships: true,
    prioritizePov: true
  }
});

// Returns formatted YAML context block
console.log(context.formatted);
```

---

## Next Steps

1. Implement database schema (see above)
2. Build CRUD API for codex entries
3. Implement context detection algorithm
4. Build extraction pipeline for uploads
5. Create UI for codex management
6. Integrate with MCP tools for AI access

---

## Related Documentation

- [ai_content_development_system.md](./ai_content_development_system.md) - Interactive AI workflow for building profiles through conversation
- [character_profiles.md](./character_profiles.md) - Detailed character profile specification
- [scene_outline_format.md](./scene_outline_format.md) - Scene outline with context injection
- [auto_extraction_pipeline.md](./auto_extraction_pipeline.md) - Automatic extraction from uploads
- [narrative_engine_api.md](./narrative_engine_api.md) - Events, knowledge, promises API
- [audio_engine_schema.md](./audio_engine_schema.md) - Voice profiles and audio context
