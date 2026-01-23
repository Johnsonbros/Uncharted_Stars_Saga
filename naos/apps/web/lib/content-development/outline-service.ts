/**
 * Outlining Mode Service
 *
 * Create structured story outlines from high-level to scene-by-scene detail.
 * See docs/ai_content_development_system.md for full documentation.
 */

import { v4 as uuidv4 } from "uuid";
import type {
  ContentSession,
  OutlineModeState,
  ConversationMessage,
  Outline,
  OutlineLevel,
  OutlineStatus,
  StoryOutlineContent,
  BookOutlineContent,
  ActOutlineContent,
  ChapterOutlineContent,
  SceneOutlineContent,
  Beat,
  BeatType,
  OutlineCreateInput,
  OutlineCreateOutput,
  OutlineDevelopInput,
  OutlineDevelopOutput,
  OutlineUpdate,
  CharacterPresence,
  PinnedContextEntry
} from "./types";

// ============================================================================
// OUTLINE SERVICE
// ============================================================================

export class OutlineService {
  private sessions: Map<string, ContentSession> = new Map();
  private outlines: Map<string, Outline> = new Map();

  /**
   * Create a new outline at specified level
   */
  createOutline(input: OutlineCreateInput, projectId: string): OutlineCreateOutput {
    const sessionId = uuidv4();
    const outlineId = uuidv4();

    // Create initial outline structure
    const outline = this.initializeOutline(outlineId, projectId, input);

    // Generate guiding questions for this level
    const guidingQuestions = this.getGuidingQuestions(input.level, outline);

    const modeState: OutlineModeState = {
      currentLevel: input.level,
      parentOutlineId: input.parentId,
      guidingQuestions,
      drillDownOptions: []
    };

    const session: ContentSession = {
      id: sessionId,
      projectId,
      sessionType: "outline",
      targetType: input.level,
      targetId: outlineId,
      status: "active",
      conversation: [],
      pendingUpdates: [],
      completionStatus: this.buildOutlineCompletionStatus(outline),
      modeState,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.sessions.set(sessionId, session);
    this.outlines.set(outlineId, outline);

    // Generate opening message
    const openingMessage = this.generateOpeningMessage(input.level, outline, guidingQuestions);

    session.conversation.push({
      role: "assistant",
      content: openingMessage,
      timestamp: new Date().toISOString()
    });

    return {
      sessionId,
      outlineDraft: outline,
      guidingQuestions
    };
  }

  /**
   * Develop outline through conversation
   */
  developOutline(input: OutlineDevelopInput): OutlineDevelopOutput {
    const session = this.sessions.get(input.sessionId);
    if (!session) {
      throw new Error(`Session ${input.sessionId} not found`);
    }

    if (session.status !== "active") {
      throw new Error(`Session ${input.sessionId} is ${session.status}`);
    }

    const modeState = session.modeState as OutlineModeState;
    const outline = this.outlines.get(session.targetId!);
    if (!outline) {
      throw new Error(`Outline ${session.targetId} not found`);
    }

    // Add user message
    session.conversation.push({
      role: "user",
      content: input.userInput,
      timestamp: new Date().toISOString()
    });

    // Extract updates from input
    const outlineUpdates = this.extractOutlineUpdates(input.userInput, outline);

    // Apply updates to outline
    for (const update of outlineUpdates) {
      this.applyOutlineUpdate(outline, update);
    }

    // Update completion status
    session.completionStatus = this.buildOutlineCompletionStatus(outline);

    // Generate next questions
    const nextQuestions = this.getNextQuestions(modeState.currentLevel, outline, session.completionStatus);

    // Check for drill-down opportunities
    const drillDownOptions = this.getDrillDownOptions(outline, session.completionStatus);
    modeState.drillDownOptions = drillDownOptions;

    // Generate response
    const response = this.generateResponse(outlineUpdates, nextQuestions, drillDownOptions);

    session.conversation.push({
      role: "assistant",
      content: response,
      timestamp: new Date().toISOString()
    });

    session.updatedAt = new Date();
    outline.updatedAt = new Date();

    return {
      outlineUpdates,
      nextQuestions,
      drillDownOptions: drillDownOptions.length > 0 ? drillDownOptions : undefined
    };
  }

  /**
   * Get outline by ID
   */
  getOutline(outlineId: string): Outline | undefined {
    return this.outlines.get(outlineId);
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): ContentSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get outlines by project
   */
  getOutlinesByProject(projectId: string): Outline[] {
    return Array.from(this.outlines.values()).filter(o => o.projectId === projectId);
  }

  /**
   * Get child outlines
   */
  getChildOutlines(parentId: string): Outline[] {
    return Array.from(this.outlines.values())
      .filter(o => o.parentId === parentId)
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder);
  }

