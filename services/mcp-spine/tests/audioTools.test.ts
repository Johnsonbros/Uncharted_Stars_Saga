import { describe, it, expect } from "@jest/globals";
import { AudioTools } from "../src/tools/audioTools.js";
import type { Logger } from "../src/types/loggerTypes.js";
import type {
  AudioSceneObject,
  VoiceProfile
} from "../../../naos/apps/web/lib/audio-engine/models.js";

const createMockLogger = (): Logger => ({
  info: () => {},
  warn: () => {},
  error: () => {},
});

const createValidScene = (): AudioSceneObject => ({
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "Test Scene",
  summary: "A test audio scene for unit testing.",
  timing: {
    startMs: 0,
    endMs: 30000,
  },
  metadata: {
    tags: ["test"],
  },
  beatMarkers: [
    {
      id: "bm_001",
      type: "pause",
      offsetMs: 5000,
      durationMs: 500,
      channel: "delivery",
      priority: 0,
      intensity: 0.5,
    },
  ],
  tracks: [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      speakerId: "narrator",
      type: "narrator",
      voiceProfileId: "550e8400-e29b-41d4-a716-446655440010",
      script: "This is the opening narration.",
    },
  ],
});

const createValidProfile = (): VoiceProfile => ({
  id: "550e8400-e29b-41d4-a716-446655440010",
  speakerId: "narrator",
  displayName: "Narrator",
  role: "narrator",
  tone: "warm",
  pace: "medium",
  cadenceWpm: 160,
  styleTags: [],
});

describe("AudioTools", () => {
  describe("generateAudioPacket", () => {
    it("generates a valid recording packet for a valid scene", async () => {
      const logger = createMockLogger();
      const audioTools = new AudioTools(logger);
      const scene = createValidScene();
      const profiles = [createValidProfile()];

      const result = await audioTools.generateAudioPacket({
        sceneId: scene.id,
        scene,
        profiles,
        requestedBy: "test-user",
        requestId: "test-req-001",
      });

      expect(result.success).toBe(true);
      expect(result.packet).toBeDefined();
      expect(result.packet?.sceneId).toBe(scene.id);
      expect(result.packet?.tracks.length).toBe(1);
      expect(result.request_id).toBe("test-req-001");
      expect(result.scene_id).toBe(scene.id);
    });

    it("rejects an invalid scene with validation errors", async () => {
      const logger = createMockLogger();
      const audioTools = new AudioTools(logger);
      const invalidScene = {
        ...createValidScene(),
        tracks: [], // Invalid: no tracks
      };
      const profiles = [createValidProfile()];

      const result = await audioTools.generateAudioPacket({
        sceneId: invalidScene.id,
        scene: invalidScene,
        profiles,
        requestedBy: "test-user",
      });

      expect(result.success).toBe(false);
      expect(result.packet).toBeUndefined();
      expect(result.validation).toBeDefined();
      expect(result.validation?.passed).toBe(false);
      expect(result.error).toContain("validation failed");
    });

    it("rejects a scene with voice profile mismatches", async () => {
      const logger = createMockLogger();
      const audioTools = new AudioTools(logger);
      const scene = createValidScene();
      const wrongProfile = {
        ...createValidProfile(),
        speakerId: "wrong-speaker", // Mismatch
      };

      const result = await audioTools.generateAudioPacket({
        sceneId: scene.id,
        scene,
        profiles: [wrongProfile],
        requestedBy: "test-user",
      });

      expect(result.success).toBe(false);
      expect(result.validation).toBeDefined();
      expect(result.validation?.voiceProfileIssues.length).toBeGreaterThan(0);
    });
  });

  describe("auditListenerConfusion", () => {
    it("passes cognition audit for a clear scene", async () => {
      const logger = createMockLogger();
      const audioTools = new AudioTools(logger);
      const scene = createValidScene();

      const result = await audioTools.auditListenerConfusion({
        sceneId: scene.id,
        scene,
        requestedBy: "test-user",
        requestId: "test-req-002",
      });

      expect(result.success).toBe(true);
      expect(result.audit).toBeDefined();
      expect(result.audit?.passed).toBe(true);
      expect(result.audit?.issues.length).toBe(0);
      expect(result.request_id).toBe("test-req-002");
      expect(result.scene_id).toBe(scene.id);
    });

    it("flags cognition issues for a scene with dense beat markers", async () => {
      const logger = createMockLogger();
      const audioTools = new AudioTools(logger);
      const scene = createValidScene();

      // Add many beat markers in a short window
      const denseBeatMarkers = Array.from({ length: 10 }, (_, i) => ({
        id: `bm_${i}`,
        type: "pause" as const,
        offsetMs: 5000 + i * 500, // 10 markers in 5 seconds
        durationMs: 200,
        channel: "delivery" as const,
        priority: 0,
        intensity: 0.5,
      }));

      const result = await audioTools.auditListenerConfusion({
        sceneId: scene.id,
        scene,
        beatMarkers: denseBeatMarkers,
        requestedBy: "test-user",
      });

      expect(result.success).toBe(true);
      expect(result.audit).toBeDefined();
      expect(result.audit?.passed).toBe(false);
      expect(result.audit?.issues.length).toBeGreaterThan(0);
      expect(result.audit?.issues.some((issue) => issue.includes("density"))).toBe(true);
    });

    it("flags cognition issues for scenes without a narrator", async () => {
      const logger = createMockLogger();
      const audioTools = new AudioTools(logger);
      const scene = {
        ...createValidScene(),
        tracks: [
          {
            id: "550e8400-e29b-41d4-a716-446655440001",
            speakerId: "character1",
            type: "character" as const,
            voiceProfileId: "550e8400-e29b-41d4-a716-446655440010",
            script: "Character dialogue only.",
          },
        ],
      };

      const result = await audioTools.auditListenerConfusion({
        sceneId: scene.id,
        scene,
        requestedBy: "test-user",
      });

      expect(result.success).toBe(true);
      expect(result.audit).toBeDefined();
      expect(result.audit?.passed).toBe(false);
      expect(result.audit?.issues.some((issue) => issue.includes("narrator"))).toBe(true);
    });
  });
});
