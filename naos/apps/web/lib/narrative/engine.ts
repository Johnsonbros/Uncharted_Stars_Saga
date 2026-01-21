import crypto from "node:crypto";
import {
  type CanonValidationReport,
  type CanonStatus,
  type Event,
  type EventInput,
  type KnowledgeCertainty,
  type KnowledgeState,
  type ListenerCognitionReport,
  type PromiseIssue,
  type PromiseRecord,
  type PromiseStatus,
  EventInputSchema,
  EventSchema
} from "./models";

export const CANON_STATUS_FLOW: Record<CanonStatus, CanonStatus[]> = {
  draft: ["draft", "proposed", "canon"],
  proposed: ["proposed", "canon"],
  canon: ["canon"]
};

export const PROMISE_STATUS_FLOW: Record<PromiseStatus, PromiseStatus[]> = {
  pending: ["pending", "fulfilled", "broken", "transformed"],
  fulfilled: ["fulfilled", "transformed"],
  broken: ["broken", "transformed"],
  transformed: ["transformed"]
};

export type DependencyIssue = {
  eventId: string;
  missingDependencies: string[];
};

export type CycleIssue = {
  cycle: string[];
};

export type ContinuityReport = {
  dependencyIssues: DependencyIssue[];
  cycleIssues: CycleIssue[];
  timestampIssues: string[];
};

export type KnowledgeIssue = {
  eventId: string;
  characterId: string;
  reason: string;
};

export type KnowledgeDerivationResult = {
  knowledge: KnowledgeState[];
  issues: KnowledgeIssue[];
};

export type CanonBuckets = {
  canon: Readonly<Event>[];
  proposed: Readonly<Event>[];
  draft: Readonly<Event>[];
};

const CERTAINTY_RANK: Record<KnowledgeCertainty, number> = {
  known: 3,
  suspected: 2,
  rumored: 1,
  false: 0
};

function freezeEvent(event: Event): Readonly<Event> {
  return Object.freeze({ ...event });
}

export function createEvent(input: EventInput): Readonly<Event> {
  const parsed = EventInputSchema.parse(input);
  const event: Event = {
    ...parsed,
    id: crypto.randomUUID(),
    timestamp: parsed.timestamp ?? new Date(),
    canonStatus: parsed.canonStatus ?? "draft"
  };
  return freezeEvent(EventSchema.parse(event));
}

export function transitionCanonStatus(
  event: Readonly<Event>,
  nextStatus: CanonStatus
): Readonly<Event> {
  const allowed = CANON_STATUS_FLOW[event.canonStatus] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw new Error(
      `Invalid canon transition: ${event.canonStatus} -> ${nextStatus}. Allowed: ${allowed.join(", ")}`
    );
  }
  return freezeEvent({ ...event, canonStatus: nextStatus });
}

export function updateEvent(
  event: Readonly<Event>,
  updates: Partial<Omit<Event, "id" | "canonStatus">>
): Readonly<Event> {
  if (event.canonStatus === "canon") {
    throw new Error("Canonical events are immutable. Create a proposal instead.");
  }
  const merged: Event = {
    ...event,
    ...updates
  };
  return freezeEvent(EventSchema.parse(merged));
}

export function splitByCanonStatus(events: Readonly<Event>[]): CanonBuckets {
  const canon = [] as Event[];
  const proposed = [] as Event[];
  const draft = [] as Event[];

  for (const event of events) {
    if (event.canonStatus === "canon") {
      canon.push(event);
    } else if (event.canonStatus === "proposed") {
      proposed.push(event);
    } else {
      draft.push(event);
    }
  }

  return { canon, proposed, draft };
}

export function validateDependencyGraph(events: Readonly<Event>[]): {
  dependencyIssues: DependencyIssue[];
  cycleIssues: CycleIssue[];
} {
  const index = new Map(events.map((event) => [event.id, event] as const));
  const dependencyIssues: DependencyIssue[] = [];

  for (const event of events) {
    const missingDependencies = event.dependencies.filter((id) => !index.has(id));
    if (missingDependencies.length > 0) {
      dependencyIssues.push({ eventId: event.id, missingDependencies });
    }
  }

  const cycleIssues: CycleIssue[] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();

  const detectCycle = (nodeId: string, path: string[]) => {
    if (stack.has(nodeId)) {
      const cycleStart = path.indexOf(nodeId);
      cycleIssues.push({ cycle: path.slice(cycleStart).concat(nodeId) });
      return;
    }
    if (visited.has(nodeId)) {
      return;
    }

    visited.add(nodeId);
    stack.add(nodeId);

    const node = index.get(nodeId);
    if (node) {
      for (const dependency of node.dependencies) {
        detectCycle(dependency, [...path, dependency]);
      }
    }

    stack.delete(nodeId);
  };

  for (const event of events) {
    detectCycle(event.id, [event.id]);
  }

  return { dependencyIssues, cycleIssues };
}

