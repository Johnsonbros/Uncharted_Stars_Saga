import { createServer } from "http";
import { randomUUID } from "crypto";
import { loadConfig } from "./config.js";
import { createLogger } from "./logger.js";
import { RESOURCE_CATALOG_V1 } from "./resources/resourceCatalog.js";
import { resolveResource } from "./resources/resourceResolver.js";
import { ProposalStore } from "./proposals/proposalStore.js";
import { ProposalTool } from "./tools/proposalTool.js";
import { AudioTools } from "./tools/audioTools.js";
import { AudioSceneManager } from "./audioSceneObject.js";
import type { BeatMarker, EmotionalPoint, DialogueAttribution, CognitionSafeguard } from "./audioSceneObject.js";
import { isAuthorizedForScope } from "./scopes/authorization.js";
import { RateLimiter } from "./rateLimit.js";
import { NarrativeSessionOrchestrator } from "./sessionOrchestrator.js";

const config = loadConfig();
const logger = createLogger({
  level: config.logLevel,
  serviceName: config.serviceName,
});

const proposalStore = new ProposalStore();
const proposalTool = new ProposalTool(proposalStore, logger);
const audioTools = new AudioTools(logger);
const audioSceneManager = new AudioSceneManager(logger);
const rateLimiter = new RateLimiter(config.rateLimitPerMinute, 60_000);

