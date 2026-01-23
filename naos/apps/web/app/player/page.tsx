import { redirect } from "next/navigation";
import { eq, asc } from "drizzle-orm";

import { db } from "@/lib/db";
import { chapters, playbackPositions } from "@/drizzle/schema";
import { getCurrentSession } from "@/lib/auth";

export default async function PlayerRedirectPage() {
  const session = await getCurrentSession();

  // If user is authenticated, try to find their last played chapter
  if (session?.listenerId) {
    const [lastPosition] = await db
      .select()
      .from(playbackPositions)
      .where(eq(playbackPositions.listenerId, session.listenerId))
      .orderBy();

    if (lastPosition) {
      redirect(`/player/${lastPosition.assetId}`);
    }
  }

  // Otherwise, redirect to the first published chapter or library
  const [firstChapter] = await db
    .select()
    .from(chapters)
    .where(eq(chapters.isPublished, true))
    .orderBy(asc(chapters.sequenceOrder))
    .limit(1);

  if (firstChapter) {
    redirect(`/player/${firstChapter.slug}`);
  }

  // No chapters available, go to library
  redirect("/library");
}
