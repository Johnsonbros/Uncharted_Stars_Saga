import assert from "node:assert/strict";
import { describe, test, beforeEach, afterEach } from "node:test";
import { AudioSceneManager } from "../src/audioSceneObject.js";
import { isAuthorizedForScope } from "../src/scopes/authorization.js";

describe("Audio Scene API - AudioSceneManager Unit Tests", () => {
  // Direct tests of AudioSceneManager class

  test("getAllScenes returns all scenes sorted by chapter and sequence", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    const manager = new AudioSceneManager(mockLogger);

    // Create scenes in different chapters with different sequences
    manager.createScene("scene3", "chapter2", "Text 3", "voice1", { sequence: 1 });
    manager.createScene("scene1", "chapter1", "Text 1", "voice1", { sequence: 2 });
    manager.createScene("scene2", "chapter1", "Text 2", "voice1", { sequence: 1 });
    manager.createScene("scene4", "chapter2", "Text 4", "voice1", { sequence: 0 });

    const allScenes = manager.getAllScenes();

    assert.equal(allScenes.length, 4);
    // Should be sorted by chapter first (chapter1 before chapter2), then by sequence
    assert.equal(allScenes[0].chapterId, "chapter1");
    assert.equal(allScenes[0].sequence, 1);
    assert.equal(allScenes[1].chapterId, "chapter1");
    assert.equal(allScenes[1].sequence, 2);
    assert.equal(allScenes[2].chapterId, "chapter2");
    assert.equal(allScenes[2].sequence, 0);
    assert.equal(allScenes[3].chapterId, "chapter2");
    assert.equal(allScenes[3].sequence, 1);
  });

  test("getAllScenes returns empty array when no scenes exist", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    const manager = new AudioSceneManager(mockLogger);
    const allScenes = manager.getAllScenes();

    assert.equal(allScenes.length, 0);
    assert.ok(Array.isArray(allScenes));
  });

  test("scene CRUD operations work correctly", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    const manager = new AudioSceneManager(mockLogger);

    // Create
    const scene = manager.createScene(
      "test-scene",
      "test-chapter",
      "Test narration text for the scene.",
      "voice-profile-1",
      {
        povAnchor: "protagonist",
        sequence: 1,
        tags: ["action", "intro"],
        productionNotes: "Opening scene",
      }
    );

    assert.ok(scene.id.startsWith("audio_test-scene_"));
    assert.equal(scene.sceneId, "test-scene");
    assert.equal(scene.chapterId, "test-chapter");
    assert.equal(scene.narrationText, "Test narration text for the scene.");
    assert.equal(scene.voiceProfileId, "voice-profile-1");
    assert.equal(scene.povAnchor, "protagonist");
    assert.equal(scene.sequence, 1);
    assert.deepEqual(scene.tags, ["action", "intro"]);
    assert.equal(scene.productionNotes, "Opening scene");
    assert.equal(scene.canonStatus, "draft");
    assert.equal(scene.version, 1);

    // Read
    const retrievedScene = manager.getScene(scene.id);
    assert.ok(retrievedScene);
    assert.equal(retrievedScene!.id, scene.id);

    // Update beat markers
    const beatMarkers = [
      { position: 5, type: "pause" as const, duration: 500 },
      { position: 15, type: "emphasis" as const, intensity: 0.8 },
    ];
    manager.updateBeatMarkers(scene.id, beatMarkers);

    const updatedScene = manager.getScene(scene.id);
    assert.equal(updatedScene!.beatMarkers.length, 2);
    assert.equal(updatedScene!.beatMarkers[0].position, 5);
    assert.equal(updatedScene!.beatMarkers[0].type, "pause");

    // Update emotional envelope
    const emotionalEnvelope = [
      { position: 0, emotion: "neutral", intensity: 0.3 },
      { position: 20, emotion: "tense", intensity: 0.7 },
    ];
    manager.updateEmotionalEnvelope(scene.id, emotionalEnvelope);

    const sceneWithEnvelope = manager.getScene(scene.id);
    assert.equal(sceneWithEnvelope!.emotionalEnvelope.length, 2);

    // Update canon status
    manager.updateCanonStatus(scene.id, "proposed");
    const sceneWithStatus = manager.getScene(scene.id);
    assert.equal(sceneWithStatus!.canonStatus, "proposed");

    // Delete
    const deleted = manager.deleteScene(scene.id);
    assert.equal(deleted, true);

    const deletedScene = manager.getScene(scene.id);
    assert.equal(deletedScene, undefined);

    // Delete non-existent
    const deletedAgain = manager.deleteScene(scene.id);
    assert.equal(deletedAgain, false);
  });

  test("dialogue attribution validation works correctly", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    const manager = new AudioSceneManager(mockLogger);
    const scene = manager.createScene(
      "dialogue-scene",
      "chapter1",
      "Hello said the protagonist. Welcome replied the guide.",
      "voice1"
    );

    // Valid attribution
    manager.addDialogueAttribution(scene.id, {
      speaker: "protagonist",
      startPosition: 0,
      endPosition: 5,
    });

    const sceneWithDialogue = manager.getScene(scene.id);
    assert.equal(sceneWithDialogue!.dialogueAttributions.length, 1);

    // Invalid attribution (out of bounds)
    assert.throws(() => {
      manager.addDialogueAttribution(scene.id, {
        speaker: "guide",
        startPosition: 100,
        endPosition: 200,
      });
    }, /Invalid dialogue attribution position/);

    // Invalid attribution (start >= end)
    assert.throws(() => {
      manager.addDialogueAttribution(scene.id, {
        speaker: "guide",
        startPosition: 20,
        endPosition: 10,
      });
    }, /Invalid dialogue attribution position/);
  });

  test("cognition safeguards can be added", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    const manager = new AudioSceneManager(mockLogger);
    const scene = manager.createScene(
      "safeguard-scene",
      "chapter1",
      "Complex dialogue with multiple speakers.",
      "voice1"
    );

    manager.addCognitionSafeguard(scene.id, {
      type: "attribution",
      description: "Ensure clear speaker transitions",
      position: 10,
    });

    manager.addCognitionSafeguard(scene.id, {
      type: "context",
      description: "Listener may need reminder of setting",
    });

    const sceneWithSafeguards = manager.getScene(scene.id);
    assert.equal(sceneWithSafeguards!.listenerCognitionSafeguards.length, 2);
    assert.equal(sceneWithSafeguards!.listenerCognitionSafeguards[0].type, "attribution");
    assert.equal(sceneWithSafeguards!.listenerCognitionSafeguards[1].type, "context");
  });

  test("validateScene returns validation results", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    const manager = new AudioSceneManager(mockLogger);
    const scene = manager.createScene(
      "valid-scene",
      "chapter1",
      "This is a valid narration text with proper content.",
      "voice1"
    );

    const validation = manager.validateScene(scene.id);
    assert.equal(validation.valid, true);
    assert.equal(validation.errors.length, 0);
    assert.ok(validation.score !== undefined);
    assert.ok(validation.score! > 0);
  });

  test("validateScene returns errors for invalid scene", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    const manager = new AudioSceneManager(mockLogger);
    const validation = manager.validateScene("non-existent-id");

    assert.equal(validation.valid, false);
    assert.ok(validation.errors.length > 0);
    assert.ok(validation.errors[0].includes("not found"));
  });

  test("validateScene warns about missing cognition safeguards for dialogue", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    const manager = new AudioSceneManager(mockLogger);
    const scene = manager.createScene(
      "dialogue-scene-2",
      "chapter1",
      "Dialogue text here.",
      "voice1"
    );

    // Add dialogue without safeguards
    manager.addDialogueAttribution(scene.id, {
      speaker: "character1",
      startPosition: 0,
      endPosition: 8,
    });

    const validation = manager.validateScene(scene.id);
    assert.ok(validation.warnings.some((w: string) => w.includes("cognition safeguards")));
  });

  test("auditListenerCognition returns audit results", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    const manager = new AudioSceneManager(mockLogger);
    const scene = manager.createScene(
      "audit-scene",
      "chapter1",
      "A longer narration text that has enough content to be properly audited for listener cognition issues.",
      "voice1"
    );

    const audit = manager.auditListenerCognition(scene.id);
    assert.ok("passed" in audit);
    assert.ok("issues" in audit);
    assert.ok("suggestions" in audit);
    assert.ok(Array.isArray(audit.issues));
    assert.ok(Array.isArray(audit.suggestions));
  });

  test("auditListenerCognition returns error for non-existent scene", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    const manager = new AudioSceneManager(mockLogger);
    const audit = manager.auditListenerCognition("non-existent");

    assert.equal(audit.passed, false);
    assert.ok(audit.issues.some((i) => i.includes("not found")));
  });

  test("auditListenerCognition detects missing beat markers", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    const manager = new AudioSceneManager(mockLogger);
    // Create a long scene without beat markers
    const longText = "This is a very long narration text. ".repeat(20);
    const scene = manager.createScene("long-scene", "chapter1", longText, "voice1");

    const audit = manager.auditListenerCognition(scene.id);
    assert.ok(audit.issues.some((i) => i.includes("Beat marker density")));
    assert.ok(audit.suggestions.some((s) => s.includes("Add more beat markers")));
  });

  test("getScenesByChapter returns scenes for specific chapter", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    const manager = new AudioSceneManager(mockLogger);
    manager.createScene("scene1", "chapter1", "Text 1", "voice1", { sequence: 2 });
    manager.createScene("scene2", "chapter1", "Text 2", "voice1", { sequence: 1 });
    manager.createScene("scene3", "chapter2", "Text 3", "voice1", { sequence: 1 });

    const chapter1Scenes = manager.getScenesByChapter("chapter1");
    assert.equal(chapter1Scenes.length, 2);
    // Should be sorted by sequence
    assert.equal(chapter1Scenes[0].sequence, 1);
    assert.equal(chapter1Scenes[1].sequence, 2);

    const chapter2Scenes = manager.getScenesByChapter("chapter2");
    assert.equal(chapter2Scenes.length, 1);

    const chapter3Scenes = manager.getScenesByChapter("chapter3");
    assert.equal(chapter3Scenes.length, 0);
  });

  test("beat marker validation rejects out of bounds markers", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    const manager = new AudioSceneManager(mockLogger);
    const scene = manager.createScene("marker-scene", "chapter1", "Short text.", "voice1");

    // Valid marker
    manager.updateBeatMarkers(scene.id, [
      { position: 5, type: "pause" as const, duration: 500 },
    ]);

    // Invalid marker (position out of bounds)
    assert.throws(() => {
      manager.updateBeatMarkers(scene.id, [
        { position: 1000, type: "pause" as const, duration: 500 },
      ]);
    }, /out of bounds/);

    // Invalid marker (negative position)
    assert.throws(() => {
      manager.updateBeatMarkers(scene.id, [
        { position: -1, type: "pause" as const, duration: 500 },
      ]);
    }, /out of bounds/);
  });

  test("updateBeatMarkers throws error for non-existent scene", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    const manager = new AudioSceneManager(mockLogger);
    assert.throws(() => {
      manager.updateBeatMarkers("non-existent", []);
    }, /not found/);
  });

  test("updateEmotionalEnvelope throws error for non-existent scene", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    const manager = new AudioSceneManager(mockLogger);
    assert.throws(() => {
      manager.updateEmotionalEnvelope("non-existent", []);
    }, /not found/);
  });

  test("updateCanonStatus throws error for non-existent scene", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    const manager = new AudioSceneManager(mockLogger);
    assert.throws(() => {
      manager.updateCanonStatus("non-existent", "canon");
    }, /not found/);
  });

  test("addDialogueAttribution throws error for non-existent scene", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    const manager = new AudioSceneManager(mockLogger);
    assert.throws(() => {
      manager.addDialogueAttribution("non-existent", {
        speaker: "character",
        startPosition: 0,
        endPosition: 5,
      });
    }, /not found/);
  });

  test("addCognitionSafeguard throws error for non-existent scene", () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    const manager = new AudioSceneManager(mockLogger);
    assert.throws(() => {
      manager.addCognitionSafeguard("non-existent", {
        type: "attribution",
        description: "Test safeguard",
      });
    }, /not found/);
  });
});