export function checkContinuity(events: Readonly<Event>[]): ContinuityReport {
  const { dependencyIssues, cycleIssues } = validateDependencyGraph(events);
  const index = new Map(events.map((event) => [event.id, event] as const));
  const timestampIssues: string[] = [];

  for (const event of events) {
    for (const dependencyId of event.dependencies) {
      const dependency = index.get(dependencyId);
      if (dependency && dependency.timestamp > event.timestamp) {
        timestampIssues.push(
          `Event ${event.id} occurs before dependency ${dependencyId} (${event.timestamp.toISOString()} < ${dependency.timestamp.toISOString()}).`
        );
      }
    }
  }

  return { dependencyIssues, cycleIssues, timestampIssues };
}

export function deriveKnowledgeState(events: Readonly<Event>[]): KnowledgeDerivationResult {
  const sortedEvents = [...events].sort((a, b) => {
    const timeDelta = a.timestamp.getTime() - b.timestamp.getTime();
    return timeDelta !== 0 ? timeDelta : a.id.localeCompare(b.id);
  });
  const knowledgeMap = new Map<string, KnowledgeState>();
  const issues: KnowledgeIssue[] = [];

  for (const event of sortedEvents) {
    for (const effect of event.knowledgeEffects) {
      const learnedAt = effect.learnedAt ?? event.timestamp;
      if (learnedAt < event.timestamp) {
        issues.push({
          eventId: event.id,
          characterId: effect.characterId,
          reason: `Knowledge learned before event timestamp (${learnedAt.toISOString()} < ${event.timestamp.toISOString()}).`
        });
      }

      const key = `${effect.characterId}:${event.id}`;
      const existing = knowledgeMap.get(key);
      if (!existing) {
        knowledgeMap.set(key, {
          characterId: effect.characterId,
          eventId: event.id,
          learnedAt,
          certainty: effect.certainty,
          source: effect.source
        });
        continue;
      }

      if (learnedAt < existing.learnedAt) {
        knowledgeMap.set(key, {
          characterId: effect.characterId,
          eventId: event.id,
          learnedAt,
          certainty: effect.certainty,
          source: effect.source
        });
        continue;
      }

      if (learnedAt.getTime() === existing.learnedAt.getTime()) {
        const incomingRank = CERTAINTY_RANK[effect.certainty];
        const existingRank = CERTAINTY_RANK[existing.certainty];
        if (incomingRank > existingRank) {
          knowledgeMap.set(key, {
            characterId: effect.characterId,
            eventId: event.id,
            learnedAt,
            certainty: effect.certainty,
            source: effect.source
          });
        }
      }
    }
  }

  const knowledge = [...knowledgeMap.values()].sort((a, b) => {
    const timeDelta = a.learnedAt.getTime() - b.learnedAt.getTime();
    return timeDelta !== 0 ? timeDelta : a.characterId.localeCompare(b.characterId);
  });

  return { knowledge, issues };
}

export function transitionPromiseStatus(
  promise: PromiseRecord,
  nextStatus: PromiseStatus
): PromiseRecord {
  const allowed = PROMISE_STATUS_FLOW[promise.status] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw new Error(
      `Invalid promise transition: ${promise.status} -> ${nextStatus}. Allowed: ${allowed.join(", ")}`
    );
  }

  return {
    ...promise,
    status: nextStatus
  };
}

export function validatePromises(promises: PromiseRecord[]): PromiseIssue[] {
  const issues: PromiseIssue[] = [];

  for (const promise of promises) {
    if (promise.status === "fulfilled" && !promise.fulfilledIn) {
      issues.push({
        promiseId: promise.id,
        message: "Promise marked fulfilled but missing fulfilledIn reference."
      });
    }

    if (promise.status !== "fulfilled" && promise.fulfilledIn) {
      issues.push({
        promiseId: promise.id,
        message: "Promise has fulfilledIn reference but is not fulfilled."
      });
    }
  }

  return issues;
}

export function validateListenerCognition(
  events: Readonly<Event>[],
  knowledge: KnowledgeState[],
  knowledgeIssues: KnowledgeIssue[] = []
): ListenerCognitionReport {
  const issues = knowledgeIssues.map((issue) => issue.reason);
  const eventIndex = new Map(events.map((event) => [event.id, event] as const));

  for (const record of knowledge) {
    const event = eventIndex.get(record.eventId);
    if (!event) {
      issues.push(`Knowledge references missing event ${record.eventId}.`);
      continue;
    }
    if (record.learnedAt < event.timestamp) {
      issues.push(
        `Knowledge for event ${record.eventId} learned before event timestamp (${record.learnedAt.toISOString()} < ${event.timestamp.toISOString()}).`
      );
    }
  }

  return { issues };
}

export function validateCanonGate(
  events: Readonly<Event>[],
  promises: PromiseRecord[]
): CanonValidationReport {
  const continuity = checkContinuity(events);
  const { knowledge, issues } = deriveKnowledgeState(events);
  const promiseIssues = validatePromises(promises);
  const listenerCognition = validateListenerCognition(events, knowledge, issues);

  const passed =
    continuity.dependencyIssues.length === 0 &&
    continuity.cycleIssues.length === 0 &&
    continuity.timestampIssues.length === 0 &&
    promiseIssues.length === 0 &&
    listenerCognition.issues.length === 0;

  return {
    passed,
    continuity,
    promiseIssues,
    listenerCognition
  };
}
