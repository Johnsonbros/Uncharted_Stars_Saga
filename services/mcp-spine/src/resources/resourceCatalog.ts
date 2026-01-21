export type McpResourceDefinition = {
  id: string;
  name: string;
  description: string;
  scopes: string[];
  version: string;
};

export const RESOURCE_CATALOG_V1: McpResourceDefinition[] = [
  {
    id: "narrative.events",
    name: "Narrative Event Index",
    description:
      "Read-only catalog of canon and draft narrative events with dependency metadata.",
    scopes: ["narrative:read"],
    version: "v1",
  },
  {
    id: "narrative.canon",
    name: "Canon State Snapshot",
    description:
      "Snapshot of immutable canon state used for continuity and proposal validation.",
    scopes: ["narrative:read"],
    version: "v1",
  },
  {
    id: "narrative.knowledge_snapshots",
    name: "Knowledge State Snapshots",
    description:
      "Temporal knowledge state summaries for listener cognition checks and recap tooling.",
    scopes: ["narrative:read"],
    version: "v1",
  },
];
