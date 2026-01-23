"use client";

import { useCallback } from "react";
import AudioPlayer from "@/components/AudioPlayer";

interface PlayerClientProps {
  chapterId: string;
  chapterSlug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  audioUrl: string | null;
  duration: number;
  initialPosition: number;
  prevChapterSlug?: string;
  nextChapterSlug?: string;
}

export default function PlayerClient({
  chapterId,
  chapterSlug,
  title,
  subtitle,
  description,
  audioUrl,
  duration,
  initialPosition,
  prevChapterSlug,
  nextChapterSlug
}: PlayerClientProps) {
  const handlePositionUpdate = useCallback(
    async (position: number) => {
      try {
        await fetch("/api/playback/position", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assetId: chapterSlug,
            positionSeconds: position
          })
        });
      } catch (error) {
        console.error("[Player] Failed to save position:", error);
      }
    },
    [chapterSlug]
  );

  const handleChapterComplete = useCallback(() => {
    // Save final position
    handlePositionUpdate(duration);

    // Auto-advance to next chapter after a short delay
    if (nextChapterSlug) {
      setTimeout(() => {
        window.location.href = `/player/${nextChapterSlug}`;
      }, 2000);
    }
  }, [duration, nextChapterSlug, handlePositionUpdate]);

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {/* Chapter header */}
      <div style={{ textAlign: "center" }}>
        <h1 style={{ margin: "0 0 8px" }}>{title}</h1>
        {subtitle && (
          <p className="muted" style={{ margin: 0, fontSize: "1.1rem" }}>
            {subtitle}
          </p>
        )}
      </div>

      {description && (
        <p
          className="muted"
          style={{
            margin: 0,
            textAlign: "center",
            lineHeight: 1.6,
            maxWidth: "600px",
            marginInline: "auto"
          }}
        >
          {description}
        </p>
      )}

      {/* Audio player */}
      {audioUrl ? (
        <AudioPlayer
          audioUrl={audioUrl}
          chapterId={chapterId}
          chapterTitle={title}
          initialPosition={initialPosition}
          duration={duration}
          onPositionUpdate={handlePositionUpdate}
          onChapterComplete={handleChapterComplete}
          prevChapterSlug={prevChapterSlug}
          nextChapterSlug={nextChapterSlug}
        />
      ) : (
        <div
          className="studio-status-banner"
          style={{
            textAlign: "center",
            padding: "32px 24px"
          }}
        >
          <p style={{ margin: 0 }}>
            Audio file not yet available. Check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
