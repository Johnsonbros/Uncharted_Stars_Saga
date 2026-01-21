export const PROPOSAL_SCHEMA_V1 = {
  $id: "https://uncharted-stars-saga.local/schemas/proposal.schema.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "MCP Proposal Schema v1",
  type: "object",
  required: [
    "proposal_id",
    "schema_version",
    "status",
    "title",
    "author",
    "payload",
    "validation",
    "created_at",
    "updated_at",
  ],
  additionalProperties: false,
  properties: {
    proposal_id: { type: "string", minLength: 1 },
    schema_version: { type: "string", enum: ["v1"] },
    status: {
      type: "string",
      enum: ["draft", "submitted", "validated", "applied", "archived"],
    },
    title: { type: "string", minLength: 1 },
    author: {
      type: "object",
      required: ["model", "role"],
      additionalProperties: false,
      properties: {
        model: { type: "string", minLength: 1 },
        role: { type: "string", minLength: 1 },
        request_id: { type: "string" },
      },
    },
    payload: {
      type: "object",
      required: ["canon_events"],
      additionalProperties: false,
      properties: {
        canon_events: {
          type: "array",
          items: {
            type: "object",
            required: ["event_id", "type", "dependencies", "content"],
            additionalProperties: false,
            properties: {
              event_id: { type: "string", minLength: 1 },
              type: { type: "string", minLength: 1 },
              dependencies: {
                type: "array",
                items: { type: "string", minLength: 1 },
                uniqueItems: true,
              },
              content: { type: "object" },
            },
          },
        },
      },
    },
    validation: {
      type: "object",
      required: ["status", "errors", "warnings"],
      additionalProperties: false,
      properties: {
        status: { type: "string", enum: ["pending", "passed", "failed"] },
        errors: { type: "array", items: { type: "string" } },
        warnings: { type: "array", items: { type: "string" } },
      },
    },
    created_at: { type: "string", format: "date-time" },
    updated_at: { type: "string", format: "date-time" },
  },
} as const;
