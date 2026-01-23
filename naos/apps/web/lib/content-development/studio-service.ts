/**
 * Studio Mode Service
 *
 * Write actual scenes with full context injection and consistency checking.
 * See docs/ai_content_development_system.md for full documentation.
 */

import { v4 as uuidv4 } from "uuid";
import type {
  ContentSession,
  StudioModeState,
  StudioContext,
  CharacterProfile,
  LocationProfile,
  Outline,
  SceneOutlineContent,
  Beat,
  ConsistencyWarning,
  ConsistencyReport,
  ConsistencyIssue,
  Suggestion,
  ProfileDiscovery,
  KnowledgeChange,
  ActivePromise,
  CodexEntry,
  ContextAssembleInput,
  ContextAssembleOutput,
  BeatWriteInput,
  BeatWriteOutput,
  ConsistencyCheckInput,
  ConsistencyCheckOutput,
  ExtractFromProseInput,
  ExtractFromProseOutput,
  RelationshipUpdate,
  ProfileUpdate
} from "./types";

// ============================================================================
// STUDIO SERVICE
// ============================================================================

export class StudioService {
  private sessions: Map<string, ContentSession> = new Map();
  private writingSessions: Map<string, WritingSession> = new Map();

  // Mock data stores - in production these would be database queries
  private characters: Map<string, CharacterProfile> = new Map();
  private locations: Map<string, LocationProfile> = new Map();
  private outlines: Map<string, Outline> = new Map();

  /**
   * Assemble full context for a scene
   */
  assembleContext(input: ContextAssembleInput): ContextAssembleOutput {
    const outline = this.outlines.get(input.sceneId);
    if (!outline || outline.outlineLevel !== "scene") {
      throw new Error(`Scene outline ${input.sceneId} not found`);
    }

    const sceneContent = outline.content as SceneOutlineContent;

    // Get POV character
    const povCharacter = outline.povCharacterId
      ? this.characters.get(outline.povCharacterId)
      : undefined;

    // Get present characters
    const presentCharacters = outline.charactersPresent
      .filter(cp => cp.characterId !== outline.povCharacterId)
      .map(cp => {
        const char = this.characters.get(cp.characterId);
        if (!char) return null;
        // Return relevant sections only
        return {
          id: char.id,
          name: char.name,
          role: char.role,
          personality: char.personality,
          voice: char.voice,
          relationships: char.relationships.filter(r => r.characterId === outline.povCharacterId),
          knowledge: {
            secrets: char.knowledge.secrets // Author reference
          }
        } as Partial<CharacterProfile>;
      })
      .filter(Boolean) as Partial<CharacterProfile>[];

    // Get location
    const location = outline.locationId
      ? this.locations.get(outline.locationId)
      : undefined;

    // Get pinned entries (mock implementation)
    const pinnedEntries: CodexEntry[] = outline.pinnedContext.map(pc => ({
      id: pc.codexEntryId,
      type: "lore",
      name: `Entry ${pc.codexEntryId}`,
      summary: pc.reason,
      description: "",
      typeData: {}
    }));

    // Build active promises (mock implementation)
    const activePromises: ActivePromise[] = sceneContent.promiseTracking.advances.map(p => ({
      id: p.promiseId || uuidv4(),
      type: p.type,
      description: p.how,
      status: "pending",
      thisSceneAction: "advancement" as const
    }));

    const fullContext: StudioContext = {
      sceneId: input.sceneId,
      outline: sceneContent,
      povCharacter: povCharacter || this.getDefaultCharacter(),
      presentCharacters,
      location,
      activePromises,
      pinnedEntries
    };

    // Run initial consistency checks
    const warnings = this.runPreWritingChecks(fullContext);

    return {
      fullContext,
      warnings
    };
  }

