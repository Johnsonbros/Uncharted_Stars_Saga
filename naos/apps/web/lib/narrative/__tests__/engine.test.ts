import { describe, expect, it } from "vitest";
import {
  checkContinuity,
  createEvent,
  deriveKnowledgeState,
  splitByCanonStatus,
  transitionCanonStatus,
  transitionPromiseStatus,
  updateEvent,
  validateCanonGate,
  validateDependencyGraph,
  validatePromises
} from "../engine";
import { type Event, EventSchema } from "../models";

const buildEvent = (overrides: Partial<Event>): Event =>
  EventSchema.parse({
    id: "2f2f8f51-0b71-4a60-b17a-1f5c50b6b7d1",
    timestamp: new Date("2025-01-01T00:00:00.000Z"),
    type: "scene",
    participants: [],
    description: "Base event",
    dependencies: [],
    impacts: [],
    knowledgeEffects: [],
    canonStatus: "draft",
    ...overrides
  });

describe("narrative engine", () => {
  it("creates draft events by default", () => {
    const event = createEvent({
      type: "scene",
      participants: [],
      description: "New event",
      dependencies: [],
      impacts: [],
      knowledgeEffects: []
    });
    expect(event.canonStatus).toBe("draft");
  });

  it("rejects invalid canon transitions", () => {
    const event = buildEvent({ canonStatus: "canon" });
    expect(() => transitionCanonStatus(event, "draft")).toThrow(/Invalid canon transition/);
  });

  it("prevents updates to canonical events", () => {
    const event = buildEvent({ canonStatus: "canon" });
    expect(() => updateEvent(event, { description: "Updated" })).toThrow(
      /Canonical events are immutable/
    );
  });

  it("detects missing dependencies and cycles", () => {
    const first = buildEvent({ id: "11111111-1111-1111-1111-111111111111" });
    const second = buildEvent({
      id: "22222222-2222-2222-2222-222222222222",
      dependencies: ["11111111-1111-1111-1111-111111111111"]
    });
    const third = buildEvent({
      id: "33333333-3333-3333-3333-333333333333",
      dependencies: ["55555555-5555-5555-5555-555555555555"]
    });
    const cycleStart = buildEvent({
      id: "44444444-4444-4444-4444-444444444444",
      dependencies: ["66666666-6666-6666-6666-666666666666"]
    });
    const cycleEnd = buildEvent({
      id: "66666666-6666-6666-6666-666666666666",
      dependencies: ["44444444-4444-4444-4444-444444444444"]
    });

    const report = validateDependencyGraph([first, second, third, cycleStart, cycleEnd]);
    expect(report.dependencyIssues).toHaveLength(1);
    expect(report.cycleIssues).toHaveLength(1);
  });

  it("flags timestamp continuity errors", () => {
    const dependency = buildEvent({
      id: "11111111-1111-1111-1111-111111111111",
      timestamp: new Date("2025-02-01T00:00:00.000Z")
    });
    const event = buildEvent({
      id: "22222222-2222-2222-2222-222222222222",
      timestamp: new Date("2025-01-01T00:00:00.000Z"),
      dependencies: [dependency.id]
    });

    const report = checkContinuity([dependency, event]);
    expect(report.timestampIssues).toHaveLength(1);
  });

  it("derives knowledge state using latest certainty", () => {
    const event = buildEvent({
      knowledgeEffects: [
        {
          characterId: "char-1",
          learnedAt: new Date("2025-01-01T00:00:00.000Z"),
          certainty: "rumored",
          source: "told"
        },
        {
          characterId: "char-1",
          learnedAt: new Date("2025-01-01T00:00:00.000Z"),
          certainty: "known",
          source: "witnessed"
        }
      ]
    });

    const { knowledge } = deriveKnowledgeState([event]);
    expect(knowledge).toHaveLength(1);
    expect(knowledge[0].certainty).toBe("known");
  });

  it("splits events by canon status", () => {
    const events = [
      buildEvent({ canonStatus: "draft" }),
      buildEvent({ id: "22222222-2222-2222-2222-222222222222", canonStatus: "proposed" }),
      buildEvent({ id: "33333333-3333-3333-3333-333333333333", canonStatus: "canon" })
    ];
    const buckets = splitByCanonStatus(events);
    expect(buckets.draft).toHaveLength(1);
    expect(buckets.proposed).toHaveLength(1);
    expect(buckets.canon).toHaveLength(1);
  });

  it("enforces promise lifecycle rules", () => {
    const promise = {
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      type: "mystery",
      establishedIn: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      description: "A dangling thread",
      status: "pending" as const
    };

    const updated = transitionPromiseStatus(promise, "fulfilled");
    expect(updated.status).toBe("fulfilled");
    expect(() => transitionPromiseStatus(updated, "pending")).toThrow(/Invalid promise transition/);
  });

  it("validates promise records", () => {
    const issues = validatePromises([
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        type: "mystery",
        establishedIn: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        description: "Incomplete promise",
        status: "fulfilled"
      }
    ]);
    expect(issues).toHaveLength(1);
  });

  it("fails canon gate when listener cognition issues exist", () => {
    const event = buildEvent({
      knowledgeEffects: [
        {
          characterId: "char-2",
          learnedAt: new Date("2024-12-01T00:00:00.000Z"),
          certainty: "known",
          source: "witnessed"
        }
      ]
    });

    const report = validateCanonGate([event], []);
    expect(report.passed).toBe(false);
  });

  it("rejects canon gate submissions with contradictory continuity", () => {
    const dependency = buildEvent({
      id: "99999999-9999-9999-9999-999999999999",
      timestamp: new Date("2025-02-10T00:00:00.000Z")
    });
    const event = buildEvent({
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      timestamp: new Date("2025-02-01T00:00:00.000Z"),
      dependencies: [dependency.id]
    });

    const report = validateCanonGate([dependency, event], []);
    expect(report.passed).toBe(false);
    expect(report.continuity.timestampIssues).toHaveLength(1);
  });
});
