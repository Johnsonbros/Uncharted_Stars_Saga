type ResourcePayload = Record<string, unknown>;

const now = () => new Date().toISOString();

const DEFAULT_PAYLOADS: Record<string, ResourcePayload> = {
  "narrative.events": {
    events: [],
    snapshot: {
      generated_at: now(),
      status: "stub"
    }
  },
  "narrative.canon": {
    canon_version: "v1",
    events: [],
    generated_at: now()
  },
  "narrative.knowledge_snapshots": {
    snapshots: [],
    generated_at: now()
  },
  "audio.scene_index": {
    scenes: [],
    masters: [],
    generated_at: now()
  },
  "listener.summary": {
    listeners: [],
    generated_at: now()
  }
};

export const getResourcePayload = async (resourceId: string): Promise<ResourcePayload> => {
  const payload = DEFAULT_PAYLOADS[resourceId];
  if (!payload) {
    return { generated_at: now(), status: "unknown_resource" };
  }

  return payload;
};