  /**
   * Start a writing session for a scene
   */
  startWritingSession(sceneId: string, projectId: string): WritingSessionOutput {
    const sessionId = uuidv4();

    // Assemble context
    const { fullContext, warnings } = this.assembleContext({ sceneId });

    const modeState: StudioModeState = {
      sceneId,
      currentBeat: 0,
      totalBeats: fullContext.outline.beats.length,
      contextLoaded: true,
      consistencyWarnings: warnings
    };

    const session: ContentSession = {
      id: sessionId,
      projectId,
      sessionType: "studio",
      targetType: "scene",
      targetId: sceneId,
      status: "active",
      conversation: [],
      pendingUpdates: [],
      completionStatus: this.buildBeatCompletionStatus(fullContext.outline.beats),
      modeState,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const writingSession: WritingSession = {
      sessionId,
      sceneId,
      context: fullContext,
      currentBeat: 0,
      writtenProse: "",
      profileDiscoveries: [],
      consistencyIssues: []
    };

    this.sessions.set(sessionId, session);
    this.writingSessions.set(sessionId, writingSession);

    return {
      sessionId,
      context: fullContext,
      currentBeat: 0,
      totalBeats: fullContext.outline.beats.length,
      warnings
    };
  }

  /**
   * Write a beat with AI assistance
   */
  writeBeat(input: BeatWriteInput): BeatWriteOutput {
    // Find the writing session
    const writingSession = Array.from(this.writingSessions.values())
      .find(ws => ws.sceneId === input.sceneId);

    if (!writingSession) {
      throw new Error(`No active writing session for scene ${input.sceneId}`);
    }

    const beat = writingSession.context.outline.beats[input.beatNumber];
    if (!beat) {
      throw new Error(`Beat ${input.beatNumber} not found in scene outline`);
    }

    // Generate prose for beat (mock implementation - in production would use AI)
    const prose = this.generateBeatProse(beat, writingSession.context, input.userGuidance);

    // Run consistency check
    const consistencyCheck = this.checkConsistency({
      prose,
      context: writingSession.context
    });

    // Extract profile discoveries
    const profileDiscoveries = this.extractProfileDiscoveries(
      prose,
      writingSession.context
    );

    // Update writing session
    writingSession.writtenProse += (writingSession.writtenProse ? "\n\n" : "") + prose;
    writingSession.currentBeat = input.beatNumber + 1;
    writingSession.profileDiscoveries.push(...profileDiscoveries);
    writingSession.consistencyIssues.push(...consistencyCheck.issues);

    return {
      prose,
      consistencyCheck,
      profileDiscoveries
    };
  }

  /**
   * Check prose for consistency issues
   */
  checkConsistency(input: ConsistencyCheckInput): ConsistencyCheckOutput {
    const issues: ConsistencyIssue[] = [];
    const suggestions: Suggestion[] = [];

    const { prose, context } = input;
    const lowerProse = prose.toLowerCase();

    // Check voice consistency
    if (context.povCharacter) {
      const voiceCheck = this.checkVoiceConsistency(prose, context.povCharacter);
      issues.push(...voiceCheck.issues);
      suggestions.push(...voiceCheck.suggestions);
    }

    // Check knowledge violations
    if (context.povCharacter?.knowledge) {
      const knowledgeCheck = this.checkKnowledgeConsistency(prose, context);
      issues.push(...knowledgeCheck.issues);
    }

    // Check arc consistency
    if (context.povCharacter?.arc) {
      const arcCheck = this.checkArcConsistency(prose, context.povCharacter);
      issues.push(...arcCheck.issues);
    }

    // Check present character voices
    for (const char of context.presentCharacters) {
      if (char.voice && char.name) {
        const charVoiceCheck = this.checkCharacterDialogue(prose, char);
        issues.push(...charVoiceCheck.issues);
        suggestions.push(...charVoiceCheck.suggestions);
      }
    }

    return { issues, suggestions };
  }

  /**
   * Extract profile-relevant information from prose
   */
  extractFromProse(input: ExtractFromProseInput): ExtractFromProseOutput {
    const characterDiscoveries: ProfileDiscovery[] = [];
    const relationshipUpdates: RelationshipUpdate[] = [];
    const knowledgeChanges: KnowledgeChange[] = [];
    const suggestedUpdates: ProfileUpdate[] = [];

    const { prose } = input;

    // Look for physical descriptions
    const physicalMatch = prose.match(/(?:scar|mark|feature|tattoo|eye|hair)[^.]+on (?:her|his|their) (\w+)/i);
    if (physicalMatch && input.charactersInvolved.length > 0) {
      characterDiscoveries.push({
        characterId: input.charactersInvolved[0],
        fieldPath: "physical.distinguishingFeatures",
        value: physicalMatch[0],
        type: "discovery",
        context: prose.substring(0, 100)
      });
    }

    // Look for verbal tics
    const verbalTicMatch = prose.match(/"([^"]+)"\s*(?:she|he|they) (?:said|always said|repeated)/i);
    if (verbalTicMatch && input.charactersInvolved.length > 0) {
      characterDiscoveries.push({
        characterId: input.charactersInvolved[0],
        fieldPath: "voice.verbalTics",
        value: verbalTicMatch[1],
        type: "discovery",
        context: prose.substring(0, 100)
      });
    }

    // Look for relationship revelations
    const relationshipMatch = prose.match(/(\w+) was (?:her|his|their) (\w+)/i);
    if (relationshipMatch && input.charactersInvolved.length >= 2) {
      relationshipUpdates.push({
        sourceCharacterId: input.charactersInvolved[0],
        targetCharacterId: input.charactersInvolved[1],
        type: "colleague", // Would need more context to determine
        description: `${relationshipMatch[1]} is their ${relationshipMatch[2]}`,
        dynamic: "stable"
      });
    }

    // Look for knowledge changes
    if (prose.includes("realized") || prose.includes("discovered") || prose.includes("learned")) {
      const learnMatch = prose.match(/(?:realized|discovered|learned) (?:that )?(.+?)(?:\.|,|$)/i);
      if (learnMatch && input.charactersInvolved.length > 0) {
        knowledgeChanges.push({
          character: input.charactersInvolved[0],
          learns: learnMatch[1],
          certainty: "known",
          source: "witnessed"
        });
      }
    }

    // Convert discoveries to suggested updates
    for (const discovery of characterDiscoveries) {
      suggestedUpdates.push({
        id: uuidv4(),
        entryId: discovery.characterId,
        fieldPath: discovery.fieldPath,
        newValue: discovery.value,
        sourceType: "writing",
        sourceReference: input.location || undefined,
        autoApplied: false,
        status: "pending",
        createdAt: new Date()
      });
    }

    return {
      characterDiscoveries,
      relationshipUpdates,
      knowledgeChanges,
      suggestedUpdates
    };
  }

