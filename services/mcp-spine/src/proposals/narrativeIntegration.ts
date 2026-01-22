/**
 * Integration layer for applying MCP proposals to the Narrative Engine
 */

import type { Proposal } from "./proposalTypes.js";

const NAOS_WEB_API_BASE = process.env.NAOS_WEB_API_BASE ?? "http://localhost:3000";
const DEFAULT_PROJECT_ID = process.env.DEFAULT_PROJECT_ID ?? "uncharted-stars";

export type ApplyProposalResult = {
  success: boolean;
  error?: string;
  appliedEvents?: string[];
};

/**
 * Apply a validated proposal's events to the Narrative Engine
 * This transitions the proposed events to canon status
 */
export async function applyProposalToNarrativeEngine(
  proposal: Proposal
): Promise<ApplyProposalResult> {
  try {
    // For each event in the proposal, we need to:
    // 1. Check if the event already exists in the Narrative Engine
    // 2. If not, create it with "proposed" status
    // 3. Transition it to "canon" status

    const appliedEvents: string[] = [];

    for (const proposedEvent of proposal.payload.canon_events) {
      // In a real implementation, we would:
      // 1. POST to /api/narrative/events to create the event if it doesn't exist
      // 2. POST to /api/narrative/events/{id}/canonize to transition to canon

      // For now, we'll create a simplified endpoint call
      const applyUrl = `${NAOS_WEB_API_BASE}/api/narrative/events/apply`;
      const response = await fetch(applyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: DEFAULT_PROJECT_ID,
          proposalId: proposal.proposal_id,
          event: {
            id: proposedEvent.event_id,
            type: proposedEvent.type,
            description: proposedEvent.content.description ?? "Applied via MCP proposal",
            dependencies: proposedEvent.dependencies,
            participants: proposedEvent.content.participants ?? [],
            location: proposedEvent.content.location,
            impacts: proposedEvent.content.impacts ?? [],
            knowledgeEffects: proposedEvent.content.knowledgeEffects ?? [],
            timestamp: new Date().toISOString(),
            canonStatus: "proposed" // Will be transitioned to canon
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to apply event ${proposedEvent.event_id}: HTTP ${response.status} - ${errorText}`,
        };
      }

      const result = await response.json();
      if (result.ok) {
        appliedEvents.push(proposedEvent.event_id);
      } else {
        return {
          success: false,
          error: `Failed to apply event ${proposedEvent.event_id}: ${result.error}`,
        };
      }
    }

    return {
      success: true,
      appliedEvents,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Exception applying proposal to Narrative Engine: ${message}`,
    };
  }
}
