import { z } from "zod";

export const SceneTimingSchema = z
  .object({
    startMs: z.number().int().nonnegative(),
    endMs: z.number().int().positive(),
    estimatedDurationMs: z.number().int().positive().optional()
  })
  .refine((timing) => timing.endMs > timing.startMs, {
    message: "Scene timing endMs must be greater than startMs."
  });
export type SceneTiming = z.infer<typeof SceneTimingSchema>;

export const SceneMetadataSchema = z
  .object({
    chapterId: z.string().min(1).optional(),
    sequence: z.number().int().nonnegative().optional(),
    tags: z.array(z.string().min(1)).default([]),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional()
  })
  .default({ tags: [] });
export type SceneMetadata = z.infer<typeof SceneMetadataSchema>;

export const BeatMarkerTypeSchema = z.enum([
  "pause",
  "emphasis",
  "sfx",
  "music",
  "breath",
  "tempo",
  "transition",
  "custom"
]);
export type BeatMarkerType = z.infer<typeof BeatMarkerTypeSchema>;

export const BeatMarkerChannelSchema = z.enum(["delivery", "music", "sfx", "tone"]);
export type BeatMarkerChannel = z.infer<typeof BeatMarkerChannelSchema>;

export const BeatMarkerSchema = z.object({
  id: z.string().min(6),
  type: BeatMarkerTypeSchema,
  offsetMs: z.number().int().nonnegative(),
  durationMs: z.number().int().nonnegative().default(0),
  channel: BeatMarkerChannelSchema.default("delivery"),
  priority: z.number().int().min(-5).max(5).default(0),
  intensity: z.number().min(0).max(1).default(0.5),
  note: z.string().min(1).optional()
});
export type BeatMarker = z.infer<typeof BeatMarkerSchema>;

export const BeatMarkerInputSchema = z.object({
  id: z.string().min(6).optional(),
  type: BeatMarkerTypeSchema,
  offsetMs: z.number().int().nonnegative(),
  durationMs: z.number().int().nonnegative().optional(),
  channel: BeatMarkerChannelSchema.optional(),
  priority: z.number().int().min(-5).max(5).optional(),
  intensity: z.number().min(0).max(1).optional(),
  note: z.string().min(1).optional()
});
export type BeatMarkerInput = z.infer<typeof BeatMarkerInputSchema>;

export const TrackTypeSchema = z.enum(["narrator", "character"]);
export type TrackType = z.infer<typeof TrackTypeSchema>;

export const TrackTimingSchema = z
  .object({
    startMs: z.number().int().nonnegative(),
    endMs: z.number().int().nonnegative()
  })
  .refine((timing) => timing.endMs > timing.startMs, {
    message: "Track timing endMs must be greater than startMs."
  });
export type TrackTiming = z.infer<typeof TrackTimingSchema>;

export const TrackSchema = z.object({
  id: z.string().uuid(),
  speakerId: z.string().min(1),
  speakerLabel: z.string().min(1).optional(),
  type: TrackTypeSchema,
  voiceProfileId: z.string().uuid(),
  script: z.string().min(1),
  notes: z.string().min(1).optional(),
  attribution: z.string().min(1).optional(),
  timing: TrackTimingSchema.optional()
});
export type Track = z.infer<typeof TrackSchema>;

export const AudioSceneObjectSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().min(1),
    summary: z.string().min(1),
    location: z.string().min(1).optional(),
    timing: SceneTimingSchema,
    metadata: SceneMetadataSchema,
    beatMarkers: z.array(BeatMarkerSchema).default([]),
    tracks: z.array(TrackSchema).min(1)
  })
  .superRefine((scene, ctx) => {
    scene.beatMarkers.forEach((marker, index) => {
      const markerEnd = marker.offsetMs + marker.durationMs;
      if (marker.offsetMs < scene.timing.startMs) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Beat marker offset occurs before scene start.",
          path: ["beatMarkers", index, "offsetMs"]
        });
      }
      if (markerEnd > scene.timing.endMs) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Beat marker exceeds scene end.",
          path: ["beatMarkers", index, "durationMs"]
        });
      }
    });

    scene.tracks.forEach((track, index) => {
      if (!track.timing) {
        return;
      }
      if (track.timing.startMs < scene.timing.startMs) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Track timing starts before scene start.",
          path: ["tracks", index, "timing", "startMs"]
        });
      }
      if (track.timing.endMs > scene.timing.endMs) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Track timing ends after scene end.",
          path: ["tracks", index, "timing", "endMs"]
        });
      }
    });
  });