// Initialize session orchestrator (Agent SDK foundation)
let sessionOrchestrator: NarrativeSessionOrchestrator | undefined;
if (config.anthropicApiKey) {
  sessionOrchestrator = new NarrativeSessionOrchestrator(
    {
      apiKey: config.anthropicApiKey,
      model: "claude-3-5-sonnet-20241022",
      maxTokens: 4096,
      temperature: 0.7,
    },
    logger,
  );
  logger.info("Session orchestrator initialized with Agent SDK");
} else {
  logger.warn("ANTHROPIC_API_KEY not set - session orchestrator disabled");
}

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
  pathname.startsWith("/mcp/tools") ||
  pathname.startsWith("/api/audio/scenes");

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

  // Agent SDK Session Orchestrator endpoints
  if (request.method === "POST" && url.pathname === "/sessions/start") {
    if (!sessionOrchestrator) {
      writeJson(response, 503, {
        error: "Session orchestrator not available. Set ANTHROPIC_API_KEY.",
      }, requestId);
      return;
    }

    const payload = await readJsonBody(request);
    const sessionId = payload?.session_id as string | undefined;
    const projectId = payload?.project_id as string | undefined;
    const sceneId = payload?.scene_id as string | undefined;
    const metadata = payload?.metadata as Record<string, unknown> | undefined;

    if (!sessionId || !projectId) {
      writeJson(response, 400, {
        error: "session_id and project_id are required.",
      }, requestId);
      return;
    }

    try {
      await sessionOrchestrator.startSession({
        sessionId,
        projectId,
        sceneId,
        metadata,
      });

      writeJson(response, 200, {
        success: true,
        session_id: sessionId,
      }, requestId);
    } catch (error) {
      writeJson(response, 500, {
        error: (error as Error).message,
      }, requestId);
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/sessions/message") {
    if (!sessionOrchestrator) {
      writeJson(response, 503, {
        error: "Session orchestrator not available. Set ANTHROPIC_API_KEY.",
      }, requestId);
      return;
    }

    const payload = await readJsonBody(request);
    const sessionId = payload?.session_id as string | undefined;
    const message = payload?.message as string | undefined;

    if (!sessionId || !message) {
      writeJson(response, 400, {
        error: "session_id and message are required.",
      }, requestId);
      return;
    }

    try {
      const responseText = await sessionOrchestrator.sendMessage(sessionId, message);

      writeJson(response, 200, {
        success: true,
        response: responseText,
      }, requestId);
    } catch (error) {
      writeJson(response, 500, {
        error: (error as Error).message,
      }, requestId);
    }
    return;
  }

  if (request.method === "DELETE" && url.pathname === "/sessions/end") {
    if (!sessionOrchestrator) {
      writeJson(response, 503, {
        error: "Session orchestrator not available. Set ANTHROPIC_API_KEY.",
      }, requestId);
      return;
    }

    const payload = await readJsonBody(request);
    const sessionId = payload?.session_id as string | undefined;

    if (!sessionId) {
      writeJson(response, 400, {
        error: "session_id is required.",
      }, requestId);
      return;
    }

    try {
      sessionOrchestrator.endSession(sessionId);

      writeJson(response, 200, {
        success: true,
      }, requestId);
    } catch (error) {
      writeJson(response, 500, {
        error: (error as Error).message,
      }, requestId);
    }
    return;
  }

  if (request.method === "GET" && url.pathname === "/sessions/info") {
    if (!sessionOrchestrator) {
      writeJson(response, 503, {
        error: "Session orchestrator not available. Set ANTHROPIC_API_KEY.",
      }, requestId);
      return;
    }

    const sessionId = url.searchParams.get("session_id");

    if (!sessionId) {
      writeJson(response, 400, {
        error: "session_id query parameter is required.",
      }, requestId);
      return;
    }

    const sessionInfo = sessionOrchestrator.getSessionInfo(sessionId);

    if (!sessionInfo) {
      writeJson(response, 404, {
        error: "Session not found.",
      }, requestId);
      return;
    }

    writeJson(response, 200, sessionInfo as unknown as Record<string, unknown>, requestId);
    return;
  }

  if (request.method === "GET" && url.pathname === "/sessions/list") {
    if (!sessionOrchestrator) {
      writeJson(response, 503, {
        error: "Session orchestrator not available. Set ANTHROPIC_API_KEY.",
      }, requestId);
      return;
    }

    const sessions = sessionOrchestrator.getActiveSessions();

    writeJson(response, 200, {
      sessions,
      count: sessions.length,
    }, requestId);
    return;
  }

  // Audio Scene CRUD API endpoints

  // POST /api/audio/scenes - Create a new audio scene
  if (request.method === "POST" && url.pathname === "/api/audio/scenes") {
    const payload = await readJsonBody(request);
    const role = payload?.role as string | undefined;
    const model = payload?.model as string | undefined;

    if (!isAuthorizedForScope("audio:scene:create", role, model)) {
      writeJson(response, 403, {
        error: "Unauthorized to create audio scenes.",
      }, requestId);
      return;
    }

    const rateLimit = rateLimiter.check(
      getRateLimitKey("audio:scene:create", role, model, request),
    );
    if (!rateLimit.allowed) {
      logger.warn("request.rate_limited", {
        request_id: requestId,
        scope: "audio:scene:create",
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
    const chapterId = payload?.chapter_id as string | undefined;
    const narrationText = payload?.narration_text as string | undefined;
    const voiceProfileId = payload?.voice_profile_id as string | undefined;
    const options = payload?.options as {
      povAnchor?: string;
      sequence?: number;
      tags?: string[];
      productionNotes?: string;
    } | undefined;

    if (!sceneId || !chapterId || !narrationText || !voiceProfileId) {
      writeJson(response, 400, {
        error: "scene_id, chapter_id, narration_text, and voice_profile_id are required.",
      }, requestId);
      return;
    }

    try {
      const scene = audioSceneManager.createScene(
        sceneId,
        chapterId,
        narrationText,
        voiceProfileId,
        options,
      );

      writeJson(response, 201, {
        success: true,
        scene: {
          id: scene.id,
          scene_id: scene.sceneId,
          chapter_id: scene.chapterId,
          sequence: scene.sequence,
          narration_text: scene.narrationText,
          voice_profile_id: scene.voiceProfileId,
          pov_anchor: scene.povAnchor,
          canon_status: scene.canonStatus,
          version: scene.version,
          created_at: scene.createdAt.toISOString(),
          updated_at: scene.updatedAt.toISOString(),
          tags: scene.tags,
          production_notes: scene.productionNotes,
        },
      }, requestId);
    } catch (error) {
      writeJson(response, 500, {
        error: (error as Error).message,
      }, requestId);
    }
    return;
  }

  // GET /api/audio/scenes - List all audio scenes (with optional chapter filter)
  if (request.method === "GET" && url.pathname === "/api/audio/scenes") {
    const payload = url.searchParams;
    const role = payload.get("role") ?? undefined;
    const model = payload.get("model") ?? undefined;

    if (!isAuthorizedForScope("audio:scene:read", role, model)) {
      writeJson(response, 403, {
        error: "Unauthorized to read audio scenes.",
      }, requestId);
      return;
    }

    const rateLimit = rateLimiter.check(
      getRateLimitKey("audio:scene:read", role, model, request),
    );
    if (!rateLimit.allowed) {
      logger.warn("request.rate_limited", {
        request_id: requestId,
        scope: "audio:scene:read",
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

    const chapterId = payload.get("chapter_id");

    let scenes;
    if (chapterId) {
      scenes = audioSceneManager.getScenesByChapter(chapterId);
    } else {
      // Get all scenes by returning scenes from all chapters
      scenes = audioSceneManager.getAllScenes();
    }

    const scenesData = scenes.map(scene => ({
      id: scene.id,
      scene_id: scene.sceneId,
      chapter_id: scene.chapterId,
      sequence: scene.sequence,
      narration_text: scene.narrationText,
      voice_profile_id: scene.voiceProfileId,
      pov_anchor: scene.povAnchor,
      canon_status: scene.canonStatus,
      version: scene.version,
      beat_marker_count: scene.beatMarkers.length,
      dialogue_attribution_count: scene.dialogueAttributions.length,
      created_at: scene.createdAt.toISOString(),
      updated_at: scene.updatedAt.toISOString(),
    }));

    writeJson(response, 200, {
      success: true,
      scenes: scenesData,
      count: scenesData.length,
    }, requestId);
    return;
  }

  // GET /api/audio/scenes/:id - Get a specific audio scene
  const getSceneMatch = url.pathname.match(/^\/api\/audio\/scenes\/([^/]+)$/);
  if (request.method === "GET" && getSceneMatch && !url.pathname.includes("/validate") && !url.pathname.includes("/audit")) {
    const sceneId = getSceneMatch[1];
    const payload = url.searchParams;
    const role = payload.get("role") ?? undefined;
    const model = payload.get("model") ?? undefined;

    if (!isAuthorizedForScope("audio:scene:read", role, model)) {
      writeJson(response, 403, {
        error: "Unauthorized to read audio scenes.",
      }, requestId);
      return;
    }

    const rateLimit = rateLimiter.check(
      getRateLimitKey("audio:scene:read", role, model, request),
    );
    if (!rateLimit.allowed) {
      logger.warn("request.rate_limited", {
        request_id: requestId,
        scope: "audio:scene:read",
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

    const scene = audioSceneManager.getScene(sceneId);
    if (!scene) {
      writeJson(response, 404, {
        error: `Audio scene ${sceneId} not found.`,
      }, requestId);
      return;
    }

    writeJson(response, 200, {
      success: true,
      scene: {
        id: scene.id,
        scene_id: scene.sceneId,
        chapter_id: scene.chapterId,
        sequence: scene.sequence,
        narration_text: scene.narrationText,
        beat_markers: scene.beatMarkers,
        emotional_envelope: scene.emotionalEnvelope,
        pov_anchor: scene.povAnchor,
        dialogue_attributions: scene.dialogueAttributions,
        voice_profile_id: scene.voiceProfileId,
        listener_cognition_safeguards: scene.listenerCognitionSafeguards,
        canon_status: scene.canonStatus,
        version: scene.version,
        created_at: scene.createdAt.toISOString(),
        updated_at: scene.updatedAt.toISOString(),
        tags: scene.tags,
        production_notes: scene.productionNotes,
      },
    }, requestId);
    return;
  }

  // PUT /api/audio/scenes/:id - Update an audio scene
  const updateSceneMatch = url.pathname.match(/^\/api\/audio\/scenes\/([^/]+)$/);
  if (request.method === "PUT" && updateSceneMatch) {
    const sceneId = updateSceneMatch[1];
    const payload = await readJsonBody(request);
    const role = payload?.role as string | undefined;
    const model = payload?.model as string | undefined;

    if (!isAuthorizedForScope("audio:scene:update", role, model)) {
      writeJson(response, 403, {
        error: "Unauthorized to update audio scenes.",
      }, requestId);
      return;
    }

    const rateLimit = rateLimiter.check(
      getRateLimitKey("audio:scene:update", role, model, request),
    );
    if (!rateLimit.allowed) {
      logger.warn("request.rate_limited", {
        request_id: requestId,
        scope: "audio:scene:update",
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

    const scene = audioSceneManager.getScene(sceneId);
    if (!scene) {
      writeJson(response, 404, {
        error: `Audio scene ${sceneId} not found.`,
      }, requestId);
      return;
    }

    try {
      // Update beat markers if provided
      const beatMarkers = payload?.beat_markers as BeatMarker[] | undefined;
      if (beatMarkers !== undefined) {
        audioSceneManager.updateBeatMarkers(sceneId, beatMarkers);
      }

      // Update emotional envelope if provided
      const emotionalEnvelope = payload?.emotional_envelope as EmotionalPoint[] | undefined;
      if (emotionalEnvelope !== undefined) {
        audioSceneManager.updateEmotionalEnvelope(sceneId, emotionalEnvelope);
      }

      // Add dialogue attributions if provided
      const dialogueAttributions = payload?.dialogue_attributions as DialogueAttribution[] | undefined;
      if (dialogueAttributions !== undefined) {
        // Clear existing and add new ones
        const currentScene = audioSceneManager.getScene(sceneId)!;
        currentScene.dialogueAttributions = [];
        for (const attribution of dialogueAttributions) {
          audioSceneManager.addDialogueAttribution(sceneId, attribution);
        }
      }

      // Add cognition safeguards if provided
      const safeguards = payload?.cognition_safeguards as CognitionSafeguard[] | undefined;
      if (safeguards !== undefined) {
        const currentScene = audioSceneManager.getScene(sceneId)!;
        currentScene.listenerCognitionSafeguards = [];
        for (const safeguard of safeguards) {
          audioSceneManager.addCognitionSafeguard(sceneId, safeguard);
        }
      }

      // Update canon status if provided
      const canonStatus = payload?.canon_status as "draft" | "proposed" | "canon" | undefined;
      if (canonStatus !== undefined) {
        audioSceneManager.updateCanonStatus(sceneId, canonStatus);
      }

      // Get updated scene
      const updatedScene = audioSceneManager.getScene(sceneId)!;

      writeJson(response, 200, {
        success: true,
        scene: {
          id: updatedScene.id,
          scene_id: updatedScene.sceneId,
          chapter_id: updatedScene.chapterId,
          sequence: updatedScene.sequence,
          narration_text: updatedScene.narrationText,
          beat_markers: updatedScene.beatMarkers,
          emotional_envelope: updatedScene.emotionalEnvelope,
          pov_anchor: updatedScene.povAnchor,
          dialogue_attributions: updatedScene.dialogueAttributions,
          voice_profile_id: updatedScene.voiceProfileId,
          listener_cognition_safeguards: updatedScene.listenerCognitionSafeguards,
          canon_status: updatedScene.canonStatus,
          version: updatedScene.version,
          created_at: updatedScene.createdAt.toISOString(),
          updated_at: updatedScene.updatedAt.toISOString(),
          tags: updatedScene.tags,
          production_notes: updatedScene.productionNotes,
        },
      }, requestId);
    } catch (error) {
      writeJson(response, 400, {
        error: (error as Error).message,
      }, requestId);
    }
    return;
  }

  // DELETE /api/audio/scenes/:id - Delete an audio scene
  const deleteSceneMatch = url.pathname.match(/^\/api\/audio\/scenes\/([^/]+)$/);
  if (request.method === "DELETE" && deleteSceneMatch) {
    const sceneId = deleteSceneMatch[1];
    const payload = await readJsonBody(request);
    const role = payload?.role as string | undefined;
    const model = payload?.model as string | undefined;

    if (!isAuthorizedForScope("audio:scene:delete", role, model)) {
      writeJson(response, 403, {
        error: "Unauthorized to delete audio scenes.",
      }, requestId);
      return;
    }

    const rateLimit = rateLimiter.check(
      getRateLimitKey("audio:scene:delete", role, model, request),
    );
    if (!rateLimit.allowed) {
      logger.warn("request.rate_limited", {
        request_id: requestId,
        scope: "audio:scene:delete",
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

    const deleted = audioSceneManager.deleteScene(sceneId);
    if (!deleted) {
      writeJson(response, 404, {
        error: `Audio scene ${sceneId} not found.`,
      }, requestId);
      return;
    }

    writeJson(response, 200, {
      success: true,
      message: `Audio scene ${sceneId} deleted successfully.`,
    }, requestId);
    return;
  }

  // POST /api/audio/scenes/:id/validate - Validate an audio scene
  const validateSceneMatch = url.pathname.match(/^\/api\/audio\/scenes\/([^/]+)\/validate$/);
  if (request.method === "POST" && validateSceneMatch) {
    const sceneId = validateSceneMatch[1];
    const payload = await readJsonBody(request);
    const role = payload?.role as string | undefined;
    const model = payload?.model as string | undefined;

    if (!isAuthorizedForScope("audio:scene:read", role, model)) {
      writeJson(response, 403, {
        error: "Unauthorized to validate audio scenes.",
      }, requestId);
      return;
    }

    const rateLimit = rateLimiter.check(
      getRateLimitKey("audio:scene:read", role, model, request),
    );
    if (!rateLimit.allowed) {
      logger.warn("request.rate_limited", {
        request_id: requestId,
        scope: "audio:scene:read",
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

    const validation = audioSceneManager.validateScene(sceneId);

    writeJson(response, 200, {
      success: true,
      scene_id: sceneId,
      validation: {
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
        score: validation.score,
      },
    }, requestId);
    return;
  }

  // POST /api/audio/scenes/:id/audit - Run listener cognition audit on an audio scene
  const auditSceneMatch = url.pathname.match(/^\/api\/audio\/scenes\/([^/]+)\/audit$/);
  if (request.method === "POST" && auditSceneMatch) {
    const sceneId = auditSceneMatch[1];
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

    const audit = audioSceneManager.auditListenerCognition(sceneId);

    writeJson(response, 200, {
      success: true,
      scene_id: sceneId,
      audit: {
        passed: audit.passed,
        issues: audit.issues,
        suggestions: audit.suggestions,
      },
    }, requestId);
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
