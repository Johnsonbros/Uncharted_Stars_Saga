import { RESOURCE_CATALOG_V1 } from "./resourceCatalog.js";
import { getRoleScopes } from "../scopes/scopeUtils.js";
import { getModelScopes } from "../models/modelRegistry.js";

export type ResourceResolveRequest = {
  resourceId: string;
  role?: string;
  model?: string;
};

export type ResourceResolveResult = {
  resourceId: string;
  version: string;
  data: Record<string, unknown>;
};

const RESOURCE_DATA: Record<string, Record<string, unknown>> = {
  "narrative.events": { events: [] },
  "narrative.canon": { canon_version: "v1", events: [] },
  "narrative.knowledge_snapshots": { snapshots: [] },
  "audio.scene_index": { scenes: [] },
  "listener.summary": { listeners: [] },
};

const isAuthorized = (resourceId: string, role?: string, model?: string) => {
  const resource = RESOURCE_CATALOG_V1.find((entry) => entry.id === resourceId);
  if (!resource) {
    return false;
  }

  const roleScopes = getRoleScopes(role);
  const modelScopes = getModelScopes(model);
  const combinedScopes = new Set([...roleScopes, ...modelScopes]);

  return resource.scopes.every((scope) => combinedScopes.has(scope));
};

export const resolveResource = (
  request: ResourceResolveRequest,
): ResourceResolveResult => {
  const resource = RESOURCE_CATALOG_V1.find(
    (entry) => entry.id === request.resourceId,
  );

  if (!resource) {
    throw new Error(`Unknown resource: ${request.resourceId}`);
  }

  if (!isAuthorized(request.resourceId, request.role, request.model)) {
    throw new Error(`Unauthorized to access resource: ${request.resourceId}`);
  }

  return {
    resourceId: resource.id,
    version: resource.version,
    data: RESOURCE_DATA[resource.id] ?? {},
  };
};
