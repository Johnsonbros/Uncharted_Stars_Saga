import type { Logger } from "./types/loggerTypes.js";
import { ConversationManager, type ConversationConfig } from "./conversationManager.js";
import { ContextManager, type AssembledContext } from "./contextManager.js";
import type Anthropic from "@anthropic-ai/sdk";

export interface SessionConfig {
  sessionId: string;
  projectId: string;
  sceneId?: string;
  metadata?: Record<string, unknown>;
}

export interface SessionOrchestrator {
  startSession(config: SessionConfig): Promise<void>;
  sendMessage(sessionId: string, message: string): Promise<string>;
  streamMessage(
    sessionId: string,
    message: string,
  ): AsyncGenerator<{ type: string; content: string }>;
  endSession(sessionId: string): void;
  getSessionInfo(sessionId: string): SessionInfo | undefined;
}

export interface SessionInfo {
  sessionId: string;
  projectId: string;
  sceneId?: string;
  messageCount: number;
  contextTokens: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Session Orchestrator
 *
 * Coordinates conversation management, context assembly, and tool calling
 * for narrative creation sessions.
 */
export class NarrativeSessionOrchestrator implements SessionOrchestrator {
  private conversationManager: ConversationManager;
  private contextManager: ContextManager;
  private logger: Logger;
  private sessions: Map<string, SessionInfo>;

  constructor(
    conversationConfig: ConversationConfig,
    logger: Logger,
  ) {
    this.conversationManager = new ConversationManager(conversationConfig, logger);
    this.contextManager = new ContextManager(logger);
    this.logger = logger;
    this.sessions = new Map();

    this.logger.info("SessionOrchestrator initialized");
  }

  /**
   * Start a new narrative session
   */
  async startSession(config: SessionConfig): Promise<void> {
    this.logger.info("session.starting", {
      session_id: config.sessionId,
      project_id: config.projectId,
      scene_id: config.sceneId,
    });

    // Assemble narrative context
    const context = await this.contextManager.assembleContext(
      config.projectId,
      config.sceneId,
    );

    // Create conversation session
    this.conversationManager.createSession(config.sessionId, {
      projectId: config.projectId,
      sceneId: config.sceneId,
      ...config.metadata,
    });

    // Update conversation context (for prompt caching)
    const systemPrompt = this.contextManager.formatAsSystemPrompt(context);
    this.conversationManager.updateSessionContext(config.sessionId, systemPrompt);

    // Track session info
    const sessionInfo: SessionInfo = {
      sessionId: config.sessionId,
      projectId: config.projectId,
      sceneId: config.sceneId,
      messageCount: 0,
      contextTokens: context.totalTokens,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sessions.set(config.sessionId, sessionInfo);

    this.logger.info("session.started", {
      session_id: config.sessionId,
      context_tokens: context.totalTokens,
    });
  }

  /**
   * Send a message and get complete response
   */
  async sendMessage(sessionId: string, message: string): Promise<string> {
    const sessionInfo = this.sessions.get(sessionId);
    if (!sessionInfo) {
      throw new Error(`Session ${sessionId} not found`);
    }

    this.logger.info("session.message_sent", {
      session_id: sessionId,
      message_length: message.length,
    });

    // Get narrative tools
    const tools = this.buildNarrativeTools();

    // Build system prompt with narrative instructions
    const systemPrompt = this.buildNarrativeSystemPrompt();

    // Send message through conversation manager
    const response = await this.conversationManager.sendMessage(
      sessionId,
      message,
      tools,
      systemPrompt,
    );

    // Update session info
    sessionInfo.messageCount += 1;
    sessionInfo.updatedAt = new Date();

    this.logger.info("session.message_received", {
      session_id: sessionId,
      response_length: response.length,
    });

    return response;
  }

  /**
   * Stream a message response
   */
  async *streamMessage(
    sessionId: string,
    message: string,
  ): AsyncGenerator<{ type: string; content: string }> {
    const sessionInfo = this.sessions.get(sessionId);
    if (!sessionInfo) {
      throw new Error(`Session ${sessionId} not found`);
    }

    this.logger.info("session.stream_started", {
      session_id: sessionId,
      message_length: message.length,
    });

    // Get narrative tools
    const tools = this.buildNarrativeTools();

    // Build system prompt
    const systemPrompt = this.buildNarrativeSystemPrompt();

    // Stream message through conversation manager
    for await (const chunk of this.conversationManager.streamMessage(
      sessionId,
      message,
      tools,
      systemPrompt,
    )) {
      yield {
        type: chunk.type,
        content: chunk.content,
      };

      if (chunk.isComplete) {
        // Update session info
        sessionInfo.messageCount += 1;
        sessionInfo.updatedAt = new Date();

        this.logger.info("session.stream_completed", {
          session_id: sessionId,
        });
        break;
      }
    }
  }

  /**
   * End a session
   */
  endSession(sessionId: string): void {
    this.conversationManager.deleteSession(sessionId);
    this.sessions.delete(sessionId);

    this.logger.info("session.ended", {
      session_id: sessionId,
    });
  }

  /**
   * Get session information
   */
  getSessionInfo(sessionId: string): SessionInfo | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): string[] {
    return Array.from(this.sessions.keys());
  }

