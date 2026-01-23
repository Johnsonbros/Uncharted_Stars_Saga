import {
  checkContinuity,
  type ContinuityReport,
  deriveKnowledgeState,
  splitByCanonStatus,
  validateCanonGate
} from "./engine";
import type { CanonValidationReport, Event, PromiseRecord } from "./models";
import { fetchProjectEvents, fetchPromises } from "./repository";

export type NarrativeStateSnapshot = {
  projectId: string;
  generatedAt: string;
  events: Event[];
  promises: PromiseRecord[];
  continuity: ContinuityReport;
  canonGate: CanonValidationReport;
  canonBuckets: {
    draft: Readonly<Event>[];
    proposed: Readonly<Event>[];
    canon: Readonly<Event>[];
  };
  knowledge: {
    states: ReturnType<typeof deriveKnowledgeState>["knowledge"];
    issues: ReturnType<typeof deriveKnowledgeState>["issues"];
  };
};

export async function buildNarrativeStateSnapshot(
  projectId: string
): Promise<NarrativeStateSnapshot> {
  const events = await fetchProjectEvents(projectId);
  const promises = await fetchPromises(projectId);
  const continuity = checkContinuity(events);
  const canonBuckets = splitByCanonStatus(events);
  const canonGate = validateCanonGate(
    [...canonBuckets.canon, ...canonBuckets.proposed],
    promises
  );
  const knowledgeResult = deriveKnowledgeState(events);

  return {
    projectId,
    generatedAt: new Date().toISOString(),
    events,
    promises,
    continuity,
    canonGate,
    canonBuckets,
    knowledge: {
      states: knowledgeResult.knowledge,
      issues: knowledgeResult.issues
    }
  };
}
