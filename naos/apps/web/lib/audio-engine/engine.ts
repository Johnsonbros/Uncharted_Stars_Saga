import crypto from "node:crypto";
import {
  type AudioSceneObject,
  type AudioSceneValidationIssue,
  type AudioSceneValidationResult,
  type BeatMarker,
  type BeatMarkerConflict,
  type BeatMarkerConflictResolution,
  type BeatMarkerInput,
  type ListenerCognitionAuditReport,
  type RecordingPacket,
  type RecordingTrack,
  type SceneTiming,
  type SpeakerNote,
  type VoiceProfile,
  type VoiceProfileIssue,
  AudioSceneObjectSchema,
  BeatMarkerInputSchema,
  RecordingPacketSchema,
  VoiceProfileSchema
} from "./models";

export type BeatMarkerAuthoringOptions = {
  timing?: SceneTiming;
  enforceWithinScene?: boolean;
  minGapMs?: number;
};

export type BeatMarkerAuthoringResult = {
  ordered: BeatMarker[];
  conflicts: BeatMarkerConflict[];
};

const DEFAULT_MIN_GAP_MS = 200;

function createBeatMarkerId(input: BeatMarkerInput): string {
  const fingerprint = JSON.stringify({
    type: input.type,
    offsetMs: input.offsetMs,
    durationMs: input.durationMs ?? 0,
    channel: input.channel ?? "delivery",
    priority: input.priority ?? 0,
    intensity: input.intensity ?? 0.5,
    note: input.note ?? ""
  });
  const hash = crypto.createHash("sha256").update(fingerprint).digest("hex").slice(0, 16);
  return `bm_${hash}`;
}

function normalizeBeatMarker(input: BeatMarkerInput): BeatMarker {
  const parsed = BeatMarkerInputSchema.parse(input);
  return {
    id: parsed.id ?? createBeatMarkerId(parsed),
    type: parsed.type,
    offsetMs: parsed.offsetMs,
    durationMs: parsed.durationMs ?? 0,
    channel: parsed.channel ?? "delivery",
    priority: parsed.priority ?? 0,
    intensity: parsed.intensity ?? 0.5,
    note: parsed.note
  };
}

function compareMarkers(a: BeatMarker, b: BeatMarker): number {
  if (a.offsetMs !== b.offsetMs) {
    return a.offsetMs - b.offsetMs;
  }
  if (a.priority !== b.priority) {
    return b.priority - a.priority;
  }
  if (a.channel !== b.channel) {
    return a.channel.localeCompare(b.channel);
  }
  if (a.type !== b.type) {
    return a.type.localeCompare(b.type);
  }
  return a.id.localeCompare(b.id);
}

function applySceneBounds(
  marker: BeatMarker,
  timing?: SceneTiming,
  enforceWithinScene?: boolean
): { marker: BeatMarker | null; conflicts: BeatMarkerConflict[] } {
  if (!timing || !enforceWithinScene) {
    return { marker, conflicts: [] };
  }

  const conflicts: BeatMarkerConflict[] = [];
  const start = timing.startMs;
  const end = timing.endMs;
  let adjusted = { ...marker };

  if (adjusted.offsetMs < start) {
    conflicts.push({
      markerId: adjusted.id,
      conflictsWith: "scene.start",
      resolution: "shift_to_scene_start",
      details: `Beat marker shifted from ${adjusted.offsetMs}ms to ${start}ms.`
    });
    adjusted.offsetMs = start;
  }

  const markerEnd = adjusted.offsetMs + adjusted.durationMs;
  if (markerEnd > end) {
    const trimmedDuration = Math.max(0, end - adjusted.offsetMs);
    conflicts.push({
      markerId: adjusted.id,
      conflictsWith: "scene.end",
      resolution: "trim_to_scene",
      details: `Beat marker duration trimmed from ${adjusted.durationMs}ms to ${trimmedDuration}ms.`
    });
    adjusted.durationMs = trimmedDuration;
  }

  if (adjusted.offsetMs > end) {
    return { marker: null, conflicts };
  }

  return { marker: adjusted, conflicts };
}

function recordConflict(
  conflicts: BeatMarkerConflict[],
  markerId: string,
  conflictsWith: string,
  resolution: BeatMarkerConflictResolution,
  details: string
) {
  conflicts.push({
    markerId,
    conflictsWith,
    resolution,
    details
  });
}