  /**
   * Refresh context for a session (e.g., after canon update)
   */
  async refreshContext(sessionId: string): Promise<void> {
    const sessionInfo = this.sessions.get(sessionId);
    if (!sessionInfo) {
      throw new Error(`Session ${sessionId} not found`);
    }

    this.logger.info("session.refreshing_context", {
      session_id: sessionId,
      project_id: sessionInfo.projectId,
    });

    // Invalidate context cache
    this.contextManager.invalidateCache(sessionInfo.projectId);

    // Reassemble context
    const context = await this.contextManager.assembleContext(
      sessionInfo.projectId,
      sessionInfo.sceneId,
    );

    // Update conversation context
    const systemPrompt = this.contextManager.formatAsSystemPrompt(context);
    this.conversationManager.updateSessionContext(sessionId, systemPrompt);

    // Update session info
    sessionInfo.contextTokens = context.totalTokens;
    sessionInfo.updatedAt = new Date();

    this.logger.info("session.context_refreshed", {
      session_id: sessionId,
      context_tokens: context.totalTokens,
    });
  }

  /**
   * Build narrative-specific tools for AI
   */
  private buildNarrativeTools(): Anthropic.Tool[] {
    return [
      {
        name: "create_narrative_event",
        description:
          "Create a new narrative event in the story. Events are the atomic units of story truth.",
        input_schema: {
          type: "object",
          properties: {
            event_type: {
              type: "string",
              description: "Type of event (e.g., dialogue, action, revelation, decision)",
            },
            timestamp: {
              type: "string",
              description: "Story timestamp (e.g., '2347-03-15T14:30:00Z')",
            },
            dependencies: {
              type: "array",
              items: { type: "string" },
              description: "IDs of events this depends on",
            },
            content: {
              type: "object",
              description: "Event content (varies by type)",
            },
          },
          required: ["event_type", "timestamp", "content"],
        },
      },
      {
        name: "update_knowledge_state",
        description:
          "Update what a character knows. Tracks who knows what and when.",
        input_schema: {
          type: "object",
          properties: {
            character_id: {
              type: "string",
              description: "ID of the character",
            },
            event_id: {
              type: "string",
              description: "ID of the event they learned about",
            },
            knowledge_type: {
              type: "string",
              enum: ["witnessed", "told", "inferred", "secret"],
              description: "How they learned this information",
            },
            learned_at: {
              type: "string",
              description: "Story timestamp when they learned it",
            },
          },
          required: ["character_id", "event_id", "knowledge_type", "learned_at"],
        },
      },
      {
        name: "track_promise",
        description:
          "Track a promise to listeners. Used to ensure story commitments are fulfilled.",
        input_schema: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "What was promised",
            },
            introduced_in: {
              type: "string",
              description: "Event ID where promise was made",
            },
          },
          required: ["description", "introduced_in"],
        },
      },
    ];
  }

  /**
   * Build narrative system prompt
   */
  private buildNarrativeSystemPrompt(): string {
    return `You are an AI assistant helping create audiobook-native narrative content for the Uncharted Stars Saga.

Your role:
- Help develop story events that maintain canon consistency
- Track character knowledge states
- Ensure promises to listeners are fulfilled
- Optimize content for audio listening (clear attribution, natural pacing)

Core principles:
- Stories are state, not documents (work with events and dependencies)
- Audio-first (optimize for listening, not reading)
- Canon is enforced (never contradict established events)
- Maintain institutional memory across sessions

When creating content:
1. Always check canon events before proposing new content
2. Track character knowledge states explicitly
3. Ensure speaker attribution is always clear in audio
4. Use beat markers for pacing (pauses, emphasis)
5. Validate against canon gates before finalizing

Use the provided tools to create events, update knowledge, and track promises.`;
  }
}
