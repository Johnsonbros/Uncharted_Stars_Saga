import { getModelScopes } from "../models/modelRegistry.js";
import { getRoleScopes } from "./scopeUtils.js";

export const isAuthorizedForScope = (
  scope: string,
  role?: string,
  model?: string,
) => {
  const scopes = new Set([...getRoleScopes(role), ...getModelScopes(model)]);
  return scopes.has(scope);
};
