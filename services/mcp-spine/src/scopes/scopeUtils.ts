import { ROLE_SCOPE_MAP_V1 } from "./scopeMap.js";

export const getRoleScopes = (role?: string) => {
  if (!role) {
    return [];
  }

  return ROLE_SCOPE_MAP_V1.find((entry) => entry.role === role)?.scopes ?? [];
};
