# Uncharted Stars Saga

> **An AI-Powered Content Publishing and Collaborative Writing Platform**

## Overview

Uncharted Stars Saga is a comprehensive platform designed to empower authors and content creators with an integrated ecosystem for publishing, monetizing, and collaboratively creating written content. The system combines modern web technologies, AI-powered writing tools, and flexible payment infrastructure to provide a complete solution from content creation to audience engagement.

## Why This Platform?

Traditional publishing platforms often separate the tools authors need: writing happens in one place, publishing in another, payment processing somewhere else, and collaboration requires yet another tool. Uncharted Stars Saga brings all of these capabilities into a unified system that:

- **Streamlines Content Monetization**: Direct-to-audience publishing with integrated payment processing
- **Enables AI-Assisted Collaboration**: Leverage AI agents and collaborative tools to co-write with humans or AI
- **Provides Flexible Access Control**: Granular permissions for co-authors, editors, and beta readers
- **Delivers Multiple Content Formats**: eBook and audiobook distribution with optimized streaming
- **Offers Marketing Integration**: Built-in funnel and marketing website to grow your audience

## Key Features

### 🎨 Frontend & User Experience

- **Marketing Website**: All-inclusive landing pages and content funnels designed to convert visitors into subscribers
- **ChatKit-Enabled Interface**: Interactive, conversational UI for seamless user engagement
- **Responsive Content Viewer**: Optimized reading experience for eBooks with easy-to-use formatting
- **Audiobook Streaming**: Efficient streaming infrastructure for audio content delivery

### 💳 Monetization & Access Control

- **Stripe Integration**: Single-tier payment system for subscription-based content access
- **Auth Middleware**: Secure authentication and authorization system
- **Access Management**: Control who can view published content (eBooks, audiobooks)
- **Customer Database**: Comprehensive user and subscription management

### 📚 Content Delivery

- **eBook Publishing**: Web-based eBook viewer with professional formatting
- **Audiobook Hosting**: Streaming-optimized audio content delivery
- **Multi-Format Support**: Serve content in various formats based on user preference
- **Content Management**: Easy-to-use system for organizing chapters, scenes, and series

### 🤖 AI-Powered Backend

- **Agent SDK Integration**: Leverage Anthropic's Agent SDK for intelligent writing assistance
- **Multi-Point MCP Servers**:
  - **Third-Party Services MCP**: Connect external tools and services to enhance functionality
  - **Writing & Editing MCP**: Custom remote MCP server for internal content creation and version control
- **Agentic Workflows**: AI agents that can write, edit, and commit content systematically
- **Automated Processing**: Intelligent data processing and storage at multiple granularity levels

### 👥 Collaborative Writing

- **Custom Auth Keys**: Generate role-specific access tokens for collaborators
- **Granular Permissions**: Control access at series, book, chapter, or scene level
- **Co-Writing Features**:
  - Invite co-authors to contribute to specific sections
  - Editor access with review and approval workflows
  - Beta reader access for feedback collection
- **Multi-Tenant Architecture**: (Planned) Separate dashboard configurations for different collaboration models

### 📊 Admin & Management

- **Admin Dashboard**: Comprehensive view of content, users, and analytics
- **Content Analytics**: Track viewership, engagement, and revenue metrics
- **User Management**: Administer subscriber access and permissions
- **Collaboration Dashboard**: (Planned) Separate config dashboard for managing editors and custom authorization templates

### 🗄️ Data Architecture

- **High-Level Storage**: Manage series, books, and major content structures
- **Granular Storage**: Scene-level and paragraph-level content versioning
- **Customer Database**: Secure storage of user data, subscriptions, and access rights
- **Content Processing Pipeline**: Efficient data transformation for different content formats

## Technology Stack

> **Status**: Architecture in planning phase

