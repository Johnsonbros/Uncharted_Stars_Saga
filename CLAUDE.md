# CLAUDE.md - AI Assistant Guide for Uncharted Stars Saga

> **Last Updated:** 2026-01-20
> **Repository Status:** Phase 1 - Foundation (NAOS Architecture Defined)

This document provides comprehensive guidance for AI assistants (like Claude) working on the Uncharted Stars Saga repository. It documents the codebase structure, development workflows, conventions, and best practices.

---

## Table of Contents

1. [Repository Overview](#repository-overview)
2. [Current State](#current-state)
3. [Development Workflow](#development-workflow)
4. [Git Conventions](#git-conventions)
5. [Code Conventions](#code-conventions)
6. [AI Assistant Guidelines](#ai-assistant-guidelines)
7. [Common Tasks](#common-tasks)
8. [Future Development](#future-development)

---

## Repository Overview

**Project Name:** Uncharted Stars Saga
**Repository:** Johnsonbros/Uncharted_Stars_Saga
**Purpose:** Narrative & Audio Operating System (NAOS) - A story simulation engine for long-running audiobook universes

### Project Goals

NAOS is a solo-author, audiobook-first platform for creating and publishing living story universes. This is not a writing app - it's a story simulation engine with institutional memory.

Key objectives:

1. **State-Based Storytelling**: Treat stories as state (events, dependencies, knowledge) not documents
2. **Audio-First Production**: Create audiobook-native content optimized for listening
3. **Canon Integrity**: AI-enforced canon management with explicit validation gates
4. **Institutional Memory**: Multi-model AI orchestration for long-term continuity assistance
5. **Direct Community**: $49 Founders Lifetime membership for dedicated listeners
6. **Long-Horizon Design**: Built for one creator over years or decades

### Key Stakeholders
- **Owner/Creator:** Nate Johnson
- **Primary AI Assistant:** Claude (via Claude Code CLI)
- **Platform:** Replit (hosting and development)

### NAOS Architecture Overview

The system consists of three decoupled layers:

**1. Creator Operating System (Private):**
- **Narrative Engine**: Events, knowledge states, canon management, dependency graphs
- **Audio Engine**: Audio scene objects, beat markers, voice profiles, recording packets
- **MCP Spine**: Controlled AI model access via Resources, Tools, and Prompts

**2. Listener Platform (Public):**
- Marketing website with audio trailer
- Founders membership checkout ($49 lifetime)
- Audiobook player with streaming and resume
- Clean, premium listening experience (no ads/tracking)

**3. Data Layer:**
- Narrative PostgreSQL (events, canon, dependencies)
- Audio Object Storage (master audio files)
- Listener PostgreSQL (accounts, entitlements, playback)
- Strictly separated: Creator OS and Listener Platform never share data

**Core Principle:** Stories are state, not documents. Canon is enforced, not implied. Audio is primary, text is supporting.

See [README.md](README.md) for overview and [ARCHITECTURE.md](ARCHITECTURE.md) for complete technical specification.

---

## Current State

### Repository Structure

As of 2026-01-20, the repository contains foundational documentation:

```
Uncharted_Stars_Saga/
├── .git/                    # Git version control
├── ARCHITECTURE.md          # Complete NAOS system architecture (NEW)
├── SYSTEM_TODO.md           # System-wide build/test/diagram checklists
├── README.md               # NAOS overview and project vision
├── CLAUDE.md              # This file - AI assistant guide
└── TESTING_STRATEGY.md    # Testing strategy and best practices
```

### Technology Stack
**Status:** ✅ Architecture defined, stack selected

**Platform:** Replit (all-in-one hosting and development)

**Technology Choices:**
- **Frontend**: Next.js 14+ (React) with Tailwind CSS
- **Backend**: Node.js with Express/Fastify + Anthropic Agent SDK
- **AI/ML**: Anthropic Claude via Agent SDK with custom MCP servers
  - MCP Resources: Read-only narrative state access
  - MCP Tools: Proposal-based canon modifications
  - Multi-model support: Opus (deep reasoning), Sonnet (balance), Haiku (speed)
- **Database**: Replit PostgreSQL (separate DBs for Creator OS and Listener Platform)
- **Storage**: Replit Object Storage (audio files with CDN)
- **Auth**: Replit Auth or Supabase Auth (email-first)
- **Payment**: Stripe Checkout and webhooks ($49 Founders Lifetime)
- **Testing**: Jest (JavaScript), pytest (if Python components added)

**Why Replit:**
- Zero infrastructure configuration
- Built-in database, storage, and CDN
- Automatic deployments with HTTPS
- Secrets management built-in
- Cost-effective for Phase 1
- Clear upgrade path to external services if scale demands

### Dependencies & Configuration
**Status:** No configuration files present yet

When technology stack is chosen, typical configuration files may include:
- `package.json` - Node.js/npm dependencies
- `requirements.txt` or `pyproject.toml` - Python dependencies
- `Cargo.toml` - Rust dependencies
- Build system configuration files
- Environment configuration (`.env.example`)

---

## Development Workflow

### Branch Strategy

This repository follows a feature-branch workflow:

1. **Main Branch:** `main` (or `master`)
   - Protected branch containing production-ready code
   - Requires pull requests for changes
   - Never commit directly to main

2. **Feature Branches:** `claude/*` or `feature/*`
   - Created for specific features or tasks
   - Naming convention: `claude/<description>-<session-id>` for AI-generated branches
   - Example: `claude/add-claude-documentation-iKzfC`

3. **Current Working Branch:** Branch varies by session
   - Check git status to see current branch
   - All development happens on feature branches
   - Will be merged to main via Pull Request

### Development Process

1. **Start New Feature:**
   ```bash
   git checkout -b claude/feature-name-sessionId
   # or
   git checkout -b feature/feature-name
   ```

2. **Make Changes:**
   - Implement changes incrementally
   - Test thoroughly before committing
   - Follow established code conventions

3. **Commit Changes:**
   ```bash
   git add <files>
   git commit -m "Clear, descriptive commit message"
   ```

4. **Push to Remote:**
   ```bash
   git push -u origin <branch-name>
   ```
   - **Important:** Branches must follow naming convention (start with `claude/` and match session ID)
   - Retry up to 4 times with exponential backoff on network failures

5. **Create Pull Request:**
   - Use GitHub CLI: `gh pr create --title "Title" --body "Description"`
   - Include clear summary of changes
   - Reference any related issues
   - Provide test plan

---

## Git Conventions

### Commit Messages

Follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Formatting, missing semicolons, etc.
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
feat(core): add player movement system
fix(ui): correct menu navigation bug
docs: update README with installation instructions
```

### Git Safety Rules

**NEVER:**
- Update git config without explicit permission
- Run destructive commands (force push, hard reset) without confirmation
- Skip hooks (--no-verify, --no-gpg-sign) without explicit request
- Force push to main/master
- Commit sensitive information (.env files, credentials, API keys)

**ALWAYS:**
- Review `git status` and `git diff` before committing
- Use meaningful commit messages
- Push to the correct branch
- Create Pull Requests for main branch changes

### Retry Logic

For network operations (push, fetch, pull):
- Retry up to 4 times on network failures
- Use exponential backoff: 2s, 4s, 8s, 16s
- Example:
  ```bash
  # Try push, if failed wait 2s and retry
  # If failed again, wait 4s and retry
  # Continue up to 4 total attempts
  ```

---

## Code Conventions

### General Principles

1. **Keep It Simple:** Avoid over-engineering
2. **YAGNI:** You Aren't Gonna Need It - don't add unused features
3. **DRY (with caution):** Don't Repeat Yourself, but avoid premature abstraction
4. **Security First:** Always consider security implications
5. **Read Before Modify:** Always read existing code before making changes

### Security Guidelines

**Always check for common vulnerabilities:**
- Command injection
- XSS (Cross-Site Scripting)
- SQL injection
- Path traversal
- Insecure deserialization
- OWASP Top 10 vulnerabilities

**If insecure code is written, fix it immediately.**

### Code Style

**To be established based on technology stack:**
- Consistent indentation (tabs vs spaces)
- Naming conventions (camelCase, snake_case, PascalCase)
- File organization patterns
- Comment and documentation standards
- Maximum line length
- Import/dependency ordering

### Documentation

**Code Comments:**
- Add comments for complex logic only
- Code should be self-documenting where possible
- Avoid stating the obvious
- Explain the "why," not the "what"

**Documentation Files:**
- README.md - Project overview, setup, usage, architecture
- CLAUDE.md - AI assistant guide (this file)
- SYSTEM_TODO.md - System-wide TODOs, tests, diagrams, and traceability
- TESTING_STRATEGY.md - Testing approach and best practices
- ARCHITECTURE.md - Detailed system design and roadmap
- CONTRIBUTING.md - Contribution guidelines (to be created)
- CHANGELOG.md - Version history (to be created)
- API.md - API documentation (to be created when applicable)

---

## AI Assistant Guidelines

### Core Responsibilities

When working on this codebase, AI assistants should:

1. **Understand Before Acting:**
   - Read existing code before modifying
   - Explore codebase structure for context
   - Ask clarifying questions when needed

2. **Use Tools Effectively:**
   - Use specialized tools (Read, Edit, Write, Grep, Glob)
   - Prefer Task tool for exploratory work
   - Run independent commands in parallel
   - Use TodoWrite to track multi-step tasks

3. **Maintain Quality:**
   - Test changes before committing
   - Follow existing conventions
   - Write clear, maintainable code
   - Document complex decisions

4. **Communicate Clearly:**
   - Explain what you're doing
   - Provide file references with line numbers (file.ts:123)
   - Ask questions when uncertain
   - Never use bash echo for communication - output text directly

5. **Use the System-Wide TODO Hub:**
   - Start with [SYSTEM_TODO.md](SYSTEM_TODO.md) to locate subsystem checklists
   - Keep checklists/tests/diagrams in sync when changes are made
   - Add new items for newly discovered error paths or missing coverage

### Task Management

**Use TodoWrite for:**
- Multi-step tasks (3+ steps)
- Complex implementations
- User-requested task lists
- Tracking parallel work

**Todo Best Practices:**
- Mark ONE task as in_progress at a time
- Complete tasks immediately when done
- Break complex tasks into smaller steps
- Use clear, actionable descriptions
- Provide both content and activeForm

**Example:**
```
content: "Implement user authentication"
activeForm: "Implementing user authentication"
status: "in_progress"
```

### Development Best Practices

**DO:**
- ✅ Read files before modifying them
- ✅ Use Edit tool for existing files
- ✅ Follow existing code patterns
- ✅ Test changes thoroughly
- ✅ Commit with clear messages
- ✅ Ask questions when uncertain
- ✅ Use parallel tool calls when possible
- ✅ Focus on requested changes only

**DON'T:**
- ❌ Propose changes to unread code
- ❌ Create new files unnecessarily
- ❌ Add unrequested features
- ❌ Over-engineer solutions
- ❌ Add comments to unchanged code
- ❌ Use bash for file operations
- ❌ Guess at required parameters
- ❌ Commit directly to main branch

### Exploration Strategy

**For codebase exploration:**
- Use Task tool with subagent_type=Explore for broad questions
- Use Glob for finding files by pattern
- Use Grep for searching specific code
- Use Read for examining specific files

**Examples:**
```
Question: "Where are errors handled?"
→ Use Task with Explore agent

Question: "Find the User class"
→ Use Glob with pattern "**/*User*"

Question: "Search for API endpoints"
→ Use Grep with pattern "api|endpoint"
```

### Code References

When referencing code, always include location:
```
The authentication logic is in src/auth/login.ts:42
The User model is defined in models/User.py:15-67
Configuration is loaded in config/index.js:8
```

---

## Common Tasks

### Starting New Work

```bash
# 1. Check current status
git status
git log --oneline -5

# 2. Create/switch to branch
git checkout -b claude/feature-name-sessionId

# 3. Explore codebase (if needed)
# Use Task tool with Explore agent

# 4. Make changes
# Use appropriate tools (Read, Edit, Write)

# 5. Test changes
# Run tests, linters, build process
```

### Creating a Commit

```bash
# 1. Review changes
git status
git diff

# 2. Stage files
git add <files>

# 3. Commit with message
git commit -m "$(cat <<'EOF'
feat(component): add new feature

Detailed description of changes
EOF
)"

# 4. Verify
git status
git log -1
```

### Creating a Pull Request

```bash
# 1. Ensure branch is current
git status
git log origin/main..HEAD

# 2. Push branch
git push -u origin <branch-name>

# 3. Create PR
gh pr create --title "Title" --body "$(cat <<'EOF'
## Summary
- Change 1
- Change 2

## Test Plan
- [ ] Test item 1
- [ ] Test item 2
EOF
)"
```

### Adding New Dependencies

**Process depends on technology stack:**

**Node.js:**
```bash
npm install <package>
# or
yarn add <package>
```

**Python:**
```bash
pip install <package>
# Update requirements.txt
pip freeze > requirements.txt
```

**Rust:**
```bash
cargo add <package>
```

**Always:**
- Document why the dependency is needed
- Check for security vulnerabilities
- Prefer well-maintained packages
- Update lock files

---

## Future Development

### Development Roadmap

The project follows a phased approach (see README.md for complete roadmap):

**Phase 1: Foundation (Current Phase)**
- Technology stack selection
- Core architecture design
- Database schema design
- Auth system implementation

**Phase 2: Core Features**
- Marketing website and landing pages
- User authentication and authorization
- Stripe payment integration
- Basic content delivery (eBook viewer)

**Phase 3: AI Integration**
- Agent SDK backend implementation
- MCP server for third-party services
- MCP server for writing and editing
- Basic agentic content creation workflows

**Phase 4: Collaboration**
- Custom auth key generation system
- Granular permission controls
- Collaborative writing interface
- Editor and co-author workflows

**Phase 5: Advanced Features**
- Audiobook streaming infrastructure
- Admin analytics dashboard
- Multi-tenant support
- Advanced AI-powered content tools

**Phase 6: Scale & Polish**
- Performance optimization
- Enhanced analytics
- Additional payment tiers
- Mobile app considerations

### Next Steps

As this repository grows, the following should be established:

1. **Technology Stack Finalization** ✅ Partially Complete
   - ✅ Planned architecture documented in README.md
   - ⏳ Choose specific framework versions
   - ⏳ Set up build system
   - ⏳ Configure development environment

2. **Project Structure**
   - ⏳ Define directory organization
   - ⏳ Establish module boundaries
   - ⏳ Create initial scaffolding for:
     - Frontend (marketing website, content viewer)
     - Backend (API, auth middleware)
     - AI services (Agent SDK, MCP servers)
     - Database schemas

3. **Development Infrastructure**
   - ✅ Testing strategy documented (TESTING_STRATEGY.md)
   - ⏳ Set up testing framework based on chosen stack
   - ⏳ Configure linters and formatters
   - ⏳ Add CI/CD pipeline (GitHub Actions recommended)
   - ⏳ Create development documentation

4. **Code Standards**
   - ⏳ Define style guide based on chosen languages
   - ⏳ Set up automated formatting (Prettier, Black, etc.)
   - ⏳ Establish review process
   - ⏳ Create templates for common tasks

5. **Documentation** ✅ Partially Complete
   - ✅ README.md with comprehensive overview
   - ✅ CLAUDE.md AI assistant guide
   - ✅ TESTING_STRATEGY.md
   - ⏳ Create detailed ARCHITECTURE.md
   - ⏳ Add CONTRIBUTING.md
   - ⏳ Write setup instructions
   - ⏳ Document API endpoints when implemented

### Updating This Document

**This document should be updated when:**
- Technology stack is chosen
- New conventions are established
- Project structure changes significantly
- New tools or workflows are adopted
- Common issues are identified

**To update:**
1. Read the current CLAUDE.md
2. Make necessary changes
3. Update "Last Updated" timestamp
4. Commit with message: `docs: update CLAUDE.md with [specific changes]`

---

## Project-Specific Considerations

### NAOS-Specific Development Guidelines

**Project Type:** Narrative & Audio Operating System (NAOS)
**Architecture:** Solo-author, audiobook-first, state-based story simulation
**Platform:** Replit (primary hosting and development)

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete system design.

When working on NAOS:

1. **Understand the Core Philosophy:**
   - **Stories are state, not documents** - Events and dependencies are primary
   - **Audio-first** - Everything designed for listening, text is a supporting view
   - **Canon is enforced** - No silent overwrites, all changes go through validation gates
   - **Solo-author, long-horizon** - Optimized for one creator over many years
   - **AI as institutional memory** - Assists continuity, not ghostwriting

2. **Narrative Engine Development:**
   - Work with **events** as atomic units of story truth
   - Maintain the **dependency graph** (directed acyclic graph)
   - Respect **canon vs. draft separation** - canon is immutable once published
   - Track **knowledge states** (who knows what, when)
   - Monitor **promises** to listeners that must be fulfilled
   - Never allow modifications that break causal consistency

3. **Audio Engine Development:**
   - Produce **Audio Scene Objects**, not raw text
   - Include **beat markers** (pauses, emphasis, timing)
   - Apply **voice profiles** consistently
   - Generate **recording packets** with complete context
   - Run **listener confusion audits** before allowing publication
   - Optimize for **audio cognition** (clear attribution, no visual tricks)

4. **MCP Integration:**
   - Follow **proposal-based workflow** for all canon changes
   - Expose **Resources** (read-only) and **Tools** (proposal creators)
   - Implement **canon gates** that validate before allowing changes
   - Support **multiple AI models** via scoped permissions
   - Log all proposals and validations for auditability
   - Never bypass validation gates

5. **Listener Platform Development:**
   - **Strictly separate** from Creator OS (no shared components)
   - Focus on **premium listening experience** (no ads, tracking)
   - Implement **$49 Founders Lifetime** membership model
   - Use **Replit services first** (Object Storage, PostgreSQL, Auth)
   - Stream audio via **signed URLs** (time-limited)
   - Track **playback position** for resume functionality
   - Monitor **bandwidth costs** and plan upgrade path if needed

6. **Security & Privacy:**
   - **PCI compliance** for Stripe integration
   - **Separate databases** for Creator OS and Listener Platform
   - **Validate entitlements** on every audio access
   - **Verify Stripe webhooks** with signatures
   - **Never expose** creator tools to public
   - **Minimal data collection** (email, playback position only)

7. **Replit-Specific Considerations:**
   - Leverage **Replit native services** before external tools
   - Use **Replit PostgreSQL** for narrative and listener data
   - Use **Replit Object Storage** for audio files initially
   - Utilize **built-in secrets management** for API keys
   - Monitor **storage and bandwidth limits**
   - Plan **upgrade path** to external CDN if scale demands
   - Take advantage of **automatic HTTPS** and **always-on deployments**

8. **Development Priorities:**
   - **Phase 1**: Narrative Engine core (events, canon, dependencies)
   - **Phase 2**: Audio Engine (scene objects, voice profiles, packets)
   - **Phase 3**: Listener Platform (website, auth, player)
   - **Phase 4**: Integration and polish
   - **Phase 5**: Founders launch
   - See [ARCHITECTURE.md](./ARCHITECTURE.md#12-implementation-roadmap) for details

9. **Testing Strategy:**
   - **Narrative Engine**: Test event dependencies, canon gates, knowledge propagation
   - **Audio Engine**: Test listener confusion detection, beat marker application
   - **MCP Tools**: Test proposal validation, continuity checks
   - **Listener Platform**: Test auth, payments, audio streaming
   - See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for comprehensive approach

10. **AI Assistant Behavior for NAOS:**
    - Always **read ARCHITECTURE.md** before making significant changes
    - Respect **separation of concerns** (Narrative Engine vs Audio Engine vs Platform)
    - Never modify **canon** without going through proposal workflow
    - When suggesting changes, **explain impact** on narrative consistency
    - Prioritize **long-term sustainability** over short-term convenience
    - Think in terms of **years of operation**, not just current sprint

## Questions or Issues?

If you encounter issues or have questions while working on this repository:

1. Check existing documentation:
   - [ARCHITECTURE.md](ARCHITECTURE.md) for complete NAOS system design
   - [README.md](README.md) for project overview
   - [TESTING_STRATEGY.md](TESTING_STRATEGY.md) for testing approach
2. Review git history for context: `git log --oneline`
3. Search for similar patterns in codebase
4. Ask the user for clarification using AskUserQuestion tool
5. Document your findings to help future AI assistants

---

## Appendix: Quick Reference

### Essential Git Commands

```bash
# Status and history
git status
git log --oneline -10
git diff

# Branch operations
git checkout -b <branch-name>
git branch -a
git branch -d <branch-name>

# Commit and push
git add <files>
git commit -m "message"
git push -u origin <branch-name>

# Fetch and pull
git fetch origin <branch-name>
git pull origin <branch-name>

# GitHub CLI
gh pr create
gh pr list
gh pr view <number>
gh issue list
```

### Useful File Patterns

```bash
# Find all source files (adjust based on tech stack)
**/*.js
**/*.ts
**/*.py
**/*.rs
**/*.go

# Find configuration
**/package.json
**/requirements.txt
**/Cargo.toml
**/*.config.js
**/*.yaml
**/*.yml

# Find documentation
**/*.md
**/docs/**
```

### Tool Selection Guide

| Task | Tool | Example |
|------|------|---------|
| Read file | Read | `file_path: "src/main.js"` |
| Edit file | Edit | `old_string: "foo", new_string: "bar"` |
| Create file | Write | `file_path: "new.js", content: "..."` |
| Find files | Glob | `pattern: "**/*.ts"` |
| Search code | Grep | `pattern: "function.*init"` |
| Explore codebase | Task (Explore) | `prompt: "How is auth handled?"` |
| Run command | Bash | `command: "npm test"` |
| Track tasks | TodoWrite | Multi-step task management |

---

**End of CLAUDE.md**

*This is a living document. Keep it updated as the project evolves.*
