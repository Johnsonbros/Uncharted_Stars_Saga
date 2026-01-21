"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const supportTiles = [
  {
    title: "Guided setup",
    description: "Answer a few friendly prompts and we assemble your story brief for you."
  },
  {
    title: "Continuity guardrails",
    description: "Every change is tracked so your canon stays consistent and easy to manage."
  },
  {
    title: "Audio-first planning",
    description: "We focus on listening flow, emotion, and clarity for audiobook delivery."
  }
];

const quickActions = [
  "Generate a 3-act outline",
  "Draft the opening scene",
  "Create a narrated teaser",
  "Set the first publishing date"
];

export default function StudioDashboardPage() {
  const [storyTitle, setStoryTitle] = useState("The Glass Atlas");
  const [idea, setIdea] = useState(
    "A courier discovers a star map that only updates when she makes brave choices."
  );
  const [tone, setTone] = useState("Hopeful, cinematic, and quietly mysterious");
  const [length, setLength] = useState("30-45 minute short story");
  const [hero, setHero] = useState("Nia Vale, a reluctant explorer");
  const [setting, setSetting] = useState("A spiral of floating markets and derelict starships");
  const [lastUpdated, setLastUpdated] = useState("just now");

  useEffect(() => {
    const now = new Date();
    setLastUpdated(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, [storyTitle, idea, tone, length, hero, setting]);

  const summary = useMemo(
    () =>
      `${storyTitle} follows ${hero} in ${setting}. Tone: ${tone}. Target length: ${length}.`,
    [storyTitle, hero, setting, tone, length]
  );

  return (
    <section className="studio-section">
      <div className="studio-grid two">
        <div className="studio-card">
          <div className="studio-card-header">
            <div>
              <h2>Welcome back, creator</h2>
              <p className="muted">
                Start with your idea and we will shape it into a ready-to-record short story.
              </p>
            </div>
            <span className="studio-pill">Live updates • {lastUpdated}</span>
          </div>

          <div className="studio-form">
            <label>
              Story title
              <input
                value={storyTitle}
                onChange={(event) => setStoryTitle(event.target.value)}
                placeholder="Give your story a memorable name"
              />
            </label>
            <label>
              One-sentence idea
              <textarea
                rows={3}
                value={idea}
                onChange={(event) => setIdea(event.target.value)}
                placeholder="Describe the big idea in one sentence"
              />
            </label>
            <div className="studio-grid two">
              <label>
                Main character
                <input
                  value={hero}
                  onChange={(event) => setHero(event.target.value)}
                  placeholder="Who is the listener rooting for?"
                />
              </label>
              <label>
                Core setting
                <input
                  value={setting}
                  onChange={(event) => setSetting(event.target.value)}
                  placeholder="Where does the story take place?"
                />
              </label>
            </div>
            <label>
              Tone & style
              <input
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                placeholder="Warm, eerie, comedic, etc."
              />
            </label>
            <label>
              Listening length
              <input
                value={length}
                onChange={(event) => setLength(event.target.value)}
                placeholder="15 min, 30-45 min, 1 hour"
              />
            </label>
          </div>
        </div>

        <div className="studio-card highlight">
          <div>
            <h3>Your story brief</h3>
            <p className="muted">
              This updates instantly as you type. Use it as your foundation for drafts, covers,
              and audio planning.
            </p>
          </div>
          <div className="studio-summary">
            <h4>{storyTitle}</h4>
            <p>{idea}</p>
            <p className="muted">{summary}</p>
          </div>
          <div className="studio-meta">
            <div>
              <span className="muted">Next best action</span>
              <strong>Generate your 3-act outline</strong>
            </div>
            <button className="button">Build the outline</button>
          </div>
        </div>
      </div>

      <div className="studio-grid three">
        {supportTiles.map((tile) => (
          <div className="studio-card" key={tile.title}>
            <h4>{tile.title}</h4>
            <p className="muted">{tile.description}</p>
          </div>
        ))}
      </div>

      <div className="studio-grid two">
        <div className="studio-card">
          <h3>Quick actions</h3>
          <p className="muted">Do the next thing without hunting through menus.</p>
          <ul className="studio-list">
            {quickActions.map((action) => (
              <li key={action}>
                <span>{action}</span>
                <button className="studio-link">Start</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="studio-card">
          <h3>Project snapshot</h3>
          <p className="muted">
            A quick glance at what is ready, what needs your input, and what the AI is preparing.
          </p>
          <div className="studio-status">
            <div>
              <strong>Outline</strong>
              <span className="muted">Not started yet</span>
            </div>
            <div>
              <strong>First scene draft</strong>
              <span className="muted">Waiting on your approval</span>
            </div>
            <div>
              <strong>Audio plan</strong>
              <span className="muted">Ready to generate</span>
            </div>
          </div>
          <Link className="button secondary" href="/studio/intake">
            Open story intake
          </Link>
        </div>
      </div>
    </section>
  );
}
