import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { chapters, playbackPositions } from "@/drizzle/schema";
import { requireAuth, hasChapterAccess } from "@/lib/auth";
import { getChapterAudioUrl } from "@/lib/audioStorage";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const session = await requireAuth();

  // Get chapter
  const [chapter] = await db
    .select()
    .from(chapters)
    .where(eq(chapters.slug, slug));

  if (!chapter) {
    return NextResponse.json(
      { error: "Chapter not found" },
      { status: 404 }
    );
  }

  if (!chapter.isPublished) {
    return NextResponse.json(
      { error: "Chapter not published" },
      { status: 404 }
    );
  }

  const hasAccess = session ? await hasChapterAccess(slug, session) : false;

  if (!hasAccess) {
    return NextResponse.json({
      chapter: {
        id: chapter.id,
        slug: chapter.slug,
        title: chapter.title,
        subtitle: chapter.subtitle,
        description: chapter.description,
        durationSeconds: chapter.durationSeconds,
        publishedAt: chapter.publishedAt,
        hasAccess: false
      },
      playbackPosition: null,
      audioUrl: null
    });
  }

  // Get playback position if authenticated
  let playbackPosition = 0;
  if (session) {
    const [position] = await db
      .select()
      .from(playbackPositions)
      .where(eq(playbackPositions.listenerId, session.listenerId));

    if (position) {
      playbackPosition = position.positionSeconds;
    }
  }

  // Generate signed URL
  let audioUrl: string | null = null;
  let audioExpiresAt: Date | null = null;

  if (chapter.audioStoragePath) {
    const signedUrl = await getChapterAudioUrl(slug, chapter.durationSeconds);
    audioUrl = signedUrl.url;
    audioExpiresAt = signedUrl.expiresAt;
  }

  return NextResponse.json({
    chapter: {
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title,
      subtitle: chapter.subtitle,
      description: chapter.description,
      durationSeconds: chapter.durationSeconds,
      publishedAt: chapter.publishedAt,
      hasAccess: true
    },
    playbackPosition,
    audioUrl,
    audioExpiresAt
  });
}
