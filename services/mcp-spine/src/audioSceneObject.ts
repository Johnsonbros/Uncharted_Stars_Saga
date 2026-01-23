import type { Logger } from "./types/loggerTypes.js";

/**
 * Beat marker for audio timing and emphasis
 */
export interface BeatMarker {
  position: number; // Character offset in narration text
  type: "pause" | "emphasis" | "tone_shift" | "breath";
  duration?: number; // Duration in milliseconds (for pauses)
  intensity?: number; // Intensity level 0.0-1.0 (for emphasis)
  metadata?: Record<string, unknown>;
}

/**
 * Emotional state at a point in the narration
 */
export interface EmotionalPoint {
  position: number; // Character offset
  emotion: string; // e.g., "tense", "joyful", "fearful"
  intensity: number; // 0.0-1.0
}

/**
 * Dialogue attribution mapping
 */
export interface DialogueAttribution {
  speaker: string; // Character ID
  startPosition: number;
  endPosition: number;
  voiceProfileId?: string;
}

/**
 * Audio cognition safeguard
 */
export interface CognitionSafeguard {
  type: "attribution" | "context" | "naming" | "reference";
  description: string;
  position?: number;
}

/**
 * Audio Scene Object - performance-ready audio content
 *
 * This is the core unit of audio production in NAOS.
 * Not raw text, but annotated, performance-ready content.
 */
export interface AudioSceneObject {
  id: string;
  sceneId: string;
  chapterId: string;
  sequence: number;

  // Core audio content
  narrationText: string;
  beatMarkers: BeatMarker[];
  emotionalEnvelope: EmotionalPoint[];

  // Narrative context
  povAnchor: string; // Character ID whose perspective
  dialogueAttributions: DialogueAttribution[];

  // Audio production
  voiceProfileId: string;
  listenerCognitionSafeguards: CognitionSafeguard[];

  // Metadata
  canonStatus: "draft" | "proposed" | "canon";
  createdAt: Date;
  updatedAt: Date;
  version: number;
  tags?: string[];
  productionNotes?: string;
}

/**
 * Validation result for audio scene objects
 */
export interface AudioSceneValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  score?: number; // Overall quality score 0.0-1.0
}

/**
 * Audio Scene Object Manager
 *
 * Manages creation, validation, and storage of audio scene objects.
 */
export class AudioSceneManager {
  private logger: Logger;
  private scenes: Map<string, AudioSceneObject>;

  constructor(logger: Logger) {
    this.logger = logger;
    this.scenes = new Map();

    this.logger.info("AudioSceneManager initialized");
  }

  /**
   * Create a new audio scene object
   */
  createScene(
    sceneId: string,
    chapterId: string,
    narrationText: string,
    voiceProfileId: string,
    options?: {
      povAnchor?: string;
      sequence?: number;
      tags?: string[];
      productionNotes?: string;
    }
  ): AudioSceneObject {
    const scene: AudioSceneObject = {
      id: this.generateSceneId(sceneId),
      sceneId,
      chapterId,
      sequence: options?.sequence || 0,
      narrationText,
      beatMarkers: [],
      emotionalEnvelope: [],
      povAnchor: options?.povAnchor || "narrator",
      dialogueAttributions: [],
      voiceProfileId,
      listenerCognitionSafeguards: [],
      canonStatus: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      tags: options?.tags,
      productionNotes: options?.productionNotes,
    };

    this.scenes.set(scene.id, scene);

    this.logger.info("audio_scene.created", {
      scene_id: scene.id,
      chapter_id: chapterId,
      text_length: narrationText.length,
    });

    return scene;
  }

  /**
   * Get an audio scene object by ID
   */
  getScene(sceneId: string): AudioSceneObject | undefined {
    return this.scenes.get(sceneId);
  }

  /**
   * Update beat markers for a scene
   */
  updateBeatMarkers(sceneId: string, beatMarkers: BeatMarker[]): void {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new Error(`Audio scene ${sceneId} not found`);
    }

    // Validate beat markers
    this.validateBeatMarkers(scene.narrationText, beatMarkers);

    scene.beatMarkers = beatMarkers;
    scene.updatedAt = new Date();

