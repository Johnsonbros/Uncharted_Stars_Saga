"use client";

import { useState } from "react";

export default function AccountSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [creatorUpdates, setCreatorUpdates] = useState(true);
  const [clearing, setClearing] = useState(false);

  const handleClearHistory = async () => {
    setClearing(true);
    try {
      // Future: API call to clear playback history
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert("Playback history cleared.");
    } catch {
      alert("Failed to clear history. Please try again.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      {/* Notification Settings */}
      <div className="studio-card">
        <h3 style={{ margin: "0 0 16px" }}>Notifications</h3>
        <p className="muted" style={{ margin: "0 0 20px" }}>
          Choose how you want to be notified about new chapters and updates.
        </p>

        <div style={{ display: "grid", gap: "16px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer"
            }}
          >
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              style={{
                width: "20px",
                height: "20px",
                cursor: "pointer"
              }}
            />
            <div>
              <div style={{ fontWeight: 600, color: "var(--text)" }}>
                New chapter notifications
              </div>
              <div className="muted" style={{ fontSize: "0.9rem" }}>
                Get an email when new content is published
              </div>
            </div>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer"
            }}
          >
            <input
              type="checkbox"
              checked={creatorUpdates}
              onChange={(e) => setCreatorUpdates(e.target.checked)}
              style={{
                width: "20px",
                height: "20px",
                cursor: "pointer"
              }}
            />
            <div>
              <div style={{ fontWeight: 600, color: "var(--text)" }}>
                Creator updates
              </div>
              <div className="muted" style={{ fontSize: "0.9rem" }}>
                Behind-the-scenes notes and announcements
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Playback Preferences */}
      <div className="studio-card">
        <h3 style={{ margin: "0 0 16px" }}>Playback preferences</h3>

        <div className="studio-form">
          <div className="studio-field">
            <label htmlFor="playback-speed">Default playback speed</label>
            <select id="playback-speed" defaultValue="1.0">
              <option value="0.75">0.75x</option>
              <option value="1.0">1.0x (Normal)</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="1.75">1.75x</option>
              <option value="2.0">2.0x</option>
            </select>
          </div>

          <div className="studio-field">
            <label htmlFor="skip-duration">Skip forward/backward duration</label>
            <select id="skip-duration" defaultValue="15">
              <option value="10">10 seconds</option>
              <option value="15">15 seconds</option>
              <option value="30">30 seconds</option>
              <option value="60">60 seconds</option>
            </select>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer"
            }}
          >
            <input
              type="checkbox"
              defaultChecked={true}
              style={{
                width: "20px",
                height: "20px",
                cursor: "pointer"
              }}
            />
            <div>
              <div style={{ fontWeight: 600, color: "var(--text)" }}>
                Auto-resume playback
              </div>
              <div className="muted" style={{ fontSize: "0.9rem" }}>
                Automatically continue from where you left off
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="studio-card">
        <h3 style={{ margin: "0 0 16px" }}>Data & Privacy</h3>
        <div style={{ display: "grid", gap: "16px" }}>
          <div>
            <strong style={{ display: "block", marginBottom: "8px" }}>
              Playback history
            </strong>
            <p className="muted" style={{ margin: "0 0 12px" }}>
              Your playback positions are stored to enable resume functionality
              across devices.
            </p>
            <button
              className="button secondary"
              style={{ fontSize: "0.9rem", padding: "8px 16px" }}
              onClick={handleClearHistory}
              disabled={clearing}
            >
              {clearing ? "Clearing..." : "Clear playback history"}
            </button>
          </div>

          <div>
            <strong style={{ display: "block", marginBottom: "8px" }}>
              Download your data
            </strong>
            <p className="muted" style={{ margin: "0 0 12px" }}>
              Request a copy of your account data, including membership details and
              playback history.
            </p>
            <button
              className="button secondary"
              style={{ fontSize: "0.9rem", padding: "8px 16px" }}
            >
              Request data export
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
