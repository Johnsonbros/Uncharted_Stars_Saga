import { createServer } from "http";
import { loadConfig } from "./config.js";
import { createLogger } from "./logger.js";
import { RESOURCE_CATALOG_V1 } from "./resources/resourceCatalog.js";
import { resolveResource } from "./resources/resourceResolver.js";
import { ProposalStore } from "./proposals/proposalStore.js";
import { ProposalTool } from "./tools/proposalTool.js";
import { getRoleScopes } from "./scopes/scopeUtils.js";
import { getModelScopes } from "./models/modelRegistry.js";

const config = loadConfig();
const logger = createLogger({
  level: config.logLevel,
  serviceName: config.serviceName,
});

const proposalStore = new ProposalStore();
const proposalTool = new ProposalTool(proposalStore, logger);

const readJsonBody = async (request: import("http").IncomingMessage) => {
  const chunks: Uint8Array[] = [];
  for await (const chunk of request) {
    chunks.push(chunk as Uint8Array);
  }
  if (chunks.length === 0) {
    return null;
  }
  const text = Buffer.concat(chunks).toString("utf-8");
  return JSON.parse(text) as Record<string, unknown>;
};

const writeJson = (
  response: import("http").ServerResponse,
  statusCode: number,
  body: Record<string, unknown>,
) => {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
};

const isAuthorizedForScope = (scope: string, role?: string, model?: string) => {
  const scopes = new Set([...getRoleScopes(role), ...getModelScopes(model)]);
  return scopes.has(scope);
};

const server = createServer(async (request, response) => {
  if (!request.url) {
    writeJson(response, 400, { error: "Missing request URL." });
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host}`);
  if (request.method === "GET" && url.pathname === "/health") {
    writeJson(response, 200, {
      status: "ok",
      service: config.serviceName,
      environment: config.environment,
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/mcp/handshake") {
    writeJson(response, 200, {
      protocol_version: "v1",
      server_version: "0.0.1",
      resource_catalog_version: "v1",
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/mcp/resources") {
    writeJson(response, 200, {
      version: "v1",
      resources: RESOURCE_CATALOG_V1,
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/mcp/resources/resolve") {
    const payload = await readJsonBody(request);
    const resourceId = payload?.resource_id as string | undefined;
    const role = payload?.role as string | undefined;
    const model = payload?.model as string | undefined;

    if (!resourceId) {
      writeJson(response, 400, { error: "resource_id is required." });
      return;
    }

    try {
      const result = resolveResource({ resourceId, role, model });
      writeJson(response, 200, result);
    } catch (error) {
      writeJson(response, 403, {
        error: (error as Error).message,
      });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/mcp/tools/proposals") {
    const payload = await readJsonBody(request);
    const role = payload?.role as string | undefined;
    const model = payload?.model as string | undefined;

    if (!isAuthorizedForScope("proposal:create", role, model)) {
      writeJson(response, 403, {
        error: "Unauthorized to create proposals.",
      });
      return;
    }

    const title = payload?.title as string | undefined;
    const author = payload?.author as Record<string, unknown> | undefined;
    const proposalPayload = payload?.payload as Record<string, unknown> | undefined;

    if (!title || !author || !proposalPayload) {
      writeJson(response, 400, {
        error: "title, author, and payload are required.",
      });
      return;
    }

    const toolResponse = proposalTool.createProposal({
      title,
      author: author as {
        model: string;
        role: string;
        request_id?: string;
      },
      payload: proposalPayload as {
        canon_events: {
          event_id: string;
          type: string;
          dependencies: string[];
          content: Record<string, unknown>;
        }[];
      },
    });

    writeJson(response, 200, toolResponse);
    return;
  }

  writeJson(response, 404, { error: "Route not found." });
});

server.listen(config.port, () => {
  logger.info("MCP spine server listening.", {
    environment: config.environment,
    port: config.port,
  });

  if (config.startupWarnings.length > 0) {
    for (const warning of config.startupWarnings) {
      logger.warn("Startup configuration warning.", { warning });
    }
  }
});