function resolveChannelMarkers(
  markers: BeatMarker[],
  options: BeatMarkerAuthoringOptions
): { markers: BeatMarker[]; conflicts: BeatMarkerConflict[] } {
  const conflicts: BeatMarkerConflict[] = [];
  const resolved: BeatMarker[] = [];
  const minGapMs = options.minGapMs ?? DEFAULT_MIN_GAP_MS;

  for (const marker of markers.sort(compareMarkers)) {
    let current: BeatMarker | null = marker;
    const last = resolved.at(-1);

    if (last && current) {
      const lastEnd = last.offsetMs + last.durationMs;
      if (current.offsetMs < lastEnd + minGapMs) {
        if (current.priority > last.priority) {
          const trimmedDuration = Math.max(
            0,
            current.offsetMs - minGapMs - last.offsetMs
          );
          if (trimmedDuration === 0) {
            resolved.pop();
            recordConflict(
              conflicts,
              current.id,
              last.id,
              "drop_previous",
              "Higher priority marker replaced overlapping marker."
            );
          } else {
            resolved[resolved.length - 1] = { ...last, durationMs: trimmedDuration };
            recordConflict(
              conflicts,
              current.id,
              last.id,
              "trim_previous",
              "Higher priority marker trimmed previous marker to avoid overlap."
            );
          }
        } else {
          const shiftedOffset = lastEnd + minGapMs;
          recordConflict(
            conflicts,
            current.id,
            last.id,
            "shift_current",
            `Marker shifted from ${current.offsetMs}ms to ${shiftedOffset}ms to avoid overlap.`
          );
          current = { ...current, offsetMs: shiftedOffset };
        }
      }
    }

    if (!current) {
      continue;
    }

    const bounded = applySceneBounds(current, options.timing, options.enforceWithinScene);
    conflicts.push(...bounded.conflicts);
    if (bounded.marker) {
      resolved.push(bounded.marker);
    } else {
      recordConflict(
        conflicts,
        current.id,
        "scene.end",
        "drop_current",
        "Marker was outside the scene timing window."
      );
    }
  }

  return { markers: resolved, conflicts };
}

export function authorBeatMarkers(
  inputs: BeatMarkerInput[],
  options: BeatMarkerAuthoringOptions = {}
): BeatMarkerAuthoringResult {
  const normalized = inputs.map(normalizeBeatMarker);
  const grouped = new Map<string, BeatMarker[]>();

  for (const marker of normalized) {
    const bucket = grouped.get(marker.channel) ?? [];
    bucket.push(marker);
    grouped.set(marker.channel, bucket);
  }

  const ordered: BeatMarker[] = [];
  const conflicts: BeatMarkerConflict[] = [];

  for (const [channel, markers] of grouped.entries()) {
    const resolved = resolveChannelMarkers(markers, options);
    ordered.push(...resolved.markers.map((marker) => ({ ...marker, channel })));
    conflicts.push(...resolved.conflicts);
  }

  ordered.sort(compareMarkers);

  return { ordered, conflicts };
}

export function validateVoiceProfilesForScene(
  scene: AudioSceneObject,
  profiles: VoiceProfile[]
): VoiceProfileIssue[] {
  const issues: VoiceProfileIssue[] = [];
  const profileIndex = new Map(profiles.map((profile) => [profile.id, profile] as const));

  for (const track of scene.tracks) {
    const profile = profileIndex.get(track.voiceProfileId);
    if (!profile) {
      issues.push({
        speakerId: track.speakerId,
        message: `Missing voice profile ${track.voiceProfileId} for track ${track.id}.`
      });
      continue;
    }
    if (profile.speakerId !== track.speakerId) {
      issues.push({
        speakerId: track.speakerId,
        message: `Voice profile ${profile.id} speakerId does not match track speakerId.`
      });
    }
    if (profile.role !== track.type) {
      issues.push({
        speakerId: track.speakerId,
        message: `Voice profile ${profile.id} role ${profile.role} does not match track type ${track.type}.`
      });
    }
  }

  return issues;
}

function validateProfilesShape(profiles: VoiceProfile[]): AudioSceneValidationIssue[] {
  const issues: AudioSceneValidationIssue[] = [];
  profiles.forEach((profile, index) => {
    const parsed = VoiceProfileSchema.safeParse(profile);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        issues.push({
          severity: "error",
          path: ["voiceProfiles", index, ...issue.path].join("."),
          message: issue.message
        });
      });
    }
  });
  return issues;
}

function toIssue(issue: AudioSceneValidationIssue["message"], path: string): AudioSceneValidationIssue {
  return {
    severity: "error",
    path,
    message: issue
  };
}

export function auditListenerCognition(
  scene: AudioSceneObject,
  beatMarkers: BeatMarker[]
): ListenerCognitionAuditReport {
  const issues: string[] = [];
  const recommendations: string[] = [];

  const narratorTracks = scene.tracks.filter((track) => track.type === "narrator");
  if (narratorTracks.length === 0) {
    issues.push("No narrator track present for scene framing.");
    recommendations.push("Add a narrator track to anchor listener orientation.");
  }

  const characterTracks = scene.tracks.filter((track) => track.type === "character");
  if (characterTracks.length > 1) {
    const missingAttribution = characterTracks.filter(
      (track) => !track.attribution && !track.speakerLabel
    );
    if (missingAttribution.length > 0) {
      issues.push("Multiple character tracks lack explicit attribution.");
      recommendations.push("Add attribution or speaker labels for character tracks.");
    }
  }

  const denseWindowMs = 10000;
  const maxMarkersPerWindow = 8;
  const sortedMarkers = [...beatMarkers].sort(compareMarkers);
  let windowStartIndex = 0;

  for (let i = 0; i < sortedMarkers.length; i += 1) {
    const current = sortedMarkers[i];
    while (
      sortedMarkers[windowStartIndex] &&
      current.offsetMs - sortedMarkers[windowStartIndex].offsetMs > denseWindowMs
    ) {
      windowStartIndex += 1;
    }
    const windowCount = i - windowStartIndex + 1;
    if (windowCount > maxMarkersPerWindow) {
      issues.push(
        `Beat marker density exceeds ${maxMarkersPerWindow} markers per 10s window near ${current.offsetMs}ms.`
      );
      recommendations.push("Reduce beat marker density or space cues further apart.");
      break;
    }
  }

  const speakerSwitches = scene.tracks.length - 1;
  if (speakerSwitches > 6) {
    issues.push("High number of speaker switches in a single scene.");
    recommendations.push("Consider grouping dialogue or adding narration to reduce switches.");
  }

  const score = Math.max(0, 1 - issues.length * 0.15);

  return {
    passed: issues.length === 0,
    score,
    issues,
    recommendations
  };
}

