# MCP Request Lifecycle Sequence (Draft)

## Purpose
Document the sequence of an MCP request, from authentication through resource/tool handling and response metadata.

## Scope
- Request authentication and scope checks.
- Resource resolution and tool execution.
- Response metadata and audit logging.

## Sequence Outline
1. **Client Request**
   - Includes auth token and requested scope.
2. **Authentication**
   - Validate token and role.
3. **Scope Authorization**
   - Check allowed resources/tools.
4. **Execution**
   - Resource fetch or tool invocation.
5. **Response**
   - Deterministic metadata (proposal_id, status).
6. **Audit Log**
   - Persist request and outcome.

## Sequence Diagram (Placeholder)
```mermaid
sequenceDiagram
  participant Client
  participant MCP
  participant Resource
  participant Tool
  Client->>MCP: Request (token, scope)
  MCP->>MCP: Auth + Scope Check
  alt Resource Request
    MCP->>Resource: Fetch data
    Resource-->>MCP: Data
  else Tool Invocation
    MCP->>Tool: Execute
    Tool-->>MCP: Result
  end
  MCP-->>Client: Response + Metadata
  MCP->>MCP: Audit Log
```

## Open Questions
- What is the canonical response metadata schema?
- Where do trace IDs originate?

## Update Triggers
- Auth system changes.
- Resource/tool contract changes.

## Related Docs
- docs/mcp_service_contracts.md
- docs/error_taxonomy.md
