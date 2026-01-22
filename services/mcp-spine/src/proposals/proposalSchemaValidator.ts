import type { ProposalValidationStatus, ProposalStatus } from "./proposalTypes.js";

export type ProposalSchemaValidationResult = {
  valid: boolean;
  errors: string[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0;

const isStringArray = (value: unknown) =>
  Array.isArray(value) && value.every((entry) => typeof entry === "string");

const isAllowedValue = <T extends string>(value: unknown, allowed: T[]) =>
  typeof value === "string" && allowed.includes(value as T);

const VALID_PROPOSAL_STATUSES: ProposalStatus[] = [
  "draft",
  "submitted",
  "validated",
  "applied",
  "archived",
];

const VALID_VALIDATION_STATUSES: ProposalValidationStatus[] = [
  "pending",
  "passed",
  "failed",
];

export const validateProposalSchema = (
  proposal: unknown,
): ProposalSchemaValidationResult => {
  const errors: string[] = [];

  if (!isRecord(proposal)) {
    return { valid: false, errors: ["Proposal must be an object."] };
  }

  if (!isNonEmptyString(proposal.proposal_id)) {
    errors.push("proposal_id must be a non-empty string.");
  }

  if (proposal.schema_version !== "v1") {
    errors.push("schema_version must be 'v1'.");
  }

  if (!isAllowedValue(proposal.status, VALID_PROPOSAL_STATUSES)) {
    errors.push("status must be a valid proposal status.");
  }

  if (!isNonEmptyString(proposal.title)) {
    errors.push("title must be a non-empty string.");
  }

  if (!isRecord(proposal.author)) {
    errors.push("author must be an object.");
  } else {
    if (!isNonEmptyString(proposal.author.model)) {
      errors.push("author.model must be a non-empty string.");
    }
    if (!isNonEmptyString(proposal.author.role)) {
      errors.push("author.role must be a non-empty string.");
    }
  }

  if (!isRecord(proposal.payload)) {
    errors.push("payload must be an object.");
  } else if (!Array.isArray(proposal.payload.canon_events)) {
    errors.push("payload.canon_events must be an array.");
  } else {
    proposal.payload.canon_events.forEach((event, index) => {
      if (!isRecord(event)) {
        errors.push(`payload.canon_events[${index}] must be an object.`);
        return;
      }

      if (!isNonEmptyString(event.event_id)) {
        errors.push(`payload.canon_events[${index}].event_id is required.`);
      }
      if (!isNonEmptyString(event.type)) {
        errors.push(`payload.canon_events[${index}].type is required.`);
      }
      if (!isStringArray(event.dependencies)) {
        errors.push(
          `payload.canon_events[${index}].dependencies must be an array of strings.`,
        );
      }
      if (!isRecord(event.content)) {
        errors.push(`payload.canon_events[${index}].content must be an object.`);
      }
    });
  }

  if (!isRecord(proposal.validation)) {
    errors.push("validation must be an object.");
  } else {
    if (!isAllowedValue(proposal.validation.status, VALID_VALIDATION_STATUSES)) {
      errors.push("validation.status must be a valid validation status.");
    }
    if (!isStringArray(proposal.validation.errors)) {
      errors.push("validation.errors must be an array of strings.");
    }
    if (!isStringArray(proposal.validation.warnings)) {
      errors.push("validation.warnings must be an array of strings.");
    }
  }

  if (!isNonEmptyString(proposal.created_at)) {
    errors.push("created_at must be a non-empty string.");
  }

  if (!isNonEmptyString(proposal.updated_at)) {
    errors.push("updated_at must be a non-empty string.");
  }

  return { valid: errors.length === 0, errors };
};
