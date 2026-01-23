import Link from "next/link";
import { eq, asc } from "drizzle-orm";

import { db } from "@/lib/db";
import { chapters, playbackPositions } from "@/drizzle/schema";
import { getCurrentSession } from "@/lib/auth";

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins} min`;
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

async function getChaptersWithProgress(listenerId: string | null) {
  // Get all published chapters
  const publishedChapters = await db
    .select()
    .from(chapters)
    .where(eq(chapters.isPublished, true))
    .orderBy(asc(chapters.sequenceOrder));

  // Get playback positions for this listener
  let positions: Record<string, number> = {};
  if (listenerId) {
    const positionRows = await db
      .select()
      .from(playbackPositions)
      .where(eq(playbackPositions.listenerId, listenerId));

    positions = positionRows.reduce(
      (acc, row) => {
        acc[row.assetId] = row.positionSeconds;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  return publishedChapters.map((chapter) => ({
    ...chapter,
    currentPosition: positions[chapter.slug] || 0
  }));
}

export default async function LibraryPage() {
  const session = await getCurrentSession();
  const isAuthenticated = !!session?.isAuthenticated;
  const hasAccess = session?.membershipType === "founders" || !!session?.membershipType;

  const chaptersWithProgress = await getChaptersWithProgress(
    session?.listenerId || null
  );

  // Find the most recently played chapter for "Continue Listening"
  const lastPlayedChapter = chaptersWithProgress
    .filter((c) => c.currentPosition > 0)
    .sort((a, b) => b.currentPosition - a.currentPosition)[0];

  return (
    <div className="studio-shell">
      <nav className="nav">
        <div className="brand">
          <span className="tag">Listener library</span>
          <Link href="/">
            <strong>Uncharted Stars Saga</strong>
          </Link>
        </div>
        <div className="nav-links">
          <Link href="/">Home</Link>
          {isAuthenticated ? (
            <>
              <Link href="/account">Account</Link>
              <Link href="/api/auth/logout">Sign out</Link>
            </>
          ) : (
            <>
              <Link href="/login">Sign in</Link>
              <Link href="/founders">Become a Founder</Link>
            </>
          )}
        </div>
      </nav>

      <div className="studio-main">
        {/* Hero section */}
        <section className="studio-section">
          <div className="hero-content" style={{ maxWidth: "700px" }}>
            <span className="tag">
              {isAuthenticated
                ? hasAccess
                  ? "Founders library"
                  : "Limited access"
                : "Guest view"}
            </span>
            <h1>Your listening library</h1>
            <p className="muted">
              {isAuthenticated
                ? hasAccess
                  ? "Full access to every chapter. Pick up where you left off or start fresh."
                  : "Complete your Founders purchase to unlock all chapters."
                : "Sign in to access your library and track your progress."}
            </p>

            {!isAuthenticated && (
              <div className="hero-actions" style={{ marginTop: "16px" }}>
                <Link href="/login" className="button">
                  Sign in
                </Link>
                <Link href="/founders" className="button secondary">
                  Become a Founder
                </Link>
              </div>
            )}

            {isAuthenticated && !hasAccess && (
              <div className="hero-actions" style={{ marginTop: "16px" }}>
                <Link href="/founders" className="button">
                  Unlock full access
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Continue Listening */}
        {lastPlayedChapter && hasAccess && (
          <section className="studio-section">
            <h2 className="section-title">Continue listening</h2>
            <div className="studio-card highlight" style={{ maxWidth: "600px" }}>
              <div className="studio-card-header">
                <div>
                  <span className="studio-pill">Resume</span>
                  <h3 style={{ margin: "8px 0 4px" }}>{lastPlayedChapter.title}</h3>
                  {lastPlayedChapter.subtitle && (
                    <p className="muted" style={{ margin: 0 }}>
                      {lastPlayedChapter.subtitle}
                    </p>
                  )}
                </div>
              </div>
              <div className="progress" style={{ height: "6px" }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${(lastPlayedChapter.currentPosition / lastPlayedChapter.durationSeconds) * 100}%`
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span className="muted" style={{ fontSize: "0.9rem" }}>
                  {formatDuration(lastPlayedChapter.currentPosition)} of{" "}
                  {formatDuration(lastPlayedChapter.durationSeconds)}
                </span>
                <Link
                  href={`/player/${lastPlayedChapter.slug}`}
                  className="button"
                  style={{ padding: "10px 20px" }}
                >
                  Continue
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* All Chapters */}
        <section className="studio-section">
          <h2 className="section-title">All chapters</h2>

          {chaptersWithProgress.length === 0 ? (
            <div className="studio-card">
              <p className="muted">
                No chapters published yet. Check back soon for the first release.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {chaptersWithProgress.map((chapter, index) => {
                const progress =
                  chapter.currentPosition > 0
                    ? (chapter.currentPosition / chapter.durationSeconds) * 100
                    : 0;
                const isCompleted = progress > 95;

                return (
                  <div
                    key={chapter.id}
                    className="studio-card"
                    style={{
                      opacity: hasAccess ? 1 : 0.7
                    }}
                  >
                    <div className="studio-card-header">
                      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                        <div
                          className="step-index"
                          style={{
                            background: isCompleted
                              ? "rgba(34, 197, 94, 0.2)"
                              : progress > 0
                                ? "var(--accent-soft)"
                                : "rgba(255, 255, 255, 0.05)"
                          }}
                        >
                          {isCompleted ? "+" : index + 1}
                        </div>
                        <div>
                          <h4 style={{ margin: 0 }}>{chapter.title}</h4>
                          {chapter.subtitle && (
                            <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.95rem" }}>
                              {chapter.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                      {hasAccess ? (
                        <Link
                          href={`/player/${chapter.slug}`}
                          className="button secondary"
                          style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                        >
                          {progress > 0 ? "Continue" : "Play"}
                        </Link>
                      ) : (
                        <span
                          className="studio-pill"
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            color: "var(--muted)"
                          }}
                        >
                          Locked
                        </span>
                      )}
                    </div>

                    {chapter.description && (
                      <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
                        {chapter.description}
                      </p>
                    )}

                    <div
                      style={{
                        display: "flex",
                        gap: "24px",
                        fontSize: "0.85rem",
                        color: "var(--muted)"
                      }}
                    >
                      <span>{formatDuration(chapter.durationSeconds)}</span>
                      {chapter.publishedAt && (
                        <span>Published {formatDate(chapter.publishedAt)}</span>
                      )}
                    </div>

                    {progress > 0 && (
                      <div className="progress" style={{ height: "4px" }}>
                        <div className="progress-bar" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <section className="footer" style={{ marginTop: "auto" }}>
        <strong>NAOS Listener Platform</strong>
        <span>Built for audio-first storytelling.</span>
        <span>Need help? hello@unchartedstars.ai</span>
      </section>
    </div>
  );
}
