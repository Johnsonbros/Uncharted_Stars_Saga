/**
 * Discovery Mode Service
 *
 * Explore ideas, brainstorm, and capture rough concepts through open-ended conversation.
 * See docs/ai_content_development_system.md for full documentation.
 */

import { v4 as uuidv4 } from "uuid";
import type {
  ContentSession,
  DiscoveryModeState,
  ConversationMessage,
  ConceptSketch,
  DiscoveryStartInput,
  DiscoveryStartOutput,
  DiscoveryRespondInput,
  DiscoveryRespondOutput
} from "./types";

// ============================================================================
// DISCOVERY SERVICE
// ============================================================================

export class DiscoveryService {
  private sessions: Map<string, ContentSession> = new Map();

  /**
   * Start a new discovery session
   */
  startSession(input: DiscoveryStartInput, projectId: string): DiscoveryStartOutput {
    const sessionId = uuidv4();

    const modeState: DiscoveryModeState = {
      topic: input.topic,
      mode: input.mode,
      capturedConcepts: [],
      threadsToExplore: [],
      questionsOpen: []
    };

    const session: ContentSession = {
      id: sessionId,
      projectId,
      sessionType: "discovery",
      status: "active",
      conversation: [],
      pendingUpdates: [],
      completionStatus: {},
      modeState,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.sessions.set(sessionId, session);

    const openingPrompt = this.generateOpeningPrompt(input);

    // Add system message to conversation
    session.conversation.push({
      role: "assistant",
      content: openingPrompt,
      timestamp: new Date().toISOString()
    });

    return {
      sessionId,
      openingPrompt
    };
  }

  /**
   * Process user input and continue the discovery conversation
   */
  respond(input: DiscoveryRespondInput): DiscoveryRespondOutput {
    const session = this.sessions.get(input.sessionId);
    if (!session) {
      throw new Error(`Session ${input.sessionId} not found`);
    }

    if (session.status !== "active") {
      throw new Error(`Session ${input.sessionId} is ${session.status}`);
    }

    const modeState = session.modeState as DiscoveryModeState;

    // Add user message to conversation
    session.conversation.push({
      role: "user",
      content: input.userInput,
      timestamp: new Date().toISOString()
    });

    // Extract concepts from user input
    const extractedConcepts = this.extractConcepts(input.userInput, modeState.mode);

    // Update mode state with extracted concepts
    modeState.capturedConcepts.push(...extractedConcepts);

    // Identify threads to explore
    const newThreads = this.identifyThreads(input.userInput, extractedConcepts);
    modeState.threadsToExplore.push(...newThreads);

    // Generate follow-up questions
    const followUpPrompt = this.generateFollowUp(input.userInput, extractedConcepts, modeState);

    // Add assistant response to conversation
    session.conversation.push({
      role: "assistant",
      content: followUpPrompt,
      timestamp: new Date().toISOString(),
      metadata: {
        extractedConcepts
      }
    });

    session.updatedAt = new Date();

    return {
      extractedConcepts,
      followUpPrompt,
      threadsOpened: newThreads
    };
  }

  /**
   * Get current session state
   */
  getSession(sessionId: string): ContentSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all captured concepts from a session
   */
  getCapturedConcepts(sessionId: string): ConceptSketch[] {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return [];
    }
    return (session.modeState as DiscoveryModeState).capturedConcepts;
  }

