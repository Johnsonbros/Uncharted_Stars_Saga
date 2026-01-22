import { beforeEach, describe, expect, it, vi } from "vitest";

import { playbackPositions } from "@/drizzle/schema";

const positions: Array<{
  id: string;
  listenerId: string;
  assetId: string;
  positionSeconds: number;
  updatedAt: Date;
}> = [];

const insert = vi.fn(() => ({
  values: (value: {
    listenerId: string;
    assetId: string;
    positionSeconds: number;
    updatedAt: Date;
  }) => ({
    onConflictDoUpdate: ({ set }: { set: { positionSeconds: number; updatedAt: Date } }) => ({
      returning: () => {
        const existing = positions.find(
          item => item.listenerId === value.listenerId && item.assetId === value.assetId
        );
        if (existing) {
          existing.positionSeconds = set.positionSeconds;
          existing.updatedAt = set.updatedAt;
          return [existing];
        }

        const record = {
          id: `pos-${positions.length + 1}`,
          listenerId: value.listenerId,
          assetId: value.assetId,
          positionSeconds: value.positionSeconds,
          updatedAt: value.updatedAt
        };
        positions.push(record);
        return [record];
      }
    })
  })
}));

const select = vi.fn(() => ({
  from: () => ({
    where: (condition: {
      type: "and";
      conditions: Array<{ type: "eq"; column: unknown; value: string }>;
    }) => {
      const listenerCondition = condition.conditions.find(
        item => item.column === playbackPositions.listenerId
      );
      const assetCondition = condition.conditions.find(
        item => item.column === playbackPositions.assetId
      );
      return positions.filter(position => {
        if (listenerCondition && position.listenerId !== listenerCondition.value) {
          return false;
        }
        if (assetCondition && position.assetId !== assetCondition.value) {
          return false;
        }
        return true;
      });
    }
  })
}));

vi.mock("@/lib/db", () => ({
  db: {
    insert,
    select
  }
}));

vi.mock("drizzle-orm", async () => {
  const actual = await vi.importActual<typeof import("drizzle-orm")>("drizzle-orm");
  return {
    ...actual,
    eq: (column: unknown, value: string) => ({ type: "eq", column, value }),
    and: (...conditions: Array<{ type: "eq"; column: unknown; value: string }>) => ({
      type: "and",
      conditions
    })
  };
});

describe("playback position integration", () => {
  beforeEach(() => {
    positions.splice(0, positions.length);
    insert.mockClear();
    select.mockClear();
  });

  it("upserts and retrieves playback positions", async () => {
    const { getPlaybackPosition, upsertPlaybackPosition } = await import(
      "@/lib/listenerPlaybackPositions"
    );

    const initial = await upsertPlaybackPosition({
      listenerId: "listener-123",
      assetId: "chapter-9",
      positionSeconds: 42
    });

    expect(initial).toMatchObject({
      listenerId: "listener-123",
      assetId: "chapter-9",
      positionSeconds: 42
    });

    const updated = await upsertPlaybackPosition({
      listenerId: "listener-123",
      assetId: "chapter-9",
      positionSeconds: 120
    });

    expect(updated).toMatchObject({
      listenerId: "listener-123",
      assetId: "chapter-9",
      positionSeconds: 120
    });

    const retrieved = await getPlaybackPosition("listener-123", "chapter-9");

    expect(retrieved).toMatchObject({
      listenerId: "listener-123",
      assetId: "chapter-9",
      positionSeconds: 120
    });
  });

  it("returns null when no playback position exists", async () => {
    const { getPlaybackPosition } = await import("@/lib/listenerPlaybackPositions");

    const retrieved = await getPlaybackPosition("listener-999", "chapter-1");

    expect(retrieved).toBeNull();
  });
});
