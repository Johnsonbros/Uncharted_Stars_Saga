import type { Proposal, ProposalValidation } from "./proposalTypes.js";

const unique = <T>(values: T[]) => new Set(values).size === values.length;

const validateCanonEvents = (proposal: Proposal, errors: string[], warnings: string[]) => {
  if (proposal.payload.canon_events.length === 0) {
    errors.push("Proposal must include at least one canon event.");
    return;
  }

  const ids = proposal.payload.canon_events.map((event) => event.event_id);
  if (!unique(ids)) {
    errors.push("Canonical event IDs must be unique.");
  }

  proposal.payload.canon_events.forEach((event) => {
    if (event.dependencies.includes(event.event_id)) {
      errors.push(`Event ${event.event_id} cannot depend on itself.`);
    }

    if (event.dependencies.length === 0) {
      warnings.push(`Event ${event.event_id} has no dependencies.`);
    }
  });
};

const runCanonGateStub = (warnings: string[]) => {
  warnings.push("Canon gate checks are stubbed; replace with real validators.");
};

export const validateProposal = (proposal: Proposal): ProposalValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];

  validateCanonEvents(proposal, errors, warnings);
  runCanonGateStub(warnings);

  return {
    status: errors.length > 0 ? "failed" : "passed",
    errors,
    warnings,
  };
};
