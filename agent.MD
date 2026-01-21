# agent.MD

> **Last Updated:** 2026-01-20

This file provides a concise, repo-specific reference for AI agents working in **Uncharted Stars Saga**, optimized for fast onboarding and task execution.

## Project Context (Read Order)
1. `README.md` — vision, roadmap, and current priorities.
2. `ARCHITECTURE.md` — system design and boundaries.
3. `CLAUDE.md` — agent workflow, commit conventions, and PR expectations.
4. `TESTING_STRATEGY.md` — what to run and when.

## Key Principles (Non-Negotiable)
- **Stories are state, not documents.** Treat events, dependencies, and canon as first-class data.
- **Audio-first.** Anything intended for listeners should prioritize audio cognition.
- **Canon is enforced.** Changes to canon require explicit validation gates.
- **Separation of concerns.** Creator OS, Listener Platform, and Data Layer are decoupled.

## Development Notes
- **Stack:** Next.js (frontend), Node.js (backend), MCP (AI orchestration), PostgreSQL + Object Storage.
- **Platform:** Replit (primary hosting).
- **Git:** Use feature branches; commit messages follow conventional commits (see `CLAUDE.md`).

## Task Workflow (Default)
1. **Clarify scope:** Identify which subsystem(s) you are changing (Creator OS, Listener Platform, Data Layer).
2. **Scan relevant docs:** Use the read order above; stop early if the change is trivial.
3. **Plan:** Outline steps if the change is non-trivial or touches canon.
4. **Implement:** Keep changes minimal and aligned with the principles.
5. **Validate:** Run tests per `TESTING_STRATEGY.md` (or explain why not).
6. **Summarize:** Provide a short, actionable summary and cite files changed.

## Efficiency Checklist
- Prefer small, focused diffs.
- Avoid reformatting unrelated code.
- Document any canon-impacting changes explicitly.
- If blocked, leave a clear next-step recommendation.

## PR/Commit Reminder
- Use conventional commit messages.
- Provide a concise PR summary and testing notes.
