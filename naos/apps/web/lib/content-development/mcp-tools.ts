/**
 * MCP Tools for Content Development
 *
 * MCP tool definitions for the AI Content Development System.
 * These tools enable AI models to interact with the content development pipeline.
 */

import type {
  DiscoveryStartInput,
  DiscoveryStartOutput,
  DiscoveryRespondInput,
  DiscoveryRespondOutput,
  ProfileDevelopInput,
  ProfileDevelopOutput,
  ProfileAnswerInput,
  ProfileAnswerOutput,
  ProfileSaveInput,
  ProfileSaveOutput,
  OutlineCreateInput,
  OutlineCreateOutput,
  OutlineDevelopInput,
  OutlineDevelopOutput,
  ContextAssembleInput,
  ContextAssembleOutput,
  BeatWriteInput,
  BeatWriteOutput,
  ConsistencyCheckInput,
  ConsistencyCheckOutput,
  ExtractFromProseInput,
  ExtractFromProseOutput,
  UpdateApplyInput,
  UpdateApplyOutput,
  CodexEntryType,
  OutlineLevel
} from "./types";

import { discoveryService } from "./discovery-service";
import { developmentService } from "./development-service";
import { outlineService } from "./outline-service";
import { studioService } from "./studio-service";

// ============================================================================
// MCP TOOL DEFINITIONS
// ============================================================================

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: object;
  handler: (input: unknown, context: MCPToolContext) => Promise<unknown>;
}

export interface MCPToolContext {
  projectId: string;
  userId?: string;
  requestId?: string;
}

// ============================================================================
// DISCOVERY MODE TOOLS
// ============================================================================

export const discoveryStartTool: MCPToolDefinition = {
  name: "content.discovery.start",
  description: "Start a discovery session to explore ideas, brainstorm, and capture rough concepts through open-ended conversation.",
  inputSchema: {
    type: "object",
    properties: {
      topic: {
        type: "string",
        description: "The topic or subject to explore (e.g., 'a scientist who discovered something terrifying')"
      },
      mode: {
        type: "string",
        enum: ["character", "setting", "plot", "open"],
        description: "The focus of exploration: character (people/beings), setting (places), plot (story events), or open (free exploration)"
      }
    },
    required: ["topic", "mode"]
  },
  handler: async (input: unknown, context: MCPToolContext): Promise<DiscoveryStartOutput> => {
    const typedInput = input as DiscoveryStartInput;
    return discoveryService.startSession(typedInput, context.projectId);
  }
};

export const discoveryRespondTool: MCPToolDefinition = {
  name: "content.discovery.respond",
  description: "Continue a discovery conversation by responding to AI questions or adding new ideas.",
  inputSchema: {
    type: "object",
    properties: {
      session_id: {
        type: "string",
        description: "The session ID from content.discovery.start"
      },
      user_input: {
        type: "string",
        description: "The user's response or new ideas to explore"
      }
    },
    required: ["session_id", "user_input"]
  },
  handler: async (input: unknown, context: MCPToolContext): Promise<DiscoveryRespondOutput> => {
    const typedInput = input as { session_id: string; user_input: string };
    return discoveryService.respond({
      sessionId: typedInput.session_id,
      userInput: typedInput.user_input
    });
  }
};

// ============================================================================
// DEVELOPMENT MODE TOOLS
// ============================================================================

export const profileDevelopTool: MCPToolDefinition = {
  name: "content.profile.develop",
  description: "Start or continue developing a structured profile (character, location, faction) through guided questions.",
  inputSchema: {
    type: "object",
    properties: {
      entry_type: {
        type: "string",
        enum: ["character", "location", "object", "faction", "lore", "timeline"],
        description: "The type of codex entry to develop"
      },
      entry_id: {
        type: "string",
        description: "Optional: ID of existing entry to continue developing"
      },
      initial_concept: {
        type: "object",
        description: "Optional: Initial concept from discovery mode to build upon",
        properties: {
          type: { type: "string" },
          name: { type: "string" },
          notes: { type: "string" },
          inferred_traits: { type: "object" }
        }
      }
    },
    required: ["entry_type"]
  },
  handler: async (input: unknown, context: MCPToolContext): Promise<ProfileDevelopOutput> => {
    const typedInput = input as {
      entry_type: CodexEntryType;
      entry_id?: string;
      initial_concept?: {
        type: string;
        name?: string;
        notes: string;
        inferred_traits?: Record<string, unknown>;
      };
    };

    return developmentService.startSession(
      {
        entryType: typedInput.entry_type,
        entryId: typedInput.entry_id,
        initialConcept: typedInput.initial_concept ? {
          type: typedInput.initial_concept.type as any,
          name: typedInput.initial_concept.name,
          notes: typedInput.initial_concept.notes,
          inferredTraits: typedInput.initial_concept.inferred_traits
        } : undefined
      },
      context.projectId
    );
  }
};

