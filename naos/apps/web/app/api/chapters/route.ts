import { NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";

import { db } from "@/lib/db";
import { chapters } from "@/drizzle/schema";
import { requireAuth, hasChapterAccess } from "@/lib/auth";
import { getChapterAudioUrl } from "@/lib/audioStorage";

export async function GET() {
  const session = await requireAuth();

  // Get all published chapters
  const publishedChapters = await db
    .select()
    .from(chapters)
    .where(eq(chapters.isPublished, true))
    .orderBy(asc(chapters.sequenceOrder));

  // Map chapters with access status and signed URLs
  const chaptersWithAccess = await Promise.all(
    publishedChapters.map(async (chapter) => {
      const hasAccess = session ? await hasChapterAccess(chapter.slug, session) : false;

      let audioUrl: string | null = null;
      let audioExpiresAt: Date | null = null;

      // Generate signed URL if user has access
      if (hasAccess && chapter.audioStoragePath) {
        const signedUrl = await getChapterAudioUrl(
          chapter.slug,
          chapter.durationSeconds
        );
        audioUrl = signedUrl.url;
        audioExpiresAt = signedUrl.expiresAt;
      }

      return {
        id: chapter.id,
        slug: chapter.slug,
        title: chapter.title,
        subtitle: chapter.subtitle,
        description: chapter.description,
        durationSeconds: chapter.durationSeconds,
        sequenceOrder: chapter.sequenceOrder,
        publishedAt: chapter.publishedAt,
        hasAccess,
        audioUrl,
        audioExpiresAt
      };
    })
  );

  return NextResponse.json({
    chapters: chaptersWithAccess,
    authenticated: !!session
  });
}
