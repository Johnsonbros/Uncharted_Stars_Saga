# API Documentation

## Overview
This document covers public-facing APIs for the Listener Platform and internal MCP Spine interfaces.

## Listener Platform API
### GET /api/library
Returns list of accessible chapters for the user.

**Response**
```json
{
  "chapters": [
    { "id": "ch-1", "title": "Chapter 1", "duration_seconds": 1240 }
  ]
}
```

### POST /api/playback
Updates playback position.

**Request**
```json
{ "asset_id": "ch-1", "position_seconds": 320 }
```

## MCP Spine Tool API
### POST /mcp/proposal.create
Creates a proposal and returns `proposal_id`.

### POST /mcp/proposal.validate
Validates proposal against schema and canon gate rules.

## Auth
- Listener APIs use session tokens or JWT.
- MCP Spine uses service tokens with scoped permissions.
