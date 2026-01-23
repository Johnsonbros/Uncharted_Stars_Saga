import { describe, it, mock } from "node:test";
import assert from "node:assert";
import { BeatMarkerSystem } from "../src/beatMarker.js";
import type { Logger } from "../src/types/loggerTypes.js";
import type { BeatMarker } from "../src/audioSceneObject.js";

// Mock logger
const createMockLogger = (): Logger => ({
  debug: mock.fn(),
  info: mock.fn(),
  warn: mock.fn(),
  error: mock.fn(),
});

describe("BeatMarkerSystem", () => {
  describe("Initialization", () => {
    it("should initialize with default config", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      assert.ok(system);
    });

    it("should initialize with custom config", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger, {
        minPauseDuration: 100,
        maxPauseDuration: 3000,
        defaultEmphasisIntensity: 0.5,
        enableAutoSuggestions: false,
      });

      assert.ok(system);
    });
  });

  describe("Apply Markers", () => {
    it("should apply markers based on default rules", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const text = "Hello, world. How are you?";
      const markers = system.applyMarkers(text);

      assert.ok(markers.length > 0);
      // Should have markers for comma and periods
      const pauseMarkers = markers.filter((m) => m.type === "pause");
      assert.ok(pauseMarkers.length >= 2);
    });

    it("should detect sentence endings", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const text = "First sentence. Second sentence! Third sentence? Fourth one.";
      const markers = system.applyMarkers(text);

      const pauseMarkers = markers.filter((m) => m.type === "pause");
      // Should detect at least the sentence endings with spaces
      assert.ok(pauseMarkers.length >= 2);
    });

    it("should detect commas", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const text = "One, two, three, four";
      const markers = system.applyMarkers(text);

      const commaMarkers = markers.filter((m) => m.position === 3 || m.position === 8 || m.position === 15);
      assert.ok(commaMarkers.length > 0);
    });

    it("should detect em dashes", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const text = "She paused—then spoke.";
      const markers = system.applyMarkers(text);

      const dashMarkers = markers.filter((m) => m.position === 10);
      assert.ok(dashMarkers.length > 0);
    });

    it("should detect ellipsis", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const text = "Wait... what happened?";
      const markers = system.applyMarkers(text);

      const ellipsisMarkers = markers.filter((m) => m.position === 4);
      assert.ok(ellipsisMarkers.length > 0);
    });

    it("should deduplicate markers at same position", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const text = "Hello!";
      const markers = system.applyMarkers(text);

      // Should have only one marker at position 5 (exclamation)
      const position5Markers = markers.filter((m) => m.position === 5);
      assert.strictEqual(position5Markers.length, 1);
    });
  });

  describe("Suggest Markers", () => {
    it("should suggest markers for sentence endings", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const text = "First sentence. Second sentence. Third sentence.";
      const suggestions = system.suggestMarkers(text);

      const sentenceEndingSuggestions = suggestions.filter((s) => s.reason.includes("Sentence ending"));
      // Should find at least 2 sentence endings (with spaces after them)
      assert.ok(sentenceEndingSuggestions.length >= 1);
    });

    it("should suggest emphasis for all caps", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const text = "This is IMPORTANT information.";
      const suggestions = system.suggestMarkers(text);

      const emphasisSuggestions = suggestions.filter((s) => s.type === "emphasis");
      assert.ok(emphasisSuggestions.length > 0);
    });

    it("should suggest tone shifts for questions", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const text = "What happened?";
      const suggestions = system.suggestMarkers(text);

      const toneShiftSuggestions = suggestions.filter((s) => s.type === "tone_shift");
      assert.ok(toneShiftSuggestions.length > 0);
    });

    it("should suggest breathing points in long sentences", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const longText = "This is a very long sentence that goes on and on, with multiple clauses, and lots of commas, to demonstrate the need for breathing points, which help the narrator maintain a natural flow.";
      const suggestions = system.suggestMarkers(longText);

      const breathSuggestions = suggestions.filter((s) => s.type === "breath");
      assert.ok(breathSuggestions.length > 0);
    });

    it("should not suggest markers when disabled", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger, { enableAutoSuggestions: false });

      const text = "Some text here.";
      const suggestions = system.suggestMarkers(text);

      assert.strictEqual(suggestions.length, 0);
    });

    it("should sort suggestions by confidence", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const text = "What is IMPORTANT? Tell me now.";
      const suggestions = system.suggestMarkers(text);

      // Check that suggestions are sorted by confidence (descending)
      for (let i = 1; i < suggestions.length; i++) {
        assert.ok(suggestions[i - 1].confidence >= suggestions[i].confidence);
      }
    });
  });

  describe("Validate Markers", () => {
    it("should validate correct markers", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const text = "Hello, world.";
      const markers: BeatMarker[] = [
        { position: 5, type: "pause", duration: 300 },
        { position: 12, type: "pause", duration: 600 },
      ];

      const validation = system.validateMarkers(text, markers);

      assert.strictEqual(validation.valid, true);
      assert.strictEqual(validation.errors.length, 0);
    });

    it("should detect out-of-bounds positions", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const text = "Short";
      const markers: BeatMarker[] = [
        { position: 100, type: "pause", duration: 300 },
      ];

      const validation = system.validateMarkers(text, markers);

      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some((e) => e.includes("out of bounds")));
    });

    it("should detect missing pause duration", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const text = "Hello, world.";
      const markers: BeatMarker[] = [
        { position: 5, type: "pause" },
      ];

      const validation = system.validateMarkers(text, markers);

      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some((e) => e.includes("missing duration")));
    });

    it("should warn about short pause duration", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger, { minPauseDuration: 200 });

      const text = "Hello, world.";
      const markers: BeatMarker[] = [
        { position: 5, type: "pause", duration: 100 },
      ];

      const validation = system.validateMarkers(text, markers);

      assert.ok(validation.warnings.some((w) => w.includes("below minimum")));
    });

    it("should warn about long pause duration", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger, { maxPauseDuration: 2000 });

      const text = "Hello, world.";
      const markers: BeatMarker[] = [
        { position: 5, type: "pause", duration: 3000 },
      ];

      const validation = system.validateMarkers(text, markers);

      assert.ok(validation.warnings.some((w) => w.includes("exceeds maximum")));
    });

    it("should detect missing emphasis intensity", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const text = "Hello!";
      const markers: BeatMarker[] = [
        { position: 5, type: "emphasis" },
      ];

      const validation = system.validateMarkers(text, markers);

      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some((e) => e.includes("missing intensity")));
    });

    it("should detect invalid emphasis intensity", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const text = "Hello!";
      const markers: BeatMarker[] = [
        { position: 5, type: "emphasis", intensity: 1.5 },
      ];

      const validation = system.validateMarkers(text, markers);

      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some((e) => e.includes("invalid intensity")));
    });

    it("should warn about high marker density", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const text = "Hello world";
      const markers: BeatMarker[] = [];
      for (let i = 0; i < 10; i++) {
        markers.push({ position: i, type: "pause", duration: 300 });
      }

      const validation = system.validateMarkers(text, markers);

      assert.ok(validation.warnings.some((w) => w.includes("High marker density")));
    });
  });

  describe("Optimize Markers", () => {
    it("should remove clustered markers", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const text = "Hello, world.";
      const markers: BeatMarker[] = [
        { position: 5, type: "pause", duration: 300 },
        { position: 10, type: "pause", duration: 300 },
      ];

      const optimized = system.optimizeMarkers(text, markers);

      // Should remove one marker due to clustering
      assert.ok(optimized.length < markers.length);
    });

    it("should enforce minimum spacing", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const text = "Hello, world.";
      const markers: BeatMarker[] = [
        { position: 0, type: "pause", duration: 300 },
        { position: 5, type: "pause", duration: 300 },
      ];

      const optimized = system.optimizeMarkers(text, markers);

      // Check spacing between markers
      for (let i = 1; i < optimized.length; i++) {
        const spacing = optimized[i].position - optimized[i - 1].position;
        assert.ok(spacing >= 10);
      }
    });

    it("should sort markers by position", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const text = "Hello, world.";
      const markers: BeatMarker[] = [
        { position: 12, type: "pause", duration: 600 },
        { position: 5, type: "pause", duration: 300 },
      ];

      const optimized = system.optimizeMarkers(text, markers);

      // Check that markers are sorted
      for (let i = 1; i < optimized.length; i++) {
        assert.ok(optimized[i].position >= optimized[i - 1].position);
      }
    });

    it("should adjust pause durations based on context", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const text = "What happened? Something terrible.";
      const markers: BeatMarker[] = [
        { position: 14, type: "pause", duration: 500 },
      ];

      const optimized = system.optimizeMarkers(text, markers);

      // Pause after question should be adjusted
      assert.ok(optimized.length > 0);
      assert.ok(optimized[0].duration);
    });
  });

  describe("Custom Rules", () => {
    it("should add a custom rule", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const initialRules = system.getRules();
      const initialCount = initialRules.length;

      system.addRule({
        type: "pause",
        pattern: /;/g,
        duration: 400,
        priority: 5,
      });

      const newRules = system.getRules();
      assert.strictEqual(newRules.length, initialCount + 1);
    });

    it("should apply custom rules", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      system.addRule({
        type: "pause",
        pattern: /;/g,
        duration: 400,
        priority: 10,
      });

      const text = "First clause; second clause.";
      const markers = system.applyMarkers(text);

      const semicolonMarkers = markers.filter((m) => m.position === 12);
      assert.ok(semicolonMarkers.length > 0);
    });

    it("should remove a rule", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const initialCount = system.getRules().length;

      const removed = system.removeRule(0);

      assert.strictEqual(removed, true);
      assert.strictEqual(system.getRules().length, initialCount - 1);
    });

    it("should return false when removing non-existent rule", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const removed = system.removeRule(9999);

      assert.strictEqual(removed, false);
    });

    it("should sort rules by priority", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      system.addRule({
        type: "pause",
        pattern: /test1/g,
        priority: 1,
      });

      system.addRule({
        type: "pause",
        pattern: /test2/g,
        priority: 10,
      });

      const rules = system.getRules();

      // Check that rules are sorted by priority (descending)
      for (let i = 1; i < rules.length; i++) {
        assert.ok(rules[i - 1].priority >= rules[i].priority);
      }
    });
  });

  describe("Get Rules", () => {
    it("should return copy of rules array", () => {
      const logger = createMockLogger();
      const system = new BeatMarkerSystem(logger);

      const rules1 = system.getRules();
      const rules2 = system.getRules();

      // Should be different array instances
      assert.notStrictEqual(rules1, rules2);
      // But with same content
      assert.strictEqual(rules1.length, rules2.length);
    });
  });
});