  /**
   * Create child outline (drill-down)
   */
  drillDown(
    parentId: string,
    childLevel: OutlineLevel,
    title: string,
    projectId: string
  ): OutlineCreateOutput {
    const parent = this.outlines.get(parentId);
    if (!parent) {
      throw new Error(`Parent outline ${parentId} not found`);
    }

    // Validate hierarchy
    if (!this.isValidDrillDown(parent.outlineLevel, childLevel)) {
      throw new Error(`Cannot drill down from ${parent.outlineLevel} to ${childLevel}`);
    }

    // Get sequence order
    const siblings = this.getChildOutlines(parentId);
    const sequenceOrder = siblings.length;

    return this.createOutline(
      {
        level: childLevel,
        parentId,
        initialConcept: title
      },
      projectId
    );
  }

  /**
   * Update outline directly
   */
  updateOutline(outlineId: string, updates: Partial<Outline>): Outline | null {
    const outline = this.outlines.get(outlineId);
    if (!outline) {
      return null;
    }

    Object.assign(outline, updates, { updatedAt: new Date() });
    return outline;
  }

  /**
   * Delete outline
   */
  deleteOutline(outlineId: string): boolean {
    const outline = this.outlines.get(outlineId);
    if (!outline) {
      return false;
    }

    // Delete children first
    const children = this.getChildOutlines(outlineId);
    for (const child of children) {
      this.deleteOutline(child.id);
    }

    return this.outlines.delete(outlineId);
  }

  /**
   * Initialize outline based on level
   */
  private initializeOutline(id: string, projectId: string, input: OutlineCreateInput): Outline {
    const now = new Date();

    const baseOutline: Outline = {
      id,
      projectId,
      outlineLevel: input.level,
      parentId: input.parentId,
      sequenceOrder: 0,
      title: input.initialConcept || `New ${input.level}`,
      content: this.getEmptyContent(input.level),
      charactersPresent: [],
      pinnedContext: [],
      status: "concept",
      canonStatus: "draft",
      createdAt: now,
      updatedAt: now
    };

    return baseOutline;
  }

  /**
   * Get empty content structure for level
   */
  private getEmptyContent(level: OutlineLevel): StoryOutlineContent | BookOutlineContent | ActOutlineContent | ChapterOutlineContent | SceneOutlineContent {
    switch (level) {
      case "story":
        return {
          logline: "",
          coreThemes: [],
          centralMystery: "",
          primaryCharacters: [],
          settingSummary: "",
          estimatedLength: "",
          targetMedium: "audiobook"
        };

      case "book":
        return {
          premise: "",
          stakes: "",
          acts: []
        };

      case "act":
        return {
          purpose: "",
          chapters: "",
          keyEvents: [],
          characterArcs: {},
          promisesEstablished: []
        };

      case "chapter":
        return {
          purpose: "",
          chapterGoals: {
            plot: "",
            character: ""
          },
          povCharacter: "",
          scenes: [],
          chapterPromises: {
            advances: [],
            demonstrates: [],
            establishes: []
          }
        };

      case "scene":
        return {
          synopsis: "",
          sceneGoals: {
            plot: [],
            character: [],
            world: [],
            reader: []
          },
          promiseTracking: {
            advances: [],
            demonstrates: [],
            establishes: [],
            fulfills: []
          },
          beats: [],
          eventsEstablished: [],
          knowledgeChanges: [],
          audioNotes: {
            pacing: "",
            emotionalArc: { start: "", middle: "", end: "" },
            ambient: { base: "", layers: [] },
            voiceNotes: {},
            keyAudioMoments: [],
            beatMarkers: []
          }
        };
    }
  }

