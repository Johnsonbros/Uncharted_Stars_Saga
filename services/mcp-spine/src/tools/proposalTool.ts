import type { Logger } from "../types/loggerTypes.js";
import { ProposalStore } from "../proposals/proposalStore.js";
import type { ProposalCreateInput } from "../proposals/proposalTypes.js";
import { validateProposal } from "../proposals/validationPipeline.js";

export type ProposalToolResponse = {
  proposal_id: string;
  status: string;
  scope: string;
  validation: {
    status: string;
    errors: string[];
    warnings: string[];
  };
  created_at: string;
  updated_at: string;
};

export class ProposalTool {
  constructor(private store: ProposalStore, private logger: Logger) {}

  createProposal(input: ProposalCreateInput): ProposalToolResponse {
    const proposal = this.store.create(input);
    this.logger.info("proposal.created", {
      proposal_id: proposal.proposal_id,
      author: proposal.author,
    });

    const validation = validateProposal(proposal);
    const nextStatus = validation.status === "passed" ? "validated" : "submitted";
    const updated = this.store.updateStatus(
      proposal.proposal_id,
      nextStatus,
      validation,
    );

    if (updated) {
      this.logger.info("proposal.validated", {
        proposal_id: updated.proposal_id,
        status: updated.status,
        validation_status: updated.validation.status,
      });
    }

    const result = updated ?? proposal;

    return {
      proposal_id: result.proposal_id,
      status: result.status,
      scope: "proposal:create",
      validation: {
        status: result.validation.status,
        errors: result.validation.errors,
        warnings: result.validation.warnings,
      },
      created_at: result.created_at,
      updated_at: result.updated_at,
    };
  }
}
