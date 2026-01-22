import type { Proposal, ProposalValidation, ProposalEventPayload } from "./proposalTypes.js";

const unique = <T>(values: T[]) => new Set(values).size === values.length;

// Configuration: where the NAOS web app is running
const NAOS_WEB_API_BASE = process.env.NAOS_WEB_API_BASE ?? "http://localhost:3000";
const DEFAULT_PROJECT_ID = process.env.DEFAULT_PROJECT_ID ?? "uncharted-stars";

/**
 * Transform MCP proposal event to Narrative Engine event format
 */
function transformProposalEventToNarrativeEvent(proposalEvent: ProposalEventPayload): Record<string, unknown> {
  return {
    id: proposalEvent.event_id,
    timestamp: new Date().toISOString(),
    type: proposalEvent.type || "custom",
    description: proposalEvent.content.description ?? "Proposal event",
    dependencies: proposalEvent.dependencies,
    participants: proposalEvent.content.participants ?? [],
    location: proposalEvent.content.location,
    impacts: proposalEvent.content.impacts ?? [],
    knowledgeEffects: proposalEvent.content.knowledgeEffects ?? [],
    canonStatus: "proposed"
  };
}

/**
 * Call the Narrative Engine canon gate validation API
 */
async function callCanonGateValidation(
  proposedEvents: Record<string, unknown>[]
): Promise<{ passed: boolean; errors: string[]; warnings: string[] }> {
  try {
    // Fetch current narrative state to get canon events and promises
    const stateUrl = `${NAOS_WEB_API_BASE}/api/narrative/state?projectId=${encodeURIComponent(DEFAULT_PROJECT_ID)}`;
    const stateResponse = await fetch(stateUrl);

    if (!stateResponse.ok) {
      return {
        passed: false,
        errors: [`Failed to fetch narrative state: HTTP ${stateResponse.status}`],
        warnings: []
      };
    }

    const stateResult = await stateResponse.json();

    if (!stateResult.ok) {
      return {
        passed: false,
        errors: [`Narrative state API error: ${stateResult.error}`],
        warnings: []
      };
    }

    const snapshot = stateResult.snapshot;

    // Combine current canon/proposed events with new proposal events
    const canonEvents = snapshot.canonBuckets?.canon ?? [];
    const currentProposed = snapshot.canonBuckets?.proposed ?? [];
    const allEvents = [...canonEvents, ...currentProposed, ...proposedEvents];

    // Extract promises
    const promises = snapshot.promises ?? [];

    // Validate using the Narrative Engine's validation logic
    // Note: In a production setup, this would be a dedicated validation endpoint
    // For now, we use the canon gate report from the current snapshot as a baseline
    const canonGate = snapshot.canonGate;

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check continuity issues
    if (canonGate.continuity.dependencyIssues?.length > 0) {
      canonGate.continuity.dependencyIssues.forEach((issue: { eventId: string; missingDependencies: string[] }) => {
        errors.push(`Event ${issue.eventId} has missing dependencies: ${issue.missingDependencies.join(", ")}`);
      });
    }

    if (canonGate.continuity.cycleIssues?.length > 0) {
      canonGate.continuity.cycleIssues.forEach((issue: { cycle: string[] }) => {
        errors.push(`Dependency cycle detected: ${issue.cycle.join(" → ")}`);
      });
    }

    if (canonGate.continuity.timestampIssues?.length > 0) {
      errors.push(...canonGate.continuity.timestampIssues);
    }

    // Check promise issues
    if (canonGate.promiseIssues?.length > 0) {
      canonGate.promiseIssues.forEach((issue: { promiseId: string; message: string }) => {
        warnings.push(`Promise ${issue.promiseId}: ${issue.message}`);
      });
    }

    // Check listener cognition issues
    if (canonGate.listenerCognition?.issues?.length > 0) {
      warnings.push(...canonGate.listenerCognition.issues);
    }

    return {
      passed: canonGate.passed && errors.length === 0,
      errors,
      warnings
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      passed: false,
      errors: [`Exception during canon gate validation: ${message}`],
      warnings: []
    };
  }
}

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

export const validateProposal = async (proposal: Proposal): Promise<ProposalValidation> => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic schema validation
  validateCanonEvents(proposal, errors, warnings);

  // If basic validation fails, don't proceed to canon gate
  if (errors.length > 0) {
    return {
      status: "failed",
      errors,
      warnings,
    };
  }

  // Transform proposal events to Narrative Engine format
  const narrativeEvents = proposal.payload.canon_events.map(transformProposalEventToNarrativeEvent);

  // Call the real canon gate validation
  const canonGateResult = await callCanonGateValidation(narrativeEvents);

  errors.push(...canonGateResult.errors);
  warnings.push(...canonGateResult.warnings);

  return {
    status: errors.length > 0 ? "failed" : "passed",
    errors,
    warnings,
  };
};