export const profileAnswerTool: MCPToolDefinition = {
  name: "content.profile.answer",
  description: "Answer a profile development question and receive the next question.",
  inputSchema: {
    type: "object",
    properties: {
      session_id: {
        type: "string",
        description: "The session ID from content.profile.develop"
      },
      answer: {
        type: "string",
        description: "The answer to the current question"
      }
    },
    required: ["session_id", "answer"]
  },
  handler: async (input: unknown, context: MCPToolContext): Promise<ProfileAnswerOutput> => {
    const typedInput = input as { session_id: string; answer: string };
    return developmentService.processAnswer({
      sessionId: typedInput.session_id,
      answer: typedInput.answer
    });
  }
};

export const profileSaveTool: MCPToolDefinition = {
  name: "content.profile.save",
  description: "Save the profile from a development session to the codex.",
  inputSchema: {
    type: "object",
    properties: {
      session_id: {
        type: "string",
        description: "The session ID from content.profile.develop"
      },
      approved_changes: {
        type: "array",
        description: "List of field updates to approve and save",
        items: {
          type: "object",
          properties: {
            field_path: { type: "string" },
            new_value: {}
          }
        }
      }
    },
    required: ["session_id", "approved_changes"]
  },
  handler: async (input: unknown, context: MCPToolContext): Promise<ProfileSaveOutput> => {
    const typedInput = input as {
      session_id: string;
      approved_changes: Array<{ field_path: string; new_value: unknown }>;
    };

    return developmentService.saveProfile({
      sessionId: typedInput.session_id,
      approvedChanges: typedInput.approved_changes.map(c => ({
        fieldPath: c.field_path,
        newValue: c.new_value,
        source: "conversation" as const
      }))
    });
  }
};

// ============================================================================
// OUTLINE MODE TOOLS
// ============================================================================

export const outlineCreateTool: MCPToolDefinition = {
  name: "content.outline.create",
  description: "Create a new outline at any level (story, book, act, chapter, scene).",
  inputSchema: {
    type: "object",
    properties: {
      level: {
        type: "string",
        enum: ["story", "book", "act", "chapter", "scene"],
        description: "The level of outline to create"
      },
      parent_id: {
        type: "string",
        description: "Optional: Parent outline ID for nested outlines (e.g., act under book)"
      },
      initial_concept: {
        type: "string",
        description: "Optional: Initial concept or title for the outline"
      }
    },
    required: ["level"]
  },
  handler: async (input: unknown, context: MCPToolContext): Promise<OutlineCreateOutput> => {
    const typedInput = input as {
      level: OutlineLevel;
      parent_id?: string;
      initial_concept?: string;
    };

    return outlineService.createOutline(
      {
        level: typedInput.level,
        parentId: typedInput.parent_id,
        initialConcept: typedInput.initial_concept
      },
      context.projectId
    );
  }
};

export const outlineDevelopTool: MCPToolDefinition = {
  name: "content.outline.develop",
  description: "Continue developing an outline through conversation.",
  inputSchema: {
    type: "object",
    properties: {
      session_id: {
        type: "string",
        description: "The session ID from content.outline.create"
      },
      user_input: {
        type: "string",
        description: "The user's response or outline content"
      }
    },
    required: ["session_id", "user_input"]
  },
  handler: async (input: unknown, context: MCPToolContext): Promise<OutlineDevelopOutput> => {
    const typedInput = input as { session_id: string; user_input: string };
    return outlineService.developOutline({
      sessionId: typedInput.session_id,
      userInput: typedInput.user_input
    });
  }
};

// ============================================================================
// STUDIO MODE TOOLS
// ============================================================================

export const studioContextAssembleTool: MCPToolDefinition = {
  name: "studio.context.assemble",
  description: "Assemble full context for a scene before writing, including POV character, present characters, location, and promises.",
  inputSchema: {
    type: "object",
    properties: {
      scene_id: {
        type: "string",
        description: "The scene outline ID to assemble context for"
      }
    },
    required: ["scene_id"]
  },
  handler: async (input: unknown, context: MCPToolContext): Promise<ContextAssembleOutput> => {
    const typedInput = input as ContextAssembleInput;
    return studioService.assembleContext(typedInput);
  }
};

