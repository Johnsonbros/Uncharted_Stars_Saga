import { RESOURCE_CATALOG_V1 } from "./resourceCatalog.js";
import { getRoleScopes } from "../scopes/scopeUtils.js";
import { getModelScopes } from "../models/modelRegistry.js";
import { getResourcePayload } from "./resourceData.js";

export type ResourceResolveRequest = {
  resourceId: string;
  role?: string;
  model?: string;
};

export type ResourceResolveResult = {
  resourceId: string;
  version: string;
  data: Record<string, unknown>;
  metadata: {
    generated_at: string;
    source_commit: string;
  };
};

const SOURCE_COMMIT = process.env.SOURCE_COMMIT ?? "unknown";

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

export const resolveResource = async (
  request: ResourceResolveRequest,
): Promise<ResourceResolveResult> => {
  const resource = RESOURCE_CATALOG_V1.find(
    (entry) => entry.id === request.resourceId,
  );

  if (!resource) {
    throw new Error(`Unknown resource: ${request.resourceId}`);
  }

  if (!isAuthorized(request.resourceId, request.role, request.model)) {
    throw new Error(`Unauthorized to access resource: ${request.resourceId}`);
  }

  const payload = await getResourcePayload(resource.id);

  return {
    resourceId: resource.id,
    version: resource.version,
    data: payload,
    metadata: {
      generated_at: new Date().toISOString(),
      source_commit: SOURCE_COMMIT,
    },
  };
};
