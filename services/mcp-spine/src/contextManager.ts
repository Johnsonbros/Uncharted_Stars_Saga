import type { Logger } from "./types/loggerTypes.js";

/**
 * Narrative event representing a single story occurrence
 */
export interface NarrativeEvent {
  id: string;
  type: string;
  timestamp: string;
  dependencies: string[];
  content: Record<string, unknown>;
  canonStatus: "canon" | "draft" | "rejected";
  createdAt: Date;
}

/**
 * Knowledge state tracking what characters know
 */
export interface KnowledgeState {
  id: string;
  characterId: string;
  eventId: string;
  knowledgeType: "witnessed" | "told" | "inferred" | "secret";
  learnedAt: string;
  source?: string;
}

/**
 * Promise to listeners that must be tracked
 */
export interface NarrativePromise {
  id: string;
  description: string;
  introducedIn: string;
  status: "pending" | "fulfilled" | "broken" | "transformed";
  fulfilledIn?: string;
  notes?: string;
}

/**
 * Character profile for voice and behavior
 */
export interface CharacterProfile {
  id: string;
  name: string;
  voiceProfileId?: string;
  personality: string[];
  knownFacts: string[];
  relationships: Record<string, string>;
}

/**
 * Assembled context for a session
 */
export interface AssembledContext {
  canonEvents: NarrativeEvent[];
  draftEvents: NarrativeEvent[];
  knowledgeStates: KnowledgeState[];
  promises: NarrativePromise[];
  characters: CharacterProfile[];
  sceneContext?: string;
  totalTokens: number;
}

/**
 * Context assembly configuration
 */
export interface ContextConfig {
  maxCanonTokens: number;
  maxDraftTokens: number;
  maxSceneTokens: number;
  enablePromptCaching: boolean;
}

/**
 * Context Manager
 *
 * Responsible for assembling narrative context for AI sessions.
 * Implements a hybrid approach:
 * - Cached canon state (150k tokens)
 * - Retrieved draft/scene context (20k tokens)
 * - Session state (10k tokens)
 */
export class ContextManager {
  private logger: Logger;
  private config: ContextConfig;
  private canonCache: Map<string, AssembledContext>;

  constructor(logger: Logger, config?: Partial<ContextConfig>) {
    this.logger = logger;
    this.config = {
      maxCanonTokens: 150_000,
      maxDraftTokens: 20_000,
      maxSceneTokens: 10_000,
      enablePromptCaching: true,
      ...config,
    };
    this.canonCache = new Map();

    this.logger.info("ContextManager initialized", {
      maxCanonTokens: this.config.maxCanonTokens,
      maxDraftTokens: this.config.maxDraftTokens,
      enablePromptCaching: this.config.enablePromptCaching,
    });
  }

  /**
   * Assemble full context for a project/scene
   *
   * This is the main entry point for building context for AI sessions.
   */
  async assembleContext(
    projectId: string,
    sceneId?: string,
  ): Promise<AssembledContext> {
    this.logger.info("context.assembly_started", {
      project_id: projectId,
      scene_id: sceneId,
    });

    // Load canon events (cacheable)
    const canonEvents = await this.loadCanonEvents(projectId);

    // Load draft events (not cached)
    const draftEvents = await this.loadDraftEvents(projectId, sceneId);

    // Load knowledge states
    const knowledgeStates = await this.loadKnowledgeStates(projectId);

    // Load promises
    const promises = await this.loadPromises(projectId);

    // Load character profiles
    const characters = await this.loadCharacterProfiles(projectId);

    // Load scene-specific context if provided
    let sceneContext: string | undefined;
    if (sceneId) {
      sceneContext = await this.loadSceneContext(projectId, sceneId);
    }

    // Estimate token count (rough approximation: 1 token ≈ 4 characters)
    const totalTokens = this.estimateTokens({
      canonEvents,
      draftEvents,
      knowledgeStates,
      promises,
      characters,
      sceneContext,
    });

    const context: AssembledContext = {
      canonEvents,
      draftEvents,
      knowledgeStates,
      promises,
      characters,
      sceneContext,
      totalTokens,
    };

    // Cache canon portion if enabled
    if (this.config.enablePromptCaching) {
      this.canonCache.set(projectId, context);
    }

    this.logger.info("context.assembly_completed", {
      project_id: projectId,
      scene_id: sceneId,
      canon_events: canonEvents.length,
      draft_events: draftEvents.length,
      knowledge_states: knowledgeStates.length,
      promises: promises.length,
      characters: characters.length,
      total_tokens: totalTokens,
    });

    return context;
  }

