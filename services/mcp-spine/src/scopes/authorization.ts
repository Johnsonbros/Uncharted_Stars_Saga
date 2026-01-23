import { getModelScopes } from "../models/modelRegistry.js";
import { getRoleScopes } from "./scopeUtils.js";

export const isAuthorizedForScope = (
  scope: string,
  role?: string,
  model?: string,
) => {
  const roleScopes = getRoleScopes(role);
  const modelScopes = getModelScopes(model);

  // If both role and model are provided, require BOTH to have the scope (defense-in-depth)
  if (role && model) {
    const roleHasScope = roleScopes.includes(scope as any);
    const modelHasScope = modelScopes.includes(scope as any);
    return roleHasScope && modelHasScope;
  }

  // If only role is provided, check role scopes
  if (role) {
    return roleScopes.includes(scope as any);
  }

  // If only model is provided, check model scopes
  if (model) {
    return modelScopes.includes(scope as any);
  }

  // No role or model provided - deny access
  return false;
};