  /**
   * Get guiding questions for outline level
   */
  private getGuidingQuestions(level: OutlineLevel, outline: Outline): string[] {
    switch (level) {
      case "story":
        return [
          "What's the one-line pitch for this story? (the logline)",
          "What are the 2-3 core themes you want to explore?",
          "What's the central mystery or question that drives the story?",
          "Who are the primary characters, and what are their arcs?",
          "What's the setting, and why is it important?"
        ];

      case "book":
        return [
          "What's the premise of this book?",
          "What are the stakes - what happens if the protagonist fails?",
          "How many acts will this book have, and what's the purpose of each?",
          "What's the core emotional journey of the main character?"
        ];

      case "act":
        return [
          "What's the core question this act should raise for the reader?",
          "What key events need to happen in this act?",
          "How do the main characters change during this act?",
          "What promises are established or advanced?",
          "Where does this act end? What's the turning point?"
        ];

      case "chapter":
        return [
          "What's the purpose of this chapter?",
          "What plot events occur?",
          "What character development happens?",
          "Who is the POV character?",
          "What scenes make up this chapter?"
        ];

      case "scene":
        return [
          "What happens in this scene? (1-3 sentences)",
          "What must this scene accomplish for plot?",
          "What must this scene accomplish for character?",
          "What are the beats - the key moments in sequence?",
          "What's the emotional arc of this scene?",
          "What audio notes are important for production?"
        ];
    }
  }

  /**
   * Build completion status for outline
   */
  private buildOutlineCompletionStatus(outline: Outline): Record<string, "complete" | "partial" | "incomplete"> {
    const status: Record<string, "complete" | "partial" | "incomplete"> = {};
    const content = outline.content;

    switch (outline.outlineLevel) {
      case "story": {
        const story = content as StoryOutlineContent;
        status["logline"] = story.logline ? "complete" : "incomplete";
        status["coreThemes"] = story.coreThemes.length >= 2 ? "complete" : story.coreThemes.length > 0 ? "partial" : "incomplete";
        status["centralMystery"] = story.centralMystery ? "complete" : "incomplete";
        status["primaryCharacters"] = story.primaryCharacters.length >= 2 ? "complete" : story.primaryCharacters.length > 0 ? "partial" : "incomplete";
        status["settingSummary"] = story.settingSummary ? "complete" : "incomplete";
        break;
      }

      case "book": {
        const book = content as BookOutlineContent;
        status["premise"] = book.premise ? "complete" : "incomplete";
        status["stakes"] = book.stakes ? "complete" : "incomplete";
        status["acts"] = book.acts.length >= 3 ? "complete" : book.acts.length > 0 ? "partial" : "incomplete";
        break;
      }

      case "act": {
        const act = content as ActOutlineContent;
        status["purpose"] = act.purpose ? "complete" : "incomplete";
        status["keyEvents"] = act.keyEvents.length >= 3 ? "complete" : act.keyEvents.length > 0 ? "partial" : "incomplete";
        status["characterArcs"] = Object.keys(act.characterArcs).length > 0 ? "complete" : "incomplete";
        break;
      }

      case "chapter": {
        const chapter = content as ChapterOutlineContent;
        status["purpose"] = chapter.purpose ? "complete" : "incomplete";
        status["chapterGoals"] = chapter.chapterGoals.plot && chapter.chapterGoals.character ? "complete" : "partial";
        status["povCharacter"] = chapter.povCharacter ? "complete" : "incomplete";
        status["scenes"] = chapter.scenes.length >= 2 ? "complete" : chapter.scenes.length > 0 ? "partial" : "incomplete";
        break;
      }

      case "scene": {
        const scene = content as SceneOutlineContent;
        status["synopsis"] = scene.synopsis ? "complete" : "incomplete";
        status["sceneGoals"] = scene.sceneGoals.plot.length > 0 && scene.sceneGoals.character.length > 0 ? "complete" : "partial";
        status["beats"] = scene.beats.length >= 3 ? "complete" : scene.beats.length > 0 ? "partial" : "incomplete";
        status["audioNotes"] = scene.audioNotes.pacing ? "complete" : "incomplete";
        break;
      }
    }

    return status;
  }