export function validateAudioScene(
  scene: AudioSceneObject,
  profiles: VoiceProfile[] = []
): AudioSceneValidationResult {
  const issues: AudioSceneValidationIssue[] = [];
  const parsed = AudioSceneObjectSchema.safeParse(scene);
  if (!parsed.success) {
    parsed.error.issues.forEach((issue) => {
      issues.push({
        severity: "error",
        path: issue.path.join("."),
        message: issue.message
      });
    });
  }

  issues.push(...validateProfilesShape(profiles));

  const voiceProfileIssues =
    profiles.length > 0 && parsed.success ? validateVoiceProfilesForScene(parsed.data, profiles) : [];
  voiceProfileIssues.forEach((issue, index) => {
    issues.push(toIssue(issue.message, ["voiceProfiles", index].join(".")));
  });

  const safeScene = parsed.success ? parsed.data : scene;
  const authoredBeats = parsed.success
    ? authorBeatMarkers(safeScene.beatMarkers, {
        timing: safeScene.timing,
        enforceWithinScene: true
      })
    : { ordered: [], conflicts: [] };
  const cognitionReport = parsed.success
    ? auditListenerCognition(safeScene, authoredBeats.ordered)
    : {
        passed: false,
        score: 0,
        issues: ["Scene failed schema validation."],
        recommendations: ["Fix schema issues before running cognition audit."]
      };

  const passed =
    issues.length === 0 &&
    voiceProfileIssues.length === 0 &&
    cognitionReport.passed &&
    authoredBeats.conflicts.length === 0;

  return {
    passed,
    issues,
    voiceProfileIssues,
    cognitionReport,
    beatMarkerConflicts: authoredBeats.conflicts
  };
}

function fingerprintScene(scene: AudioSceneObject, profiles: VoiceProfile[]): string {
  const sortedProfiles = [...profiles].sort((a, b) => a.id.localeCompare(b.id));
  const payload = JSON.stringify({
    scene,
    profiles: sortedProfiles
  });
  return crypto.createHash("sha256").update(payload).digest("hex");
}

function buildSpeakerNotes(profiles: VoiceProfile[]): SpeakerNote[] {
  return profiles.map((profile) => ({
    speakerId: profile.speakerId,
    voiceProfileId: profile.id,
    displayName: profile.displayName,
    role: profile.role,
    tone: profile.tone,
    pace: profile.pace,
    cadenceWpm: profile.cadenceWpm,
    notes: profile.notes,
    styleTags: profile.styleTags
  }));
}

function buildRecordingTracks(scene: AudioSceneObject, profiles: VoiceProfile[]): RecordingTrack[] {
  const profileIndex = new Map(profiles.map((profile) => [profile.id, profile] as const));
  return scene.tracks.map((track) => {
    const profile = profileIndex.get(track.voiceProfileId);
    return {
      trackId: track.id,
      speakerId: track.speakerId,
      voiceProfileId: track.voiceProfileId,
      speakerLabel: track.speakerLabel ?? profile?.displayName ?? track.speakerId,
      script: track.script,
      notes: track.notes,
      attribution: track.attribution
    };
  });
}

export function generateRecordingPacket(
  scene: AudioSceneObject,
  profiles: VoiceProfile[],
  options: { generatedAt?: Date } = {}
): RecordingPacket {
  const validation = validateAudioScene(scene, profiles);
  if (!validation.passed) {
    throw new Error("Audio scene failed validation. Resolve issues before generating packet.");
  }

  const fingerprint = fingerprintScene(scene, profiles);
  const packetId = `packet_${fingerprint.slice(0, 16)}`;
  const authoredBeats = authorBeatMarkers(scene.beatMarkers, {
    timing: scene.timing,
    enforceWithinScene: true
  });

  const packet: RecordingPacket = {
    packetId,
    sceneId: scene.id,
    fingerprint,
    generatedAt: options.generatedAt ?? new Date(0),
    sceneTitle: scene.title,
    sceneSummary: scene.summary,
    timing: scene.timing,
    tracks: buildRecordingTracks(scene, profiles),
    context: {
      sceneSummary: scene.summary,
      speakerNotes: buildSpeakerNotes(profiles),
      beatMarkers: authoredBeats.ordered
    }
  };

  return RecordingPacketSchema.parse(packet);
}
