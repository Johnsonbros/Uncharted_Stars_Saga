# Audio Engine Documentation

## Audio Scene Schema (v1)

### Purpose
The Audio Scene Object (ASO) is the canonical, validated payload produced by the Narrative Engine and consumed by the Audio Engine to render audio assets. The schema focuses on deterministic rendering, safety checks, and traceable provenance.

### Core Shape
```json
{
  "scene_id": "scene-ch4-s3",
  "scene_version": "v3",
  "title": "Chapter 4 - Scene 3",
  "series_id": "uss",
  "season_number": 1,
  "episode_number": 4,
  "language": "en-US",
  "duration_target_seconds": 432,
  "beats": [],
  "voices": [],
  "mix": {},
  "safety": {},
  "provenance": {}
}
```

### Required Fields
| Field | Type | Description |
| --- | --- | --- |
| `scene_id` | string | Stable identifier from narrative pipeline. |
| `scene_version` | string | Monotonic version tag emitted per export. |
| `series_id` | string | Short series/universe identifier. |
| `season_number` | int | Season index (1-based). |
| `episode_number` | int | Episode index (1-based). |
| `language` | string | BCP-47 locale for rendering. |
| `beats` | array | Ordered list of beat objects. |
| `voices` | array | Voice profiles referenced by beats. |
| `mix` | object | Mix directives (levels, stems, normalization). |
| `safety` | object | Required safety checks and thresholds. |
| `provenance` | object | Source references (canon, proposal, commits). |

### Beat Object
```json
{
  "beat_id": "beat-012",
  "order": 12,
  "type": "dialogue",
  "speaker": "voice-narrator",
  "script": "We moved through the corridor.",
  "timing": { "min_seconds": 3.2, "max_seconds": 4.8 },
  "effects": [{ "type": "reverb", "preset": "hall" }],
  "music_cue": "underscore-quiet",
  "sfx": ["door_slide"]
}
```

Validation rules:
- `order` is strictly increasing with no gaps.
- `speaker` must reference an entry in `voices`.
- `timing.min_seconds` <= `timing.max_seconds`.
- `type` must be one of: `dialogue`, `narration`, `sfx`, `music`, `silence`.

### Voice Profile Object
```json
{
  "voice_id": "voice-narrator",
  "label": "Narrator",
  "gender": "neutral",
  "age_range": "adult",
  "accent": "general-american",
  "timbre": "warm",
  "pace_wpm": 160,
  "pitch_range": "mid",
  "safety": { "max_emotion_intensity": 0.7 }
}
```

Validation rules:
- `voice_id` is unique.
- `pace_wpm` between 120 and 200.
- `max_emotion_intensity` between 0 and 1.

### Mix Object
```json
{
  "target_lufs": -16,
  "true_peak_db": -1,
  "stem_balance": {
    "dialogue": 0.0,
    "music": -6.0,
    "sfx": -3.0
  }
}
```

Validation rules:
- `target_lufs` between -24 and -12.
- `true_peak_db` <= -1.

### Safety Object
```json
{
  "listener_confusion_threshold": 0.3,
  "max_sfx_density_per_min": 12,
  "profanity_filter": "soft"
}
```

Validation rules:
- `listener_confusion_threshold` between 0 and 1.
- `max_sfx_density_per_min` between 0 and 30.

### Provenance Object
```json
{
  "canon_event_ids": ["evt-991", "evt-992"],
  "proposal_id": "prop-88b",
  "source_commit": "a1b2c3d",
  "generated_at": "2026-01-20T10:00:00Z"
}
```

Validation rules:
- `canon_event_ids` must be non-empty.
- `generated_at` is ISO-8601.

## Voice Profile Constraints & Audio Safety Guidelines

### Voice Constraints
- All voices must include `label`, `accent`, and `timbre`.
- Voices tagged as `child` require `profanity_filter = strict` in `safety`.
- Do not reuse a voice profile across two distinct characters unless explicitly marked as `voice_role = narrator`.

### Safety Guidelines
- Cap simultaneous speakers at 2 for dialogue beats unless `safety.allow_overlap = true`.
- Maintain `target_lufs` between -18 and -14 for long-form content.
- Enforce `listener_confusion_threshold <= 0.3` for production exports.
- No beat may exceed `max_emotion_intensity` of its voice profile.

### Required Validation Checks
- Beat ordering, speaker existence, and timing bounds.
- Mix compliance (LUFS/true peak).
- SFX density vs. `max_sfx_density_per_min`.
- Content safety filters applied before render.
