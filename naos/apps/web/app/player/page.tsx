import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Player - Uncharted Stars Saga",
  description: "Listen to your audiobook"
};

// Mock chapter data - will be replaced with actual database queries
const chapterData = {
  id: "infinitys-reach-prologue",
  title: "Infinity's Reach",
  subtitle: "Prologue",
  duration: 2760, // 46 minutes in seconds
  currentPosition: 1122, // 18:42 in seconds
  audioUrl: "/audio/placeholder.mp3", // Will be replaced with signed URL from object storage
  description:
    "The first encounter with an impossible artifact that defies the laws of physics.",
  published: "2026-01-22"
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function PlayerPage() {
  const progressPercent = (chapterData.currentPosition / chapterData.duration) * 100;

  return (
    <div className="studio-shell">
      <nav className="nav">
        <div className="brand">
          <span className="tag">NAOS Listener Platform</span>
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
            ← Back to library
          </Link>

          <div
            className="studio-card highlight"
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              width: "100%"
            }}
          >
            <div style={{ textAlign: "center" }}>
              <span className="studio-pill">Now playing</span>
              <h1 style={{ margin: "16px 0 4px" }}>{chapterData.title}</h1>
              <p className="muted" style={{ margin: 0, fontSize: "1.1rem" }}>
                {chapterData.subtitle}
              </p>
            </div>

            <p
              className="muted"
              style={{
                margin: "16px 0 0",
                textAlign: "center",
                lineHeight: 1.6
              }}
            >
              {chapterData.description}
            </p>

            <div style={{ marginTop: "32px" }}>
              {/* Progress bar */}
              <div className="progress" style={{ height: "8px" }}>
                <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
              </div>

              {/* Time display */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "12px",
                  fontSize: "0.9rem",
                  color: "var(--muted)"
                }}
              >
                <span>{formatTime(chapterData.currentPosition)}</span>
                <span>{formatTime(chapterData.duration)}</span>
              </div>

              {/* Audio player controls */}
              <div style={{ marginTop: "24px" }}>
                <audio
                  controls
                  style={{ width: "100%" }}
                  preload="metadata"
                  // src={chapterData.audioUrl} // Will be populated with signed URL
                >
                  Your browser does not support audio playback.
                </audio>
              </div>

              {/* Player notes */}
              <div
                className="studio-status-banner"
                style={{
                  marginTop: "24px",
                  textAlign: "center",
                  fontSize: "0.9rem"
                }}
              >
                Audio file placeholder. Full playback integration coming in Phase 3.
              </div>
            </div>
          </div>
        </div>

        {/* Additional chapter info */}
        <div className="studio-section" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="studio-card">
            <h3 style={{ margin: "0 0 16px" }}>About this chapter</h3>
            <div className="studio-status">
              <div>
                <span className="muted">Published</span>
                <span>{chapterData.published}</span>
              </div>
              <div>
                <span className="muted">Duration</span>
                <span>{formatTime(chapterData.duration)}</span>
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
              <li>Use keyboard shortcuts: Space (play/pause), Left/Right (skip 15s)</li>
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
