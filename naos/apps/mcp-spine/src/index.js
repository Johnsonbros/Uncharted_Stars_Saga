const http = require("http");

const { ERROR_CODES, toJsonRpcError } = require("./errors");
const { listResources, readResource } = require("./resources");
const { listTools, callTool } = require("./tools");
const { listPrompts, getPrompt } = require("./prompts");
const { listAuditLog, transitionProposal, getProposal } = require("./proposals");
const { ROLE_SCOPES, getScopesForRole } = require("./scopes");

const PORT = process.env.MCP_SPINE_PORT || 4040;
const MCP_VERSION = "0.1";

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function jsonRpcResponse(id, result) {
  return JSON.stringify({ jsonrpc: "2.0", id, result });
}

function jsonRpcErrorResponse(id, error) {
  return JSON.stringify({ jsonrpc: "2.0", id, error });
}

function getRoleFromRequest(request) {
  const configuredRole = process.env.MCP_SPINE_ROLE;
  if (configuredRole) {
    return configuredRole;
  }

  const allowOverride = process.env.MCP_SPINE_ALLOW_ROLE_OVERRIDE === "true";
  const requestedRole = request?.params?.role;
  if (allowOverride && requestedRole && ROLE_SCOPES[requestedRole]) {
    return requestedRole;
  }

  return "haiku";
}

async function handleJsonRpc(request) {
  if (!request || typeof request !== "object") {
    return jsonRpcErrorResponse(
      null,
      toJsonRpcError(ERROR_CODES.internal, { reason: "invalid_request" })
    );
  }

  const { id, method, params } = request || {};
  if (!method || typeof method !== "string") {
    return jsonRpcErrorResponse(
      id ?? null,
      toJsonRpcError(ERROR_CODES.internal, { reason: "missing_method" })
    );
  }
  const role = getRoleFromRequest(request);

  try {
    switch (method) {
      case "initialize":
        return jsonRpcResponse(id, {
          server: "naos-mcp-spine",
          version: MCP_VERSION,
          role,
          scopes: getScopesForRole(role),
        });
      case "resources/list":
        return jsonRpcResponse(id, { resources: listResources() });
      case "resources/read": {
        const { result, error, data } = readResource({ uri: params?.uri, role });
        if (error) {
          return jsonRpcErrorResponse(id, toJsonRpcError(error, data));
        }
        return jsonRpcResponse(id, result);
      }
      case "tools/list":
        return jsonRpcResponse(id, { tools: listTools() });
      case "tools/call": {
        const { result, error, data } = callTool({ name: params?.name, params, role });
        if (error) {
          return jsonRpcErrorResponse(id, toJsonRpcError(error, data));
        }
        return jsonRpcResponse(id, result);
      }
      case "prompts/list":
        return jsonRpcResponse(id, { prompts: listPrompts() });
      case "prompts/get": {
        const prompt = getPrompt({ name: params?.name });
        if (!prompt) {
          return jsonRpcErrorResponse(
            id,
            toJsonRpcError(ERROR_CODES.internal, { reason: "prompt_not_found" })
          );
        }
        return jsonRpcResponse(id, prompt);
      }
      case "proposals/transition": {
        const { result, error, data } = transitionProposal({
          proposalId: params?.proposalId,
          nextStatus: params?.nextStatus,
          actor: role,
        });
        if (error) {
          return jsonRpcErrorResponse(id, toJsonRpcError(error, data));
        }
        return jsonRpcResponse(id, result);
      }
      case "proposals/get": {
        const proposal = getProposal({ proposalId: params?.proposalId });
        return jsonRpcResponse(id, { proposal });
      }
      case "audit/log":
        return jsonRpcResponse(id, { audit: listAuditLog({ proposalId: params?.proposalId }) });
      default:
        return jsonRpcErrorResponse(
          id,
          toJsonRpcError(ERROR_CODES.internal, { reason: "unknown_method", method })
        );
    }
  } catch (error) {
    return jsonRpcErrorResponse(id, toJsonRpcError(ERROR_CODES.internal, { detail: error.message }));
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    const payload = await parseBody(req);
    const response = await handleJsonRpc(payload);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(response);
  } catch (error) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(
      jsonRpcErrorResponse(null, toJsonRpcError(ERROR_CODES.internal, { detail: error.message }))
    );
  }
});

server.listen(PORT, () => {
  console.log(`MCP spine listening on port ${PORT}`);
});
