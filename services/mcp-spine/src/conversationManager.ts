import Anthropic from "@anthropic-ai/sdk";
import type { Logger } from "./types/loggerTypes.js";
import type { MessageParam, TextBlock, ToolUseBlock } from "@anthropic-ai/sdk/resources/messages.js";

export interface ConversationConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ConversationState {
  sessionId: string;
  messages: ConversationMessage[];
  context?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StreamChunk {
  type: "text" | "tool_use" | "error";
  content: string;
  toolCall?: ToolCall;
  isComplete: boolean;
}

export class ConversationManager {
  private client: Anthropic;
  private logger: Logger;
  private config: Required<ConversationConfig>;
  private sessions: Map<string, ConversationState>;

  constructor(config: ConversationConfig, logger: Logger) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
    this.logger = logger;
    this.config = {
      apiKey: config.apiKey,
      model: config.model || "claude-3-5-sonnet-20241022",
      maxTokens: config.maxTokens || 4096,
      temperature: config.temperature || 0.7,
    };
    this.sessions = new Map();

    this.logger.info("ConversationManager initialized", {
      model: this.config.model,
      maxTokens: this.config.maxTokens,
    });
  }

  /**
   * Create a new conversation session
   */
  createSession(sessionId: string, metadata?: Record<string, unknown>): ConversationState {
    const state: ConversationState = {
      sessionId,
      messages: [],
      metadata: metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(sessionId, state);

    this.logger.info("conversation.session_created", {
      session_id: sessionId,
      metadata,
    });

    return state;
  }

  /**
   * Get existing session state
   */
  getSession(sessionId: string): ConversationState | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Update session context (for prompt caching)
   */
  updateSessionContext(sessionId: string, context: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.context = context;
    session.updatedAt = new Date();

    this.logger.info("conversation.context_updated", {
      session_id: sessionId,
      context_length: context.length,
    });
  }

  /**
   * Add a message to the session history
   */
  addMessage(
    sessionId: string,
    role: "user" | "assistant",
    content: string,
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.messages.push({
      role,
      content,
      timestamp: new Date(),
    });
    session.updatedAt = new Date();

    this.logger.debug("conversation.message_added", {
      session_id: sessionId,
      role,
      content_length: content.length,
    });
  }

  /**
   * Send a message with streaming response
   */
  async *streamMessage(
    sessionId: string,
    userMessage: string,
    tools?: Anthropic.Tool[],
    systemPrompt?: string,
  ): AsyncGenerator<StreamChunk> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Add user message to history
    this.addMessage(sessionId, "user", userMessage);

    // Build message history for API
    const messages: MessageParam[] = session.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Build system prompt with context if available
    const systemMessages: any[] = [];

    if (session.context) {
      systemMessages.push({
        type: "text",
        text: session.context,
        cache_control: { type: "ephemeral" },
      });
    }

    if (systemPrompt) {
      systemMessages.push({
        type: "text",
        text: systemPrompt,
      });
    }

    try {
      this.logger.info("conversation.stream_started", {
        session_id: sessionId,
        message_count: messages.length,
        has_context: !!session.context,
        has_tools: !!tools,
      });

      const stream = await this.client.messages.stream({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: systemMessages.length > 0 ? systemMessages : undefined,
        messages,
        tools,
      });

      let assistantResponse = "";
      let currentToolCall: ToolCall | undefined;

      for await (const chunk of stream) {
        if (chunk.type === "content_block_start") {
          const block = chunk.content_block;

          if (block.type === "text") {
            // Text block started
            continue;
          } else if (block.type === "tool_use") {
            // Tool use block started
            currentToolCall = {
              id: block.id,
              name: block.name,
              input: {},
            };
          }
        } else if (chunk.type === "content_block_delta") {
          const delta = chunk.delta;

          if (delta.type === "text_delta") {
            const text = delta.text;
            assistantResponse += text;
            yield {
              type: "text",
              content: text,
              isComplete: false,
            };
          } else if (delta.type === "input_json_delta") {
            // Accumulate tool input (partial JSON)
            continue;
          }
        } else if (chunk.type === "content_block_stop") {
          if (currentToolCall) {
            // Tool use block completed
            yield {
              type: "tool_use",
              content: currentToolCall.name,
              toolCall: currentToolCall,
              isComplete: false,
            };
            currentToolCall = undefined;
          }
        } else if (chunk.type === "message_stop") {
          // Message complete
          this.addMessage(sessionId, "assistant", assistantResponse);

          yield {
            type: "text",
            content: "",
            isComplete: true,
          };

          this.logger.info("conversation.stream_completed", {
            session_id: sessionId,
            response_length: assistantResponse.length,
          });
        }
      }
    } catch (error) {
      this.logger.error("conversation.stream_error", {
        session_id: sessionId,
        error: (error as Error).message,
      });

      yield {
        type: "error",
        content: (error as Error).message,
        isComplete: true,
      };
    }
  }

  /**
   * Send a message and get the complete response (non-streaming)
   */
  async sendMessage(
    sessionId: string,
    userMessage: string,
    tools?: Anthropic.Tool[],
    systemPrompt?: string,
  ): Promise<string> {
    let response = "";

    for await (const chunk of this.streamMessage(sessionId, userMessage, tools, systemPrompt)) {
      if (chunk.type === "text") {
        response += chunk.content;
      }
      if (chunk.isComplete) {
        break;
      }
    }

    return response;
  }

  /**
   * Clear session history (but keep the session)
   */
  clearSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.messages = [];
    session.updatedAt = new Date();

    this.logger.info("conversation.session_cleared", {
      session_id: sessionId,
    });
  }

  /**
   * Delete a session completely
   */
  deleteSession(sessionId: string): void {
    const deleted = this.sessions.delete(sessionId);

    if (deleted) {
      this.logger.info("conversation.session_deleted", {
        session_id: sessionId,
      });
    }
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): string[] {
    return Array.from(this.sessions.keys());
  }

  /**
   * Get session statistics
   */
  getSessionStats(sessionId: string): {
    messageCount: number;
    contextLength: number;
    duration: number;
  } | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return undefined;
    }

    const duration = Date.now() - session.createdAt.getTime();

    return {
      messageCount: session.messages.length,
      contextLength: session.context?.length || 0,
      duration,
    };
  }
}
