/**
 * AI Content Development System
 *
 * A comprehensive system for building story content through conversational AI collaboration.
 *
 * Four Development Modes:
 * 1. Discovery Mode - Explore ideas and capture rough concepts
 * 2. Development Mode - Build structured profiles through guided questions
 * 3. Outlining Mode - Create hierarchical story outlines (story → book → act → chapter → scene)
 * 4. Studio Mode - Write scenes with full context injection and consistency checking
 *
 * See docs/ai_content_development_system.md for complete documentation.
 */

// Types
export * from "./types";

// Services
export { DiscoveryService, discoveryService } from "./discovery-service";
export { DevelopmentService, developmentService } from "./development-service";
export { OutlineService, outlineService } from "./outline-service";
export { StudioService, studioService } from "./studio-service";

// Conversation Engine
export { ConversationEngine, conversationEngine } from "./conversation-engine";

// MCP Tools
export {
  getContentDevelopmentTools,
  executeContentTool,
  contentDevelopmentTools,
  type MCPToolDefinition,
  type MCPToolContext
} from "./mcp-tools";

// Re-export key types for convenience
export type {
  // Session types
  ContentSession,
  ContentSessionType,
  ContentSessionStatus,

  // Mode state types
  DiscoveryModeState,
  DevelopmentModeState,
  OutlineModeState,
  StudioModeState,

  // Profile types
  CharacterProfile,
  LocationProfile,
  FactionProfile,
  CharacterRole,
  ArcType,
  RelationshipType,

  // Outline types
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

  // Studio types
  StudioContext,
  ConsistencyWarning,
  ConsistencyReport,
  ProfileDiscovery,

  // Conversation types
  ConversationMessage,
  ConceptSketch,
  FieldUpdate,
  ClarificationRequest
} from "./types";

/**
 * Initialize content development system
 *
 * In production, this would:
 * - Connect to database
 * - Load existing sessions
 * - Register MCP tools with the spine
 */
export function initializeContentDevelopment(): void {
  // Services are already initialized as singletons
  // Additional setup would go here

  console.log("[ContentDevelopment] System initialized");
  console.log("[ContentDevelopment] Available modes: Discovery, Development, Outline, Studio");
  console.log("[ContentDevelopment] MCP tools registered:", contentDevelopmentTools.length);
}

/**
 * Create a new content development workflow
 *
 * This helper function starts the appropriate service based on mode.
 */
export async function startWorkflow(
  mode: "discovery" | "development" | "outline" | "studio",
  projectId: string,
  options: WorkflowOptions
): Promise<WorkflowResult> {
  switch (mode) {
    case "discovery":
      if (!options.topic || !options.discoveryMode) {
        throw new Error("Discovery mode requires topic and discoveryMode");
      }
      const discoveryResult = discoveryService.startSession(
        { topic: options.topic, mode: options.discoveryMode },
        projectId
      );
      return {
        sessionId: discoveryResult.sessionId,
        mode: "discovery",
        nextPrompt: discoveryResult.openingPrompt
      };

    case "development":
      if (!options.entryType) {
        throw new Error("Development mode requires entryType");
      }
      const devResult = developmentService.startSession(
        {
          entryType: options.entryType,
          entryId: options.entryId,
          initialConcept: options.initialConcept
        },
        projectId
      );
      return {
        sessionId: devResult.sessionId,
        mode: "development",
        nextPrompt: devResult.nextQuestion,
        completionStatus: devResult.completionStatus
      };

    case "outline":
      if (!options.outlineLevel) {
        throw new Error("Outline mode requires outlineLevel");
      }
      const outlineResult = outlineService.createOutline(
        {
          level: options.outlineLevel,
          parentId: options.parentId,
          initialConcept: options.title
        },
        projectId
      );
      return {
        sessionId: outlineResult.sessionId,
        mode: "outline",
        nextPrompt: outlineResult.guidingQuestions[0],
        outline: outlineResult.outlineDraft
      };

    case "studio":
      if (!options.sceneId) {
        throw new Error("Studio mode requires sceneId");
      }
      const studioResult = studioService.startWritingSession(
        options.sceneId,
        projectId
      );
      return {
        sessionId: studioResult.sessionId,
        mode: "studio",
        context: studioResult.context,
        warnings: studioResult.warnings
      };

    default:
      throw new Error(`Unknown workflow mode: ${mode}`);
  }
}

// Supporting types for workflow helper
interface WorkflowOptions {
  // Discovery options
  topic?: string;
  discoveryMode?: "character" | "setting" | "plot" | "open";

  // Development options
  entryType?: "character" | "location" | "object" | "faction" | "lore" | "timeline";
  entryId?: string;
  initialConcept?: ConceptSketch;

  // Outline options
  outlineLevel?: "story" | "book" | "act" | "chapter" | "scene";
  parentId?: string;
  title?: string;

  // Studio options
  sceneId?: string;
}

interface WorkflowResult {
  sessionId: string;
  mode: "discovery" | "development" | "outline" | "studio";
  nextPrompt?: string;
  completionStatus?: Record<string, string>;
  outline?: Outline;
  context?: StudioContext;
  warnings?: ConsistencyWarning[];
}

import type { Outline, StudioContext, ConsistencyWarning, ConceptSketch } from "./types";
import { contentDevelopmentTools } from "./mcp-tools";
