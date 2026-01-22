import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Event } from "../models";
import { EventSchema } from "../models";
import { buildNarrativeStateSnapshot } from "../service";
import * as repository from "../repository";

vi.mock("../repository", () => ({
  fetchProjectEvents: vi.fn(),
  fetchPromises: vi.fn()
}));

const buildEvent = (overrides: Partial<Event>): Event =>
  EventSchema.parse({
    id: "00000000-0000-0000-0000-000000000001",
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

describe("buildNarrativeStateSnapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not let draft continuity issues fail the canon gate", async () => {
    const canonEvent = buildEvent({
      id: "00000000-0000-0000-0000-000000000002",
      timestamp: new Date("2025-01-02T00:00:00.000Z"),
      canonStatus: "canon"
    });
    const proposedEvent = buildEvent({
      id: "00000000-0000-0000-0000-000000000003",
      timestamp: new Date("2025-01-03T00:00:00.000Z"),
      canonStatus: "proposed"
    });
    const draftEvent = buildEvent({
      id: "00000000-0000-0000-0000-000000000004",
      canonStatus: "draft",
      dependencies: ["00000000-0000-0000-0000-999999999999"]
    });

    vi.mocked(repository.fetchProjectEvents).mockResolvedValue([
      canonEvent,
      proposedEvent,
      draftEvent
    ]);
    vi.mocked(repository.fetchPromises).mockResolvedValue([]);

    const snapshot = await buildNarrativeStateSnapshot("project-1");

    expect(snapshot.canonGate.passed).toBe(true);
    expect(snapshot.continuity.dependencyIssues).toHaveLength(1);
  });
});
