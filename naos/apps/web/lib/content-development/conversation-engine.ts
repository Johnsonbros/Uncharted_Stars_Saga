/**
 * Conversation Engine
 *
 * Core conversation analysis and response generation for AI content development.
 * Extracts structured data from natural language and generates contextual follow-ups.
 */

import type {
  ConceptSketch,
  ConversationMessage,
  FieldUpdate,
  CharacterProfile,
  LocationProfile,
  FactionProfile,
  ClarificationRequest,
  CodexEntryType
} from "./types";

// ============================================================================
// EXTRACTION PATTERNS
// ============================================================================

/**
 * Patterns for extracting character information from conversation
 */
const CHARACTER_EXTRACTION_PATTERNS = {
  personality: {
    traits: [
      /(?:she|he|they)(?:'s|'re| is| are) (\w+(?:,?\s+(?:and\s+)?\w+)*)/i,
      /personality[:\s]+(\w+(?:,?\s+(?:and\s+)?\w+)*)/i,
      /(?:core )?traits?[:\s]+(\w+(?:,?\s+(?:and\s+)?\w+)*)/i
    ],
    strengths: [
      /strength(?:s)?[:\s]+(.+?)(?:\.|$)/i,
      /good at (.+?)(?:\.|$)/i,
      /excels at (.+?)(?:\.|$)/i
    ],
    flaws: [
      /flaw(?:s)?[:\s]+(.+?)(?:\.|$)/i,
      /weakness(?:es)?[:\s]+(.+?)(?:\.|$)/i,
      /struggles with (.+?)(?:\.|$)/i
    ],
    fears: [
      /fears? (?:that )?(.+?)(?:\.|$)/i,
      /afraid of (.+?)(?:\.|$)/i,
      /terrified (?:of )?(.+?)(?:\.|$)/i
    ]
  },
  voice: {
    speechPatterns: [
      /(?:talks?|speaks?) (.+?)(?:\.|$)/i,
      /speech[:\s]+(.+?)(?:\.|$)/i
    ],
    verbalTics: [
      /always says? ["'](.+?)["']/i,
      /verbal tic(?:s)?[:\s]+(.+?)(?:\.|$)/i,
      /catchphrase[:\s]+["'](.+?)["']/i
    ]
  },
  background: {
    keyEvents: [
      /(?:parents?|family) (?:died|passed|lost) (.+?)(?:\.|$)/i,
      /(?:when|after) (.+?) happened/i
    ],
    occupation: [
      /(?:she|he|they)(?:'s| is| works as) (?:a |an )?(\w+(?:\s+\w+)?)/i,
      /occupation[:\s]+(\w+(?:\s+\w+)?)/i
    ]
  },
  goals: {
    primary: [
      /wants? to (.+?)(?:\.|$)/i,
      /goal[:\s]+(.+?)(?:\.|$)/i,
      /trying to (.+?)(?:\.|$)/i
    ],
    internal: [
      /needs? (.+?)(?:\.|but|$)/i,
      /truly (?:wants?|needs?) (.+?)(?:\.|$)/i
    ]
  },
  relationships: {
    general: [
      /(\w+)(?:'s| is) (?:her|his|their) (\w+)/i,
      /relationship with (\w+)[:\s]+(.+?)(?:\.|$)/i
    ]
  },
  knowledge: {
    knows: [
      /knows? (?:that )?(.+?)(?:\.|$)/i,
      /aware (?:that |of )?(.+?)(?:\.|$)/i
    ],
    doesntKnow: [
      /doesn't know (?:that )?(.+?)(?:\.|$)/i,
      /unaware (?:that |of )?(.+?)(?:\.|$)/i
    ]
  }
};

/**
 * Patterns for extracting location information
 */
const LOCATION_EXTRACTION_PATTERNS = {
  atmosphere: [
    /atmosphere[:\s]+(.+?)(?:\.|$)/i,
    /feels? (.+?)(?:\.|$)/i,
    /mood[:\s]+(.+?)(?:\.|$)/i
  ],
  features: [
    /features?[:\s]+(.+?)(?:\.|$)/i,
    /has (?:a |an )?(.+?)(?:\.|$)/i,
    /contains? (.+?)(?:\.|$)/i
  ],
  inhabitants: [
    /(?:usually |typically )?(?:inhabited|populated) by (.+?)(?:\.|$)/i,
    /people (?:there|here)[:\s]+(.+?)(?:\.|$)/i
  ]
};

// ============================================================================
// QUESTION GENERATION
// ============================================================================

/**
 * Question priority order for character development
 */
export const CHARACTER_QUESTION_PRIORITY = [
  { field: "identity.name", question: "What is this character's name?" },
  { field: "identity.role", question: "What role does this character play in the story? (protagonist, antagonist, mentor, etc.)" },
  { field: "identity.summary", question: "Can you give me a one-line description of this character?" },
  { field: "personality.traits", question: "What are 3-5 core personality traits that define this character?" },
  { field: "voice.speechPatterns", question: "How does this character talk? What's distinctive about their speech?" },
  { field: "goals.primary", question: "What is this character's main goal in the story?" },
  { field: "goals.internal", question: "What does this character truly need, perhaps without consciously realizing it?" },
  { field: "personality.flaws", question: "What are this character's key flaws or weaknesses?" },
  { field: "background.keyEvents", question: "What formative events shaped who this character is?" },
  { field: "relationships", question: "Who are the most important people in this character's life?" },
  { field: "arc.type", question: "What type of arc will this character have? (positive change, flat, etc.)" },
  { field: "arc.startingState", question: "Where does this character start emotionally/psychologically?" },
  { field: "physical.distinguishingFeatures", question: "What's one physical feature people notice about this character?" },
  { field: "voice.verbalTics", question: "Does this character have any verbal tics or repeated phrases?" },
  { field: "knowledge.doesntKnow", question: "What important things does this character not know?" }
];

/**
 * Question priority order for location development
 */
export const LOCATION_QUESTION_PRIORITY = [
  { field: "name", question: "What is this location called?" },
  { field: "hierarchy", question: "Where is this location? What contains it?" },
  { field: "atmosphere", question: "What's the atmosphere or mood of this place?" },
  { field: "features", question: "What are the notable features of this location?" },
  { field: "purpose", question: "What is this location's purpose? Why does it exist?" },
  { field: "inhabitants", question: "Who typically inhabits or visits this location?" },
  { field: "audio", question: "What sounds characterize this location? What would a listener hear?" },
  { field: "connections", question: "How do people get to this location? What's it connected to?" }
];

// ============================================================================
// CONVERSATION ENGINE CLASS
// ============================================================================

export class ConversationEngine {
  /**
   * Analyze user input and extract structured content
   */
  analyzeInput(
    input: string,
    entryType: CodexEntryType,
    existingProfile?: Partial<CharacterProfile | LocationProfile | FactionProfile>
  ): AnalysisResult {
    const result: AnalysisResult = {
      extractedFacts: [],
      inferredCharacteristics: {},
      detectedRelationships: [],
      contradictions: [],
      confidenceScore: 0
    };

    if (entryType === "character") {
      this.extractCharacterData(input, result);
    } else if (entryType === "location") {
      this.extractLocationData(input, result);
    }

    // Check for contradictions with existing profile
    if (existingProfile) {
      this.detectContradictions(result, existingProfile);
    }

    // Calculate confidence score based on extraction success
    result.confidenceScore = this.calculateConfidence(result);

    return result;
  }

  /**
   * Extract character data from input text
   */
  private extractCharacterData(input: string, result: AnalysisResult): void {
    // Extract personality traits
    for (const pattern of CHARACTER_EXTRACTION_PATTERNS.personality.traits) {
      const match = input.match(pattern);
      if (match) {
        const traits = match[1].split(/,\s*(?:and\s+)?/).map(t => t.trim().toLowerCase());
        result.extractedFacts.push({
          fieldPath: "personality.traits",
          value: traits,
          confidence: 0.8
        });
      }
    }

    // Extract speech patterns
    for (const pattern of CHARACTER_EXTRACTION_PATTERNS.voice.speechPatterns) {
      const match = input.match(pattern);
      if (match) {
        result.extractedFacts.push({
          fieldPath: "voice.speechPatterns",
          value: match[1].trim(),
          confidence: 0.7
        });
      }
    }

    // Extract verbal tics
    for (const pattern of CHARACTER_EXTRACTION_PATTERNS.voice.verbalTics) {
      const match = input.match(pattern);
      if (match) {
        result.extractedFacts.push({
          fieldPath: "voice.verbalTics",
          value: [match[1].trim()],
          confidence: 0.9
        });
      }
    }

    // Extract goals
    for (const pattern of CHARACTER_EXTRACTION_PATTERNS.goals.primary) {
      const match = input.match(pattern);
      if (match) {
        result.extractedFacts.push({
          fieldPath: "goals.primary",
          value: match[1].trim(),
          confidence: 0.7
        });
      }
    }

    // Extract occupation
    for (const pattern of CHARACTER_EXTRACTION_PATTERNS.background.occupation) {
      const match = input.match(pattern);
      if (match) {
        result.extractedFacts.push({
          fieldPath: "background.occupation",
          value: match[1].trim(),
          confidence: 0.8
        });
      }
    }

    // Extract fears
    for (const pattern of CHARACTER_EXTRACTION_PATTERNS.personality.fears) {
      const match = input.match(pattern);
      if (match) {
        result.extractedFacts.push({
          fieldPath: "personality.fears",
          value: [match[1].trim()],
          confidence: 0.8
        });
      }
    }

    // Extract knowledge
    for (const pattern of CHARACTER_EXTRACTION_PATTERNS.knowledge.knows) {
      const match = input.match(pattern);
      if (match) {
        result.inferredCharacteristics["knowledge.knows"] = match[1].trim();
      }
    }

    for (const pattern of CHARACTER_EXTRACTION_PATTERNS.knowledge.doesntKnow) {
      const match = input.match(pattern);
      if (match) {
        result.extractedFacts.push({
          fieldPath: "knowledge.doesntKnow",
          value: [match[1].trim()],
          confidence: 0.9
        });
      }
    }
  }

  /**
   * Extract location data from input text
   */
  private extractLocationData(input: string, result: AnalysisResult): void {
    // Extract atmosphere
    for (const pattern of LOCATION_EXTRACTION_PATTERNS.atmosphere) {
      const match = input.match(pattern);
      if (match) {
        result.extractedFacts.push({
          fieldPath: "atmosphere",
          value: match[1].trim(),
          confidence: 0.8
        });
      }
    }

    // Extract features
    for (const pattern of LOCATION_EXTRACTION_PATTERNS.features) {
      const match = input.match(pattern);
      if (match) {
        const features = match[1].split(/,\s*(?:and\s+)?/).map(f => f.trim());
        result.extractedFacts.push({
          fieldPath: "features",
          value: features,
          confidence: 0.7
        });
      }
    }
  }

  /**
   * Detect contradictions between new data and existing profile
   */
  private detectContradictions(
    result: AnalysisResult,
    existingProfile: Partial<CharacterProfile | LocationProfile | FactionProfile>
  ): void {
    for (const fact of result.extractedFacts) {
      const existingValue = this.getNestedValue(existingProfile, fact.fieldPath);
      if (existingValue !== undefined) {
        // Check if values conflict
        if (this.valuesConflict(existingValue, fact.value)) {
          result.contradictions.push({
            fieldPath: fact.fieldPath,
            existingValue,
            newValue: fact.value,
            severity: "warning"
          });
        }
      }
    }
  }

  /**
   * Check if two values conflict
   */
  private valuesConflict(existing: unknown, newVal: unknown): boolean {
    if (Array.isArray(existing) && Array.isArray(newVal)) {
      // Arrays don't conflict, they can be merged
      return false;
    }
    if (typeof existing === "string" && typeof newVal === "string") {
      // Strings conflict if they're significantly different
      return existing.toLowerCase() !== newVal.toLowerCase();
    }
    return existing !== newVal;
  }

  /**
   * Get nested value from object using dot notation path
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split(".").reduce((current: unknown, key) => {
      if (current && typeof current === "object") {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  /**
   * Calculate confidence score for extraction results
   */
  private calculateConfidence(result: AnalysisResult): number {
    if (result.extractedFacts.length === 0) {
      return 0;
    }
    const avgConfidence = result.extractedFacts.reduce((sum, f) => sum + f.confidence, 0) / result.extractedFacts.length;
    // Reduce confidence if contradictions found
    const contradictionPenalty = result.contradictions.length * 0.1;
    return Math.max(0, Math.min(1, avgConfidence - contradictionPenalty));
  }

  /**
   * Map extracted facts to field updates
   */
  mapToFieldUpdates(result: AnalysisResult): FieldUpdate[] {
    return result.extractedFacts.map(fact => ({
      fieldPath: fact.fieldPath,
      newValue: fact.value,
      confidence: fact.confidence,
      source: "conversation" as const,
      approved: false
    }));
  }

  /**
   * Generate next question based on completion status
   */
  generateNextQuestion(
    entryType: CodexEntryType,
    completionStatus: Record<string, "complete" | "partial" | "incomplete">,
    conversationContext?: string
  ): string {
    const questions = entryType === "character"
      ? CHARACTER_QUESTION_PRIORITY
      : LOCATION_QUESTION_PRIORITY;

    // Find first incomplete field
    for (const q of questions) {
      const status = completionStatus[q.field];
      if (!status || status === "incomplete") {
        return q.question;
      }
    }

    // All fields complete
    return "I think we have a solid foundation for this profile. Would you like to review what we've built, or is there anything else you'd like to add?";
  }

  /**
   * Generate clarification request when ambiguity detected
   */
  generateClarification(
    ambiguity: Ambiguity,
    existingProfile?: Partial<CharacterProfile | LocationProfile | FactionProfile>
  ): ClarificationRequest {
    if (ambiguity.type === "contradiction") {
      return {
        question: `I noticed this might conflict with what we established earlier. ${ambiguity.description} Which interpretation should we use?`,
        options: ambiguity.options,
        context: ambiguity.context
      };
    }

    return {
      question: `I want to make sure I understand correctly. ${ambiguity.description}`,
      options: ambiguity.options,
      context: ambiguity.context
    };
  }

  /**
   * Generate acknowledgment of what was learned
   */
  generateAcknowledgment(updates: FieldUpdate[]): string {
    if (updates.length === 0) {
      return "I'd like to learn more about this.";
    }

    const fields = updates.map(u => this.fieldPathToHuman(u.fieldPath));
    if (fields.length === 1) {
      return `Got it - I've noted the ${fields[0]}.`;
    }

    const last = fields.pop();
    return `Good - I've captured the ${fields.join(", ")} and ${last}.`;
  }

  /**
   * Convert field path to human-readable description
   */
  private fieldPathToHuman(fieldPath: string): string {
    const mappings: Record<string, string> = {
      "personality.traits": "personality traits",
      "personality.flaws": "character flaws",
      "personality.fears": "fears",
      "voice.speechPatterns": "speech patterns",
      "voice.verbalTics": "verbal tics",
      "goals.primary": "main goal",
      "goals.internal": "inner need",
      "background.occupation": "occupation",
      "background.keyEvents": "background events",
      "knowledge.doesntKnow": "knowledge gaps",
      "atmosphere": "atmosphere",
      "features": "key features"
    };
    return mappings[fieldPath] || fieldPath.split(".").pop() || fieldPath;
  }

  /**
   * Build completion status from current profile
   */
  buildCompletionStatus(
    entryType: CodexEntryType,
    profile: Partial<CharacterProfile | LocationProfile | FactionProfile>
  ): Record<string, "complete" | "partial" | "incomplete"> {
    const status: Record<string, "complete" | "partial" | "incomplete"> = {};
    const questions = entryType === "character"
      ? CHARACTER_QUESTION_PRIORITY
      : LOCATION_QUESTION_PRIORITY;

    for (const q of questions) {
      const value = this.getNestedValue(profile as Record<string, unknown>, q.field);
      if (value === undefined || value === null || value === "") {
        status[q.field] = "incomplete";
      } else if (Array.isArray(value) && value.length === 0) {
        status[q.field] = "incomplete";
      } else if (Array.isArray(value) && value.length < 3 && q.field.includes("traits")) {
        status[q.field] = "partial";
      } else {
        status[q.field] = "complete";
      }
    }

    return status;
  }
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface AnalysisResult {
  extractedFacts: ExtractedFact[];
  inferredCharacteristics: Record<string, unknown>;
  detectedRelationships: DetectedRelationship[];
  contradictions: Contradiction[];
  confidenceScore: number;
}

export interface ExtractedFact {
  fieldPath: string;
  value: unknown;
  confidence: number;
}

export interface DetectedRelationship {
  targetName: string;
  type: string;
  description: string;
}

export interface Contradiction {
  fieldPath: string;
  existingValue: unknown;
  newValue: unknown;
  severity: "error" | "warning";
}

export interface Ambiguity {
  type: "contradiction" | "unclear" | "multiple_interpretations";
  description: string;
  options?: string[];
  context: string;
}

// Export singleton instance
export const conversationEngine = new ConversationEngine();
