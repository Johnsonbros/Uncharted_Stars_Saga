# Auto Scene Generation Pipeline

This pipeline automates the conversion of canonized narrative events into performance-ready audio scene objects and recording packets. It is designed for audio-first cognition, canon integrity, and repeatable validation gates.

## Goals

- Convert canonized narrative events into structured `AudioSceneObject` data.
- Enforce canon, continuity, and listener cognition checks before recording.
- Provide deterministic artifacts for voice talent and post-production.

## Inputs

- Canonized events + dependencies (Narrative DB)
- Scene window definition (chapter, episode, or event batch)
- Voice profile registry + pronunciation glossary
- Canon constraints (promises, knowledge states, time ordering)

## Outputs

- Validated `AudioSceneObject` entries
- Listener cognition audit report
- `RecordingPacket` bundles (scene + beat markers + notes)

## Pipeline Flow (Auto)

```mermaid
flowchart TD
  start([Trigger: Auto Scene Generation Request])
  window[Select canon window + target scope
(chapter/episode/scene list)]
  context[Load narrative context
(events, knowledge, promises)]
  outline[Auto outline scenes
(summary beats + POV + intent)]
  draft[Generate draft AudioSceneObject
(dialogue, narration, timing)]
  voice[Resolve voice profiles + pronunciation
attach speaker notes]
  beats[Author beat markers
(pacing, emphasis, pauses)]
  schema[Schema validation
(AudioSceneObject + timing bounds)]
  cognition[Listener cognition audit
(confusion risk + speaker clarity)]
  gate{Pass validation + cognition?}
  revise[Auto revision pass
(issue-targeted rewrite)]
  approve[Creator review + approval
(optional manual edits)]
  packet[Generate RecordingPacket
(voice tracks + cues)]
  store[Persist scene + packet
(audit log + version hash)]
  done([Ready for recording])

  start --> window --> context --> outline --> draft --> voice --> beats --> schema --> cognition --> gate
  gate -- "fail" --> revise --> schema
  gate -- "pass" --> approve --> packet --> store --> done
```

## Gate Criteria

1. **Schema validation**: All fields present, timing within scene bounds.
2. **Continuity validation**: Events align with canon state and knowledge timing.
3. **Cognition audit**: Speaker clarity, attribution, and pacing checks pass.
4. **Creator approval**: Human sign-off before recording packet generation.

## Failure Handling

- Failed steps produce a targeted issue list for revision.
- Auto revision passes are limited to scoped, issue-driven rewrites.
- Repeated failures must escalate to manual authoring.

## Telemetry + Audit Trail

- Pipeline emits a `scene_generation_id` for correlation.
- Every revision logs issue types, fix attempts, and outcome.
- Final artifacts include a stable content hash for provenance.
