import crypto from "node:crypto";
import {
  type CanonStatus,
  type Event,
  type EventInput,
  EventInputSchema,
  EventSchema
} from "./models";

export const CANON_STATUS_FLOW: Record<CanonStatus, CanonStatus[]> = {
  draft: ["draft", "proposed", "canon"],
  proposed: ["proposed", "canon"],
  canon: ["canon"]
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

export function createEvent(input: EventInput): Event {
  const parsed = EventInputSchema.parse(input);
  const event: Event = {
    ...parsed,
    id: crypto.randomUUID(),
    timestamp: parsed.timestamp ?? new Date(),
    canonStatus: parsed.canonStatus ?? "draft"
  };
  return EventSchema.parse(event);
}

export function transitionCanonStatus(event: Event, nextStatus: CanonStatus): Event {
  const allowed = CANON_STATUS_FLOW[event.canonStatus] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw new Error(
      `Invalid canon transition: ${event.canonStatus} -> ${nextStatus}. Allowed: ${allowed.join(", ")}`
    );
  }
  return { ...event, canonStatus: nextStatus };
}

export function updateEvent(event: Event, updates: Partial<Omit<Event, "id" | "canonStatus">>): Event {
  if (event.canonStatus === "canon") {
    throw new Error("Canonical events are immutable. Create a proposal instead.");
  }
  const merged: Event = {
    ...event,
    ...updates
  };
  return EventSchema.parse(merged);
}

export function splitByCanonStatus(events: Event[]) {
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

export function validateDependencyGraph(events: Event[]): {
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

export function checkContinuity(events: Event[]): ContinuityReport {
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
