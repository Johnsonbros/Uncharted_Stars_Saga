import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { playbackPositions } from "@/drizzle/schema";

export type PlaybackPositionInput = {
  listenerId: string;
  assetId: string;
  positionSeconds: number;
};

export async function upsertPlaybackPosition(input: PlaybackPositionInput) {
  const now = new Date();
  const [position] = await db
    .insert(playbackPositions)
    .values({
      listenerId: input.listenerId,
      assetId: input.assetId,
      positionSeconds: input.positionSeconds,
      updatedAt: now
    })
    .onConflictDoUpdate({
      target: [playbackPositions.listenerId, playbackPositions.assetId],
      set: {
        positionSeconds: input.positionSeconds,
        updatedAt: now
      }
    })
    .returning();

  return position;
}

export async function getPlaybackPosition(listenerId: string, assetId: string) {
  const [position] = await db
    .select()
    .from(playbackPositions)
    .where(
      and(
        eq(playbackPositions.listenerId, listenerId),
        eq(playbackPositions.assetId, assetId)
      )
    );

  return position ?? null;
}
