import type { Logger } from "../types/loggerTypes.js";
import { ProposalStore } from "../proposals/proposalStore.js";
import type { ProposalCreateInput } from "../proposals/proposalTypes.js";
import { validateProposal } from "../proposals/validationPipeline.js";
import { applyProposalToNarrativeEngine } from "../proposals/narrativeIntegration.js";

export type ProposalToolResponse = {
  proposal_id: string;
  status: string;
  scope: string;
  validation: {
    status: string;
    errors: string[];
    warnings: string[];
  };
  message?: string;
  applied_events?: string[];
  created_at: string;
  updated_at: string;
};

export class ProposalTool {
  constructor(private store: ProposalStore, private logger: Logger) {}

  async createProposal(input: ProposalCreateInput): Promise<ProposalToolResponse> {
    const proposal = this.store.create(input);
    this.logger.info("proposal.created", {
      proposal_id: proposal.proposal_id,
      author: proposal.author,
    });

    const validation = await validateProposal(proposal);
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

  async applyProposal(proposalId: string): Promise<ProposalToolResponse | null> {
    const proposal = this.store.get(proposalId);
    if (!proposal) {
      return null;
    }

    if (proposal.validation.status !== "passed") {
      this.logger.warn("proposal.apply.blocked", {
        proposal_id: proposal.proposal_id,
        status: proposal.status,
        validation_status: proposal.validation.status,
      });

      return {
        proposal_id: proposal.proposal_id,
        status: proposal.status,
        scope: "proposal:apply",
        validation: {
          status: proposal.validation.status,
          errors: proposal.validation.errors,
          warnings: proposal.validation.warnings,
        },
        message: "Canon gate failed; proposal cannot be applied.",
        created_at: proposal.created_at,
        updated_at: proposal.updated_at,
      };
    }

    // Apply the proposal to the Narrative Engine
    this.logger.info("proposal.apply.started", {
      proposal_id: proposal.proposal_id,
      event_count: proposal.payload.canon_events.length,
    });

    const applyResult = await applyProposalToNarrativeEngine(proposal);

    if (!applyResult.success) {
      this.logger.error("proposal.apply.failed", {
        proposal_id: proposal.proposal_id,
        error: applyResult.error,
      });

      return {
        proposal_id: proposal.proposal_id,
        status: proposal.status,
        scope: "proposal:apply",
        validation: {
          status: proposal.validation.status,
          errors: proposal.validation.errors,
          warnings: proposal.validation.warnings,
        },
        message: `Failed to apply proposal to Narrative Engine: ${applyResult.error}`,
        created_at: proposal.created_at,
        updated_at: proposal.updated_at,
      };
    }

    // Update proposal status to applied
    const updated = this.store.updateStatus(
      proposal.proposal_id,
      "applied",
      proposal.validation,
    );

    if (updated) {
      this.logger.info("proposal.applied", {
        proposal_id: updated.proposal_id,
        status: updated.status,
        applied_events: applyResult.appliedEvents,
      });
    }

    const result = updated ?? proposal;

    return {
      proposal_id: result.proposal_id,
      status: result.status,
      scope: "proposal:apply",
      validation: {
        status: result.validation.status,
        errors: result.validation.errors,
        warnings: result.validation.warnings,
      },
      message: `Successfully applied ${applyResult.appliedEvents?.length ?? 0} events to canon.`,
      applied_events: applyResult.appliedEvents,
      created_at: result.created_at,
      updated_at: result.updated_at,
    };
  }
}
