import { randomUUID } from "crypto";
import type {
  Proposal,
  ProposalCreateInput,
  ProposalStatus,
  ProposalValidation,
} from "./proposalTypes.js";

const now = () => new Date().toISOString();

export class ProposalStore {
  private proposals = new Map<string, Proposal>();

  create(input: ProposalCreateInput): Proposal {
    const timestamp = now();
    const proposal: Proposal = {
      proposal_id: randomUUID(),
      schema_version: "v1",
      status: "submitted",
      title: input.title,
      author: input.author,
      payload: input.payload,
      validation: {
        status: "pending",
        errors: [],
        warnings: [],
      },
      created_at: timestamp,
      updated_at: timestamp,
    };

    this.proposals.set(proposal.proposal_id, proposal);
    return proposal;
  }

  updateStatus(
    proposalId: string,
    status: ProposalStatus,
    validation?: ProposalValidation,
  ): Proposal | null {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      return null;
    }

    proposal.status = status;
    proposal.updated_at = now();
    if (validation) {
      proposal.validation = validation;
    }

    return proposal;
  }

  get(proposalId: string) {
    return this.proposals.get(proposalId) ?? null;
  }
}
