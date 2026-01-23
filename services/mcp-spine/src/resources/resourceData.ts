type ResourcePayload = Record<string, unknown>;

const now = () => new Date().toISOString();

// Configuration: where the NAOS web app is running
const NAOS_WEB_API_BASE = process.env.NAOS_WEB_API_BASE ?? "";
const DEFAULT_PROJECT_ID = process.env.DEFAULT_PROJECT_ID ?? "uncharted-stars";
const SKIP_EXTERNAL_API = !NAOS_WEB_API_BASE || NAOS_WEB_API_BASE === "test" || process.env.NODE_ENV === "test";

/**
 * Fetch narrative state snapshot from the NAOS web app API
 */
async function fetchNarrativeState(projectId: string = DEFAULT_PROJECT_ID): Promise<ResourcePayload> {
  // In test mode, return stub data
  if (SKIP_EXTERNAL_API) {
    return {
      events: [],
      canonBuckets: { canon: [], proposed: [], draft: [] },
      promises: [],
      knowledge: { states: [], issues: [] },
      canonGate: {
        passed: true,
        continuity: { dependencyIssues: [], cycleIssues: [], timestampIssues: [] },
        promiseIssues: [],
        listenerCognition: { issues: [] }
      },
      generatedAt: now(),
      projectId
    };
  }

  try {
    const url = `${NAOS_WEB_API_BASE}/api/narrative/state?projectId=${encodeURIComponent(projectId)}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to fetch narrative state: ${response.status} ${response.statusText}`);
      return {
        generated_at: now(),
        status: "fetch_failed",
        error: `HTTP ${response.status}`
      };
    }

    const result = await response.json();

    if (!result.ok) {
      console.error(`Narrative state API returned error: ${result.error}`);
      return {
        generated_at: now(),
        status: "api_error",
        error: result.error
      };
    }

    return result.snapshot;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown fetch error";
    console.error(`Exception fetching narrative state: ${message}`);
    return {
      generated_at: now(),
      status: "exception",
      error: message
    };
  }
}

/**
 * Extract narrative events resource from snapshot
 */
async function getNarrativeEvents(): Promise<ResourcePayload> {
  const snapshot = await fetchNarrativeState();

  if (!snapshot.events || !Array.isArray(snapshot.events)) {
    return {
      events: [],
      snapshot: {
        generated_at: now(),
        status: "no_data"
      }
    };
  }

  return {
    events: snapshot.events,
    snapshot: {
      generated_at: snapshot.generatedAt ?? now(),
      project_id: snapshot.projectId,
      status: "ok"
    }
  };
}

/**
 * Extract canon events from snapshot
 */
async function getNarrativeCanon(): Promise<ResourcePayload> {
  const snapshot = await fetchNarrativeState();

  const canonEvents = snapshot.canonBuckets?.canon ?? [];

  return {
    canon_version: "v1",
    events: canonEvents,
    generated_at: snapshot.generatedAt ?? now(),
    project_id: snapshot.projectId
  };
}

/**
 * Extract knowledge states from snapshot
 */
async function getNarrativeKnowledge(): Promise<ResourcePayload> {
  const snapshot = await fetchNarrativeState();

  return {
    snapshots: snapshot.knowledge?.states ?? [],
    issues: snapshot.knowledge?.issues ?? [],
    generated_at: snapshot.generatedAt ?? now(),
    project_id: snapshot.projectId
  };
}

/**
 * Placeholder for audio scene index (to be implemented when Audio Engine API exists)
 */
async function getAudioSceneIndex(): Promise<ResourcePayload> {
  // TODO: Implement when /api/audio/scenes endpoint exists
  return {
    scenes: [],
    masters: [],
    generated_at: now(),
    status: "not_implemented",
    note: "Audio Engine API endpoint not yet available"
  };
}

/**
 * Placeholder for listener summary (to be implemented when Listener Platform API exists)
 */
async function getListenerSummary(): Promise<ResourcePayload> {
  // TODO: Implement when /api/listeners/summary endpoint exists
  return {
    listeners: [],
    generated_at: now(),
    status: "not_implemented",
    note: "Listener Platform API endpoint not yet available"
  };
}

const RESOURCE_FETCHERS: Record<string, () => Promise<ResourcePayload>> = {
  "narrative.events": getNarrativeEvents,
  "narrative.canon": getNarrativeCanon,
  "narrative.knowledge_snapshots": getNarrativeKnowledge,
  "audio.scene_index": getAudioSceneIndex,
  "listener.summary": getListenerSummary
};

export const getResourcePayload = async (resourceId: string): Promise<ResourcePayload> => {
  const fetcher = RESOURCE_FETCHERS[resourceId];

  if (!fetcher) {
    return {
      generated_at: now(),
      status: "unknown_resource",
      error: `No fetcher defined for resource: ${resourceId}`
    };
  }

  return await fetcher();
};