  /**
   * Extract outline updates from user input
   */
  private extractOutlineUpdates(input: string, outline: Outline): OutlineUpdate[] {
    const updates: OutlineUpdate[] = [];
    const lowerInput = input.toLowerCase();

    switch (outline.outlineLevel) {
      case "story":
        // Extract logline
        if (lowerInput.includes("logline") || input.includes(":")) {
          const colonIndex = input.indexOf(":");
          if (colonIndex > -1) {
            updates.push({
              fieldPath: "content.logline",
              value: input.substring(colonIndex + 1).trim()
            });
          }
        }

        // Extract themes
        const themeMatch = input.match(/themes?[:\s]+(.+?)(?:\.|$)/i);
        if (themeMatch) {
          const themes = themeMatch[1].split(/,\s*(?:and\s+)?/).map(t => t.trim());
          updates.push({
            fieldPath: "content.coreThemes",
            value: themes
          });
        }

        // Extract central mystery/question
        const mysteryMatch = input.match(/(?:mystery|question|core question)[:\s]+(.+?)(?:\.|$)/i);
        if (mysteryMatch) {
          updates.push({
            fieldPath: "content.centralMystery",
            value: mysteryMatch[1].trim()
          });
        }
        break;

      case "book":
        // Extract premise
        const premiseMatch = input.match(/(?:premise|about)[:\s]+(.+?)(?:\.|$)/i);
        if (premiseMatch) {
          updates.push({
            fieldPath: "content.premise",
            value: premiseMatch[1].trim()
          });
        }

        // Extract stakes
        const stakesMatch = input.match(/(?:stakes?|at stake|happens if)[:\s]+(.+?)(?:\.|$)/i);
        if (stakesMatch) {
          updates.push({
            fieldPath: "content.stakes",
            value: stakesMatch[1].trim()
          });
        }
        break;

      case "act":
        // Extract purpose
        const purposeMatch = input.match(/(?:purpose|goal|question)[:\s]+(.+?)(?:\.|$)/i);
        if (purposeMatch) {
          updates.push({
            fieldPath: "content.purpose",
            value: purposeMatch[1].trim()
          });
        }

        // Extract key events
        const eventsMatch = input.match(/(?:events?|happens?)[:\s]+(.+?)(?:\.|$)/i);
        if (eventsMatch) {
          const events = eventsMatch[1].split(/[,;]/).map(e => e.trim()).filter(e => e);
          updates.push({
            fieldPath: "content.keyEvents",
            value: events
          });
        }
        break;

      case "chapter":
        // Extract purpose
        const chapterPurposeMatch = input.match(/(?:purpose|about)[:\s]+(.+?)(?:\.|$)/i);
        if (chapterPurposeMatch) {
          updates.push({
            fieldPath: "content.purpose",
            value: chapterPurposeMatch[1].trim()
          });
        }

        // Extract POV character
        const povMatch = input.match(/(?:pov|point of view|from)[:\s]+(\w+)/i);
        if (povMatch) {
          updates.push({
            fieldPath: "content.povCharacter",
            value: povMatch[1].trim()
          });
        }
        break;

      case "scene":
        // Extract synopsis
        if (input.length > 20 && !input.includes(":")) {
          updates.push({
            fieldPath: "content.synopsis",
            value: input.trim()
          });
        }

        // Extract beats from numbered list
        const beatMatches = input.match(/\d+[.)]\s*(.+?)(?=\d+[.)]|$)/g);
        if (beatMatches) {
          const beats: Beat[] = beatMatches.map((match, index) => ({
            id: index + 1,
            type: "action" as BeatType,
            summary: match.replace(/^\d+[.)]\s*/, "").trim(),
            purpose: "",
            charactersActive: [],
            emotionalState: {},
            durationEstimate: "medium" as const,
            audioDirection: ""
          }));
          updates.push({
            fieldPath: "content.beats",
            value: beats
          });
        }
        break;
    }

    // If no structured extraction, store as general note for the title or summary
    if (updates.length === 0 && input.trim().length > 10) {
      if (outline.outlineLevel === "scene") {
        updates.push({
          fieldPath: "content.synopsis",
          value: input.trim()
        });
      } else {
        updates.push({
          fieldPath: "title",
          value: input.trim().substring(0, 100)
        });
      }
    }

    return updates;
  }

  /**
   * Apply update to outline
   */
  private applyOutlineUpdate(outline: Outline, update: OutlineUpdate): void {
    const parts = update.fieldPath.split(".");
    let current: Record<string, unknown> = outline as unknown as Record<string, unknown>;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    const finalPart = parts[parts.length - 1];

    // Handle array appending
    if (Array.isArray(current[finalPart]) && Array.isArray(update.value)) {
      current[finalPart] = update.value;
    } else {
      current[finalPart] = update.value;
    }
  }

  /**
   * Get next questions based on completion
   */
  private getNextQuestions(
    level: OutlineLevel,
    outline: Outline,
    completionStatus: Record<string, "complete" | "partial" | "incomplete">
  ): string[] {
    const allQuestions = this.getGuidingQuestions(level, outline);
    const questions: string[] = [];

    // Map completion status fields to question indices
    const fieldToQuestionIndex: Record<string, number> = {
      logline: 0, coreThemes: 1, centralMystery: 2, primaryCharacters: 3, settingSummary: 4,
      premise: 0, stakes: 1, acts: 2,
      purpose: 0, keyEvents: 1, characterArcs: 2,
      chapterGoals: 1, povCharacter: 3, scenes: 4,
      synopsis: 0, sceneGoals: 1, beats: 3, audioNotes: 5
    };

    for (const [field, status] of Object.entries(completionStatus)) {
      if (status !== "complete") {
        const questionIndex = fieldToQuestionIndex[field];
        if (questionIndex !== undefined && allQuestions[questionIndex]) {
          questions.push(allQuestions[questionIndex]);
        }
      }
    }

    return questions.slice(0, 3);
  }

  /**
   * Get drill-down options
   */
  private getDrillDownOptions(
    outline: Outline,
    completionStatus: Record<string, "complete" | "partial" | "incomplete">
  ): string[] {
    const options: string[] = [];

    // Check if outline is sufficiently complete to drill down
    const completeCount = Object.values(completionStatus).filter(s => s === "complete").length;
    const totalCount = Object.keys(completionStatus).length;

    if (completeCount < totalCount / 2) {
      return options; // Not ready for drill-down
    }

    switch (outline.outlineLevel) {
      case "story":
        options.push("Create book outline");
        break;
      case "book":
        const bookContent = outline.content as BookOutlineContent;
        if (bookContent.acts.length > 0) {
          bookContent.acts.forEach((act, i) => {
            options.push(`Outline Act ${i + 1}: ${act.name || act.purpose}`);
          });
        } else {
          options.push("Create Act 1 outline");
        }
        break;
      case "act":
        options.push("Create chapter outlines for this act");
        break;
      case "chapter":
        const chapterContent = outline.content as ChapterOutlineContent;
        if (chapterContent.scenes.length > 0) {
          chapterContent.scenes.forEach((scene, i) => {
            options.push(`Outline Scene ${i + 1}: ${scene.title || scene.summary}`);
          });
        } else {
          options.push("Create scene outlines for this chapter");
        }
        break;
      case "scene":
        options.push("Ready for Studio Mode - write this scene");
        break;
    }

    return options;
  }

  /**
   * Check if drill-down is valid
   */
  private isValidDrillDown(parentLevel: OutlineLevel, childLevel: OutlineLevel): boolean {
    const hierarchy: Record<OutlineLevel, OutlineLevel | null> = {
      story: "book",
      book: "act",
      act: "chapter",
      chapter: "scene",
      scene: null
    };
    return hierarchy[parentLevel] === childLevel;
  }

  /**
   * Generate opening message
   */
  private generateOpeningMessage(
    level: OutlineLevel,
    outline: Outline,
    guidingQuestions: string[]
  ): string {
    const levelNames: Record<OutlineLevel, string> = {
      story: "story concept",
      book: "book structure",
      act: "act outline",
      chapter: "chapter outline",
      scene: "scene outline"
    };

    const intro = `Let's build the ${levelNames[level]} for "${outline.title}".`;
    const guidance = level === "scene"
      ? "Scene outlines should be detailed enough to write from, with beat-by-beat structure."
      : `We'll work through the key elements to create a solid ${levelNames[level]}.`;

    const firstQuestion = guidingQuestions[0] || "What would you like to establish first?";

    return `${intro}\n\n${guidance}\n\n${firstQuestion}`;
  }

  /**
   * Generate response after updates
   */
  private generateResponse(
    updates: OutlineUpdate[],
    nextQuestions: string[],
    drillDownOptions: string[]
  ): string {
    let response = "";

    // Acknowledge updates
    if (updates.length > 0) {
      const fields = updates.map(u => u.fieldPath.split(".").pop()).join(", ");
      response += `Got it - I've captured the ${fields}.\n\n`;
    }

    // Offer drill-down if available
    if (drillDownOptions.length > 0) {
      response += "This outline is taking shape. You can:\n";
      drillDownOptions.forEach((option, i) => {
        response += `${i + 1}. ${option}\n`;
      });
      response += "\nOr continue building this level:\n\n";
    }

    // Ask next question
    if (nextQuestions.length > 0) {
      response += nextQuestions[0];
    } else {
      response += "This outline looks complete! Would you like to drill down to the next level, or make any adjustments?";
    }

    return response;
  }

  /**
   * End outline session
   */
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = "completed";
      session.completedAt = new Date();
      session.updatedAt = new Date();
    }
  }
}

// Export singleton instance
export const outlineService = new OutlineService();
