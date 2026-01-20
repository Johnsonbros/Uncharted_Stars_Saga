# CLAUDE.md - AI Assistant Guide for Uncharted Stars Saga

> **Last Updated:** 2026-01-20
> **Repository Status:** Early initialization phase

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
**Purpose:** An AI-Powered Content Publishing and Collaborative Writing Platform

### Project Goals

This platform provides a comprehensive ecosystem for authors and content creators to publish, monetize, and collaboratively create written content. Key objectives:

1. **Streamline Content Monetization**: Enable direct-to-audience publishing with integrated payment processing
2. **Enable AI-Assisted Collaboration**: Leverage AI agents and collaborative tools for co-writing with humans or AI
3. **Provide Flexible Access Control**: Implement granular permissions for co-authors, editors, and beta readers
4. **Deliver Multiple Content Formats**: Support eBook and audiobook distribution with optimized streaming
5. **Offer Marketing Integration**: Provide built-in funnels and marketing website to grow audience

### Key Stakeholders
- **Owner:** Nate Johnson
- **Primary AI Assistant:** Claude (via Claude Code CLI)

### Platform Overview

The platform integrates several key systems:

**Frontend Components:**
- Marketing website with ChatKit-enabled interface
- Responsive eBook content viewer
- Audiobook streaming interface
- Admin dashboard for content and user management

**Backend Services:**
- Auth middleware for authentication and authorization
- Stripe integration for subscription-based payments
- Content delivery system (eBooks and audiobooks)
- Agentic system powered by Anthropic's Agent SDK
- Multi-point MCP servers for third-party services and content management

**Data Layer:**
- Content database (hierarchical, scene-level granularity)
- Customer database (subscribers and access rights)
- Auth keys and permissions for collaborative access control

**Collaborative Features:**
- Custom auth key generation for role-specific access
- Granular permissions at series/book/chapter/scene level
- Co-author, editor, and beta reader workflows

See [README.md](README.md) for complete feature list and architecture diagrams.

---

## Current State

### Repository Structure

As of 2026-01-20, the repository contains foundational documentation:

```
Uncharted_Stars_Saga/
├── .git/                    # Git version control
├── README.md               # Comprehensive platform overview and architecture
├── CLAUDE.md              # This file - AI assistant guide
└── TESTING_STRATEGY.md    # Testing strategy and best practices
```

### Technology Stack
**Status:** Architecture in planning phase

Expected technology stack based on project requirements:

- **Frontend**: Modern web framework (React/Next.js consideration) with ChatKit integration
- **Backend**: Node.js or Python with Anthropic Agent SDK integration
- **AI/ML**: Anthropic Claude via Agent SDK with custom MCP servers
  - Third-Party Services MCP: External tool integration
  - Writing & Editing MCP: Remote server for content creation and version control
- **Payment**: Stripe API for subscription management
- **Auth**: Custom middleware with JWT/OAuth support
- **Database**: TBD (consideration for both relational and document storage)
- **Storage**: Cloud storage for media files (eBooks, audiobooks)
- **Testing**: Framework TBD (see TESTING_STRATEGY.md for recommendations)

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
- TESTING_STRATEGY.md - Testing approach and best practices
- ARCHITECTURE.md - Detailed system design (to be created)
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

### Platform-Specific Best Practices

When working on Uncharted Stars Saga:

1. **Security is Critical:**
   - Handle payment data with extreme care (PCI compliance)
   - Implement robust authentication and authorization
   - Validate all content access permissions
   - Prevent unauthorized access to premium content
   - Sanitize user-generated content

2. **AI Integration:**
   - Follow Anthropic Agent SDK best practices
   - Design MCP servers for reliability and performance
   - Implement proper error handling for AI operations
   - Consider rate limiting and cost management
   - Test AI-generated content workflows thoroughly

3. **Content Management:**
   - Maintain content versioning and history
   - Implement atomic operations for content updates
   - Design for hierarchical content structures (series → book → chapter → scene)
   - Plan for large media file handling (audiobooks)
   - Consider CDN integration for content delivery

4. **Collaborative Workflows:**
   - Design for concurrent editing scenarios
   - Implement conflict resolution strategies
   - Track attribution for collaborative content
   - Provide granular access control testing

5. **Payment Integration:**
   - Test Stripe webhooks thoroughly
   - Handle subscription lifecycle events
   - Implement idempotent payment processing
   - Plan for subscription upgrades/downgrades
   - Consider tax and international payments

6. **Performance:**
   - Optimize audiobook streaming
   - Implement efficient content queries
   - Consider caching strategies
   - Plan for scalability from the start

## Questions or Issues?

If you encounter issues or have questions while working on this repository:

1. Check existing documentation (README.md, TESTING_STRATEGY.md, docs/)
2. Review git history for context: `git log --oneline`
3. Search for similar patterns in codebase
4. Consult README.md for platform architecture details
5. Reference TESTING_STRATEGY.md for testing approach
6. Ask the user for clarification using AskUserQuestion tool
7. Document your findings to help future AI assistants

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