Expected technologies:
- **Frontend**: Modern web framework (React/Next.js consideration) with ChatKit integration
- **Backend**: Node.js/Python with Agent SDK integration
- **AI/ML**: Anthropic Claude via Agent SDK with custom MCP servers
- **Payment**: Stripe API for subscription management
- **Auth**: Custom middleware with JWT/OAuth support
- **Database**: TBD (consideration for both relational and document storage)
- **Storage**: Cloud storage for media files (eBooks, audiobooks)

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Marketing Website                         │
│                  (ChatKit-enabled Frontend)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Auth Middleware                            │
│              (Authentication & Authorization)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌────────────────┐ ┌──────────────┐ ┌──────────────────┐
│   Content      │ │   Payment    │ │   Admin          │
│   Delivery     │ │   System     │ │   Dashboard      │
│   (eBook/Audio)│ │   (Stripe)   │ │                  │
└────────────────┘ └──────────────┘ └──────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Agentic System (Agent SDK)               │    │
│  │                                                      │    │
│  │  ┌──────────────────┐    ┌──────────────────────┐ │    │
│  │  │  MCP Server      │    │  MCP Server          │ │    │
│  │  │  (Third-Party    │    │  (Writing & Editing) │ │    │
│  │  │   Services)      │    │  (Content Management)│ │    │
│  │  └──────────────────┘    └──────────────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┐ ┌────────────────┐ ┌──────────────────┐  │
│  │   Content    │ │    Customer    │ │   Auth Keys &    │  │
│  │   Database   │ │    Database    │ │   Permissions    │  │
│  │ (Hierarchical│ │  (Subscribers) │ │   (Collab Mgmt)  │  │
│  │  Granular)   │ │                │ │                  │  │
│  └──────────────┘ └────────────────┘ └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Use Cases

### For Independent Authors
- Publish serialized content directly to subscribers
- Generate audiobook versions with AI assistance
- Build an audience through integrated marketing tools
- Monetize content without platform middlemen

### For Collaborative Writing Teams
- Co-write series with multiple authors using granular access controls
- Assign editors with specific review permissions
- Use AI agents to maintain consistency across collaborative works
- Manage different authorization levels for various contributors

### For Content Creators
- Transform written content into multiple formats (eBook, audiobook)
- Leverage AI for drafting, editing, and content enhancement
- Stream audio content efficiently to subscribers
- Analyze audience engagement and optimize content strategy

## Roadmap

### Phase 1: Foundation (Current)
- [ ] Technology stack selection
- [ ] Core architecture design
- [ ] Database schema design
- [ ] Auth system implementation

### Phase 2: Core Features
- [ ] Marketing website and landing pages
- [ ] User authentication and authorization
- [ ] Stripe payment integration
- [ ] Basic content delivery (eBook viewer)

### Phase 3: AI Integration
- [ ] Agent SDK backend implementation
- [ ] MCP server for third-party services
- [ ] MCP server for writing and editing
- [ ] Basic agentic content creation workflows

### Phase 4: Collaboration
- [ ] Custom auth key generation system
- [ ] Granular permission controls
- [ ] Collaborative writing interface
- [ ] Editor and co-author workflows

### Phase 5: Advanced Features
- [ ] Audiobook streaming infrastructure
- [ ] Admin analytics dashboard
- [ ] Multi-tenant support
- [ ] Advanced AI-powered content tools

### Phase 6: Scale & Polish
- [ ] Performance optimization
- [ ] Enhanced analytics
- [ ] Additional payment tiers
- [ ] Mobile app considerations

## Getting Started

> **Note**: This project is in early planning/development phase. Setup instructions will be added as the technology stack is finalized.

## Contributing

This repository follows a feature-branch workflow. See [CLAUDE.md](./CLAUDE.md) for detailed contribution guidelines and development practices.

## Documentation

- **[CLAUDE.md](./CLAUDE.md)**: Comprehensive guide for AI assistants working on this codebase
- **[TESTING_STRATEGY.md](./TESTING_STRATEGY.md)**: Testing approach and guidelines

## Project Status

**Current Phase**: Architecture & Planning
**Last Updated**: 2026-01-20
**Active Branch**: `claude/update-readme-overview-0QITh`

## License

> **Status**: To be determined

## Contact

**Repository Owner**: Johnsonbros
**Project**: Uncharted Stars Saga

---

*Building the future of collaborative, AI-powered content creation.*
