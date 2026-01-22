import { describe, it } from "node:test";
import assert from "node:assert";
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

      assert.strictEqual(result.success, true);
      assert.ok(result.packet);
      assert.strictEqual(result.packet?.sceneId, scene.id);
      assert.strictEqual(result.packet?.tracks.length, 1);
      assert.strictEqual(result.request_id, "test-req-001");
      assert.strictEqual(result.scene_id, scene.id);
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

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.packet, undefined);
      assert.ok(result.validation);
      assert.strictEqual(result.validation?.passed, false);
      assert.ok(result.error?.includes("validation failed"));
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

      assert.strictEqual(result.success, false);
      assert.ok(result.validation);
      assert.ok((result.validation?.voiceProfileIssues.length ?? 0) > 0);
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

      assert.strictEqual(result.success, true);
      assert.ok(result.audit);
      assert.strictEqual(result.audit?.passed, true);
      assert.strictEqual(result.audit?.issues.length, 0);
      assert.strictEqual(result.request_id, "test-req-002");
      assert.strictEqual(result.scene_id, scene.id);
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

      assert.strictEqual(result.success, true);
      assert.ok(result.audit);
      assert.strictEqual(result.audit?.passed, false);
      assert.ok((result.audit?.issues.length ?? 0) > 0);
      assert.ok(result.audit?.issues.some((issue) => issue.includes("density")));
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

      assert.strictEqual(result.success, true);
      assert.ok(result.audit);
      assert.strictEqual(result.audit?.passed, false);
      assert.ok(result.audit?.issues.some((issue) => issue.includes("narrator")));
    });
  });
});
