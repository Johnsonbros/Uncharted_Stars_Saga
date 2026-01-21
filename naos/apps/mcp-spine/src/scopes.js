const ROLE_SCOPES = {
  opus: ["read:story", "read:audio", "write:proposal", "analyze:continuity"],
  sonnet: ["read:story", "read:audio", "write:proposal", "analyze:confusion"],
  haiku: ["read:story"],
  creator: [
    "read:story",
    "read:audio",
    "write:proposal",
    "write:draft",
    "analyze:continuity",
    "analyze:confusion",
    "apply:canon",
  ],
};

function getScopesForRole(role) {
  return ROLE_SCOPES[role] || [];
}

function roleHasScope(role, scope) {
  return getScopesForRole(role).includes(scope);
}

module.exports = {
  ROLE_SCOPES,
  getScopesForRole,
  roleHasScope,
};
