import { MODEL_SCOPE_MAP_V1, type McpScope } from "../scopes/scopeMap.js";

export type ModelRegistryEntry = {
  id: string;
  label: string;
  scopes: McpScope[];
};

export const MODEL_REGISTRY_V1: ModelRegistryEntry[] = [
  {
    id: "opus",
    label: "Claude Opus",
    scopes: MODEL_SCOPE_MAP_V1.opus,
  },
  {
    id: "sonnet",
    label: "Claude Sonnet",
    scopes: MODEL_SCOPE_MAP_V1.sonnet,
  },
  {
    id: "haiku",
    label: "Claude Haiku",
    scopes: MODEL_SCOPE_MAP_V1.haiku,
  },
];

export const getModelScopes = (modelId: string | undefined) => {
  if (!modelId) {
    return [];
  }

  return MODEL_REGISTRY_V1.find((entry) => entry.id === modelId)?.scopes ?? [];
};