  /**
   * Get writing session
   */
  getWritingSession(sessionId: string): WritingSession | undefined {
    return this.writingSessions.get(sessionId);
  }

  /**
   * Get session
   */
  getSession(sessionId: string): ContentSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * End writing session
   */
  endWritingSession(sessionId: string): WritingSessionSummary | null {
    const writingSession = this.writingSessions.get(sessionId);
    const session = this.sessions.get(sessionId);

    if (!writingSession || !session) {
      return null;
    }

    session.status = "completed";
    session.completedAt = new Date();
    session.updatedAt = new Date();

    const summary: WritingSessionSummary = {
      sessionId,
      sceneId: writingSession.sceneId,
      beatsWritten: writingSession.currentBeat,
      totalBeats: writingSession.context.outline.beats.length,
      wordCount: writingSession.writtenProse.split(/\s+/).length,
      profileDiscoveries: writingSession.profileDiscoveries,
      consistencyIssuesFound: writingSession.consistencyIssues.length,
      prose: writingSession.writtenProse
    };

    return summary;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Run pre-writing consistency checks
   */
  private runPreWritingChecks(context: StudioContext): ConsistencyWarning[] {
    const warnings: ConsistencyWarning[] = [];

    // Check if POV character has voice profile
    if (!context.povCharacter.voice?.profileId) {
      warnings.push({
        type: "voice_drift",
        description: "POV character has no voice profile assigned",
        suggestion: "Define voice profile before writing to ensure consistent voice",
        severity: "warning"
      });
    }

    // Check if scene has beats
    if (context.outline.beats.length === 0) {
      warnings.push({
        type: "promise_neglect",
        description: "Scene outline has no beats defined",
        suggestion: "Add beat-by-beat breakdown before writing",
        severity: "warning"
      });
    }

    // Check if promises are being addressed
    if (context.activePromises.length === 0 &&
        context.outline.promiseTracking.advances.length === 0 &&
        context.outline.promiseTracking.demonstrates.length === 0) {
      warnings.push({
        type: "promise_neglect",
        description: "Scene doesn't advance or demonstrate any promises",
        suggestion: "Consider which story promises this scene should address",
        severity: "info"
      });
    }

    return warnings;
  }

  /**
   * Check voice consistency in prose
   */
  private checkVoiceConsistency(
    prose: string,
    character: CharacterProfile
  ): { issues: ConsistencyIssue[]; suggestions: Suggestion[] } {
    const issues: ConsistencyIssue[] = [];
    const suggestions: Suggestion[] = [];

    // Check vocabulary level
    if (character.voice.vocabularyLevel === "technical") {
      // Look for overly casual language in POV internal thoughts
      const casualPatterns = ["kinda", "gonna", "wanna", "yeah"];
      for (const pattern of casualPatterns) {
        if (prose.toLowerCase().includes(pattern)) {
          issues.push({
            type: "voice_drift",
            description: `Casual language "${pattern}" may not fit character's technical vocabulary`,
            location: pattern,
            severity: "warning"
          });
        }
      }
    }

    // Check for verbal tics in dialogue
    if (character.voice.verbalTics && character.voice.verbalTics.length > 0) {
      const hasVerbalTic = character.voice.verbalTics.some(tic =>
        prose.toLowerCase().includes(tic.toLowerCase())
      );
      if (!hasVerbalTic && prose.includes('"')) {
        issues.push({
          type: "voice_drift",
          description: `Character's verbal tics (${character.voice.verbalTics.join(", ")}) not present in dialogue`,
          severity: "info"
        });
      }
    }

    return { issues, suggestions };
  }

  /**
   * Check knowledge consistency
   */
  private checkKnowledgeConsistency(
    prose: string,
    context: StudioContext
  ): { issues: ConsistencyIssue[] } {
    const issues: ConsistencyIssue[] = [];

    // Check if POV character references things they shouldn't know
    if (context.povCharacter.knowledge?.doesntKnow) {
      for (const unknown of context.povCharacter.knowledge.doesntKnow) {
        // Simplified check - in production would use NLP
        const keywords = unknown.toLowerCase().split(" ").filter(w => w.length > 4);
        for (const keyword of keywords) {
          if (prose.toLowerCase().includes(keyword)) {
            issues.push({
              type: "knowledge_violation",
              description: `POV character may be referencing something they don't know: "${unknown}"`,
              location: keyword,
              severity: "warning"
            });
          }
        }
      }
    }

    return { issues };
  }

  /**
   * Check arc consistency
   */
  private checkArcConsistency(
    prose: string,
    character: CharacterProfile
  ): { issues: ConsistencyIssue[] } {
    const issues: ConsistencyIssue[] = [];

    // Check if character behavior matches arc stage
    if (character.arc.currentStage === "resistance") {
      // Character should be resisting change - look for openness
      const opennessIndicators = ["eagerly", "openly admitted", "readily accepted"];
      for (const indicator of opennessIndicators) {
        if (prose.toLowerCase().includes(indicator)) {
          issues.push({
            type: "arc_inconsistency",
            description: `Character is in "resistance" stage but prose shows openness: "${indicator}"`,
            severity: "warning"
          });
        }
      }
    }

    return { issues };
  }

  /**
   * Check character dialogue consistency
   */
  private checkCharacterDialogue(
    prose: string,
    character: Partial<CharacterProfile>
  ): { issues: ConsistencyIssue[]; suggestions: Suggestion[] } {
    const issues: ConsistencyIssue[] = [];
    const suggestions: Suggestion[] = [];

    if (!character.voice?.speechPatterns) {
      return { issues, suggestions };
    }

    // Check for contractions if character shouldn't use them
    if (character.voice.speechPatterns.toLowerCase().includes("no contractions") ||
        character.voice.speechPatterns.toLowerCase().includes("never uses contractions")) {
      const contractionPattern = /"\s*[^"]*(?:don't|can't|won't|isn't|aren't|wasn't|weren't|I'm|I've|I'll|we're|they're)[^"]*"/i;
      const match = prose.match(contractionPattern);
      if (match) {
        issues.push({
          type: "voice_drift",
          description: `${character.name} shouldn't use contractions but dialogue contains them`,
          location: match[0],
          severity: "warning"
        });
        suggestions.push({
          type: "voice_correction",
          original: match[0],
          suggested: match[0].replace(/don't/gi, "do not")
            .replace(/can't/gi, "cannot")
            .replace(/won't/gi, "will not")
            .replace(/I'm/gi, "I am")
            .replace(/I've/gi, "I have"),
          reason: "Character voice profile specifies no contractions"
        });
      }
    }

    return { issues, suggestions };
  }

  /**
   * Generate beat prose (mock implementation)
   */
  private generateBeatProse(
    beat: Beat,
    context: StudioContext,
    userGuidance?: string
  ): string {
    // In production, this would call the AI model with full context
    // For now, return a placeholder based on beat info

    const povName = context.povCharacter.name;
    const beatType = beat.type;
    const summary = beat.summary;

    let prose = "";

    switch (beatType) {
      case "establishing":
        prose = `${povName} stood in the ${context.location?.name || "room"}, taking in the surroundings. ${summary}`;
        break;
      case "dialogue":
        const otherChar = context.presentCharacters[0]?.name || "the other";
        prose = `"${beat.keyDialogue?.[0]?.line || "..."}" ${otherChar} said.\n\n${povName} considered the words carefully.`;
        break;
      case "introspection":
        prose = `${povName}'s thoughts drifted. ${summary}`;
        break;
      case "revelation":
        prose = `The realization hit ${povName} like a wave. ${summary}`;
        break;
      case "action":
        prose = `${povName} moved with purpose. ${summary}`;
        break;
      default:
        prose = summary;
    }

    if (userGuidance) {
      prose = `[Guidance: ${userGuidance}]\n\n${prose}`;
    }

    return prose;
  }

  /**
   * Extract profile discoveries from prose
   */
  private extractProfileDiscoveries(
    prose: string,
    context: StudioContext
  ): ProfileDiscovery[] {
    const characterIds = [
      context.povCharacter.id,
      ...context.presentCharacters.map(c => c.id).filter(Boolean)
    ] as string[];

    const result = this.extractFromProse({
      prose,
      charactersInvolved: characterIds,
      location: context.location?.id
    });

    return result.characterDiscoveries;
  }

  /**
   * Build beat completion status
   */
  private buildBeatCompletionStatus(beats: Beat[]): Record<string, "complete" | "partial" | "incomplete"> {
    const status: Record<string, "complete" | "partial" | "incomplete"> = {};
    beats.forEach((_, index) => {
      status[`beat_${index}`] = "incomplete";
    });
    return status;
  }

  /**
   * Get default character for when POV isn't found
   */
  private getDefaultCharacter(): CharacterProfile {
    return {
      id: "default",
      projectId: "",
      name: "Unnamed",
      aliases: [],
      role: "protagonist",
      summary: "",
      description: "",
      personality: { traits: [], strengths: [], flaws: [], fears: [], desires: [], values: [], quirks: [] },
      physical: { age: "", gender: "", appearance: "", distinguishingFeatures: [] },
      voice: { profileId: "", speechPatterns: "", vocabularyLevel: "moderate", accent: "", verbalTics: [], emotionalRange: "" },
      background: { backstory: "", origin: "", occupation: "", education: "", keyEvents: [] },
      goals: { primary: "", secondary: [], internal: "", motivation: "" },
      relationships: [],
      arc: { type: "unknown", startingState: "", endingState: "", currentStage: "", keyMoments: [] },
      story: { povEligible: true, firstAppearance: "", chapterAppearances: [], importance: "major" },
      knowledge: { knows: [], doesntKnow: [], secrets: [], liesTold: [] },
      notes: "",
      tags: [],
      canonStatus: "draft",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // ============================================================================
  // DATA MANAGEMENT (for testing - in production, use database)
  // ============================================================================

  /**
   * Register character for testing
   */
  registerCharacter(character: CharacterProfile): void {
    this.characters.set(character.id, character);
  }

  /**
   * Register location for testing
   */
  registerLocation(location: LocationProfile): void {
    this.locations.set(location.id, location);
  }

  /**
   * Register outline for testing
   */
  registerOutline(outline: Outline): void {
    this.outlines.set(outline.id, outline);
  }
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface WritingSession {
  sessionId: string;
  sceneId: string;
  context: StudioContext;
  currentBeat: number;
  writtenProse: string;
  profileDiscoveries: ProfileDiscovery[];
  consistencyIssues: ConsistencyIssue[];
}

export interface WritingSessionOutput {
  sessionId: string;
  context: StudioContext;
  currentBeat: number;
  totalBeats: number;
  warnings: ConsistencyWarning[];
}

export interface WritingSessionSummary {
  sessionId: string;
  sceneId: string;
  beatsWritten: number;
  totalBeats: number;
  wordCount: number;
  profileDiscoveries: ProfileDiscovery[];
  consistencyIssuesFound: number;
  prose: string;
}

// Export singleton instance
export const studioService = new StudioService();
