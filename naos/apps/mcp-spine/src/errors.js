const ERROR_CODES = {
  unauthorizedScope: {
    code: "MCP-AUT-010",
    message: "Scope is not permitted for this role.",
    severity: "SEV2",
    owner: "mcp-spine",
  },
  resourceDenied: {
    code: "MCP-AUT-011",
    message: "Resource access denied.",
    severity: "SEV2",
    owner: "mcp-spine",
  },
  invalidProposal: {
    code: "MCP-VAL-020",
    message: "Proposal schema validation failed.",
    severity: "SEV3",
    owner: "mcp-spine",
  },
  proposalState: {
    code: "MCP-STA-050",
    message: "Proposal lifecycle transition invalid.",
    severity: "SEV3",
    owner: "mcp-spine",
  },
  rateLimited: {
    code: "MCP-RAT-040",
    message: "Rate limit exceeded.",
    severity: "SEV2",
    owner: "mcp-spine",
  },
  internal: {
    code: "MCP-UNK-900",
    message: "Unexpected MCP spine error.",
    severity: "SEV1",
    owner: "mcp-spine",
  },
};

function toJsonRpcError(error, data = {}) {
  return {
    code: -32000,
    message: error.message,
    data: {
      errorCode: error.code,
      severity: error.severity,
      owner: error.owner,
      ...data,
    },
  };
}

module.exports = {
  ERROR_CODES,
  toJsonRpcError,
};
