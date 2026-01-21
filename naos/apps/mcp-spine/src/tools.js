const { ERROR_CODES } = require("./errors");
const { roleHasScope } = require("./scopes");
const { createProposal } = require("./proposals");

const TOOL_DEFINITIONS = [
  {
    name: "scene.propose_patch",
    description: "Propose a patch to an existing scene.",
    scope: "write:proposal",
    inputSchema: {
      required: ["sceneId", "changes"],
      properties: {
        sceneId: { type: "string" },
        changes: { type: "array" },
        reason: { type: "string" },
      },
    },
  },
  {
    name: "event.propose_add",
    description: "Propose a new narrative event.",
    scope: "write:proposal",
    inputSchema: {
      required: ["event", "dependencies"],
      properties: {
        event: { type: "object" },
        dependencies: { type: "array" },
        reason: { type: "string" },
      },
    },
  },
  {
    name: "continuity.check",
    description: "Analyze continuity within a scope.",
    scope: "analyze:continuity",
    inputSchema: {
      required: ["scope"],
      properties: {
        scope: { type: "string" },
        targetId: { type: "string" },
        notes: { type: "array" },
      },
    },
  },
  {
    name: "diff.semantic",
    description: "Compute semantic diffs between versions.",
    scope: "read:story",
    inputSchema: {
      required: ["versionA", "versionB"],
      properties: {
        versionA: { type: "string" },
        versionB: { type: "string" },
        focus: { type: "string" },
      },
    },
  },
  {
    name: "listener_confusion.audit",
    description: "Audit scenes for audio listener confusion risks.",
    scope: "analyze:confusion",
    inputSchema: {
      required: ["sceneId"],
      properties: {
        sceneId: { type: "string" },
        narrationStyle: { type: "string" },
      },
    },
  },
  {
    name: "audio_packet.generate",
    description: "Generate an audio recording packet for a chapter.",
    scope: "read:audio",
    inputSchema: {
      required: ["chapterId"],
      properties: {
        chapterId: { type: "string" },
        voiceProfileId: { type: "string" },
        narrator: { type: "string" },
      },
    },
  },
];

function listTools() {
  return TOOL_DEFINITIONS.map(({ name, description, inputSchema, scope }) => ({
    name,
    description,
    inputSchema,
    scope,
  }));
}

function validateToolInput({ tool, params }) {
  const issues = [];
  const payload = params || {};

  if (!tool?.inputSchema) {
    return { valid: true, issues: [] };
  }

  const { required = [], properties = {} } = tool.inputSchema;
  required.forEach((field) => {
    if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
      issues.push(`${field} is required`);
    }
  });

  Object.entries(properties).forEach(([field, schema]) => {
    if (payload[field] === undefined || payload[field] === null) {
      return;
    }
    if (schema.type === "array" && !Array.isArray(payload[field])) {
      issues.push(`${field} must be an array`);
      return;
    }
    if (schema.type === "string" && typeof payload[field] !== "string") {
      issues.push(`${field} must be a string`);
      return;
    }
    if (schema.type === "object") {
      if (typeof payload[field] !== "object" || Array.isArray(payload[field])) {
        issues.push(`${field} must be an object`);
      }
    }
  });

  return { valid: issues.length === 0, issues };
}

function callTool({ name, params, role }) {
  const tool = TOOL_DEFINITIONS.find((item) => item.name === name);
  if (!tool) {
    return {
      error: ERROR_CODES.internal,
      data: { reason: "tool_not_found", toolName: name },
    };
  }

  if (!roleHasScope(role, tool.scope)) {
    return {
      error: ERROR_CODES.unauthorizedScope,
      data: { requiredScope: tool.scope, toolName: name },
    };
  }

  const validation = validateToolInput({ tool, params });
  if (!validation.valid) {
    return {
      error: ERROR_CODES.invalidProposal,
      data: { issues: validation.issues, toolName: name },
    };
  }

  const { role: _role, name: _name, ...payload } = params || {};
  const issuedAt = new Date().toISOString();

  switch (name) {
    case "scene.propose_patch":
    case "event.propose_add":
      return createProposal({
        toolName: name,
        payload,
        submittedBy: role,
      });
    case "continuity.check":
      return {
        result: {
          status: "ok",
          issues: [],
          scope: payload.scope,
          targetId: payload.targetId || null,
          notes: Array.isArray(payload.notes) ? payload.notes : [],
          issuedAt,
        },
      };
    case "diff.semantic":
      return {
        result: {
          status: "ok",
          summary: `Semantic diff placeholders for ${payload.versionA} → ${payload.versionB}.`,
          versionA: payload.versionA,
          versionB: payload.versionB,
          focus: payload.focus || "story",
          issuedAt,
        },
      };
    case "listener_confusion.audit":
      return {
        result: {
          status: "ok",
          score: 0,
          issues: [],
          sceneId: payload.sceneId,
          narrationStyle: payload.narrationStyle || "neutral",
          issuedAt,
        },
      };
    case "audio_packet.generate":
      return {
        result: {
          status: "ok",
          packetId: `pkt_${Date.now()}`,
          chapterId: payload.chapterId,
          voiceProfileId: payload.voiceProfileId || "default",
          narrator: payload.narrator || "system",
          issuedAt,
          segments: [
            {
              id: "intro",
              label: "Chapter intro",
              durationSec: 20,
            },
            {
              id: "body",
              label: "Primary narrative",
              durationSec: 300,
            },
            {
              id: "outro",
              label: "Chapter outro",
              durationSec: 15,
            },
          ],
        },
      };
    default:
      return {
        error: ERROR_CODES.internal,
        data: { reason: "unhandled_tool", toolName: name },
      };
  }
}

module.exports = {
  listTools,
  callTool,
};
