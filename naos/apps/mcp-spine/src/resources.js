const { ERROR_CODES } = require("./errors");
const { roleHasScope } = require("./scopes");

const RESOURCE_CATALOG = [
  {
    uri: "story://project/uncharted-stars/canon",
    description: "Canonical narrative summary for Uncharted Stars.",
    scope: "read:story",
    mimeType: "application/json",
    resolver: () => ({
      projectId: "uncharted-stars",
      canonStatus: "canon",
      updatedAt: new Date().toISOString(),
      summary: "Foundation scaffold; canonical events not yet loaded.",
      tags: ["canon", "summary"],
      version: 1,
    }),
  },
  {
    uri: "story://project/uncharted-stars/drafts",
    description: "Draft narrative summary for Uncharted Stars.",
    scope: "read:story",
    mimeType: "application/json",
    resolver: () => ({
      projectId: "uncharted-stars",
      draftCount: 0,
      updatedAt: new Date().toISOString(),
      tags: ["drafts"],
    }),
  },
  {
    uri: "story://audio/voice-profiles",
    description: "Voice profile overview for audio engine.",
    scope: "read:audio",
    mimeType: "application/json",
    resolver: () => ({
      voiceProfiles: [],
      updatedAt: new Date().toISOString(),
      tags: ["audio", "voices"],
    }),
  },
];

function listResources() {
  return RESOURCE_CATALOG.map(({ uri, description, scope, mimeType }) => ({
    uri,
    description,
    scope,
    mimeType,
  }));
}

function readResource({ uri, role }) {
  if (!uri || typeof uri !== "string") {
    return {
      error: ERROR_CODES.internal,
      data: { reason: "missing_uri" },
    };
  }

  const resource = RESOURCE_CATALOG.find((item) => item.uri === uri);
  if (!resource) {
    return {
      error: ERROR_CODES.resourceDenied,
      data: { uri },
    };
  }

  if (!roleHasScope(role, resource.scope)) {
    return {
      error: ERROR_CODES.resourceDenied,
      data: { uri, requiredScope: resource.scope },
    };
  }

  try {
    const content = resource.resolver();
    return {
      result: {
        uri: resource.uri,
        mimeType: resource.mimeType,
        content,
      },
    };
  } catch (error) {
    return {
      error: ERROR_CODES.internal,
      data: { reason: "resource_error", detail: error.message, uri },
    };
  }
}

module.exports = {
  listResources,
  readResource,
};
