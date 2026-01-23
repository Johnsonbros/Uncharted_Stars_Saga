/**
 * Development Mode Service
 *
 * Transform rough concepts into structured profiles through guided conversation.
 * See docs/ai_content_development_system.md for full documentation.
 */

import { v4 as uuidv4 } from "uuid";
import type {
  ContentSession,
  DevelopmentModeState,
  ConversationMessage,
  ConceptSketch,
  FieldUpdate,
  CharacterProfile,
  LocationProfile,
  FactionProfile,
  ClarificationRequest,
  CodexEntryType,
  ProfileDevelopInput,
  ProfileDevelopOutput,
  ProfileAnswerInput,
  ProfileAnswerOutput,
  ProfileSaveInput,
  ProfileSaveOutput
} from "./types";
import {
  ConversationEngine,
  CHARACTER_QUESTION_PRIORITY,
  LOCATION_QUESTION_PRIORITY
} from "./conversation-engine";

// ============================================================================
// DEVELOPMENT SERVICE
// ============================================================================

export class DevelopmentService {
  private sessions: Map<string, ContentSession> = new Map();
  private conversationEngine: ConversationEngine;

  constructor() {
    this.conversationEngine = new ConversationEngine();
  }

  /**
   * Start a new development session for building a profile
   */
  startSession(input: ProfileDevelopInput, projectId: string): ProfileDevelopOutput {
    const sessionId = uuidv4();

    // Initialize profile from initial concept if provided
    const currentProfile = this.initializeProfile(input.entryType, input.initialConcept);

    // Build initial completion status
    const completionStatus = this.conversationEngine.buildCompletionStatus(
      input.entryType,
      currentProfile
    );

    // Calculate questions
    const questions = input.entryType === "character"
      ? CHARACTER_QUESTION_PRIORITY
      : LOCATION_QUESTION_PRIORITY;

    const questionsRemaining = Object.values(completionStatus).filter(
      s => s === "incomplete" || s === "partial"
    ).length;

    const nextQuestions = this.getNextQuestions(input.entryType, completionStatus, 3);

    const modeState: DevelopmentModeState = {
      entryType: input.entryType,
      questionsAsked: 0,
      questionsRemaining,
      nextQuestions,
      currentProfileDraft: currentProfile
    };

    const session: ContentSession = {
      id: sessionId,
      projectId,
      sessionType: "development",
      targetType: input.entryType,
      targetId: input.entryId,
      status: "active",
      conversation: [],
      pendingUpdates: [],
      completionStatus,
      modeState,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.sessions.set(sessionId, session);

    // Generate opening message
    const openingMessage = this.generateOpeningMessage(input, currentProfile, completionStatus);

    session.conversation.push({
      role: "assistant",
      content: openingMessage,
      timestamp: new Date().toISOString()
    });

    return {
      sessionId,
      currentProfile,
      completionStatus,
      nextQuestion: nextQuestions[0] || "Tell me more about this profile."
    };
  }

  /**
   * Process user answer and continue building profile
   */
  processAnswer(input: ProfileAnswerInput): ProfileAnswerOutput {
    const session = this.sessions.get(input.sessionId);
    if (!session) {
      throw new Error(`Session ${input.sessionId} not found`);
    }

    if (session.status !== "active") {
      throw new Error(`Session ${input.sessionId} is ${session.status}`);
    }

    const modeState = session.modeState as DevelopmentModeState;
    const entryType = modeState.entryType;

    // Add user message to conversation
    session.conversation.push({
      role: "user",
      content: input.answer,
      timestamp: new Date().toISOString()
    });

    // Analyze input and extract fields
    const analysis = this.conversationEngine.analyzeInput(
      input.answer,
      entryType,
      modeState.currentProfileDraft
    );

    // Map to field updates
    const extractedFields = this.conversationEngine.mapToFieldUpdates(analysis);

    // Check for clarification needs
    let needsClarification: ClarificationRequest | undefined;
    if (analysis.contradictions.length > 0) {
      needsClarification = this.conversationEngine.generateClarification({
        type: "contradiction",
        description: `Earlier you mentioned ${JSON.stringify(analysis.contradictions[0].existingValue)}, but this seems to suggest ${JSON.stringify(analysis.contradictions[0].newValue)}.`,
        options: [
          "Use the new information",
          "Keep the original",
          "Both are true in different contexts"
        ],
        context: analysis.contradictions[0].fieldPath
      });
    }

    // Update profile draft with extracted fields
    for (const field of extractedFields) {
      this.applyFieldUpdate(modeState.currentProfileDraft, field);
    }

    // Add to pending updates
    session.pendingUpdates.push(...extractedFields);

    // Update completion status
    session.completionStatus = this.conversationEngine.buildCompletionStatus(
      entryType,
      modeState.currentProfileDraft
    );

    // Update mode state
    modeState.questionsAsked++;
    modeState.questionsRemaining = Object.values(session.completionStatus).filter(
      s => s === "incomplete" || s === "partial"
    ).length;
    modeState.nextQuestions = this.getNextQuestions(entryType, session.completionStatus, 3);

    // Generate acknowledgment and next question
    const acknowledgment = this.conversationEngine.generateAcknowledgment(extractedFields);
    const nextQuestion = needsClarification
      ? needsClarification.question
      : modeState.nextQuestions[0] || "Would you like to add anything else?";

    const responseContent = acknowledgment + "\n\n" + nextQuestion;

    // Add assistant response
    session.conversation.push({
      role: "assistant",
      content: responseContent,
      timestamp: new Date().toISOString(),
      metadata: {
        extractedConcepts: [],
        fieldsUpdated: extractedFields.map(f => f.fieldPath),
        questionsAsked: [nextQuestion]
      }
    });

    session.updatedAt = new Date();

    return {
      extractedFields,
      needsClarification,
      profilePreview: modeState.currentProfileDraft,
      nextQuestion,
      completionStatus: session.completionStatus
    };
  }

  /**
   * Save profile from session
   */
  saveProfile(input: ProfileSaveInput): ProfileSaveOutput {
    const session = this.sessions.get(input.sessionId);
    if (!session) {
      throw new Error(`Session ${input.sessionId} not found`);
    }

    const modeState = session.modeState as DevelopmentModeState;

    // Apply approved changes
    for (const change of input.approvedChanges) {
      this.applyFieldUpdate(modeState.currentProfileDraft, change);
      change.approved = true;
    }

    // Mark session as completed
    session.status = "completed";
    session.completedAt = new Date();
    session.updatedAt = new Date();

    // Generate entry ID if not updating existing
    const entryId = session.targetId || uuidv4();

    // Build final profile
    const savedProfile = this.buildFinalProfile(
      modeState.entryType,
      modeState.currentProfileDraft,
      entryId,
      session.projectId
    );

    return {
      entryId,
      savedProfile
    };
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): ContentSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get current profile preview
   */
  getProfilePreview(sessionId: string): Partial<CharacterProfile | LocationProfile | FactionProfile> | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }
    return (session.modeState as DevelopmentModeState).currentProfileDraft;
  }

  /**
   * Initialize profile from concept sketch
   */
  private initializeProfile(
    entryType: CodexEntryType,
    concept?: ConceptSketch
  ): Partial<CharacterProfile | LocationProfile | FactionProfile> {
    const baseProfile: Record<string, unknown> = {};

    if (concept) {
      // Apply name if present
      if (concept.name) {
        baseProfile.name = concept.name;
      }

      // Apply inferred traits
      if (concept.inferredTraits) {
        for (const [key, value] of Object.entries(concept.inferredTraits)) {
          // Map common inferred traits to profile fields
          switch (key) {
            case "occupation":
              if (entryType === "character") {
                baseProfile.background = baseProfile.background || {};
                (baseProfile.background as Record<string, unknown>).occupation = value;
              }
              break;
            case "personality":
              if (entryType === "character") {
                baseProfile.personality = baseProfile.personality || {};
                (baseProfile.personality as Record<string, unknown>).traits = Array.isArray(value) ? value : [value];
              }
              break;
            case "fear":
              if (entryType === "character") {
                baseProfile.personality = baseProfile.personality || {};
                (baseProfile.personality as Record<string, unknown>).fears = [value];
              }
              break;
            case "goal":
              if (entryType === "character") {
                baseProfile.goals = baseProfile.goals || {};
                (baseProfile.goals as Record<string, unknown>).primary = value;
              }
              break;
            case "atmosphere":
              if (entryType === "location") {
                baseProfile.atmosphere = value;
              }
              break;
            case "locationType":
              if (entryType === "location") {
                baseProfile.summary = `A ${value}`;
              }
              break;
          }
        }
      }
    }

    return baseProfile as Partial<CharacterProfile | LocationProfile | FactionProfile>;
  }

  /**
   * Apply field update to profile
   */
  private applyFieldUpdate(
    profile: Partial<CharacterProfile | LocationProfile | FactionProfile>,
    update: FieldUpdate
  ): void {
    const parts = update.fieldPath.split(".");
    let current: Record<string, unknown> = profile as Record<string, unknown>;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    const finalPart = parts[parts.length - 1];

    // Handle array merging
    if (Array.isArray(current[finalPart]) && Array.isArray(update.newValue)) {
      const existing = current[finalPart] as unknown[];
      const newItems = (update.newValue as unknown[]).filter(item => !existing.includes(item));
      current[finalPart] = [...existing, ...newItems];
    } else {
      current[finalPart] = update.newValue;
    }
  }

  /**
   * Get next questions based on completion status
   */
  private getNextQuestions(
    entryType: CodexEntryType,
    completionStatus: Record<string, "complete" | "partial" | "incomplete">,
    count: number
  ): string[] {
    const questions = entryType === "character"
      ? CHARACTER_QUESTION_PRIORITY
      : LOCATION_QUESTION_PRIORITY;

    const nextQuestions: string[] = [];

    for (const q of questions) {
      if (nextQuestions.length >= count) break;

      const status = completionStatus[q.field];
      if (!status || status === "incomplete" || status === "partial") {
        nextQuestions.push(q.question);
      }
    }

    return nextQuestions;
  }

  /**
   * Generate opening message based on input and current state
   */
  private generateOpeningMessage(
    input: ProfileDevelopInput,
    currentProfile: Partial<CharacterProfile | LocationProfile | FactionProfile>,
    completionStatus: Record<string, "complete" | "partial" | "incomplete">
  ): string {
    const entryType = input.entryType;
    const hasInitialData = Object.keys(currentProfile).length > 0;
    const name = (currentProfile as { name?: string }).name;

    if (input.entryId) {
      // Developing existing entry
      const completeCount = Object.values(completionStatus).filter(s => s === "complete").length;
      const totalCount = Object.keys(completionStatus).length;

      return `Let's continue developing ${name ? `${name}'s` : "this"} profile. ` +
        `We have ${completeCount}/${totalCount} sections complete. ` +
        `${this.getNextQuestions(entryType, completionStatus, 1)[0] || "What would you like to add?"}`;
    }

    if (hasInitialData && name) {
      // Coming from discovery with some data
      return `Let's develop ${name}'s profile. Based on our discovery session, I already have some notes. ` +
        `Let me ask some targeted questions to fill in the details.\n\n` +
        this.getNextQuestions(entryType, completionStatus, 1)[0];
    }

    // Starting fresh
    const typeLabel = entryType === "character" ? "character" :
                      entryType === "location" ? "location" :
                      entryType === "faction" ? "faction" : entryType;

    return `Let's build a ${typeLabel} profile. I'll ask questions to help structure the details.\n\n` +
      this.getNextQuestions(entryType, completionStatus, 1)[0];
  }

  /**
   * Build final profile with required fields
   */
  private buildFinalProfile(
    entryType: CodexEntryType,
    draft: Partial<CharacterProfile | LocationProfile | FactionProfile>,
    entryId: string,
    projectId: string
  ): CharacterProfile | LocationProfile | FactionProfile {
    const now = new Date();

    if (entryType === "character") {
      const characterDraft = draft as Partial<CharacterProfile>;
      return {
        id: entryId,
        projectId,
        name: characterDraft.name || "Unnamed Character",
        aliases: characterDraft.aliases || [],
        role: characterDraft.role || "supporting",
        summary: characterDraft.summary || "",
        description: characterDraft.description || "",
        personality: {
          traits: characterDraft.personality?.traits || [],
          strengths: characterDraft.personality?.strengths || [],
          flaws: characterDraft.personality?.flaws || [],
          fears: characterDraft.personality?.fears || [],
          desires: characterDraft.personality?.desires || [],
          values: characterDraft.personality?.values || [],
          quirks: characterDraft.personality?.quirks || []
        },
        physical: {
          age: characterDraft.physical?.age || "",
          gender: characterDraft.physical?.gender || "",
          appearance: characterDraft.physical?.appearance || "",
          distinguishingFeatures: characterDraft.physical?.distinguishingFeatures || []
        },
        voice: {
          profileId: characterDraft.voice?.profileId || "",
          speechPatterns: characterDraft.voice?.speechPatterns || "",
          vocabularyLevel: characterDraft.voice?.vocabularyLevel || "moderate",
          accent: characterDraft.voice?.accent || "",
          verbalTics: characterDraft.voice?.verbalTics || [],
          emotionalRange: characterDraft.voice?.emotionalRange || ""
        },
        background: {
          backstory: characterDraft.background?.backstory || "",
          origin: characterDraft.background?.origin || "",
          occupation: characterDraft.background?.occupation || "",
          education: characterDraft.background?.education || "",
          keyEvents: characterDraft.background?.keyEvents || []
        },
        goals: {
          primary: characterDraft.goals?.primary || "",
          secondary: characterDraft.goals?.secondary || [],
          internal: characterDraft.goals?.internal || "",
          motivation: characterDraft.goals?.motivation || ""
        },
        relationships: characterDraft.relationships || [],
        arc: {
          type: characterDraft.arc?.type || "unknown",
          startingState: characterDraft.arc?.startingState || "",
          endingState: characterDraft.arc?.endingState || "",
          currentStage: characterDraft.arc?.currentStage || "status_quo",
          keyMoments: characterDraft.arc?.keyMoments || []
        },
        story: {
          povEligible: characterDraft.story?.povEligible ?? false,
          firstAppearance: characterDraft.story?.firstAppearance || "",
          lastAppearance: characterDraft.story?.lastAppearance,
          chapterAppearances: characterDraft.story?.chapterAppearances || [],
          importance: characterDraft.story?.importance || "supporting"
        },
        knowledge: {
          knows: characterDraft.knowledge?.knows || [],
          doesntKnow: characterDraft.knowledge?.doesntKnow || [],
          secrets: characterDraft.knowledge?.secrets || [],
          liesTold: characterDraft.knowledge?.liesTold || []
        },
        notes: characterDraft.notes || "",
        tags: characterDraft.tags || [],
        canonStatus: "draft",
        createdAt: now,
        updatedAt: now
      };
    }

    if (entryType === "location") {
      const locationDraft = draft as Partial<LocationProfile>;
      return {
        id: entryId,
        projectId,
        name: locationDraft.name || "Unnamed Location",
        aliases: locationDraft.aliases || [],
        summary: locationDraft.summary || "",
        description: locationDraft.description || "",
        parentLocationId: locationDraft.parentLocationId,
        atmosphere: locationDraft.atmosphere || "",
        features: locationDraft.features || [],
        typicalInhabitants: locationDraft.typicalInhabitants || [],
        coordinates: locationDraft.coordinates,
        audioContext: locationDraft.audioContext || {},
        tags: locationDraft.tags || [],
        canonStatus: "draft",
        createdAt: now,
        updatedAt: now
      };
    }

    // Faction
    const factionDraft = draft as Partial<FactionProfile>;
    return {
      id: entryId,
      projectId,
      name: factionDraft.name || "Unnamed Faction",
      aliases: factionDraft.aliases || [],
      summary: factionDraft.summary || "",
      description: factionDraft.description || "",
      ideology: factionDraft.ideology || "",
      structure: factionDraft.structure || "",
      headquartersId: factionDraft.headquartersId,
      leaderId: factionDraft.leaderId,
      memberIds: factionDraft.memberIds || [],
      tags: factionDraft.tags || [],
      canonStatus: "draft",
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * End a development session
   */
  endSession(sessionId: string, outcome: "completed" | "abandoned" = "abandoned"): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }
    session.status = outcome;
    session.completedAt = new Date();
    session.updatedAt = new Date();
  }

  /**
   * Get session summary for review
   */
  getSessionSummary(sessionId: string): DevelopmentSummary | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    const modeState = session.modeState as DevelopmentModeState;

    return {
      sessionId,
      entryType: modeState.entryType,
      profileName: (modeState.currentProfileDraft as { name?: string }).name || "Unnamed",
      questionsAsked: modeState.questionsAsked,
      fieldsComplete: Object.values(session.completionStatus).filter(s => s === "complete").length,
      fieldsTotal: Object.keys(session.completionStatus).length,
      pendingUpdates: session.pendingUpdates.length,
      readyToSave: modeState.questionsRemaining <= 3 // Have enough to create a useful profile
    };
  }
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface DevelopmentSummary {
  sessionId: string;
  entryType: CodexEntryType;
  profileName: string;
  questionsAsked: number;
  fieldsComplete: number;
  fieldsTotal: number;
  pendingUpdates: number;
  readyToSave: boolean;
}

// Export singleton instance
export const developmentService = new DevelopmentService();