export const studioBeatWriteTool: MCPToolDefinition = {
  name: "studio.beat.write",
  description: "Write a specific beat of a scene with AI assistance.",
  inputSchema: {
    type: "object",
    properties: {
      scene_id: {
        type: "string",
        description: "The scene ID"
      },
      beat_number: {
        type: "number",
        description: "The beat number to write (0-indexed)"
      },
      user_guidance: {
        type: "string",
        description: "Optional: Specific guidance or adjustments for the beat"
      }
    },
    required: ["scene_id", "beat_number"]
  },
  handler: async (input: unknown, context: MCPToolContext): Promise<BeatWriteOutput> => {
    const typedInput = input as BeatWriteInput;
    return studioService.writeBeat(typedInput);
  }
};

export const studioConsistencyCheckTool: MCPToolDefinition = {
  name: "studio.consistency.check",
  description: "Check prose for consistency issues including voice drift, knowledge violations, and arc inconsistencies.",
  inputSchema: {
    type: "object",
    properties: {
      prose: {
        type: "string",
        description: "The prose to check"
      },
      context: {
        type: "object",
        description: "The studio context assembled for the scene"
      }
    },
    required: ["prose", "context"]
  },
  handler: async (input: unknown, context: MCPToolContext): Promise<ConsistencyCheckOutput> => {
    const typedInput = input as ConsistencyCheckInput;
    return studioService.checkConsistency(typedInput);
  }
};

// ============================================================================
// PROFILE EXTRACTION TOOLS
// ============================================================================

export const extractFromProseTool: MCPToolDefinition = {
  name: "content.extract.from_prose",
  description: "Extract profile-relevant information from written prose, including character discoveries, relationship updates, and knowledge changes.",
  inputSchema: {
    type: "object",
    properties: {
      prose: {
        type: "string",
        description: "The prose to extract from"
      },
      characters_involved: {
        type: "array",
        items: { type: "string" },
        description: "IDs of characters involved in this prose"
      },
      location: {
        type: "string",
        description: "Optional: Location ID where the scene takes place"
      }
    },
    required: ["prose", "characters_involved"]
  },
  handler: async (input: unknown, context: MCPToolContext): Promise<ExtractFromProseOutput> => {
    const typedInput = input as ExtractFromProseInput;
    return studioService.extractFromProse(typedInput);
  }
};

export const updateApplyTool: MCPToolDefinition = {
  name: "content.update.apply",
  description: "Apply or queue profile updates extracted from writing sessions.",
  inputSchema: {
    type: "object",
    properties: {
      updates: {
        type: "array",
        description: "Profile updates to apply",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            entry_id: { type: "string" },
            field_path: { type: "string" },
            new_value: {}
          }
        }
      },
      auto_apply: {
        type: "boolean",
        description: "Whether to auto-apply minor updates without approval"
      }
    },
    required: ["updates", "auto_apply"]
  },
  handler: async (input: unknown, context: MCPToolContext): Promise<UpdateApplyOutput> => {
    // Mock implementation - in production would update database
    const typedInput = input as UpdateApplyInput;
    const applied = typedInput.autoApply ? typedInput.updates : [];
    const pendingApproval = typedInput.autoApply ? [] : typedInput.updates;

    return {
      applied,
      pendingApproval,
      conflicts: []
    };
  }
};

// ============================================================================
// TOOL REGISTRY
// ============================================================================

export const contentDevelopmentTools: MCPToolDefinition[] = [
  // Discovery
  discoveryStartTool,
  discoveryRespondTool,

  // Development
  profileDevelopTool,
  profileAnswerTool,
  profileSaveTool,

  // Outline
  outlineCreateTool,
  outlineDevelopTool,

  // Studio
  studioContextAssembleTool,
  studioBeatWriteTool,
  studioConsistencyCheckTool,

  // Extraction
  extractFromProseTool,
  updateApplyTool
];

/**
 * Get all content development tools for MCP registration
 */
export function getContentDevelopmentTools(): MCPToolDefinition[] {
  return contentDevelopmentTools;
}

/**
 * Execute a content development tool by name
 */
export async function executeContentTool(
  toolName: string,
  input: unknown,
  context: MCPToolContext
): Promise<unknown> {
  const tool = contentDevelopmentTools.find(t => t.name === toolName);
  if (!tool) {
    throw new Error(`Unknown content development tool: ${toolName}`);
  }
  return tool.handler(input, context);
}
