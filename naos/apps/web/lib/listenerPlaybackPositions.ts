import { and, eq } from "drizzle-orm";

import { playbackPositions } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { getOrCreateListenerByEmail } from "@/lib/listenerEntitlements";

export type PlaybackPositionInput = {
  listenerId?: string;
  email?: string;
  assetId: string;
  positionSeconds: number;
};

export async function upsertPlaybackPosition(input: PlaybackPositionInput) {
  let listenerId = input.listenerId;

  if (!listenerId && input.email) {
    const listener = await getOrCreateListenerByEmail(input.email);
    listenerId = listener.id;
  }

  if (!listenerId) {
    throw new Error("Listener identity is required to save playback position.");
  }

  const now = new Date();
  const [position] = await db
    .insert(playbackPositions)
    .values({
      listenerId,
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
