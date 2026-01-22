# agent.md

> **Last Updated:** 2026-01-20

This file defines how AI agents are expected to think, act, and make decisions in the **Uncharted Stars Saga** repo.  
It overrides generic agent defaults and prioritizes correctness, canon integrity, and audio-first storytelling.

## Project Context (Read Order)
1. `README.md` — vision, roadmap, and current priorities.
2. `ARCHITECTURE.md` — system design and boundaries.
3. `CLAUDE.md` — agent workflow, commit conventions, and PR expectations.
4. `TESTING_STRATEGY.md` — what to run and when.

## Core Principles (Non-Negotiable)
- **Stories are state, not documents.**  
  Treat scenes, events, timelines, and character arcs as mutable state that must remain internally consistent.
- **Audio-first.**  
  Optimize for listening: clarity, pacing, dialogue flow, and cognitive load matter more than visual structure.
- **Canon is enforced.**  
  Canon changes require explicit identification, validation, and acknowledgment.
- **Separation of concerns.**  
  Creator OS, Listener Platform, and Data Layer must remain decoupled.

## Canon Safety Rules
- If you are unsure whether something is canon → assume it is and stop.
- If you intend to change canon → state it explicitly before implementing.
- If sources conflict → flag the conflict and defer resolution.

## Development Notes
- **Stack:** Next.js (frontend), Node.js (backend), MCP (AI orchestration), PostgreSQL + Object Storage.
- **Platform:** Replit (primary hosting).
- **Git:** Feature branches only. Conventional commits required (see `CLAUDE.md`).

## Task Workflow (Default)
0. **Pre-flight:** Classify the task (code, story, infra) and note any canon or audio impact.
1. **Clarify scope:** Identify affected subsystem(s): Creator OS, Listener Platform, Data Layer.
2. **Scan relevant docs:** Follow the read order above; stop early if trivial.
3. **Plan:** Required for non-trivial changes or anything touching canon.
4. **Implement:** Keep changes minimal and principle-aligned.
5. **Validate:** Run tests per `TESTING_STRATEGY.md` or explain why not.
6. **Summarize:** Provide a short, actionable summary with files changed.

## Multi-Agent Sprint Protocol (Parallel, Non-Overlapping)
**Goal:** Allow multiple agents to work in parallel without duplicating effort or colliding on files.

### 1) Task Claiming Rules (Required)
- **Single active task per agent.**
- **Claim before work:** Update the Task Card in `SYSTEM_TODO.md` to set:
  - `Status: [~]`
  - `Assignee:` (your agent name)
  - `Claim token:` (timestamp + short ID, e.g., `2026-01-20T18:42Z/agent-03`)
  - `Claimed at:` (UTC)
- **If a task is already claimed**, pick another unclaimed task.
- **If you must abandon a task**, set `Status: [ ]` and add a brief blocker note.

### 2) Sprint Packet Structure (Recommended)
When work can be parallelized, group items into **Sprint Packets**:
- **Packet size:** 5 tasks max.
- **Each task:** up to 5 explicit subtasks.
- **Packet owner:** assigns tasks, ensures no overlap, tracks completion.

### 3) Handoff Requirements (Required)
On completion, update the Task Card:
- `Status: [x]`
- `Done looks like:` (confirm acceptance criteria)
- `Files involved:` (updated list)
- `Tests required:` (run or note why not)
- `Docs updates required:` (verify or add)
- Add a **handoff note** with next-step context if follow-on work is needed.

### 4) Conflict Resolution
- If two agents collide, the **earliest claim token wins**.
- The second agent must **unclaim and pick a new task**.
- Escalate unresolved conflicts by documenting them in the Task Card.

## Standard Agent Prompt (Copy/Paste)
Use this prompt to launch any parallel agent so they self-select tasks without overlap:

```
You are Agent <NAME>. Follow agent.MD and SYSTEM_TODO.md.

1) Open SYSTEM_TODO.md and choose the next unclaimed task using the Next-Task Selection Rules.
2) Claim it by updating the Task Card: Status [~], Assignee, Claim token, Claimed at.
3) Do only that task. If blocked, unclaim it with a blocker note and pick another.
4) On completion, set Status [x], fill acceptance criteria, files, tests, and docs updates.
5) Provide a short handoff summary.
```

## Efficiency Checklist
- Prefer small, focused diffs.
- Avoid reformatting unrelated code.
- Explicitly document canon-impacting changes.
- If blocked, leave a clear next-step recommendation.

## When in Doubt
Pause implementation. Summarize the uncertainty and propose 1–2 safe options rather than guessing.

## PR / Commit Reminder
- Use conventional commit messages.
- Include a concise PR summary and testing notes.