  /**
   * End a discovery session
   */
  endSession(sessionId: string, outcome: "completed" | "abandoned" = "completed"): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }
    session.status = outcome;
    session.completedAt = new Date();
    session.updatedAt = new Date();
  }

  /**
   * Generate opening prompt based on discovery mode
   */
  private generateOpeningPrompt(input: DiscoveryStartInput): string {
    switch (input.mode) {
      case "character":
        return `Let's explore this character: "${input.topic}". Tell me about them - what's the first thing that comes to mind? Don't worry about structure yet, just share what you're imagining.`;

      case "setting":
        return `Let's discover this place: "${input.topic}". What do you see when you imagine it? What does it feel like to be there?`;

      case "plot":
        return `Let's explore this story idea: "${input.topic}". What's the core of it? What happens, and why does it matter?`;

      case "open":
      default:
        return `Tell me about "${input.topic}". What are you imagining? What excites you about this idea?`;
    }
  }

  /**
   * Extract concepts from user input
   */
  private extractConcepts(input: string, mode: string): ConceptSketch[] {
    const concepts: ConceptSketch[] = [];
    const lowerInput = input.toLowerCase();

    // Character extraction patterns
    if (mode === "character" || mode === "open") {
      // Look for personality indicators
      const personalityMatch = input.match(/(?:she|he|they)(?:'s|'re| is| are) (\w+(?:,?\s+(?:and\s+)?\w+)*)/i);
      if (personalityMatch) {
        concepts.push({
          type: "character_sketch",
          notes: `Personality: ${personalityMatch[1]}`,
          inferredTraits: { personality: personalityMatch[1].split(/,\s*/) }
        });
      }

      // Look for occupation/role
      const roleMatch = input.match(/(?:a |an )(\w+(?:ist|er|or|ian|ant|ent)?)/i);
      if (roleMatch && !["a", "an", "the"].includes(roleMatch[1].toLowerCase())) {
        concepts.push({
          type: "character_sketch",
          notes: `Role/Occupation: ${roleMatch[1]}`,
          inferredTraits: { occupation: roleMatch[1] }
        });
      }

      // Look for fear/motivation
      const fearMatch = input.match(/(?:fears?|afraid of|scared of|terrified of) (.+?)(?:\.|,|$)/i);
      if (fearMatch) {
        concepts.push({
          type: "character_sketch",
          notes: `Fear: ${fearMatch[1]}`,
          inferredTraits: { fear: fearMatch[1] }
        });
      }

      // Look for goals/wants
      const goalMatch = input.match(/(?:wants? to|trying to|needs? to) (.+?)(?:\.|,|$)/i);
      if (goalMatch) {
        concepts.push({
          type: "character_sketch",
          notes: `Goal: ${goalMatch[1]}`,
          inferredTraits: { goal: goalMatch[1] }
        });
      }
    }

    // Setting extraction patterns
    if (mode === "setting" || mode === "open") {
      // Look for atmosphere/mood descriptions
      const atmosphereMatch = input.match(/(?:feels?|atmosphere|mood)[:\s]+(.+?)(?:\.|,|$)/i);
      if (atmosphereMatch) {
        concepts.push({
          type: "setting_concept",
          notes: `Atmosphere: ${atmosphereMatch[1]}`,
          inferredTraits: { atmosphere: atmosphereMatch[1] }
        });
      }

      // Look for location type
      const locationMatch = input.match(/(?:a |an |the )(\w+(?:\s+\w+)?)\s+(?:where|that|which)/i);
      if (locationMatch) {
        concepts.push({
          type: "setting_concept",
          notes: `Location type: ${locationMatch[1]}`,
          inferredTraits: { locationType: locationMatch[1] }
        });
      }
    }

    // Plot extraction patterns
    if (mode === "plot" || mode === "open") {
      // Look for conflict
      const conflictMatch = input.match(/(?:conflict|struggle|fight|battle)[:\s]+(.+?)(?:\.|,|$)/i);
      if (conflictMatch) {
        concepts.push({
          type: "plot_idea",
          notes: `Conflict: ${conflictMatch[1]}`,
          inferredTraits: { conflict: conflictMatch[1] }
        });
      }

      // Look for stakes
      const stakesMatch = input.match(/(?:at stake|risk|lose|gain)[:\s]+(.+?)(?:\.|,|$)/i);
      if (stakesMatch) {
        concepts.push({
          type: "plot_idea",
          notes: `Stakes: ${stakesMatch[1]}`,
          inferredTraits: { stakes: stakesMatch[1] }
        });
      }
    }

    // Relationship patterns (all modes)
    const relationshipMatch = input.match(/(\w+)(?:'s| is)?\s+(?:her|his|their)\s+(\w+)/i);
    if (relationshipMatch) {
      concepts.push({
        type: "relationship",
        name: relationshipMatch[1],
        notes: `Relationship: ${relationshipMatch[2]}`,
        inferredTraits: {
          relationType: relationshipMatch[2],
          relatedTo: relationshipMatch[1]
        }
      });
    }

    // If no structured concepts extracted, create a general note
    if (concepts.length === 0 && input.trim().length > 20) {
      concepts.push({
        type: mode === "character" ? "character_sketch" :
              mode === "setting" ? "setting_concept" :
              mode === "plot" ? "plot_idea" : "character_sketch",
        notes: input.trim(),
        openQuestions: ["What's the core of this idea?", "What makes this interesting?"]
      });
    }

    return concepts;
  }

  /**
   * Identify threads to explore based on input and concepts
   */
  private identifyThreads(input: string, concepts: ConceptSketch[]): string[] {
    const threads: string[] = [];
    const lowerInput = input.toLowerCase();

    // Look for "but" indicating tension
    if (lowerInput.includes(" but ")) {
      threads.push("Tension or contradiction to explore");
    }

    // Look for questions in the input
    if (input.includes("?")) {
      threads.push("Question to answer");
    }

    // Look for relationships mentioned
    if (concepts.some(c => c.type === "relationship")) {
      threads.push("Relationship dynamics to develop");
    }

    // Look for fear/conflict mentioned
    if (lowerInput.includes("fear") || lowerInput.includes("afraid") || lowerInput.includes("scared")) {
      threads.push("Fear source to explore");
    }

    // Look for discovery/secret mentioned
    if (lowerInput.includes("discover") || lowerInput.includes("secret") || lowerInput.includes("hidden")) {
      threads.push("Secret or discovery to develop");
    }

    // Look for pressure/conflict from others
    if (lowerInput.includes("everyone") || lowerInput.includes("pressure") || lowerInput.includes("wants")) {
      threads.push("External pressure sources");
    }

    return threads;
  }

  /**
   * Generate follow-up prompt based on conversation state
   */
  private generateFollowUp(
    input: string,
    extractedConcepts: ConceptSketch[],
    modeState: DiscoveryModeState
  ): string {
    const lowerInput = input.toLowerCase();

    // Acknowledge what was captured
    let acknowledgment = "";
    if (extractedConcepts.length > 0) {
      const notes = extractedConcepts.map(c => c.notes).join("; ");
      acknowledgment = `Interesting - ${notes.toLowerCase()}. `;
    }

    // Generate contextual follow-up question based on mode and content
    if (modeState.mode === "character") {
      return acknowledgment + this.generateCharacterFollowUp(input, extractedConcepts);
    } else if (modeState.mode === "setting") {
      return acknowledgment + this.generateSettingFollowUp(input, extractedConcepts);
    } else if (modeState.mode === "plot") {
      return acknowledgment + this.generatePlotFollowUp(input, extractedConcepts);
    }

    // Open mode - follow the thread
    return acknowledgment + this.generateOpenFollowUp(input, extractedConcepts);
  }

  /**
   * Generate character-focused follow-up
   */
  private generateCharacterFollowUp(input: string, concepts: ConceptSketch[]): string {
    const lowerInput = input.toLowerCase();

    // If they mentioned fear, explore it
    if (lowerInput.includes("fear") || lowerInput.includes("afraid") || lowerInput.includes("scared")) {
      return "That fear is a powerful starting point. Is this fear about what they found, or what it means for them? Or both?";
    }

    // If they mentioned a discovery
    if (lowerInput.includes("discover") || lowerInput.includes("found")) {
      return "What do they want to do with this discovery - understand it, protect it, or escape from it?";
    }

    // If they mentioned occupation
    if (concepts.some(c => c.inferredTraits?.occupation)) {
      return "What makes them good at their job? Beyond intelligence, what's their unique strength?";
    }

    // If they mentioned personality
    if (concepts.some(c => c.inferredTraits?.personality)) {
      return "Were they always this way, or did something change them? What event shaped who they are?";
    }

    // If they mentioned goals
    if (concepts.some(c => c.inferredTraits?.goal)) {
      return "What's stopping them from achieving this? What's their biggest obstacle - external or internal?";
    }

    // Default character questions
    const defaultQuestions = [
      "What drives them? What do they want more than anything?",
      "Who's the most important person in their life, and why?",
      "What's the thing they'd never admit to anyone?",
      "What do they believe about themselves that might not be true?"
    ];

    return defaultQuestions[Math.floor(Math.random() * defaultQuestions.length)];
  }

  /**
   * Generate setting-focused follow-up
   */
  private generateSettingFollowUp(input: string, concepts: ConceptSketch[]): string {
    const lowerInput = input.toLowerCase();

    // If they mentioned atmosphere
    if (concepts.some(c => c.inferredTraits?.atmosphere)) {
      return "What sounds would you hear in this place? What would a listener experience?";
    }

    // If they mentioned a specific feature
    if (lowerInput.includes("has") || lowerInput.includes("contains")) {
      return "What's the history of this place? Why does it exist, and who built it?";
    }

    // Default setting questions
    const defaultQuestions = [
      "What happens in this place? What's its purpose in the story?",
      "Who typically comes here, and why?",
      "What's unique about this place that listeners will remember?",
      "What's hidden here that most people don't know about?"
    ];

    return defaultQuestions[Math.floor(Math.random() * defaultQuestions.length)];
  }

  /**
   * Generate plot-focused follow-up
   */
  private generatePlotFollowUp(input: string, concepts: ConceptSketch[]): string {
    const lowerInput = input.toLowerCase();

    // If they mentioned conflict
    if (concepts.some(c => c.inferredTraits?.conflict)) {
      return "What's at stake if they fail? What happens if the conflict isn't resolved?";
    }

    // If they mentioned stakes
    if (concepts.some(c => c.inferredTraits?.stakes)) {
      return "Who else is involved in this? Are there forces working against the resolution?";
    }

    // Default plot questions
    const defaultQuestions = [
      "What's the central question the story is trying to answer?",
      "How does this connect to the characters' personal journeys?",
      "What's the worst thing that could happen? The best thing?",
      "Where does this story start, and where does it need to end?"
    ];

    return defaultQuestions[Math.floor(Math.random() * defaultQuestions.length)];
  }

  /**
   * Generate open-mode follow-up
   */
  private generateOpenFollowUp(input: string, concepts: ConceptSketch[]): string {
    const lowerInput = input.toLowerCase();

    // Follow the energy of what they mentioned
    if (lowerInput.includes("but")) {
      return "You mentioned a 'but' - tell me more about that tension. What's pulling in different directions?";
    }

    if (lowerInput.includes("?")) {
      return "That's a great question to explore. What's your instinct? What answer feels right to you?";
    }

    // Default open questions
    const defaultQuestions = [
      "What excites you most about this? What makes you want to tell this story?",
      "If you had to describe this in one sentence to a friend, what would you say?",
      "What's the feeling you want listeners to have when they experience this?",
      "What's the most important thing about this that we haven't talked about yet?"
    ];

    return defaultQuestions[Math.floor(Math.random() * defaultQuestions.length)];
  }

  /**
   * Summarize discovery session artifacts
   */
  summarizeSession(sessionId: string): DiscoverySummary {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const modeState = session.modeState as DiscoveryModeState;

    return {
      sessionId,
      topic: modeState.topic,
      mode: modeState.mode,
      capturedConcepts: modeState.capturedConcepts,
      threadsToExplore: modeState.threadsToExplore,
      questionsOpen: modeState.questionsOpen,
      conversationLength: session.conversation.length,
      readyForDevelopment: modeState.capturedConcepts.length >= 3
    };
  }

  /**
   * Convert discovery artifacts to development input
   */
  prepareForDevelopment(sessionId: string): DevelopmentInput | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    const modeState = session.modeState as DiscoveryModeState;

    // Combine all captured concepts
    const combinedNotes = modeState.capturedConcepts.map(c => c.notes).join("\n");
    const combinedTraits = modeState.capturedConcepts.reduce((acc, c) => {
      return { ...acc, ...c.inferredTraits };
    }, {});

    // Determine entry type from mode
    const entryType = modeState.mode === "character" ? "character" :
                      modeState.mode === "setting" ? "location" :
                      "character"; // Default for open/plot

    return {
      entryType,
      initialConcept: {
        type: modeState.mode === "character" ? "character_sketch" :
              modeState.mode === "setting" ? "setting_concept" : "plot_idea",
        name: modeState.capturedConcepts.find(c => c.name)?.name,
        notes: combinedNotes,
        inferredTraits: combinedTraits,
        openQuestions: modeState.questionsOpen
      },
      threadsToExplore: modeState.threadsToExplore
    };
  }
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface DiscoverySummary {
  sessionId: string;
  topic: string;
  mode: string;
  capturedConcepts: ConceptSketch[];
  threadsToExplore: string[];
  questionsOpen: string[];
  conversationLength: number;
  readyForDevelopment: boolean;
}

export interface DevelopmentInput {
  entryType: "character" | "location" | "object" | "faction" | "lore" | "timeline";
  initialConcept: ConceptSketch;
  threadsToExplore: string[];
}

// Export singleton instance
export const discoveryService = new DiscoveryService();
