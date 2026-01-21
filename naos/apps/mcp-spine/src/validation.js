function validateProposal({ toolName, payload }) {
  const issues = [];

  if (!toolName) {
    issues.push("toolName is required");
  }

  if (!payload || typeof payload !== "object") {
    issues.push("payload must be an object");
  }

  if (toolName === "scene.propose_patch") {
    if (!payload.sceneId || typeof payload.sceneId !== "string") {
      issues.push("sceneId is required for scene.propose_patch");
    }
    if (!Array.isArray(payload.changes)) {
      issues.push("changes must be an array for scene.propose_patch");
    }
  }

  if (toolName === "event.propose_add") {
    if (!payload.event || typeof payload.event !== "object") {
      issues.push("event is required for event.propose_add");
    }
    if (!Array.isArray(payload.dependencies)) {
      issues.push("dependencies must be an array for event.propose_add");
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

module.exports = {
  validateProposal,
};
