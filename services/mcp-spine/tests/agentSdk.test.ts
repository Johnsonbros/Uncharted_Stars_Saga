import { describe, it, mock } from "node:test";
import assert from "node:assert";
import { ConversationManager } from "../src/conversationManager.js";
import { ContextManager } from "../src/contextManager.js";
import { NarrativeSessionOrchestrator } from "../src/sessionOrchestrator.js";
import type { Logger } from "../src/types/loggerTypes.js";

// Mock logger
const createMockLogger = (): Logger => ({
  debug: mock.fn(),
  info: mock.fn(),
  warn: mock.fn(),
  error: mock.fn(),
});

describe("Agent SDK Foundation", () => {
  describe("ConversationManager", () => {
    it("should create a new session", () => {
      const logger = createMockLogger();
      const manager = new ConversationManager(
        {
          apiKey: "test-key",
          model: "claude-3-5-sonnet-20241022",
        },
        logger,
      );

      const session = manager.createSession("test-session-1", { project: "test" });

      assert.strictEqual(session.sessionId, "test-session-1");
      assert.strictEqual(session.messages.length, 0);
      assert.deepStrictEqual(session.metadata, { project: "test" });
    });

    it("should retrieve an existing session", () => {
      const logger = createMockLogger();
      const manager = new ConversationManager(
        {
          apiKey: "test-key",
        },
        logger,
      );

      manager.createSession("test-session-2");
      const session = manager.getSession("test-session-2");

      assert.ok(session);
      assert.strictEqual(session.sessionId, "test-session-2");
    });

    it("should update session context", () => {
      const logger = createMockLogger();
      const manager = new ConversationManager(
        {
          apiKey: "test-key",
        },
        logger,
      );

      manager.createSession("test-session-3");
      manager.updateSessionContext("test-session-3", "Test context");

      const session = manager.getSession("test-session-3");
      assert.strictEqual(session?.context, "Test context");
    });

    it("should add messages to session", () => {
      const logger = createMockLogger();
      const manager = new ConversationManager(
        {
          apiKey: "test-key",
        },
        logger,
      );

      manager.createSession("test-session-4");
      manager.addMessage("test-session-4", "user", "Hello");
      manager.addMessage("test-session-4", "assistant", "Hi there!");

      const session = manager.getSession("test-session-4");
      assert.strictEqual(session?.messages.length, 2);
      assert.strictEqual(session?.messages[0].content, "Hello");
      assert.strictEqual(session?.messages[1].content, "Hi there!");
    });

    it("should get session statistics", () => {
      const logger = createMockLogger();
      const manager = new ConversationManager(
        {
          apiKey: "test-key",
        },
        logger,
      );

      manager.createSession("test-session-5");
      manager.updateSessionContext("test-session-5", "Context data");
      manager.addMessage("test-session-5", "user", "Test");

      const stats = manager.getSessionStats("test-session-5");
      assert.ok(stats);
      assert.strictEqual(stats.messageCount, 1);
      assert.strictEqual(stats.contextLength, 12);
      assert.ok(stats.duration >= 0);
    });

    it("should clear session history", () => {
      const logger = createMockLogger();
      const manager = new ConversationManager(
        {
          apiKey: "test-key",
        },
        logger,
      );

      manager.createSession("test-session-6");
      manager.addMessage("test-session-6", "user", "Test");
      manager.clearSession("test-session-6");

      const session = manager.getSession("test-session-6");
      assert.strictEqual(session?.messages.length, 0);
    });

    it("should delete a session", () => {
      const logger = createMockLogger();
      const manager = new ConversationManager(
        {
          apiKey: "test-key",
        },
        logger,
      );

      manager.createSession("test-session-7");
      manager.deleteSession("test-session-7");

      const session = manager.getSession("test-session-7");
      assert.strictEqual(session, undefined);
    });
  });

  describe("ContextManager", () => {
    it("should initialize with default config", () => {
      const logger = createMockLogger();
      const manager = new ContextManager(logger);

      const stats = manager.getCacheStats();
      assert.strictEqual(stats.size, 0);
      assert.strictEqual(stats.projects.length, 0);
    });

    it("should assemble context for a project", async () => {
      const logger = createMockLogger();
      const manager = new ContextManager(logger);

      const context = await manager.assembleContext("test-project-1");

      assert.ok(context);
      assert.ok(Array.isArray(context.canonEvents));
      assert.ok(Array.isArray(context.draftEvents));
      assert.ok(Array.isArray(context.knowledgeStates));
      assert.ok(Array.isArray(context.promises));
      assert.ok(Array.isArray(context.characters));
      assert.ok(typeof context.totalTokens === "number");
    });

    it("should format context as system prompt", async () => {
      const logger = createMockLogger();
      const manager = new ContextManager(logger);

      const context = await manager.assembleContext("test-project-2");
      const prompt = manager.formatAsSystemPrompt(context);

      assert.ok(typeof prompt === "string");
      assert.ok(prompt.length >= 0);
    });

    it("should invalidate cache", async () => {
      const logger = createMockLogger();
      const manager = new ContextManager(logger, { enablePromptCaching: true });

      await manager.assembleContext("test-project-3");
      let stats = manager.getCacheStats();
      assert.ok(stats.projects.includes("test-project-3"));

      manager.invalidateCache("test-project-3");
      stats = manager.getCacheStats();
      assert.ok(!stats.projects.includes("test-project-3"));
    });
  });

  describe("NarrativeSessionOrchestrator", () => {
    it("should start a new session", async () => {
      const logger = createMockLogger();
      const orchestrator = new NarrativeSessionOrchestrator(
        {
          apiKey: "test-key",
        },
        logger,
      );

      await orchestrator.startSession({
        sessionId: "orchestrator-test-1",
        projectId: "test-project",
      });

      const sessionInfo = orchestrator.getSessionInfo("orchestrator-test-1");
      assert.ok(sessionInfo);
      assert.strictEqual(sessionInfo.sessionId, "orchestrator-test-1");
      assert.strictEqual(sessionInfo.projectId, "test-project");
      assert.strictEqual(sessionInfo.messageCount, 0);
    });

    it("should get active sessions", async () => {
      const logger = createMockLogger();
      const orchestrator = new NarrativeSessionOrchestrator(
        {
          apiKey: "test-key",
        },
        logger,
      );

      await orchestrator.startSession({
        sessionId: "orchestrator-test-2",
        projectId: "test-project",
      });

      await orchestrator.startSession({
        sessionId: "orchestrator-test-3",
        projectId: "test-project",
      });

      const sessions = orchestrator.getActiveSessions();
      assert.strictEqual(sessions.length, 2);
      assert.ok(sessions.includes("orchestrator-test-2"));
      assert.ok(sessions.includes("orchestrator-test-3"));
    });

    it("should end a session", async () => {
      const logger = createMockLogger();
      const orchestrator = new NarrativeSessionOrchestrator(
        {
          apiKey: "test-key",
        },
        logger,
      );

      await orchestrator.startSession({
        sessionId: "orchestrator-test-4",
        projectId: "test-project",
      });

      orchestrator.endSession("orchestrator-test-4");

      const sessionInfo = orchestrator.getSessionInfo("orchestrator-test-4");
      assert.strictEqual(sessionInfo, undefined);
    });

    it("should refresh context", async () => {
      const logger = createMockLogger();
      const orchestrator = new NarrativeSessionOrchestrator(
        {
          apiKey: "test-key",
        },
        logger,
      );

      await orchestrator.startSession({
        sessionId: "orchestrator-test-5",
        projectId: "test-project",
      });

      const sessionBefore = orchestrator.getSessionInfo("orchestrator-test-5");
      const tokensBefore = sessionBefore?.contextTokens;

      await orchestrator.refreshContext("orchestrator-test-5");

      const sessionAfter = orchestrator.getSessionInfo("orchestrator-test-5");
      const tokensAfter = sessionAfter?.contextTokens;

      // Tokens should be defined (even if 0)
      assert.ok(typeof tokensBefore === "number");
      assert.ok(typeof tokensAfter === "number");
    });
  });
});
