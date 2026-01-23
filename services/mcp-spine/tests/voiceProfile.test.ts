import { describe, it, mock } from "node:test";
import assert from "node:assert";
import { VoiceProfileManager } from "../src/voiceProfile.js";
import type { Logger } from "../src/types/loggerTypes.js";

// Mock logger
const createMockLogger = (): Logger => ({
  debug: mock.fn(),
  info: mock.fn(),
  warn: mock.fn(),
  error: mock.fn(),
});

describe("VoiceProfileManager", () => {
  describe("Profile Creation", () => {
    it("should create a narrator voice profile", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Main Narrator", "narrator");

      assert.ok(profile.id);
      assert.strictEqual(profile.name, "Main Narrator");
      assert.strictEqual(profile.role, "narrator");
      assert.strictEqual(profile.tempo, 150);
      assert.strictEqual(profile.authority, 0.7);
      assert.strictEqual(profile.tone, "neutral");
      assert.strictEqual(profile.version, 1);
    });

    it("should create a character voice profile", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Alice", "character", {
        characterId: "char-alice",
        tempo: 160,
        authority: 0.5,
        tone: "warm",
        ageRange: "young_adult",
        gender: "female",
      });

      assert.strictEqual(profile.role, "character");
      assert.strictEqual(profile.characterId, "char-alice");
      assert.strictEqual(profile.tempo, 160);
      assert.strictEqual(profile.tone, "warm");
      assert.strictEqual(profile.ageRange, "young_adult");
      assert.strictEqual(profile.gender, "female");
    });

    it("should create profile with custom options", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Mysterious Narrator", "narrator", {
        tempo: 140,
        authority: 0.9,
        emotionalRange: { min: 0.2, max: 0.9 },
        tone: "cold",
        pace: "slow",
        accent: "British",
        styleTags: ["mysterious", "foreboding"],
      });

      assert.strictEqual(profile.tempo, 140);
      assert.strictEqual(profile.authority, 0.9);
      assert.deepStrictEqual(profile.emotionalRange, { min: 0.2, max: 0.9 });
      assert.strictEqual(profile.tone, "cold");
      assert.strictEqual(profile.pace, "slow");
      assert.strictEqual(profile.accent, "British");
      assert.deepStrictEqual(profile.styleTags, ["mysterious", "foreboding"]);
    });

    it("should map character to profile", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Bob", "character", {
        characterId: "char-bob",
      });

      const retrieved = manager.getProfileForCharacter("char-bob");

      assert.ok(retrieved);
      assert.strictEqual(retrieved.id, profile.id);
    });
  });

  describe("Profile Retrieval", () => {
    it("should retrieve profile by ID", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const created = manager.createProfile("Test", "narrator");
      const retrieved = manager.getProfile(created.id);

      assert.ok(retrieved);
      assert.strictEqual(retrieved.id, created.id);
    });

    it("should return undefined for non-existent profile", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.getProfile("non-existent");

      assert.strictEqual(profile, undefined);
    });

    it("should get all profiles", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      manager.createProfile("Narrator 1", "narrator");
      manager.createProfile("Narrator 2", "narrator");
      manager.createProfile("Character 1", "character");

      const all = manager.getAllProfiles();

      assert.strictEqual(all.length, 3);
    });

    it("should get profiles by role", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      manager.createProfile("Narrator 1", "narrator");
      manager.createProfile("Narrator 2", "narrator");
      manager.createProfile("Character 1", "character");

      const narrators = manager.getProfilesByRole("narrator");
      const characters = manager.getProfilesByRole("character");

      assert.strictEqual(narrators.length, 2);
      assert.strictEqual(characters.length, 1);
    });

    it("should return undefined for non-existent character", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.getProfileForCharacter("non-existent");

      assert.strictEqual(profile, undefined);
    });
  });

  describe("Profile Updates", () => {
    it("should update profile attributes", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Test", "narrator");

      manager.updateProfile(profile.id, {
        tempo: 180,
        tone: "dramatic",
        authority: 0.9,
      });

      const updated = manager.getProfile(profile.id);

      assert.strictEqual(updated?.tempo, 180);
      assert.strictEqual(updated?.tone, "dramatic");
      assert.strictEqual(updated?.authority, 0.9);
      assert.strictEqual(updated?.version, 2);
    });

    it("should throw error for non-existent profile", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      assert.throws(() => {
        manager.updateProfile("non-existent", { tempo: 180 });
      }, /not found/);
    });

    it("should update version number", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Test", "narrator");

      assert.strictEqual(profile.version, 1);

      manager.updateProfile(profile.id, { tempo: 180 });
      const updated = manager.getProfile(profile.id);

      assert.strictEqual(updated?.version, 2);
    });
  });

  describe("Pronunciation Notes", () => {
    it("should add pronunciation note", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Test", "narrator");

      manager.addPronunciationNote(profile.id, "naive", "nah-EEV");

      const updated = manager.getProfile(profile.id);

      assert.strictEqual(updated?.pronunciationNotes.length, 1);
      assert.strictEqual(updated?.pronunciationNotes[0].word, "naive");
      assert.strictEqual(updated?.pronunciationNotes[0].pronunciation, "nah-EEV");
    });

    it("should add multiple pronunciation notes", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Test", "narrator");

      manager.addPronunciationNote(profile.id, "naive", "nah-EEV");
      manager.addPronunciationNote(profile.id, "cache", "CASH");

      const updated = manager.getProfile(profile.id);

      assert.strictEqual(updated?.pronunciationNotes.length, 2);
    });

    it("should throw error for non-existent profile", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      assert.throws(() => {
        manager.addPronunciationNote("non-existent", "test", "TEST");
      }, /not found/);
    });
  });

  describe("Allowed Quirks", () => {
    it("should add allowed quirk", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Test", "character");

      manager.addAllowedQuirk(profile.id, "Occasional stutter when nervous");

      const updated = manager.getProfile(profile.id);

      assert.strictEqual(updated?.allowedQuirks.length, 1);
      assert.strictEqual(updated?.allowedQuirks[0], "Occasional stutter when nervous");
    });

    it("should not add duplicate quirks", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Test", "character");

      manager.addAllowedQuirk(profile.id, "Stutter");
      manager.addAllowedQuirk(profile.id, "Stutter");

      const updated = manager.getProfile(profile.id);

      assert.strictEqual(updated?.allowedQuirks.length, 1);
    });
  });

  describe("Forbidden Patterns", () => {
    it("should add forbidden pattern", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Test", "narrator");

      manager.addForbiddenPattern(profile.id, "No filler words like 'um' or 'uh'");

      const updated = manager.getProfile(profile.id);

      assert.strictEqual(updated?.forbiddenPatterns.length, 1);
      assert.strictEqual(updated?.forbiddenPatterns[0], "No filler words like 'um' or 'uh'");
    });

    it("should not add duplicate patterns", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Test", "narrator");

      manager.addForbiddenPattern(profile.id, "No filler words");
      manager.addForbiddenPattern(profile.id, "No filler words");

      const updated = manager.getProfile(profile.id);

      assert.strictEqual(updated?.forbiddenPatterns.length, 1);
    });
  });

  describe("Consistency Checking", () => {
    it("should pass consistency check for consistent usage", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Alice", "character", {
        characterId: "char-alice",
      });

      const check = manager.checkConsistency(profile.id, [profile.id, profile.id, profile.id]);

      assert.strictEqual(check.consistent, true);
      assert.strictEqual(check.issues.length, 0);
    });

    it("should detect inconsistent profile usage", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile1 = manager.createProfile("Alice", "character");
      const profile2 = manager.createProfile("Bob", "character");

      const check = manager.checkConsistency(profile1.id, [profile1.id, profile2.id, profile1.id]);

      assert.strictEqual(check.consistent, false);
      assert.ok(check.issues.some((i) => i.includes("different voice profiles")));
    });

    it("should detect character without characterId", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Orphan", "character");

      const check = manager.checkConsistency(profile.id, [profile.id]);

      assert.ok(check.issues.some((i) => i.includes("not linked to a character")));
    });

    it("should suggest adding pronunciation notes", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Test", "narrator");

      const check = manager.checkConsistency(profile.id, [profile.id]);

      assert.ok(check.suggestions.some((s) => s.includes("pronunciation notes")));
    });

    it("should calculate consistency score", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Test", "narrator", {
        characterId: "char-test",
        styleTags: ["dramatic"],
      });

      manager.addPronunciationNote(profile.id, "test", "TEST");

      const check = manager.checkConsistency(profile.id, [profile.id]);

      assert.ok(check.score !== undefined);
      assert.ok(check.score >= 0 && check.score <= 1);
    });
  });

  describe("Profile Comparison", () => {
    it("should compare identical profiles", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Test", "narrator");

      const comparison = manager.compareProfiles(profile.id, profile.id);

      assert.strictEqual(comparison.similarity, 1.0);
      assert.strictEqual(comparison.differences.length, 0);
    });

    it("should compare different profiles", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile1 = manager.createProfile("Narrator 1", "narrator", {
        tempo: 150,
        tone: "neutral",
      });

      const profile2 = manager.createProfile("Narrator 2", "narrator", {
        tempo: 180,
        tone: "dramatic",
      });

      const comparison = manager.compareProfiles(profile1.id, profile2.id);

      assert.ok(comparison.similarity < 1.0);
      assert.ok(comparison.differences.length > 0);
    });

    it("should detect all attribute differences", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile1 = manager.createProfile("Test 1", "narrator", {
        tempo: 150,
        authority: 0.7,
        tone: "neutral",
        pace: "medium",
      });

      const profile2 = manager.createProfile("Test 2", "character", {
        tempo: 180,
        authority: 0.5,
        tone: "warm",
        pace: "fast",
      });

      const comparison = manager.compareProfiles(profile1.id, profile2.id);

      const attrNames = comparison.differences.map((d) => d.attribute);
      assert.ok(attrNames.includes("role"));
      assert.ok(attrNames.includes("tempo"));
      assert.ok(attrNames.includes("authority"));
      assert.ok(attrNames.includes("tone"));
      assert.ok(attrNames.includes("pace"));
    });

    it("should handle non-existent profiles", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Test", "narrator");

      const comparison = manager.compareProfiles(profile.id, "non-existent");

      assert.strictEqual(comparison.similarity, 0);
      assert.ok(comparison.differences.length > 0);
    });
  });

  describe("Assignment Validation", () => {
    it("should validate correct assignment", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Alice", "character", {
        characterId: "char-alice",
        emotionalRange: { min: 0.3, max: 0.9 },
      });

      const validation = manager.validateAssignment(profile.id, {
        characterId: "char-alice",
        emotionalIntensity: 0.6,
      });

      assert.strictEqual(validation.valid, true);
      assert.strictEqual(validation.warnings.length, 0);
    });

    it("should warn about character mismatch", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Alice", "character", {
        characterId: "char-alice",
      });

      const validation = manager.validateAssignment(profile.id, {
        characterId: "char-bob",
      });

      assert.ok(validation.warnings.some((w) => w.includes("different character")));
    });

    it("should warn about emotional range mismatch", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Test", "narrator", {
        emotionalRange: { min: 0.3, max: 0.7 },
      });

      const validation = manager.validateAssignment(profile.id, {
        emotionalIntensity: 0.9,
      });

      assert.ok(validation.warnings.some((w) => w.includes("outside profile range")));
    });

    it("should warn about pace mismatch with scene type", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Slow Narrator", "narrator", {
        pace: "slow",
      });

      const validation = manager.validateAssignment(profile.id, {
        sceneType: "action",
      });

      assert.ok(validation.warnings.some((w) => w.includes("may not suit action")));
    });
  });

  describe("Profile Deletion", () => {
    it("should delete a profile", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Test", "narrator");

      const deleted = manager.deleteProfile(profile.id);

      assert.strictEqual(deleted, true);
      assert.strictEqual(manager.getProfile(profile.id), undefined);
    });

    it("should remove character mapping when deleting", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Alice", "character", {
        characterId: "char-alice",
      });

      manager.deleteProfile(profile.id);

      const retrieved = manager.getProfileForCharacter("char-alice");
      assert.strictEqual(retrieved, undefined);
    });

    it("should return false for non-existent profile", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const deleted = manager.deleteProfile("non-existent");

      assert.strictEqual(deleted, false);
    });
  });

  describe("Profile Cloning", () => {
    it("should clone a profile", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const original = manager.createProfile("Original", "narrator", {
        tempo: 160,
        authority: 0.8,
        tone: "dramatic",
      });

      manager.addPronunciationNote(original.id, "test", "TEST");
      manager.addAllowedQuirk(original.id, "Quirk");

      const cloned = manager.cloneProfile(original.id, "Cloned");

      assert.notStrictEqual(cloned.id, original.id);
      assert.strictEqual(cloned.name, "Cloned");
      assert.strictEqual(cloned.tempo, original.tempo);
      assert.strictEqual(cloned.authority, original.authority);
      assert.strictEqual(cloned.tone, original.tone);
      assert.strictEqual(cloned.version, 1);
      assert.strictEqual(cloned.characterId, undefined);
    });

    it("should throw error for non-existent profile", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      assert.throws(() => {
        manager.cloneProfile("non-existent", "New");
      }, /not found/);
    });
  });

  describe("Export for Recording", () => {
    it("should export profile for recording", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Test Narrator", "narrator", {
        tempo: 150,
        authority: 0.8,
        tone: "dramatic",
        pace: "medium",
        emotionalRange: { min: 0.3, max: 0.9 },
        styleTags: ["mysterious", "foreboding"],
      });

      manager.addPronunciationNote(profile.id, "naive", "nah-EEV");
      manager.addAllowedQuirk(profile.id, "Slight pause before dramatic reveals");
      manager.addForbiddenPattern(profile.id, "No filler words");

      const exported = manager.exportForRecording(profile.id);

      assert.strictEqual(exported.profileId, profile.id);
      assert.strictEqual(exported.name, "Test Narrator");
      assert.ok(exported.instructions.includes("dramatic"));
      assert.ok(exported.instructions.includes("naive"));
      assert.ok(exported.instructions.includes("mysterious"));
      assert.strictEqual(exported.technicalSpecs.tempo, 150);
      assert.strictEqual(exported.technicalSpecs.authority, 0.8);
    });

    it("should throw error for non-existent profile", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      assert.throws(() => {
        manager.exportForRecording("non-existent");
      }, /not found/);
    });

    it("should include all relevant sections in instructions", () => {
      const logger = createMockLogger();
      const manager = new VoiceProfileManager(logger);

      const profile = manager.createProfile("Alice", "character", {
        characterId: "char-alice",
        ageRange: "young_adult",
        gender: "female",
        accent: "American",
        styleTags: ["energetic"],
      });

      manager.addPronunciationNote(profile.id, "test", "TEST");
      manager.addAllowedQuirk(profile.id, "Quirk");
      manager.addForbiddenPattern(profile.id, "Pattern");

      const exported = manager.exportForRecording(profile.id);

      assert.ok(exported.instructions.includes("Age Range"));
      assert.ok(exported.instructions.includes("Gender"));
      assert.ok(exported.instructions.includes("Accent"));
      assert.ok(exported.instructions.includes("Style"));
      assert.ok(exported.instructions.includes("Pronunciation Notes"));
      assert.ok(exported.instructions.includes("Allowed Quirks"));
      assert.ok(exported.instructions.includes("Avoid"));
    });
  });
});
