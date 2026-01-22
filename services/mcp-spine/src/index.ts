import { createServer } from "http";
import { randomUUID } from "crypto";
import { loadConfig } from "./config.js";
import { createLogger } from "./logger.js";
import { RESOURCE_CATALOG_V1 } from "./resources/resourceCatalog.js";
import { resolveResource } from "./resources/resourceResolver.js";
import { ProposalStore } from "./proposals/proposalStore.js";
import { ProposalTool } from "./tools/proposalTool.js";
import { AudioTools } from "./tools/audioTools.js";
import { isAuthorizedForScope } from "./scopes/authorization.js";
import { RateLimiter } from "./rateLimit.js";

const config = loadConfig();
const logger = createLogger({
  level: config.logLevel,
  serviceName: config.serviceName,
});

const proposalStore = new ProposalStore();
const proposalTool = new ProposalTool(proposalStore, logger);
const audioTools = new AudioTools(logger);
const rateLimiter = new RateLimiter(config.rateLimitPerMinute, 60_000);

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
  requestId?: string,
) => {
  const payload = requestId ? { request_id: requestId, ...body } : body;
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
};

const getRequestId = (request: import("http").IncomingMessage) => {
  const header = request.headers["x-request-id"];
  if (typeof header === "string" && header.trim().length > 0) {
    return header;
  }
  return randomUUID();
};

const getAccessToken = (request: import("http").IncomingMessage) => {
  const header = request.headers.authorization;
  if (!header) {
    return undefined;
  }
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer") {
    return undefined;
  }
  return token;
};

const requiresAuth = (pathname: string) =>
  pathname.startsWith("/mcp/resources/resolve") ||
  pathname.startsWith("/mcp/tools");

const isAuthorizedForToken = (request: import("http").IncomingMessage) => {
  if (!config.accessToken) {
    return true;
  }
  const token = getAccessToken(request);
  return token === config.accessToken;
};

const getRateLimitKey = (
  scope: string,
  role: string | undefined,
  model: string | undefined,
  request: import("http").IncomingMessage,
) => {
  const ip = request.socket.remoteAddress ?? "unknown";
  return `${scope}:${role ?? "unknown"}:${model ?? "unknown"}:${ip}`;
};

