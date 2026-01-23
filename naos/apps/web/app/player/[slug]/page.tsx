import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq, asc, lt, gt } from "drizzle-orm";

import { db } from "@/lib/db";
import { chapters, playbackPositions } from "@/drizzle/schema";
import { getCurrentSession, hasChapterAccess } from "@/lib/auth";
import { getChapterAudioUrl } from "@/lib/audioStorage";
import PlayerClient from "./PlayerClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const [chapter] = await db
    .select()
    .from(chapters)
    .where(eq(chapters.slug, slug));

  if (!chapter) {
    return {
      title: "Chapter Not Found - Uncharted Stars Saga"
    };
  }

  return {
    title: `${chapter.title} - Uncharted Stars Saga`,
    description: chapter.description || `Listen to ${chapter.title}`
  };
}

async function getAdjacentChapters(currentOrder: number) {
  const [prevChapter] = await db
    .select({ slug: chapters.slug })
    .from(chapters)
    .where(eq(chapters.isPublished, true))
    .orderBy(asc(chapters.sequenceOrder))
    .limit(1);

  const allChapters = await db
    .select({ slug: chapters.slug, sequenceOrder: chapters.sequenceOrder })
    .from(chapters)
    .where(eq(chapters.isPublished, true))
    .orderBy(asc(chapters.sequenceOrder));

  const currentIndex = allChapters.findIndex((c) => c.sequenceOrder === currentOrder);
  const prev = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const next = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  return { prev, next };
}

export default async function PlayerPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getCurrentSession();

  // Get chapter data
  const [chapter] = await db
    .select()
    .from(chapters)
    .where(eq(chapters.slug, slug));

  if (!chapter || !chapter.isPublished) {
    notFound();
  }

  // Check access
  const hasAccess = session ? await hasChapterAccess(slug, session) : false;

  if (!hasAccess) {
    // Redirect to founders page if not authenticated or no access
    redirect(`/founders?return=/player/${slug}`);
  }

  // Get playback position
  let playbackPosition = 0;
  if (session) {
    const [position] = await db
      .select()
      .from(playbackPositions)
      .where(eq(playbackPositions.listenerId, session.listenerId));

    if (position && position.assetId === slug) {
      playbackPosition = position.positionSeconds;
    }
  }

  // Generate signed audio URL
  let audioUrl: string | null = null;
  if (chapter.audioStoragePath) {
    const signedUrl = await getChapterAudioUrl(slug, chapter.durationSeconds);
    audioUrl = signedUrl.url;
  }

  // Get adjacent chapters for navigation
  const { prev, next } = await getAdjacentChapters(chapter.sequenceOrder);

  return (
    <div className="studio-shell">
      <nav className="nav">
        <div className="brand">
          <span className="tag">Now playing</span>
          <Link href="/">
            <strong>Uncharted Stars Saga</strong>
          </Link>
        </div>
        <div className="nav-links">
          <Link href="/library">Library</Link>
          <Link href="/account">Account</Link>
        </div>
      </nav>

      <div className="studio-main">
        <div className="studio-section">
          <Link
            href="/library"
            className="button secondary"
            style={{
              alignSelf: "flex-start",
              fontSize: "0.9rem",
              padding: "8px 16px"
            }}
          >
            Back to library
          </Link>

          <div
            className="studio-card highlight"
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              width: "100%"
            }}
          >
            <PlayerClient
              chapterId={chapter.id}
              chapterSlug={slug}
              title={chapter.title}
              subtitle={chapter.subtitle}
              description={chapter.description}
              audioUrl={audioUrl}
              duration={chapter.durationSeconds}
              initialPosition={playbackPosition}
              prevChapterSlug={prev?.slug}
              nextChapterSlug={next?.slug}
            />
          </div>
        </div>

        {/* Chapter info */}
        <div className="studio-section" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="studio-card">
            <h3 style={{ margin: "0 0 16px" }}>About this chapter</h3>
            <div className="studio-status">
              <div>
                <span className="muted">Published</span>
                <span>
                  {chapter.publishedAt
                    ? new Intl.DateTimeFormat("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      }).format(chapter.publishedAt)
                    : "Coming soon"}
                </span>
              </div>
              <div>
                <span className="muted">Duration</span>
                <span>
                  {Math.floor(chapter.durationSeconds / 60)} minutes
                </span>
              </div>
              <div>
                <span className="muted">Format</span>
                <span>Audio + Read mode</span>
              </div>
            </div>
          </div>

          <div className="studio-card soft">
            <h3 style={{ margin: 0 }}>Playback tips</h3>
            <ul
              style={{
                margin: "12px 0 0",
                paddingLeft: "20px",
                color: "var(--muted)",
                lineHeight: 1.7
              }}
            >
              <li>Your position is automatically saved every few seconds</li>
              <li>Use keyboard shortcuts: Space (play/pause), Left/Right (skip)</li>
              <li>Playback syncs across devices when you're signed in</li>
            </ul>
          </div>
        </div>
      </div>

      <section className="footer">
        <strong>NAOS Listener Platform</strong>
        <span>Built for audio-first storytelling.</span>
        <span>Need help? hello@unchartedstars.ai</span>
      </section>
    </div>
  );
}
