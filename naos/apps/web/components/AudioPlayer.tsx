"use client";

import { useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
  audioUrl?: string;
  chapterId: string;
  initialPosition?: number;
  duration: number;
  onPositionUpdate?: (position: number) => void;
}

export default function AudioPlayer({
  audioUrl,
  chapterId,
  initialPosition = 0,
  duration,
  onPositionUpdate
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(initialPosition);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
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

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 15,
        duration
      );
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 15, 0);
    }
  };

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

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const progressPercent = (currentTime / duration) * 100;

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
      />

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
        />
        <div className="progress" style={{ height: "8px", cursor: "pointer" }}>
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
          <span>{formatTime(duration)}</span>
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
          onClick={skipBackward}
          className="button secondary"
          style={{ padding: "12px 16px" }}
          title="Skip backward 15 seconds"
        >
          ⏪ 15s
        </button>

        <button
          onClick={togglePlayPause}
          className="button"
          style={{
            padding: "16px 32px",
            fontSize: "1.1rem"
          }}
        >
          {isPlaying ? "⏸ Pause" : "▶ Play"}
        </button>

        <button
          onClick={skipForward}
          className="button secondary"
          style={{ padding: "12px 16px" }}
          title="Skip forward 15 seconds"
        >
          15s ⏩
        </button>
      </div>

      {/* Playback speed control */}
      <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
        <span className="muted" style={{ fontSize: "0.9rem" }}>
          Speed:
        </span>
        {[0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map(speed => (
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
          >
            {speed}x
          </button>
        ))}
      </div>

      {/* Keyboard shortcuts hint */}
      <p
        className="muted"
        style={{
          textAlign: "center",
          fontSize: "0.85rem",
          margin: 0
        }}
      >
        Keyboard shortcuts: Space (play/pause) · ← → (skip 15s)
      </p>
    </div>
  );
}