const server = createServer(async (request, response) => {
  if (!request.url) {
    writeJson(response, 400, { error: "Missing request URL." });
    return;
  }

  const requestId = getRequestId(request);
  const url = new URL(request.url, `http://${request.headers.host}`);
  logger.info("request.received", {
    request_id: requestId,
    method: request.method,
    path: url.pathname,
  });

  if (requiresAuth(url.pathname) && !isAuthorizedForToken(request)) {
    writeJson(response, 401, { error: "Unauthorized request token." }, requestId);
    return;
  }

  if (request.method === "GET" && url.pathname === "/health") {
    writeJson(response, 200, {
      status: "ok",
      service: config.serviceName,
      environment: config.environment,
    }, requestId);
    return;
  }

  if (request.method === "GET" && url.pathname === "/mcp/handshake") {
    writeJson(response, 200, {
      protocol_version: "v1",
      server_version: "0.0.1",
      resource_catalog_version: "v1",
    }, requestId);
    return;
  }

  if (request.method === "GET" && url.pathname === "/mcp/resources") {
    writeJson(response, 200, {
      version: "v1",
      resources: RESOURCE_CATALOG_V1,
    }, requestId);
    return;
  }

  if (request.method === "POST" && url.pathname === "/mcp/resources/resolve") {
    const payload = await readJsonBody(request);
    const resourceId = payload?.resource_id as string | undefined;
    const role = payload?.role as string | undefined;
    const model = payload?.model as string | undefined;

    if (!resourceId) {
      writeJson(response, 400, { error: "resource_id is required." }, requestId);
      return;
    }

    const rateLimit = rateLimiter.check(
      getRateLimitKey("resource:resolve", role, model, request),
    );
    if (!rateLimit.allowed) {
      logger.warn("request.rate_limited", {
        request_id: requestId,
        scope: "resource:resolve",
        role,
        model,
        reset_at: rateLimit.resetAt,
      });
      writeJson(
        response,
        429,
        {
          error: "Rate limit exceeded.",
          reset_at: rateLimit.resetAt,
        },
        requestId,
      );
      return;
    }

    try {
      const result = await resolveResource({ resourceId, role, model });
      writeJson(response, 200, result, requestId);
    } catch (error) {
      writeJson(response, 403, {
        error: (error as Error).message,
      }, requestId);
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
      }, requestId);
      return;
    }

    const rateLimit = rateLimiter.check(
      getRateLimitKey("proposal:create", role, model, request),
    );
    if (!rateLimit.allowed) {
      logger.warn("request.rate_limited", {
        request_id: requestId,
        scope: "proposal:create",
        role,
        model,
        reset_at: rateLimit.resetAt,
      });
      writeJson(
        response,
        429,
        {
          error: "Rate limit exceeded.",
          reset_at: rateLimit.resetAt,
        },
        requestId,
      );
      return;
    }

    const title = payload?.title as string | undefined;
    const author = payload?.author as Record<string, unknown> | undefined;
    const proposalPayload = payload?.payload as Record<string, unknown> | undefined;

    if (!title || !author || !proposalPayload) {
      writeJson(response, 400, {
        error: "title, author, and payload are required.",
      }, requestId);
      return;
    }

    const toolResponse = await proposalTool.createProposal({
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

    writeJson(response, 200, toolResponse, requestId);
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/mcp/tools/proposals/apply"
  ) {
    const payload = await readJsonBody(request);
    const role = payload?.role as string | undefined;
    const model = payload?.model as string | undefined;

    if (!isAuthorizedForScope("proposal:apply", role, model)) {
      writeJson(response, 403, {
        error: "Unauthorized to apply proposals.",
      }, requestId);
      return;
    }

    const rateLimit = rateLimiter.check(
      getRateLimitKey("proposal:apply", role, model, request),
    );
    if (!rateLimit.allowed) {
      logger.warn("request.rate_limited", {
        request_id: requestId,
        scope: "proposal:apply",
        role,
        model,
        reset_at: rateLimit.resetAt,
      });
      writeJson(
        response,
        429,
        {
          error: "Rate limit exceeded.",
          reset_at: rateLimit.resetAt,
        },
        requestId,
      );
      return;
    }

    const proposalId = payload?.proposal_id as string | undefined;
    if (!proposalId) {
      writeJson(response, 400, { error: "proposal_id is required." }, requestId);
      return;
    }

    const applyResponse = await proposalTool.applyProposal(proposalId);
    if (!applyResponse) {
      writeJson(response, 404, { error: "Proposal not found." }, requestId);
      return;
    }

    writeJson(response, 200, applyResponse, requestId);
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/mcp/tools/audio/generate"
  ) {
    const payload = await readJsonBody(request);
    const role = payload?.role as string | undefined;
    const model = payload?.model as string | undefined;

    if (!isAuthorizedForScope("audio:generate", role, model)) {
      writeJson(response, 403, {
        error: "Unauthorized to generate audio packets.",
      }, requestId);
      return;
    }

    const rateLimit = rateLimiter.check(
      getRateLimitKey("audio:generate", role, model, request),
    );
    if (!rateLimit.allowed) {
      logger.warn("request.rate_limited", {
        request_id: requestId,
        scope: "audio:generate",
        role,
        model,
        reset_at: rateLimit.resetAt,
      });
      writeJson(
        response,
        429,
        {
          error: "Rate limit exceeded.",
          reset_at: rateLimit.resetAt,
        },
        requestId,
      );
      return;
    }

    const sceneId = payload?.scene_id as string | undefined;
    const scene = payload?.scene as Record<string, unknown> | undefined;
    const profiles = payload?.profiles as Record<string, unknown>[] | undefined;
    const requestedBy = payload?.requested_by as string | undefined;

    if (!sceneId || !scene || !profiles || !requestedBy) {
      writeJson(response, 400, {
        error: "scene_id, scene, profiles, and requested_by are required.",
      }, requestId);
      return;
    }

    const audioResponse = await audioTools.generateAudioPacket({
      sceneId,
      scene: scene as any,
      profiles: profiles as any,
      requestedBy,
      requestId,
    });

    const statusCode = audioResponse.success ? 200 : 400;
    writeJson(response, statusCode, audioResponse, requestId);
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/mcp/tools/audio/audit"
  ) {
    const payload = await readJsonBody(request);
    const role = payload?.role as string | undefined;
    const model = payload?.model as string | undefined;

    if (!isAuthorizedForScope("audio:audit", role, model)) {
      writeJson(response, 403, {
        error: "Unauthorized to audit audio scenes.",
      }, requestId);
      return;
    }

    const rateLimit = rateLimiter.check(
      getRateLimitKey("audio:audit", role, model, request),
    );
    if (!rateLimit.allowed) {
      logger.warn("request.rate_limited", {
        request_id: requestId,
        scope: "audio:audit",
        role,
        model,
        reset_at: rateLimit.resetAt,
      });
      writeJson(
        response,
        429,
        {
          error: "Rate limit exceeded.",
          reset_at: rateLimit.resetAt,
        },
        requestId,
      );
      return;
    }

    const sceneId = payload?.scene_id as string | undefined;
    const scene = payload?.scene as Record<string, unknown> | undefined;
    const beatMarkers = payload?.beat_markers as Record<string, unknown>[] | undefined;
    const requestedBy = payload?.requested_by as string | undefined;

    if (!sceneId || !scene || !requestedBy) {
      writeJson(response, 400, {
        error: "scene_id, scene, and requested_by are required.",
      }, requestId);
      return;
    }

    const auditResponse = await audioTools.auditListenerConfusion({
      sceneId,
      scene: scene as any,
      beatMarkers: beatMarkers as any,
      requestedBy,
      requestId,
    });

    const statusCode = auditResponse.success ? 200 : 400;
    writeJson(response, statusCode, auditResponse, requestId);
    return;
  }

  writeJson(response, 404, { error: "Route not found." }, requestId);
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
