# agent.MD

> **Last Updated:** 2026-01-20

This file provides a concise, repo-specific reference for AI agents working in **Uncharted Stars Saga**.

## Project Context
- **Project:** Uncharted Stars Saga (NAOS: Narrative & Audio Operating System)
- **Phase:** Phase 1 - Foundation (architecture defined)
- **Primary Docs:**
  - `README.md` for project vision and roadmap
  - `ARCHITECTURE.md` for system design
  - `CLAUDE.md` for detailed AI assistant guidance
  - `TESTING_STRATEGY.md` for testing practices

## Key Principles
- **Stories are state, not documents.** Treat events, dependencies, and canon as first-class.
- **Audio-first.** Anything intended for listeners should prioritize audio cognition.
- **Canon is enforced.** Changes to canon require explicit validation gates.
- **Separation of concerns.** Creator OS, Listener Platform, and Data Layer are decoupled.

## Development Notes
- **Stack:** Next.js (frontend), Node.js (backend), MCP (AI orchestration), PostgreSQL + Object Storage.
- **Platform:** Replit (primary hosting).
- **Git:** Use feature branches; commit messages follow conventional commits (see `CLAUDE.md`).

## Quick Start for Agents
1. Read `README.md` and `ARCHITECTURE.md` before significant changes.
2. Follow conventions in `CLAUDE.md` for commit messages and workflows.
3. Run tests according to `TESTING_STRATEGY.md` when applicable.

