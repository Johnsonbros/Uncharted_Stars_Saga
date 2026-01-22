import type { Logger } from "../types/loggerTypes.js";
import type {
  AudioSceneObject,
  VoiceProfile,
  RecordingPacket,
  ListenerCognitionAuditReport,
  AudioSceneValidationResult,
  BeatMarker
} from "../../../../naos/apps/web/lib/audio-engine/models.js";
import {
  generateRecordingPacket,
  auditListenerCognition,
  validateAudioScene
} from "../../../../naos/apps/web/lib/audio-engine/engine.js";

export type AudioPacketGenerateInput = {
  sceneId: string;
  scene: AudioSceneObject;
  profiles: VoiceProfile[];
  requestedBy: string;
  requestId?: string;
};

export type AudioPacketGenerateResponse = {
  success: boolean;
  packet?: RecordingPacket;
  validation?: AudioSceneValidationResult;
  error?: string;
  message?: string;
  request_id: string;
  scene_id: string;
  generated_at: string;
};

export type ListenerConfusionAuditInput = {
  sceneId: string;
  scene: AudioSceneObject;
  beatMarkers?: BeatMarker[];
  requestedBy: string;
  requestId?: string;
};

export type ListenerConfusionAuditResponse = {
  success: boolean;
  audit?: ListenerCognitionAuditReport;
  validation?: AudioSceneValidationResult;
  error?: string;
  message?: string;
  request_id: string;
  scene_id: string;
  audited_at: string;
};

export class AudioTools {
  constructor(private logger: Logger) {}

  /**
   * Generate a recording packet from an audio scene and voice profiles.
   * Validates the scene, runs cognition audits, and produces a performance-ready packet.
   */
  async generateAudioPacket(
    input: AudioPacketGenerateInput
  ): Promise<AudioPacketGenerateResponse> {
    const requestId = input.requestId ?? `req_${Date.now()}`;
    const generatedAt = new Date().toISOString();

    this.logger.info("audio.packet.generate.started", {
      request_id: requestId,
      scene_id: input.sceneId,
      requested_by: input.requestedBy,
      profile_count: input.profiles.length
    });

    try {
      // First, validate the audio scene
      const validation = validateAudioScene(input.scene, input.profiles);

      if (!validation.passed) {
        this.logger.warn("audio.packet.generate.validation_failed", {
          request_id: requestId,
          scene_id: input.sceneId,
          issue_count: validation.issues.length,
          cognition_passed: validation.cognitionReport.passed
        });

        return {
          success: false,
          validation,
          error: "Audio scene validation failed. Resolve issues before generating packet.",
          message: `Found ${validation.issues.length} validation issues and ${validation.cognitionReport.issues.length} cognition issues.`,
          request_id: requestId,
          scene_id: input.sceneId,
          generated_at: generatedAt
        };
      }

      // Generate the recording packet
      const packet = generateRecordingPacket(input.scene, input.profiles, {
        generatedAt: new Date()
      });

      this.logger.info("audio.packet.generate.success", {
        request_id: requestId,
        scene_id: input.sceneId,
        packet_id: packet.packetId,
        track_count: packet.tracks.length,
        beat_marker_count: packet.context.beatMarkers.length
      });

      return {
        success: true,
        packet,
        validation,
        message: `Successfully generated recording packet with ${packet.tracks.length} tracks.`,
        request_id: requestId,
        scene_id: input.sceneId,
        generated_at: generatedAt
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error("audio.packet.generate.error", {
        request_id: requestId,
        scene_id: input.sceneId,
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage,
        message: "Failed to generate recording packet due to internal error.",
        request_id: requestId,
        scene_id: input.sceneId,
        generated_at: generatedAt
      };
    }
  }

  /**
   * Run a listener cognition audit on an audio scene.
   * Checks for attribution clarity, speaker density, and cognitive load.
   */
  async auditListenerConfusion(
    input: ListenerConfusionAuditInput
  ): Promise<ListenerConfusionAuditResponse> {
    const requestId = input.requestId ?? `req_${Date.now()}`;
    const auditedAt = new Date().toISOString();

    this.logger.info("listener.confusion.audit.started", {
      request_id: requestId,
      scene_id: input.sceneId,
      requested_by: input.requestedBy,
      beat_marker_count: input.beatMarkers?.length ?? input.scene.beatMarkers.length
    });

    try {
      // Validate the scene first
      const validation = validateAudioScene(input.scene);

      // Run cognition audit with provided or scene-default beat markers
      const beatMarkers = input.beatMarkers ?? input.scene.beatMarkers;
      const audit = auditListenerCognition(input.scene, beatMarkers);

      this.logger.info("listener.confusion.audit.completed", {
        request_id: requestId,
        scene_id: input.sceneId,
        passed: audit.passed,
        score: audit.score,
        issue_count: audit.issues.length,
        recommendation_count: audit.recommendations.length
      });

      return {
        success: true,
        audit,
        validation,
        message: audit.passed
          ? "Cognition audit passed with no issues."
          : `Cognition audit flagged ${audit.issues.length} issues.`,
        request_id: requestId,
        scene_id: input.sceneId,
        audited_at: auditedAt
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error("listener.confusion.audit.error", {
        request_id: requestId,
        scene_id: input.sceneId,
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage,
        message: "Failed to complete cognition audit due to internal error.",
        request_id: requestId,
        scene_id: input.sceneId,
        audited_at: auditedAt
      };
    }
  }
}
