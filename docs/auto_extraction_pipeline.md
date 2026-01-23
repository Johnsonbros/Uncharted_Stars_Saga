# Auto-Extraction Pipeline

> **Status:** Design Documentation
> **Last Updated:** 2026-01-23
> **Related:** [story_codex_system.md](./story_codex_system.md), [character_profiles.md](./character_profiles.md)

This document describes NAOS's automatic extraction pipeline that creates codex entries and character profiles from uploaded story content.

---

## Table of Contents

1. [Overview](#overview)
2. [Supported Upload Formats](#supported-upload-formats)
3. [Extraction Pipeline](#extraction-pipeline)
4. [Entity Extraction](#entity-extraction)
5. [Profile Generation](#profile-generation)
6. [Human Review Interface](#human-review-interface)
7. [API Specification](#api-specification)
8. [Implementation Details](#implementation-details)

---

## Overview

The auto-extraction pipeline allows creators to upload existing manuscripts, outlines, or notes and automatically populate their Story Codex with extracted characters, locations, objects, and other entities.

### Core Value Proposition

- **Reduce Manual Entry**: Don't retype information that exists in your writing
- **Discover Implicit Details**: AI identifies character traits from actions and dialogue
- **Relationship Mapping**: Automatically detect character relationships
- **Consistency Bootstrap**: Establish codex baseline from existing work

### Key Principles

1. **Human-in-the-Loop**: All extractions require creator review before codex entry
2. **Source Attribution**: Every extracted fact links back to its source text
3. **Confidence Scoring**: AI indicates certainty level for each extraction
4. **Non-Destructive**: Uploads don't modify original files
5. **Incremental**: Can process additional uploads and merge with existing codex

---

## Supported Upload Formats

### Text Formats

| Format | Extensions | Notes |
|--------|------------|-------|
| Plain Text | `.txt` | UTF-8 encoding preferred |
| Markdown | `.md`, `.markdown` | Preserves structure |
| Rich Text | `.rtf` | Converted to plain text |
| Word Document | `.docx` | Extracts text, ignores formatting |
| OpenDocument | `.odt` | Extracts text content |

### Structured Formats

| Format | Extensions | Notes |
|--------|------------|-------|
| Scrivener | `.scriv` | Processes binder structure |
| OPML | `.opml` | Outline extraction |
| JSON | `.json` | With schema detection |
| YAML | `.yaml`, `.yml` | Character sheets, world docs |

### Special Formats

| Format | Extensions | Notes |
|--------|------------|-------|
| Novel Crafter Export | `.json` | Direct codex import |
| Campfire Export | `.json` | Character/world import |
| World Anvil Export | `.json` | World-building import |

### Upload Constraints

- Maximum file size: 50MB
- Maximum files per batch: 20
- Maximum combined text: 500,000 words
- Supported encodings: UTF-8, UTF-16, ASCII

---

## Extraction Pipeline

### Pipeline Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                       UPLOAD STAGE                               │
│                                                                  │
│   Files → Validation → Format Detection → Text Extraction        │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                      ANALYSIS STAGE                              │
│                                                                  │
│   Chunking → Entity Detection → Relationship Detection →         │
│   Scene/Chapter Detection                                        │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                     EXTRACTION STAGE                             │
│                                                                  │
│   Character Extraction → Location Extraction →                   │
│   Object Extraction → Lore Extraction                            │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                     GENERATION STAGE                             │
│                                                                  │
│   Profile Generation → Relationship Mapping →                    │
│   Confidence Scoring → Source Attribution                        │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                      REVIEW STAGE                                │
│                                                                  │
│   Human Review Interface → Edit/Merge/Reject →                   │
│   Codex Entry Creation                                           │
└──────────────────────────────────────────────────────────────────┘
```

### Stage Details

#### 1. Upload Stage

```typescript
interface UploadStageResult {
  uploadId: string;
  files: ProcessedFile[];
  totalWordCount: number;
  detectedFormat: string;
  status: 'success' | 'partial' | 'failed';
  errors: UploadError[];
}

interface ProcessedFile {
  filename: string;
  format: string;
  wordCount: number;
  extractedText: string;
  structure?: DocumentStructure;  // For formats with chapters/sections
}
```

#### 2. Analysis Stage

```typescript
interface AnalysisStageResult {
  chunks: TextChunk[];
  entities: DetectedEntity[];
  relationships: DetectedRelationship[];
  structure: NarrativeStructure;
}

interface TextChunk {
  id: string;
  text: string;
  sourceFile: string;
  position: { start: number; end: number };
  type: 'narrative' | 'dialogue' | 'description' | 'exposition';
}

interface DetectedEntity {
  name: string;
  type: 'character' | 'location' | 'object' | 'faction' | 'concept';
  mentions: EntityMention[];
  confidence: number;  // 0-1
}

interface EntityMention {
  chunkId: string;
  text: string;
  position: { start: number; end: number };
  context: string;  // Surrounding text
}
```

#### 3. Extraction Stage

For each detected entity, extract detailed information:

```typescript
interface ExtractionStageResult {
  characters: ExtractedCharacter[];
  locations: ExtractedLocation[];
  objects: ExtractedObject[];
  factions: ExtractedFaction[];
  lore: ExtractedLore[];
}

interface ExtractedCharacter {
  entityId: string;
  name: string;
  aliases: string[];

  // Extracted attributes with sources
  attributes: {
    field: string;
    value: string;
    confidence: number;
    sources: SourceReference[];
  }[];

  // Detected relationships
  relationships: {
    targetName: string;
    type: string;
    confidence: number;
    sources: SourceReference[];
  }[];
}

interface SourceReference {
  chunkId: string;
  quote: string;
  position: { start: number; end: number };
}
```

#### 4. Generation Stage

Convert extractions to draft codex entries:

```typescript
interface GenerationStageResult {
  draftEntries: DraftCodexEntry[];
  relationshipMap: RelationshipMap;
  confidenceReport: ConfidenceReport;
}

interface DraftCodexEntry {
  id: string;
  type: CodexType;
  name: string;
  aliases: string[];

  // Generated content
  summary: string;
  description: string;
  typeData: Record<string, any>;

  // Extraction metadata
  confidence: number;
  sources: SourceReference[];
  extractionNotes: string[];

  // Review status
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'merged';
  reviewNotes: string;
}
```

---

## Entity Extraction

### Character Extraction

The pipeline identifies characters through:

1. **Named Entity Recognition**: Proper nouns in narrative and dialogue
2. **Dialogue Attribution**: "said X" patterns
3. **Pronoun Resolution**: Tracking pronoun references
4. **Role Detection**: Protagonist, antagonist, etc. based on screen time and narrative focus

#### Character Attribute Extraction

| Attribute | Extraction Method | Confidence Factors |
|-----------|-------------------|-------------------|
| Name | Direct mention | High if consistent |
| Aliases | "also known as", dialogue addressing | Medium |
| Physical | Description passages | High if explicit |
| Personality | Actions, dialogue patterns, narrator description | Medium |
| Goals | Stated desires, pursued actions | Medium-Low |
| Relationships | Interaction patterns, explicit statements | Medium |
| Voice | Dialogue analysis | Medium-High |
| Role | Narrative prominence, arc patterns | Medium |

#### Dialogue Analysis for Voice

```typescript
interface DialogueAnalysis {
  characterName: string;
  totalLines: number;
  averageSentenceLength: number;
  vocabularyLevel: 'simple' | 'moderate' | 'sophisticated' | 'technical';
  contractionUsage: number;  // Percentage
  questionFrequency: number;
  exclamationFrequency: number;
  commonPhrases: string[];
  speechPatternNotes: string;
}
```

### Location Extraction

Locations identified through:

1. **Setting Descriptions**: Narrative passages describing places
2. **Character Movement**: "went to", "arrived at" patterns
3. **Scene Headers**: If present in structured documents
4. **Consistent Naming**: Same place mentioned multiple times

#### Location Attribute Extraction

| Attribute | Extraction Method |
|-----------|-------------------|
| Name | Direct mention |
| Type | Context (ship, planet, room, etc.) |
| Atmosphere | Descriptive passages |
| Features | Listed elements |
| Inhabitants | Characters appearing there |
| Hierarchy | "in the X" containment patterns |

### Object Extraction

Objects identified when:

1. Named with significance (capitalized, repeated)
2. Associated with plot events
3. Possess special properties
4. Characters interact meaningfully with them

### Faction Extraction

Groups identified through:

1. Collective nouns with agency
2. Multiple characters sharing affiliation
3. Ideological statements
4. Organizational references

---

## Profile Generation

### Generation Process

For each extracted entity, AI generates a complete profile:

```
Extracted Entity + Source Text → AI Profile Generation → Draft Entry

AI considers:
1. All mentions and contexts
2. Character actions (what they DO)
3. Character dialogue (how they SPEAK)
4. Narrator descriptions (how they're DESCRIBED)
5. Relationship dynamics (how they RELATE)
6. Narrative role (their FUNCTION)
```

### Profile Completeness Levels

**Minimum Viable (background characters):**
- Name, aliases
- Summary (one line)
- Basic role

**Standard (supporting characters):**
- Above plus personality traits
- Voice notes from dialogue
- Key relationships
- Basic physical if described

**Complete (major characters):**
- All fields populated
- Detailed voice analysis
- Comprehensive relationships
- Arc tracking if detectable

### Confidence Scoring

Each generated field receives a confidence score:

```typescript
type ConfidenceLevel = 'high' | 'medium' | 'low' | 'inferred';

interface FieldConfidence {
  field: string;
  value: string;
  confidence: ConfidenceLevel;
  reasoning: string;
  sources: SourceReference[];
}

// Confidence criteria:
// high: Explicitly stated in text, multiple consistent sources
// medium: Stated once or implied strongly
// low: Inferred from context, may need verification
// inferred: AI interpretation, requires human validation
```

### Source Attribution

Every extracted fact links to its source:

```typescript
interface SourceAttribution {
  fact: string;
  sources: {
    quote: string;          // Exact text
    file: string;           // Source file
    location: string;       // Chapter/section/position
    extractionType: 'explicit' | 'implicit' | 'inferred';
  }[];
}

// Example:
{
  fact: "Elara has a scar on her left hand",
  sources: [{
    quote: "She traced the thin scar across her palm, a reminder of the first artifact that fought back.",
    file: "chapter_03.md",
    location: "Chapter 3, paragraph 47",
    extractionType: "explicit"
  }]
}
```

---

## Human Review Interface

### Review Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    EXTRACTION SUMMARY                       │
│                                                             │
│  Uploaded: 3 files (45,000 words)                          │
│  Detected: 12 characters, 8 locations, 5 objects           │
│  Generated: 25 draft entries                                │
│                                                             │
│  [Review All] [Review by Type] [Auto-approve High Conf.]   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    ENTRY REVIEW                             │
│                                                             │
│  Character: Elara Vance                     Confidence: 92% │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Summary: [editable field]                                  │
│  "Xenoarchaeologist haunted by discovery"                   │
│                                                             │
│  Personality Traits: [editable list]                        │
│  • curious (high) - "her endless questions" ch.2           │
│  • methodical (high) - multiple analysis scenes             │
│  • haunted (medium) - "the weight she carried" ch.5         │
│  [+ Add trait]                                              │
│                                                             │
│  Voice Notes: [editable]                                    │
│  "Precise vocabulary, longer explanatory sentences..."      │
│  Sources: [view 23 dialogue samples]                        │
│                                                             │
│  Relationships:                                             │
│  • AURORA - colleague (high) [edit type ▼]                 │
│  • Dr. Chen - mentor (medium) [edit type ▼]                │
│  [+ Add relationship]                                       │
│                                                             │
│  [◀ Previous] [Approve] [Edit] [Reject] [Merge] [Next ▶]   │
└─────────────────────────────────────────────────────────────┘
```

### Review Actions

| Action | Description |
|--------|-------------|
| **Approve** | Accept entry as-is into codex (draft status) |
| **Edit** | Modify fields before approving |
| **Reject** | Discard extraction (with reason) |
| **Merge** | Combine with existing codex entry |
| **Split** | Separate if AI merged distinct entities |
| **Flag** | Mark for later review |

### Batch Operations

- **Auto-approve**: Approve all entries above confidence threshold
- **Bulk edit**: Apply same change to multiple entries
- **Quick review**: Approve/reject with single click per entry

### Merge Handling

When uploading additional content:

```typescript
interface MergeDecision {
  existingEntry: CodexEntry;
  newExtraction: DraftCodexEntry;
  matchConfidence: number;
  conflicts: FieldConflict[];
  recommendation: 'merge' | 'keep_existing' | 'keep_new' | 'manual';
}

interface FieldConflict {
  field: string;
  existingValue: string;
  newValue: string;
  recommendation: 'keep_existing' | 'use_new' | 'combine';
  reasoning: string;
}
```

---

## API Specification

### Upload Endpoint

```
POST /api/codex/extract
Content-Type: multipart/form-data

Parameters:
- files: File[] (required) - Files to process
- projectId: string (required) - Target project
- options: ExtractionOptions (optional)

Response:
{
  uploadId: string,
  status: "processing" | "complete" | "failed",
  estimatedTime: number,  // seconds
  progressUrl: string     // WebSocket for progress
}
```

### Extraction Options

```typescript
interface ExtractionOptions {
  // What to extract
  extractCharacters: boolean;      // default: true
  extractLocations: boolean;       // default: true
  extractObjects: boolean;         // default: true
  extractFactions: boolean;        // default: true
  extractLore: boolean;            // default: true

  // Extraction depth
  profileDepth: 'minimal' | 'standard' | 'complete';  // default: standard
  dialogueAnalysis: boolean;       // default: true
  relationshipDetection: boolean;  // default: true

  // Confidence thresholds
  minConfidence: number;           // default: 0.3
  autoApproveThreshold: number;    // default: 0.9

  // Merge behavior
  mergeWithExisting: boolean;      // default: true
  conflictResolution: 'ask' | 'keep_existing' | 'use_new';  // default: ask

  // Processing
  chunkSize: number;               // default: 10000 (characters)
  maxConcurrentChunks: number;     // default: 5
}
```

### Progress Endpoint

```
GET /api/codex/extract/{uploadId}/progress

Response:
{
  uploadId: string,
  status: "uploading" | "analyzing" | "extracting" | "generating" | "complete",
  progress: {
    stage: string,
    current: number,
    total: number,
    percentage: number
  },
  preliminary: {
    charactersFound: number,
    locationsFound: number,
    objectsFound: number
  }
}
```

### Results Endpoint

```
GET /api/codex/extract/{uploadId}/results

Response:
{
  uploadId: string,
  status: "complete",
  summary: {
    filesProcessed: number,
    wordsAnalyzed: number,
    entitiesDetected: number,
    entriesGenerated: number,
    averageConfidence: number
  },
  entries: DraftCodexEntry[],
  relationships: RelationshipMap,
  reviewUrl: string  // UI for human review
}
```

### Confirm Endpoint

```
POST /api/codex/extract/{uploadId}/confirm

Body:
{
  approvedEntries: string[],       // Entry IDs to approve
  rejectedEntries: string[],       // Entry IDs to reject
  editedEntries: EditedEntry[],    // Modified entries
  mergeDecisions: MergeDecision[]  // How to handle conflicts
}

Response:
{
  created: number,
  merged: number,
  rejected: number,
  codexEntryIds: string[]
}
```

---

## Implementation Details

### AI Model Configuration

```typescript
interface ExtractionModelConfig {
  // Entity detection
  entityModel: 'haiku';           // Fast, good for NER
  entityMaxTokens: 4000;

  // Profile generation
  profileModel: 'sonnet';         // Balance of quality/speed
  profileMaxTokens: 8000;

  // Deep analysis (optional)
  analysisModel: 'opus';          // For complex inference
  analysisMaxTokens: 16000;
}
```

### Chunking Strategy

```typescript
function chunkDocument(text: string, options: ChunkOptions): TextChunk[] {
  // 1. Split by natural boundaries (chapters, sections, scene breaks)
  // 2. If chunks too large, split by paragraphs
  // 3. Maintain context overlap for entity continuity
  // 4. Tag chunks with structural metadata
}

interface ChunkOptions {
  maxChunkSize: number;           // Characters
  overlapSize: number;            // For context continuity
  preserveBoundaries: string[];   // Patterns to split on
}
```

### Entity Resolution

Handling multiple names for same entity:

```typescript
interface EntityResolution {
  canonicalName: string;
  variants: {
    name: string;
    frequency: number;
    contexts: string[];
  }[];
  mergeConfidence: number;
}

// Example:
{
  canonicalName: "Elara Vance",
  variants: [
    { name: "Elara", frequency: 145, contexts: ["dialogue", "narrative"] },
    { name: "Dr. Vance", frequency: 23, contexts: ["formal", "professional"] },
    { name: "she", frequency: 89, contexts: ["narrative"] }  // resolved pronouns
  ],
  mergeConfidence: 0.95
}
```

### Relationship Detection Patterns

```typescript
const relationshipPatterns = [
  // Family
  { pattern: /(\w+)'s (mother|father|sister|brother|daughter|son)/, type: 'family' },
  { pattern: /(mother|father) of (\w+)/, type: 'family' },

  // Professional
  { pattern: /(\w+) worked (for|under|with) (\w+)/, type: 'colleague' },
  { pattern: /(\w+)'s (boss|employee|colleague)/, type: 'professional' },

  // Romantic
  { pattern: /(\w+) (loved|kissed|married) (\w+)/, type: 'romantic' },
  { pattern: /(\w+)'s (husband|wife|partner)/, type: 'romantic' },

  // Conflict
  { pattern: /(\w+) (fought|hated|opposed) (\w+)/, type: 'enemy' },

  // Interaction (infer from repeated co-occurrence)
  { pattern: null, type: 'interaction', method: 'co-occurrence' }
];
```

### Error Handling

```typescript
interface ExtractionError {
  type: 'upload' | 'parse' | 'extraction' | 'generation';
  severity: 'warning' | 'error' | 'fatal';
  message: string;
  file?: string;
  position?: { start: number; end: number };
  recoverable: boolean;
  suggestion?: string;
}

// Common errors:
// - Encoding issues (suggest: re-save as UTF-8)
// - Empty files (skip with warning)
// - Unsupported format (suggest: convert to .txt)
// - Too large (suggest: split file)
// - Low confidence across board (suggest: add more content)
```

---

## Usage Examples

### Basic Upload Flow

```typescript
// 1. Upload files
const upload = await fetch('/api/codex/extract', {
  method: 'POST',
  body: formData  // Contains files and projectId
});
const { uploadId, progressUrl } = await upload.json();

// 2. Monitor progress via WebSocket
const ws = new WebSocket(progressUrl);
ws.onmessage = (event) => {
  const progress = JSON.parse(event.data);
  updateProgressUI(progress);
};

// 3. Get results when complete
const results = await fetch(`/api/codex/extract/${uploadId}/results`);
const { entries } = await results.json();

// 4. Review and confirm
// ... human reviews entries in UI ...

// 5. Commit approved entries
await fetch(`/api/codex/extract/${uploadId}/confirm`, {
  method: 'POST',
  body: JSON.stringify({
    approvedEntries: selectedEntryIds,
    editedEntries: modifiedEntries
  })
});
```

### Incremental Upload

```typescript
// Uploading additional chapters to existing project
const upload = await fetch('/api/codex/extract', {
  method: 'POST',
  body: formData,
  headers: {
    'X-Extraction-Options': JSON.stringify({
      mergeWithExisting: true,
      conflictResolution: 'ask'
    })
  }
});

// Results will include merge decisions for overlapping entities
const results = await fetch(`/api/codex/extract/${uploadId}/results`);
const { entries, mergeDecisions } = await results.json();

// Review merge conflicts
for (const decision of mergeDecisions) {
  // UI shows existing vs new, user decides
}
```

---

## Related Documentation

- [story_codex_system.md](./story_codex_system.md) - Codex architecture
- [character_profiles.md](./character_profiles.md) - Character profile format
- [scene_outline_format.md](./scene_outline_format.md) - Scene structure
- [mcp_narrative_tools.md](./mcp_narrative_tools.md) - MCP integration
