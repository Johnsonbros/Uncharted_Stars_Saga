import { describe, expect, it } from "vitest";
import {
  auditListenerCognition,
  authorBeatMarkers,
  generateRecordingPacket,
  validateAudioScene,
  validateVoiceProfilesForScene
} from "../engine";
import { type AudioSceneObject, type BeatMarkerInput, type VoiceProfile } from "../models";

const baseScene: AudioSceneObject = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "Docking Bay Arrival",
  summary: "The crew arrives at Bay 7 and surveys the hangar.",
  location: "Bay 7",
  timing: {
    startMs: 0,
    endMs: 60000,
    estimatedDurationMs: 60000
  },
  metadata: {
    chapterId: "chapter-1",
    sequence: 1,
    tags: ["arrival", "hangar"],
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: new Date("2025-01-01T00:00:00.000Z")
  },
  beatMarkers: [
    {
      id: "bm_000001",
      type: "pause",
      offsetMs: 1000,
      durationMs: 500,
      channel: "delivery",
      priority: 0,
      intensity: 0.4,
      note: "Breath before reveal"
    },
    {
      id: "bm_000002",
      type: "music",
      offsetMs: 4000,
      durationMs: 2000,
      channel: "music",
      priority: 0,
      intensity: 0.6,
      note: "Ambient swell"
    }
  ],
  tracks: [
    {
      id: "22222222-2222-2222-2222-222222222222",
      speakerId: "narrator-1",
      speakerLabel: "Narrator",
      type: "narrator",
      voiceProfileId: "33333333-3333-3333-3333-333333333333",
      script: "We touched down at Bay 7 as the alarms faded.",
      notes: "Steady, grounded tone.",
      attribution: "Narrator"
    }
  ]
};

const baseProfiles: VoiceProfile[] = [
  {
    id: "33333333-3333-3333-3333-333333333333",
    speakerId: "narrator-1",
    displayName: "NAOS Narrator",
    role: "narrator",
    tone: "warm",
    pace: "medium",
    cadenceWpm: 160,
    styleTags: ["calm"],
    notes: "Maintain an inviting cadence."
  }
];

describe("audio engine", () => {
  it("authors beat markers in order and records overlaps", () => {
    const inputs: BeatMarkerInput[] = [
      {
        id: "bm_late",
        type: "pause",
        offsetMs: 2000,
        durationMs: 400,
        channel: "delivery",
        priority: 0,
        intensity: 0.3
      },
      {
        id: "bm_early",
        type: "pause",
        offsetMs: 500,
        durationMs: 200,
        channel: "delivery",
        priority: 0,
        intensity: 0.2
      },
      {
        id: "bm_overlap",
        type: "emphasis",
        offsetMs: 600,
        durationMs: 200,
        channel: "delivery",
        priority: -1,
        intensity: 0.7
      }
    ];

    const { ordered, conflicts } = authorBeatMarkers(inputs, { minGapMs: 200 });

    expect(ordered.map((marker) => marker.id)).toEqual(["bm_early", "bm_overlap", "bm_late"]);
    expect(conflicts.length).toBeGreaterThanOrEqual(1);
  });

  it("validates audio scene objects and voice profile constraints", () => {
    const validation = validateAudioScene(baseScene, baseProfiles);
    expect(validation.passed).toBe(true);

    const mismatchedProfiles: VoiceProfile[] = [
      {
        ...baseProfiles[0],
        id: "44444444-4444-4444-4444-444444444444",
        speakerId: "another-speaker",
        role: "character"
      }
    ];

    const mismatchedScene: AudioSceneObject = {
      ...baseScene,
      tracks: [
        {
          ...baseScene.tracks[0],
          voiceProfileId: "44444444-4444-4444-4444-444444444444"
        }
      ]
    };

    const issues = validateVoiceProfilesForScene(mismatchedScene, mismatchedProfiles);
    expect(issues).toHaveLength(2);
    expect(issues[0].message).toMatch(/speakerId does not match/);
  });

  it("generates recording packets with required context blocks", () => {
    const packet = generateRecordingPacket(baseScene, baseProfiles, {
      generatedAt: new Date("2025-01-10T00:00:00.000Z")
    });

    expect(packet.packetId).toMatch(/^packet_/);
    expect(packet.context.beatMarkers).toHaveLength(2);
    expect(packet.context.speakerNotes).toHaveLength(1);
    expect(packet.tracks).toHaveLength(1);
    expect(packet.generatedAt.toISOString()).toBe("2025-01-10T00:00:00.000Z");
  });

  it("scores listener cognition audits and flags high-density cues", () => {
    const denseMarkers: BeatMarkerInput[] = Array.from({ length: 9 }, (_, index) => ({
      id: `bm_dense_${index}`,
      type: "pause",
      offsetMs: 200 * index,
      durationMs: 50,
      channel: "delivery",
      priority: 0,
      intensity: 0.2
    }));

    const scene: AudioSceneObject = {
      ...baseScene,
      id: "55555555-5555-5555-5555-555555555555",
      tracks: [
        {
          id: "66666666-6666-6666-6666-666666666666",
          speakerId: "char-1",
          type: "character",
          voiceProfileId: "77777777-7777-7777-7777-777777777777",
          script: "We are not alone in this bay."
        },
        {
          id: "88888888-8888-8888-8888-888888888888",
          speakerId: "char-2",
          type: "character",
          voiceProfileId: "99999999-9999-9999-9999-999999999999",
          script: "Keep your voice down."
        }
      ],
      beatMarkers: denseMarkers.map((marker) => ({
        id: marker.id ?? "",
        type: marker.type,
        offsetMs: marker.offsetMs,
        durationMs: marker.durationMs ?? 0,
        channel: marker.channel ?? "delivery",
        priority: marker.priority ?? 0,
        intensity: marker.intensity ?? 0.5
      }))
    };

    const report = auditListenerCognition(scene, authorBeatMarkers(denseMarkers).ordered);

    expect(report.passed).toBe(false);
    expect(report.score).toBeLessThan(1);
    expect(report.issues.join(" ")).toMatch(/Beat marker density/);
  });
});
