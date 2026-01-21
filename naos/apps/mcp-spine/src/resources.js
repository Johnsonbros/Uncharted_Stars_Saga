const { ERROR_CODES } = require("./errors");
const { roleHasScope } = require("./scopes");

const RESOURCE_CATALOG = [
  {
    uri: "story://project/uncharted-stars/canon",
    description: "Canonical narrative summary for Uncharted Stars.",
    scope: "read:story",
    resolver: () => ({
      projectId: "uncharted-stars",
      canonStatus: "canon",
      updatedAt: new Date().toISOString(),
      summary: "Foundation scaffold; canonical events not yet loaded.",
    }),
  },
  {
    uri: "story://project/uncharted-stars/drafts",
    description: "Draft narrative summary for Uncharted Stars.",
    scope: "read:story",
    resolver: () => ({
      projectId: "uncharted-stars",
      draftCount: 0,
      updatedAt: new Date().toISOString(),
    }),
  },
  {
    uri: "story://audio/voice-profiles",
    description: "Voice profile overview for audio engine.",
    scope: "read:audio",
    resolver: () => ({
      voiceProfiles: [],
      updatedAt: new Date().toISOString(),
    }),
  },
];

function listResources() {
  return RESOURCE_CATALOG.map(({ uri, description }) => ({ uri, description }));
}

function readResource({ uri, role }) {
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

  return {
    result: {
      uri: resource.uri,
      mimeType: "application/json",
      content: resource.resolver(),
    },
  };
}

module.exports = {
  listResources,
  readResource,
};
