"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface AudioPlayerProps {
  audioUrl?: string;
  chapterId: string;
  chapterTitle?: string;
  initialPosition?: number;
  duration: number;
  onPositionUpdate?: (position: number) => void;
  onChapterComplete?: () => void;
  nextChapterSlug?: string;
  prevChapterSlug?: string;
}

export default function AudioPlayer({
  audioUrl,
  chapterId,
  chapterTitle,
  initialPosition = 0,
  duration,
  onPositionUpdate,
  onChapterComplete,
  nextChapterSlug,
  prevChapterSlug
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(initialPosition);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format seconds to MM:SS or HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Set initial position
  useEffect(() => {
    if (audioRef.current && initialPosition > 0) {
      audioRef.current.currentTime = initialPosition;
    }
  }, [initialPosition]);

  // Save position periodically
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (audioRef.current && onPositionUpdate) {
        const position = Math.floor(audioRef.current.currentTime);
        onPositionUpdate(position);
      }
    }, 5000); // Save every 5 seconds

    return () => clearInterval(interval);
  }, [isPlaying, onPositionUpdate]);

  const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => {
          setError("Unable to play audio. Please try again.");
          console.error("[Player] Play error:", err);
        });
      }
    }
  }, [isPlaying]);

  const skipForward = useCallback((seconds = 15) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + seconds,
        duration
      );
    }
  }, [duration]);

  const skipBackward = useCallback((seconds = 15) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - seconds, 0);
    }
  }, []);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onPositionUpdate) {
      onPositionUpdate(Math.floor(duration));
    }
    if (onChapterComplete) {
      onChapterComplete();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowRight":
          e.preventDefault();
          skipForward(e.shiftKey ? 30 : 15);
          break;
        case "ArrowLeft":
          e.preventDefault();
          skipBackward(e.shiftKey ? 30 : 15);
          break;
        case "j":
          e.preventDefault();
          skipBackward(10);
          break;
        case "l":
          e.preventDefault();
          skipForward(10);
          break;
        case ",":
          e.preventDefault();
          handleSpeedChange(Math.max(0.5, playbackSpeed - 0.25));
          break;
        case ".":
          e.preventDefault();
          handleSpeedChange(Math.min(2.0, playbackSpeed + 0.25));
          break;
        case "m":
          e.preventDefault();
          if (audioRef.current) {
            audioRef.current.muted = !audioRef.current.muted;
          }
          break;
        case "0":
        case "Home":
          e.preventDefault();
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
          }
          break;
        case "End":
          e.preventDefault();
          if (audioRef.current) {
            audioRef.current.currentTime = duration - 1;
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayPause, skipForward, skipBackward, playbackSpeed, duration]);

  const progressPercent = (currentTime / duration) * 100;

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => {
          setIsPlaying(true);
          setIsLoading(false);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={() => setError("Unable to load audio")}
        preload="metadata"
      />

      {/* Chapter title */}
      {chapterTitle && (
        <div style={{ textAlign: "center" }}>
          <span className="studio-pill">Now playing</span>
          <h2 style={{ margin: "12px 0 0" }}>{chapterTitle}</h2>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            color: "#fca5a5",
            textAlign: "center"
          }}
        >
          {error}
        </div>
      )}

      {/* Progress bar */}
      <div style={{ display: "grid", gap: "12px" }}>
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          style={{
            width: "100%",
            cursor: "pointer",
            accentColor: "var(--accent)"
          }}
          aria-label="Seek"
        />
        <div
          className="progress"
          style={{ height: "8px", cursor: "pointer" }}
          onClick={handleProgressClick}
          role="progressbar"
          aria-valuenow={currentTime}
          aria-valuemin={0}
          aria-valuemax={duration}
        >
          <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.9rem",
            color: "var(--muted)"
          }}
        >
          <span>{formatTime(currentTime)}</span>
          <span>-{formatTime(duration - currentTime)}</span>
        </div>
      </div>

      {/* Playback controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px"
        }}
      >
        <button
          onClick={() => skipBackward()}
          className="button secondary"
          style={{ padding: "12px 16px" }}
          title="Skip backward 15 seconds (Left Arrow)"
          aria-label="Skip backward 15 seconds"
        >
          -15s
        </button>

        <button
          onClick={togglePlayPause}
          className="button"
          style={{
            padding: "16px 32px",
            fontSize: "1.1rem",
            minWidth: "120px"
          }}
          disabled={!audioUrl || isLoading}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isLoading ? "Loading..." : isPlaying ? "Pause" : "Play"}
        </button>

        <button
          onClick={() => skipForward()}
          className="button secondary"
          style={{ padding: "12px 16px" }}
          title="Skip forward 15 seconds (Right Arrow)"
          aria-label="Skip forward 15 seconds"
        >
          +15s
        </button>
      </div>

      {/* Playback speed control */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
        <span className="muted" style={{ fontSize: "0.9rem", marginRight: "8px" }}>
          Speed:
        </span>
        {[0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((speed) => (
          <button
            key={speed}
            onClick={() => handleSpeedChange(speed)}
            className={playbackSpeed === speed ? "studio-pill" : "button secondary"}
            style={{
              padding: "6px 12px",
              fontSize: "0.85rem",
              background:
                playbackSpeed === speed ? "var(--accent-soft)" : "transparent"
            }}
            aria-label={`Playback speed ${speed}x`}
            aria-pressed={playbackSpeed === speed}
          >
            {speed}x
          </button>
        ))}
      </div>

      {/* Chapter navigation */}
      {(prevChapterSlug || nextChapterSlug) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            paddingTop: "16px",
            borderTop: "1px solid var(--border)"
          }}
        >
          {prevChapterSlug ? (
            <a
              href={`/player/${prevChapterSlug}`}
              className="button secondary"
              style={{ fontSize: "0.9rem" }}
            >
              Previous chapter
            </a>
          ) : (
            <div />
          )}
          {nextChapterSlug && (
            <a
              href={`/player/${nextChapterSlug}`}
              className="button secondary"
              style={{ fontSize: "0.9rem" }}
            >
              Next chapter
            </a>
          )}
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      <details style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
        <summary style={{ cursor: "pointer", textAlign: "center" }}>
          Keyboard shortcuts
        </summary>
        <div
          style={{
            marginTop: "12px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "8px",
            padding: "12px",
            background: "rgba(0, 0, 0, 0.2)",
            borderRadius: "8px"
          }}
        >
          <span><kbd>Space</kbd> / <kbd>K</kbd> Play/Pause</span>
          <span><kbd>Left</kbd> / <kbd>J</kbd> Skip back</span>
          <span><kbd>Right</kbd> / <kbd>L</kbd> Skip forward</span>
          <span><kbd>Shift+Arrow</kbd> Skip 30s</span>
          <span><kbd>,</kbd> / <kbd>.</kbd> Speed -/+</span>
          <span><kbd>M</kbd> Mute</span>
          <span><kbd>0</kbd> / <kbd>Home</kbd> Start</span>
          <span><kbd>End</kbd> Near end</span>
        </div>
      </details>
    </div>
  );
}