  /**
   * Format context as a system prompt
   */
  formatAsSystemPrompt(context: AssembledContext): string {
    const sections: string[] = [];

    // Canon events section (for prompt caching)
    if (context.canonEvents.length > 0) {
      sections.push("# Canon Events (Immutable Story State)");
      sections.push("");
      sections.push("The following events are established canon and cannot be contradicted:");
      sections.push("");

      for (const event of context.canonEvents) {
        sections.push(`## Event: ${event.id}`);
        sections.push(`Type: ${event.type}`);
        sections.push(`Timestamp: ${event.timestamp}`);
        sections.push(`Dependencies: ${event.dependencies.join(", ") || "none"}`);
        sections.push(`Content: ${JSON.stringify(event.content, null, 2)}`);
        sections.push("");
      }
      sections.push("---");
      sections.push("");
    }

    // Character profiles
    if (context.characters.length > 0) {
      sections.push("# Character Profiles");
      sections.push("");

      for (const character of context.characters) {
        sections.push(`## ${character.name} (${character.id})`);
        sections.push(`Voice Profile: ${character.voiceProfileId || "not assigned"}`);
        sections.push(`Personality: ${character.personality.join(", ")}`);
        sections.push(`Known Facts: ${character.knownFacts.join(", ")}`);
        sections.push("");
      }
      sections.push("---");
      sections.push("");
    }

    // Knowledge states
    if (context.knowledgeStates.length > 0) {
      sections.push("# Knowledge States (Who Knows What)");
      sections.push("");

      const grouped = this.groupKnowledgeByCharacter(context.knowledgeStates);
      for (const [characterId, states] of Object.entries(grouped)) {
        sections.push(`## Character: ${characterId}`);
        for (const state of states) {
          sections.push(`- ${state.knowledgeType}: Event ${state.eventId} (learned at ${state.learnedAt})`);
        }
        sections.push("");
      }
      sections.push("---");
      sections.push("");
    }

    // Promises
    if (context.promises.length > 0) {
      sections.push("# Promises to Listeners");
      sections.push("");

      for (const promise of context.promises) {
        sections.push(`## ${promise.id}: ${promise.description}`);
        sections.push(`Status: ${promise.status}`);
        sections.push(`Introduced: ${promise.introducedIn}`);
        if (promise.fulfilledIn) {
          sections.push(`Fulfilled: ${promise.fulfilledIn}`);
        }
        if (promise.notes) {
          sections.push(`Notes: ${promise.notes}`);
        }
        sections.push("");
      }
      sections.push("---");
      sections.push("");
    }

    // Draft events
    if (context.draftEvents.length > 0) {
      sections.push("# Draft Events (Work in Progress)");
      sections.push("");
      sections.push("These events are not yet canon and may be modified:");
      sections.push("");

      for (const event of context.draftEvents) {
        sections.push(`## Event: ${event.id}`);
        sections.push(`Type: ${event.type}`);
        sections.push(`Timestamp: ${event.timestamp}`);
        sections.push(`Content: ${JSON.stringify(event.content, null, 2)}`);
        sections.push("");
      }
      sections.push("---");
      sections.push("");
    }

    // Scene-specific context
    if (context.sceneContext) {
      sections.push("# Current Scene Context");
      sections.push("");
      sections.push(context.sceneContext);
      sections.push("");
    }

    return sections.join("\n");
  }

  /**
   * Invalidate canon cache for a project
   */
  invalidateCache(projectId: string): void {
    this.canonCache.delete(projectId);
    this.logger.info("context.cache_invalidated", {
      project_id: projectId,
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    projects: string[];
  } {
    return {
      size: this.canonCache.size,
      projects: Array.from(this.canonCache.keys()),
    };
  }

  /**
   * Load canon events from storage (MVP: in-memory)
   */
  private async loadCanonEvents(projectId: string): Promise<NarrativeEvent[]> {
    // TODO: Replace with actual database query
    // For now, return empty array as MVP
    this.logger.debug("context.loading_canon_events", { project_id: projectId });
    return [];
  }

  /**
   * Load draft events from storage (MVP: in-memory)
   */
  private async loadDraftEvents(
    projectId: string,
    sceneId?: string,
  ): Promise<NarrativeEvent[]> {
    // TODO: Replace with actual database query
    // Filter by sceneId if provided
    this.logger.debug("context.loading_draft_events", {
      project_id: projectId,
      scene_id: sceneId,
    });
    return [];
  }

  /**
   * Load knowledge states from storage (MVP: in-memory)
   */
  private async loadKnowledgeStates(projectId: string): Promise<KnowledgeState[]> {
    // TODO: Replace with actual database query
    this.logger.debug("context.loading_knowledge_states", { project_id: projectId });
    return [];
  }

  /**
   * Load promises from storage (MVP: in-memory)
   */
  private async loadPromises(projectId: string): Promise<NarrativePromise[]> {
    // TODO: Replace with actual database query
    this.logger.debug("context.loading_promises", { project_id: projectId });
    return [];
  }

  /**
   * Load character profiles from storage (MVP: in-memory)
   */
  private async loadCharacterProfiles(projectId: string): Promise<CharacterProfile[]> {
    // TODO: Replace with actual database query
    this.logger.debug("context.loading_character_profiles", { project_id: projectId });
    return [];
  }

  /**
   * Load scene-specific context (MVP: in-memory)
   */
  private async loadSceneContext(projectId: string, sceneId: string): Promise<string> {
    // TODO: Replace with actual database query
    this.logger.debug("context.loading_scene_context", {
      project_id: projectId,
      scene_id: sceneId,
    });
    return "";
  }

  /**
   * Estimate token count for context
   */
  private estimateTokens(context: Partial<AssembledContext>): number {
    const formatted = this.formatAsSystemPrompt(context as AssembledContext);
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(formatted.length / 4);
  }

  /**
   * Group knowledge states by character
   */
  private groupKnowledgeByCharacter(
    states: KnowledgeState[],
  ): Record<string, KnowledgeState[]> {
    const grouped: Record<string, KnowledgeState[]> = {};

    for (const state of states) {
      if (!grouped[state.characterId]) {
        grouped[state.characterId] = [];
      }
      grouped[state.characterId].push(state);
    }

    return grouped;
  }
}