describe("Audio Scene Scope Authorization", () => {

  test("creator role can create audio scenes", () => {
    assert.equal(isAuthorizedForScope("audio:scene:create", "creator", undefined), true);
  });

  test("creator role can read audio scenes", () => {
    assert.equal(isAuthorizedForScope("audio:scene:read", "creator", undefined), true);
  });

  test("creator role can update audio scenes", () => {
    assert.equal(isAuthorizedForScope("audio:scene:update", "creator", undefined), true);
  });

  test("creator role can delete audio scenes", () => {
    assert.equal(isAuthorizedForScope("audio:scene:delete", "creator", undefined), true);
  });

  test("editor_reviewer role can only read audio scenes", () => {
    assert.equal(isAuthorizedForScope("audio:scene:read", "editor_reviewer", undefined), true);
    assert.equal(isAuthorizedForScope("audio:scene:create", "editor_reviewer", undefined), false);
    assert.equal(isAuthorizedForScope("audio:scene:update", "editor_reviewer", undefined), false);
    assert.equal(isAuthorizedForScope("audio:scene:delete", "editor_reviewer", undefined), false);
  });

  test("listener_support role cannot access audio scenes", () => {
    assert.equal(isAuthorizedForScope("audio:scene:read", "listener_support", undefined), false);
    assert.equal(isAuthorizedForScope("audio:scene:create", "listener_support", undefined), false);
  });

  test("automation_service role has full audio scene access", () => {
    assert.equal(isAuthorizedForScope("audio:scene:create", "automation_service", undefined), true);
    assert.equal(isAuthorizedForScope("audio:scene:read", "automation_service", undefined), true);
    assert.equal(isAuthorizedForScope("audio:scene:update", "automation_service", undefined), true);
    assert.equal(isAuthorizedForScope("audio:scene:delete", "automation_service", undefined), true);
  });

  test("opus model can create, read, and update audio scenes but not delete", () => {
    assert.equal(isAuthorizedForScope("audio:scene:create", undefined, "opus"), true);
    assert.equal(isAuthorizedForScope("audio:scene:read", undefined, "opus"), true);
    assert.equal(isAuthorizedForScope("audio:scene:update", undefined, "opus"), true);
    assert.equal(isAuthorizedForScope("audio:scene:delete", undefined, "opus"), false);
  });

  test("sonnet model can create, read, and update audio scenes but not delete", () => {
    assert.equal(isAuthorizedForScope("audio:scene:create", undefined, "sonnet"), true);
    assert.equal(isAuthorizedForScope("audio:scene:read", undefined, "sonnet"), true);
    assert.equal(isAuthorizedForScope("audio:scene:update", undefined, "sonnet"), true);
    assert.equal(isAuthorizedForScope("audio:scene:delete", undefined, "sonnet"), false);
  });

  test("haiku model can only read audio scenes", () => {
    assert.equal(isAuthorizedForScope("audio:scene:read", undefined, "haiku"), true);
    assert.equal(isAuthorizedForScope("audio:scene:create", undefined, "haiku"), false);
    assert.equal(isAuthorizedForScope("audio:scene:update", undefined, "haiku"), false);
    assert.equal(isAuthorizedForScope("audio:scene:delete", undefined, "haiku"), false);
  });

  test("combined role and model permissions work correctly", () => {
    // Creator role + opus model = should have create access
    assert.equal(isAuthorizedForScope("audio:scene:create", "creator", "opus"), true);
    // Editor reviewer role + haiku model = should have read access
    assert.equal(isAuthorizedForScope("audio:scene:read", "editor_reviewer", "haiku"), true);
    // Listener support + any model = no audio scene access
    assert.equal(isAuthorizedForScope("audio:scene:read", "listener_support", "opus"), true); // opus provides read
    assert.equal(isAuthorizedForScope("audio:scene:create", "listener_support", "haiku"), false);
  });
});
