import { describe, it, mock } from "node:test";
import assert from "node:assert";
import { AudioSceneManager } from "../src/audioSceneObject.js";
import type { Logger } from "../src/types/loggerTypes.js";

// Mock logger
const createMockLogger = (): Logger => ({
  debug: mock.fn(),
  info: mock.fn(),
  warn: mock.fn(),
  error: mock.fn(),
});

describe("AudioSceneManager", () => {
  describe("Scene Creation", () => {
    it("should create a new audio scene object", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const scene = manager.createScene(
        "scene-1",
        "chapter-1",
        "The stars shimmered in the void.",
        "voice-narrator-1"
      );

      assert.ok(scene.id);
      assert.strictEqual(scene.sceneId, "scene-1");
      assert.strictEqual(scene.chapterId, "chapter-1");
      assert.strictEqual(scene.narrationText, "The stars shimmered in the void.");
      assert.strictEqual(scene.voiceProfileId, "voice-narrator-1");
      assert.strictEqual(scene.canonStatus, "draft");
      assert.strictEqual(scene.sequence, 0);
    });

    it("should create scene with options", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const scene = manager.createScene(
        "scene-2",
        "chapter-1",
        "She spoke clearly.",
        "voice-char-1",
        {
          povAnchor: "alice",
          sequence: 5,
          tags: ["dialogue", "important"],
          productionNotes: "Emphasize the word 'clearly'",
        }
      );

      assert.strictEqual(scene.povAnchor, "alice");
      assert.strictEqual(scene.sequence, 5);
      assert.deepStrictEqual(scene.tags, ["dialogue", "important"]);
      assert.strictEqual(scene.productionNotes, "Emphasize the word 'clearly'");
    });

    it("should initialize empty arrays and metadata", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const scene = manager.createScene("scene-3", "chapter-1", "Text", "voice-1");

      assert.strictEqual(scene.beatMarkers.length, 0);
      assert.strictEqual(scene.emotionalEnvelope.length, 0);
      assert.strictEqual(scene.dialogueAttributions.length, 0);
      assert.strictEqual(scene.listenerCognitionSafeguards.length, 0);
      assert.strictEqual(scene.version, 1);
      assert.ok(scene.createdAt instanceof Date);
      assert.ok(scene.updatedAt instanceof Date);
    });
  });

  describe("Scene Retrieval", () => {
    it("should retrieve a scene by ID", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const created = manager.createScene("scene-1", "chapter-1", "Text", "voice-1");
      const retrieved = manager.getScene(created.id);

      assert.ok(retrieved);
      assert.strictEqual(retrieved.id, created.id);
    });

    it("should return undefined for non-existent scene", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const scene = manager.getScene("non-existent");
      assert.strictEqual(scene, undefined);
    });

    it("should get scenes by chapter", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      manager.createScene("scene-1", "chapter-1", "Text 1", "voice-1", { sequence: 2 });
      manager.createScene("scene-2", "chapter-1", "Text 2", "voice-1", { sequence: 1 });
      manager.createScene("scene-3", "chapter-2", "Text 3", "voice-1");

      const chapter1Scenes = manager.getScenesByChapter("chapter-1");

      assert.strictEqual(chapter1Scenes.length, 2);
      assert.strictEqual(chapter1Scenes[0].sequence, 1);
      assert.strictEqual(chapter1Scenes[1].sequence, 2);
    });
  });

  describe("Beat Markers", () => {
    it("should update beat markers", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const scene = manager.createScene("scene-1", "chapter-1", "Hello, world!", "voice-1");

      manager.updateBeatMarkers(scene.id, [
        { position: 5, type: "pause", duration: 300 },
        { position: 12, type: "emphasis", intensity: 0.8 },
      ]);

      const updated = manager.getScene(scene.id);
      assert.strictEqual(updated?.beatMarkers.length, 2);
      assert.strictEqual(updated?.beatMarkers[0].type, "pause");
      assert.strictEqual(updated?.beatMarkers[1].type, "emphasis");
    });

    it("should throw error for invalid beat marker position", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const scene = manager.createScene("scene-1", "chapter-1", "Short", "voice-1");

      assert.throws(() => {
        manager.updateBeatMarkers(scene.id, [
          { position: 100, type: "pause", duration: 300 },
        ]);
      }, /out of bounds/);
    });

    it("should throw error for non-existent scene", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      assert.throws(() => {
        manager.updateBeatMarkers("non-existent", []);
      }, /not found/);
    });
  });

  describe("Emotional Envelope", () => {
    it("should update emotional envelope", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const scene = manager.createScene("scene-1", "chapter-1", "Text", "voice-1");

      manager.updateEmotionalEnvelope(scene.id, [
        { position: 0, emotion: "calm", intensity: 0.5 },
        { position: 10, emotion: "tense", intensity: 0.8 },
      ]);

      const updated = manager.getScene(scene.id);
      assert.strictEqual(updated?.emotionalEnvelope.length, 2);
      assert.strictEqual(updated?.emotionalEnvelope[0].emotion, "calm");
      assert.strictEqual(updated?.emotionalEnvelope[1].intensity, 0.8);
    });
  });

  describe("Dialogue Attribution", () => {
    it("should add dialogue attribution", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const scene = manager.createScene(
        "scene-1",
        "chapter-1",
        '"Hello," she said. "How are you?"',
        "voice-1"
      );

      manager.addDialogueAttribution(scene.id, {
        speaker: "alice",
        startPosition: 0,
        endPosition: 7,
        voiceProfileId: "voice-alice",
      });

      const updated = manager.getScene(scene.id);
      assert.strictEqual(updated?.dialogueAttributions.length, 1);
      assert.strictEqual(updated?.dialogueAttributions[0].speaker, "alice");
    });

    it("should throw error for invalid position range", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const scene = manager.createScene("scene-1", "chapter-1", "Short", "voice-1");

      assert.throws(() => {
        manager.addDialogueAttribution(scene.id, {
          speaker: "alice",
          startPosition: 10,
          endPosition: 5,
        });
      }, /Invalid dialogue attribution/);
    });
  });

  describe("Cognition Safeguards", () => {
    it("should add cognition safeguard", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const scene = manager.createScene("scene-1", "chapter-1", "Text", "voice-1");

      manager.addCognitionSafeguard(scene.id, {
        type: "attribution",
        description: "Clear speaker identification",
        position: 0,
      });

      const updated = manager.getScene(scene.id);
      assert.strictEqual(updated?.listenerCognitionSafeguards.length, 1);
      assert.strictEqual(updated?.listenerCognitionSafeguards[0].type, "attribution");
    });
  });

  describe("Scene Validation", () => {
    it("should validate a well-formed scene", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const scene = manager.createScene(
        "scene-1",
        "chapter-1",
        "The stars shimmered in the void.",
        "voice-1"
      );

      const validation = manager.validateScene(scene.id);

      assert.strictEqual(validation.valid, true);
      assert.strictEqual(validation.errors.length, 0);
    });

    it("should detect empty narration text", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const scene = manager.createScene("scene-1", "chapter-1", "", "voice-1");

      const validation = manager.validateScene(scene.id);

      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some((e) => e.includes("empty")));
    });

    it("should detect out-of-bounds beat markers", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const scene = manager.createScene("scene-1", "chapter-1", "Short", "voice-1");

      // Bypass validation to force invalid state
      const sceneObj = manager.getScene(scene.id);
      if (sceneObj) {
        sceneObj.beatMarkers = [{ position: 100, type: "pause", duration: 300 }];
      }

      const validation = manager.validateScene(scene.id);

      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some((e) => e.includes("out of bounds")));
    });

    it("should warn about missing cognition safeguards", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const scene = manager.createScene("scene-1", "chapter-1", "Text", "voice-1");

      manager.addDialogueAttribution(scene.id, {
        speaker: "alice",
        startPosition: 0,
        endPosition: 4,
      });

      const validation = manager.validateScene(scene.id);

      assert.ok(validation.warnings.some((w) => w.includes("cognition safeguards")));
    });

    it("should calculate quality score", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const scene = manager.createScene("scene-1", "chapter-1", "Text", "voice-1");

      const validation = manager.validateScene(scene.id);

      assert.ok(validation.score !== undefined);
      assert.ok(validation.score >= 0 && validation.score <= 1);
    });
  });

  describe("Listener Cognition Audit", () => {
    it("should pass audit for simple narration with beat markers", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const scene = manager.createScene(
        "scene-1",
        "chapter-1",
        "The stars shimmered in the endless void of space.",
        "voice-1"
      );

      // Add beat markers to avoid low density warning
      manager.updateBeatMarkers(scene.id, [
        { position: 20, type: "pause", duration: 300 },
        { position: 40, type: "pause", duration: 600 },
      ]);

      const audit = manager.auditListenerCognition(scene.id);

      assert.strictEqual(audit.passed, true);
      assert.strictEqual(audit.issues.length, 0);
    });

    it("should detect dialogue without attribution safeguards", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const scene = manager.createScene("scene-1", "chapter-1", "Hello", "voice-1");

      manager.addDialogueAttribution(scene.id, {
        speaker: "alice",
        startPosition: 0,
        endPosition: 5,
      });

      const audit = manager.auditListenerCognition(scene.id);

      assert.strictEqual(audit.passed, false);
      assert.ok(audit.issues.some((i) => i.includes("attribution safeguards")));
    });

    it("should detect low beat marker density", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const longText = "A".repeat(500);
      const scene = manager.createScene("scene-1", "chapter-1", longText, "voice-1");

      const audit = manager.auditListenerCognition(scene.id);

      assert.ok(audit.issues.some((i) => i.includes("marker density")));
      assert.ok(audit.suggestions.length > 0);
    });

    it("should detect missing emotional envelope", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const longText = "A".repeat(600);
      const scene = manager.createScene("scene-1", "chapter-1", longText, "voice-1");

      const audit = manager.auditListenerCognition(scene.id);

      assert.ok(audit.issues.some((i) => i.includes("emotional envelope")));
    });
  });

  describe("Canon Status", () => {
    it("should update canon status", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const scene = manager.createScene("scene-1", "chapter-1", "Text", "voice-1");

      assert.strictEqual(scene.canonStatus, "draft");

      manager.updateCanonStatus(scene.id, "proposed");
      const updated = manager.getScene(scene.id);

      assert.strictEqual(updated?.canonStatus, "proposed");
    });

    it("should throw error for non-existent scene", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      assert.throws(() => {
        manager.updateCanonStatus("non-existent", "canon");
      }, /not found/);
    });
  });

  describe("Scene Deletion", () => {
    it("should delete a scene", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const scene = manager.createScene("scene-1", "chapter-1", "Text", "voice-1");

      const deleted = manager.deleteScene(scene.id);

      assert.strictEqual(deleted, true);
      assert.strictEqual(manager.getScene(scene.id), undefined);
    });

    it("should return false for non-existent scene", () => {
      const logger = createMockLogger();
      const manager = new AudioSceneManager(logger);

      const deleted = manager.deleteScene("non-existent");

      assert.strictEqual(deleted, false);
    });
  });
});
