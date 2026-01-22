export type McpScope =
  | "narrative:read"
  | "audio:read"
  | "audio:generate"
  | "audio:audit"
  | "listener:summary:read"
  | "proposal:create"
  | "proposal:validate"
  | "proposal:apply";

export type McpRole =
  | "creator"
  | "editor_reviewer"
  | "listener_support"
  | "automation_service";

export type RoleScopeMap = {
  role: McpRole;
  label: string;
  scopes: McpScope[];
};

export const ROLE_SCOPE_MAP_V1: RoleScopeMap[] = [
  {
    role: "creator",
    label: "Creator",
    scopes: [
      "narrative:read",
      "audio:read",
      "audio:generate",
      "audio:audit",
      "listener:summary:read",
      "proposal:create",
      "proposal:validate",
    ],
  },
  {
    role: "editor_reviewer",
    label: "Editor/Reviewer",
    scopes: [
      "narrative:read",
      "audio:read",
      "audio:audit",
      "proposal:create",
      "proposal:validate",
    ],
  },
  {
    role: "listener_support",
    label: "Listener Support",
    scopes: ["listener:summary:read"],
  },
  {
    role: "automation_service",
    label: "Automation/Service",
    scopes: [
      "narrative:read",
      "audio:read",
      "audio:generate",
      "audio:audit",
      "listener:summary:read",
      "proposal:create",
      "proposal:validate",
      "proposal:apply",
    ],
  },
];

export const MODEL_SCOPE_MAP_V1: Record<string, McpScope[]> = {
  opus: ["narrative:read", "audio:read", "audio:generate", "audio:audit", "proposal:validate"],
  sonnet: ["narrative:read", "audio:read", "audio:generate", "audio:audit", "proposal:create"],
  haiku: ["narrative:read", "audio:audit"],
};
