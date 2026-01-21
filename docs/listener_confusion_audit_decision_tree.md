# Listener Confusion Audit Decision Tree

> **Purpose:** Provide a consistent, audio-first decision path for diagnosing listener confusion risks before an audio scene is released.

```mermaid
flowchart TD
  A[Start: Draft Audio Scene] --> B{Attribution clarity?}
  B -- Clear --> C{POV consistency?}
  B -- Unclear --> B1[Revise speaker attribution cues] --> B

  C -- Consistent --> D{Temporal anchors present?}
  C -- Inconsistent --> C1[Align POV + narration beats] --> C

  D -- Present --> E{Scene density manageable?}
  D -- Missing --> D1[Add time/place anchors or recap beats] --> D

  E -- Manageable --> F{Character count < 4 within 60s?}
  E -- Overloaded --> E1[Split or simplify scene] --> E

  F -- Yes --> G{Names + roles differentiated?}
  F -- No --> F1[Reduce cast or add voice profile markers] --> F

  G -- Yes --> H{Audio cues support listener cognition?}
  G -- No --> G1[Add audio cues: pauses, emphasis, recap] --> G

  H -- Yes --> I[Pass: Confusion risk acceptable]
  H -- No --> H1[Add cues or restructure beats] --> H
```

## Usage Notes

- Run this audit before recording packet generation.
- If any branch loops more than twice, split the scene or re-outline the beat order.
- Record each failure point in the audit log with the scene ID and remediation summary.
