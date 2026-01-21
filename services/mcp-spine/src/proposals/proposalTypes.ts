export type ProposalStatus =
  | "draft"
  | "submitted"
  | "validated"
  | "applied"
  | "archived";

export type ProposalValidationStatus = "pending" | "passed" | "failed";

export type ProposalAuthor = {
  model: string;
  role: string;
  request_id?: string;
};

export type ProposalEventPayload = {
  event_id: string;
  type: string;
  dependencies: string[];
  content: Record<string, unknown>;
};

export type ProposalPayload = {
  canon_events: ProposalEventPayload[];
};

export type ProposalValidation = {
  status: ProposalValidationStatus;
  errors: string[];
  warnings: string[];
};

export type Proposal = {
  proposal_id: string;
  schema_version: "v1";
  status: ProposalStatus;
  title: string;
  author: ProposalAuthor;
  payload: ProposalPayload;
  validation: ProposalValidation;
  created_at: string;
  updated_at: string;
};

export type ProposalCreateInput = {
  title: string;
  author: ProposalAuthor;
  payload: ProposalPayload;
};
