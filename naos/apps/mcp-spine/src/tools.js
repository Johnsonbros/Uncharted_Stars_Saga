const { ERROR_CODES } = require("./errors");
const { roleHasScope } = require("./scopes");
const { createProposal } = require("./proposals");

const TOOL_DEFINITIONS = [
  {
    name: "scene.propose_patch",
    description: "Propose a patch to an existing scene.",
    scope: "write:proposal",
  },
  {
    name: "event.propose_add",
    description: "Propose a new narrative event.",
    scope: "write:proposal",
  },
  {
    name: "continuity.check",
    description: "Analyze continuity within a scope.",
    scope: "analyze:continuity",
  },
  {
    name: "diff.semantic",
    description: "Compute semantic diffs between versions.",
    scope: "read:story",
  },
  {
    name: "listener_confusion.audit",
    description: "Audit scenes for audio listener confusion risks.",
    scope: "analyze:confusion",
  },
  {
    name: "audio_packet.generate",
    description: "Generate an audio recording packet for a chapter.",
    scope: "read:audio",
  },
];

function listTools() {
  return TOOL_DEFINITIONS.map(({ name, description }) => ({ name, description }));
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

  const { role: _role, name: _name, ...payload } = params || {};

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
          status: "stubbed",
          issues: [],
          scope: params?.scope || "scene",
          targetId: params?.targetId || null,
        },
      };
    case "diff.semantic":
      return {
        result: {
          status: "stubbed",
          summary: "Semantic diff generation is pending implementation.",
          versionA: params?.versionA || null,
          versionB: params?.versionB || null,
        },
      };
    case "listener_confusion.audit":
      return {
        result: {
          status: "stubbed",
          score: 0,
          issues: [],
          sceneId: params?.sceneId || null,
        },
      };
    case "audio_packet.generate":
      return {
        result: {
          status: "stubbed",
          packetId: `pkt_${Date.now()}`,
          chapterId: params?.chapterId || null,
          voiceProfileId: params?.voiceProfileId || null,
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