export type AudioSceneObject = z.infer<typeof AudioSceneObjectSchema>;

export const VoiceRoleSchema = z.enum(["narrator", "character"]);
export type VoiceRole = z.infer<typeof VoiceRoleSchema>;

export const VoiceToneSchema = z.enum([
  "neutral",
  "warm",
  "bright",
  "gravelly",
  "airy",
  "intense",
  "soft"
]);
export type VoiceTone = z.infer<typeof VoiceToneSchema>;

export const VoicePaceSchema = z.enum(["slow", "medium", "fast"]);
export type VoicePace = z.infer<typeof VoicePaceSchema>;

export const VoiceProfileSchema = z.object({
  id: z.string().uuid(),
  speakerId: z.string().min(1),
  displayName: z.string().min(1),
  role: VoiceRoleSchema,
  tone: VoiceToneSchema,
  pace: VoicePaceSchema,
  cadenceWpm: z.number().int().min(80).max(220),
  accent: z.string().min(1).optional(),
  styleTags: z.array(z.string().min(1)).default([]),
  notes: z.string().min(1).optional()
});
export type VoiceProfile = z.infer<typeof VoiceProfileSchema>;

export const VoiceProfileRequirementSchema = z.object({
  speakerId: z.string().min(1),
  role: VoiceRoleSchema
});
export type VoiceProfileRequirement = z.infer<typeof VoiceProfileRequirementSchema>;

export const RecordingTrackSchema = z.object({
  trackId: z.string().uuid(),
  speakerId: z.string().min(1),
  voiceProfileId: z.string().uuid(),
  speakerLabel: z.string().min(1),
  script: z.string().min(1),
  notes: z.string().min(1).optional(),
  attribution: z.string().min(1).optional()
});
export type RecordingTrack = z.infer<typeof RecordingTrackSchema>;

export const SpeakerNoteSchema = z.object({
  speakerId: z.string().min(1),
  voiceProfileId: z.string().uuid(),
  displayName: z.string().min(1),
  role: VoiceRoleSchema,
  tone: VoiceToneSchema,
  pace: VoicePaceSchema,
  cadenceWpm: z.number().int().min(80).max(220),
  notes: z.string().min(1).optional(),
  styleTags: z.array(z.string().min(1)).default([])
});
export type SpeakerNote = z.infer<typeof SpeakerNoteSchema>;

export const RecordingContextSchema = z.object({
  sceneSummary: z.string().min(1),
  speakerNotes: z.array(SpeakerNoteSchema),
  beatMarkers: z.array(BeatMarkerSchema)
});
export type RecordingContext = z.infer<typeof RecordingContextSchema>;

export const RecordingPacketSchema = z.object({
  packetId: z.string().min(1),
  sceneId: z.string().uuid(),
  fingerprint: z.string().min(1),
  generatedAt: z.coerce.date(),
  sceneTitle: z.string().min(1),
  sceneSummary: z.string().min(1),
  timing: SceneTimingSchema,
  tracks: z.array(RecordingTrackSchema),
  context: RecordingContextSchema
});
export type RecordingPacket = z.infer<typeof RecordingPacketSchema>;

export type AudioSceneValidationIssue = {
  severity: "error" | "warning";
  path: string;
  message: string;
};

export type VoiceProfileIssue = {
  speakerId: string;
  message: string;
};

export type ListenerCognitionAuditReport = {
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
};

export type AudioSceneValidationResult = {
  passed: boolean;
  issues: AudioSceneValidationIssue[];
  voiceProfileIssues: VoiceProfileIssue[];
  cognitionReport: ListenerCognitionAuditReport;
  beatMarkerConflicts: BeatMarkerConflict[];
};

export type BeatMarkerConflictResolution =
  | "trim_previous"
  | "shift_current"
  | "drop_previous"
  | "drop_current"
  | "trim_to_scene"
  | "shift_to_scene_start";

export type BeatMarkerConflict = {
  markerId: string;
  conflictsWith: string;
  resolution: BeatMarkerConflictResolution;
  details: string;
};