    this.logger.info("audio_scene.beat_markers_updated", {
      scene_id: sceneId,
      marker_count: beatMarkers.length,
    });
  }

  /**
   * Update emotional envelope for a scene
   */
  updateEmotionalEnvelope(sceneId: string, envelope: EmotionalPoint[]): void {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new Error(`Audio scene ${sceneId} not found`);
    }

    scene.emotionalEnvelope = envelope;
    scene.updatedAt = new Date();

    this.logger.info("audio_scene.emotional_envelope_updated", {
      scene_id: sceneId,
      point_count: envelope.length,
    });
  }

  /**
   * Add dialogue attribution
   */
  addDialogueAttribution(sceneId: string, attribution: DialogueAttribution): void {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new Error(`Audio scene ${sceneId} not found`);
    }

    // Validate position ranges
    if (attribution.startPosition < 0 ||
        attribution.endPosition > scene.narrationText.length ||
        attribution.startPosition >= attribution.endPosition) {
      throw new Error("Invalid dialogue attribution position");
    }

    scene.dialogueAttributions.push(attribution);
    scene.updatedAt = new Date();

    this.logger.info("audio_scene.dialogue_attribution_added", {
      scene_id: sceneId,
      speaker: attribution.speaker,
    });
  }

  /**
   * Add cognition safeguard
   */
  addCognitionSafeguard(sceneId: string, safeguard: CognitionSafeguard): void {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new Error(`Audio scene ${sceneId} not found`);
    }

    scene.listenerCognitionSafeguards.push(safeguard);
    scene.updatedAt = new Date();

    this.logger.info("audio_scene.safeguard_added", {
      scene_id: sceneId,
      safeguard_type: safeguard.type,
    });
  }

  /**
   * Validate an audio scene object
   */
  validateScene(sceneId: string): AudioSceneValidation {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      return {
        valid: false,
        errors: [`Scene ${sceneId} not found`],
        warnings: [],
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate narration text
    if (!scene.narrationText || scene.narrationText.trim().length === 0) {
      errors.push("Narration text is empty");
    }

    // Validate voice profile
    if (!scene.voiceProfileId) {
      errors.push("Voice profile not assigned");
    }

    // Validate beat markers
    for (const marker of scene.beatMarkers) {
      if (marker.position < 0 || marker.position > scene.narrationText.length) {
        errors.push(`Beat marker at position ${marker.position} is out of bounds`);
      }
      if (marker.type === "pause" && (!marker.duration || marker.duration <= 0)) {
        warnings.push(`Pause at position ${marker.position} has no duration`);
      }
      if (marker.type === "emphasis" && (!marker.intensity || marker.intensity < 0 || marker.intensity > 1)) {
        warnings.push(`Emphasis at position ${marker.position} has invalid intensity`);
      }
    }

    // Validate emotional envelope
    for (const point of scene.emotionalEnvelope) {
      if (point.position < 0 || point.position > scene.narrationText.length) {
        errors.push(`Emotional point at position ${point.position} is out of bounds`);
      }
      if (point.intensity < 0 || point.intensity > 1) {
        errors.push(`Emotional point at position ${point.position} has invalid intensity`);
      }
    }

    // Validate dialogue attributions
    for (const attr of scene.dialogueAttributions) {
      if (attr.startPosition >= attr.endPosition) {
        errors.push(`Dialogue attribution has invalid range: ${attr.startPosition}-${attr.endPosition}`);
      }
      if (!attr.speaker) {
        errors.push("Dialogue attribution missing speaker");
      }
    }

    // Check for listener confusion risks
    if (scene.dialogueAttributions.length > 0 && scene.listenerCognitionSafeguards.length === 0) {
      warnings.push("Scene has dialogue but no cognition safeguards");
    }

    // Calculate quality score
    const score = this.calculateQualityScore(scene, errors.length, warnings.length);

    const valid = errors.length === 0;

    this.logger.info("audio_scene.validated", {
      scene_id: sceneId,
      valid,
      error_count: errors.length,
      warning_count: warnings.length,
      score,
    });

    return {
      valid,
      errors,
      warnings,
      score,
    };
  }

  /**
   * Run listener cognition audit
   */
  auditListenerCognition(sceneId: string): {
    passed: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      return {
        passed: false,
        issues: [`Scene ${sceneId} not found`],
        suggestions: [],
      };
    }

    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for clear attribution in dialogue
    const dialogueText = scene.dialogueAttributions.length;
    if (dialogueText > 0) {
      const safeguardsCount = scene.listenerCognitionSafeguards.filter(
        s => s.type === "attribution"
      ).length;

      if (safeguardsCount === 0) {
        issues.push("Dialogue present but no attribution safeguards");
        suggestions.push("Add speaker attribution safeguards to clarify who is speaking");
      }
    }

    // Check beat marker density (should have markers every ~200-300 chars for good pacing)
    const textLength = scene.narrationText.length;
    const markerCount = scene.beatMarkers.length;
    const idealMarkerCount = Math.ceil(textLength / 250);

    if (markerCount < idealMarkerCount * 0.5) {
      issues.push("Beat marker density too low - may lack natural pacing");
      suggestions.push(`Add more beat markers (current: ${markerCount}, recommended: ${idealMarkerCount})`);
    }

    // Check for excessive speaker switches
    const speakerSwitches = this.countSpeakerSwitches(scene.dialogueAttributions);
    if (speakerSwitches > 10) {
      issues.push("Excessive speaker switches may confuse listeners");
      suggestions.push("Consider adding narrator bridging or reducing speaker switches");
    }

    // Check emotional envelope coverage
    if (scene.emotionalEnvelope.length === 0 && textLength > 500) {
      issues.push("No emotional envelope for substantial narration");
      suggestions.push("Add emotional points to guide narrator performance");
    }

    const passed = issues.length === 0;

    this.logger.info("audio_scene.cognition_audit", {
      scene_id: sceneId,
      passed,
      issue_count: issues.length,
    });

    return { passed, issues, suggestions };
  }

  /**
   * Update canon status
   */
  updateCanonStatus(sceneId: string, status: AudioSceneObject["canonStatus"]): void {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new Error(`Audio scene ${sceneId} not found`);
    }

    const oldStatus = scene.canonStatus;
    scene.canonStatus = status;
    scene.updatedAt = new Date();

    this.logger.info("audio_scene.canon_status_updated", {
      scene_id: sceneId,
      old_status: oldStatus,
      new_status: status,
    });
  }

  /**
   * Get all scenes for a chapter
   */
  getScenesByChapter(chapterId: string): AudioSceneObject[] {
    return Array.from(this.scenes.values())
      .filter(scene => scene.chapterId === chapterId)
      .sort((a, b) => a.sequence - b.sequence);
  }

  /**
   * Delete a scene
   */
  deleteScene(sceneId: string): boolean {
    const deleted = this.scenes.delete(sceneId);

    if (deleted) {
      this.logger.info("audio_scene.deleted", {
        scene_id: sceneId,
      });
    }

    return deleted;
  }

  /**
   * Helper: Generate unique scene ID
   */
  private generateSceneId(sceneId: string): string {
    return `audio_${sceneId}_${Date.now()}`;
  }

  /**
   * Helper: Validate beat markers
   */
  private validateBeatMarkers(text: string, markers: BeatMarker[]): void {
    for (const marker of markers) {
      if (marker.position < 0 || marker.position > text.length) {
        throw new Error(`Beat marker position ${marker.position} out of bounds`);
      }
    }
  }

  /**
   * Helper: Calculate quality score
   */
  private calculateQualityScore(
    scene: AudioSceneObject,
    errorCount: number,
    warningCount: number
  ): number {
    // Start with perfect score
    let score = 1.0;

    // Penalize errors heavily
    score -= errorCount * 0.3;

    // Penalize warnings lightly
    score -= warningCount * 0.1;

    // Bonus for good beat marker density
    const idealMarkerCount = Math.ceil(scene.narrationText.length / 250);
    const markerRatio = scene.beatMarkers.length / idealMarkerCount;
    if (markerRatio >= 0.8 && markerRatio <= 1.2) {
      score += 0.1;
    }

    // Bonus for emotional envelope
    if (scene.emotionalEnvelope.length > 0) {
      score += 0.05;
    }

    // Bonus for cognition safeguards
    if (scene.listenerCognitionSafeguards.length > 0) {
      score += 0.05;
    }

    // Clamp to 0.0-1.0
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Helper: Count speaker switches
   */
  private countSpeakerSwitches(attributions: DialogueAttribution[]): number {
    if (attributions.length <= 1) return 0;

    let switches = 0;
    for (let i = 1; i < attributions.length; i++) {
      if (attributions[i].speaker !== attributions[i - 1].speaker) {
        switches++;
      }
    }
    return switches;
  }
}
