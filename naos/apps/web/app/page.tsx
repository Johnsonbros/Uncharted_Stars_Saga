const featureCards = [
  {
    title: "Listener-first player",
    description:
      "Seamless playback with progress tracking, chapter resume, and a distraction-free soundscape."
  },
  {
    title: "Founders access",
    description:
      "One-time membership unlocks every episode, bonus releases, and behind-the-scenes notes."
  },
  {
    title: "Story intelligence",
    description:
      "Canon-aware recaps and context keep the universe consistent across years of releases."
  }
];

const experienceSteps = [
  {
    title: "Discover",
    description: "Start on the landing page with the hybrid audio trailer."
  },
  {
    title: "Join",
    description: "Unlock the full library with a single Founders purchase."
  },
  {
    title: "Listen",
    description: "Jump into any chapter and pick up exactly where you left off."
  },
  {
    title: "Return",
    description: "Get notified when new chapters arrive and continue the saga."
  }
];

const highlightStats = [
  {
    label: "Membership",
    value: "$49 lifetime"
  },
  {
    label: "Formats",
    value: "Audio + read"
  },
  {
    label: "Story cadence",
    value: "Seasonal drops"
  }
];

export default function HomePage() {
  return (
    <main>
      <nav className="nav">
        <div className="brand">
          <span className="tag">NAOS Listener Platform</span>
          <strong>Uncharted Stars Saga</strong>
        </div>
        <div className="nav-links">
          <a href="#experience">Experience</a>
          <a href="#features">Features</a>
          <a href="#trailer">Audio trailer</a>
          <a href="#membership">Membership</a>
        </div>
        <a className="button" href="/studio/proposals">
          Creator studio
        </a>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <span className="tag">Audiobook-first universe</span>
          <h1>Uncharted Stars Saga is a premium listening universe.</h1>
          <p>
            NAOS delivers a cinematic audio experience, clean reading mode, and a
            community that stays with the story for the long haul.
          </p>
          <div className="hero-actions">
            <a className="button" href="#membership">
              Become a Founder
            </a>
            <a className="button secondary" href="#trailer">
              Play the trailer
            </a>
          </div>
          <div className="hero-stats">
            {highlightStats.map(stat => (
              <div className="stat-card" key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-card">
          <div>
            <h3>What you get</h3>
            <p className="muted">
              A guided listening experience with clear context, audio notes, and
              automatic progress sync.
            </p>
          </div>
          <ul className="hero-list">
            <li>Immediate access to every published chapter.</li>
            <li>Progress sync across sessions and devices.</li>
            <li>Clean player built for long-form listening.</li>
          </ul>
          <div className="card highlight-card">
            <strong>Now playing</strong>
            <p className="muted">“Act I: Discovery” · 46 min · Resume from 18:42</p>
            <div className="progress">
              <div className="progress-bar" style={{ width: "41%" }} />
            </div>
          </div>
        </div>
      </section>

      <section id="experience">
        <div className="section-header">
          <h2 className="section-title">The listener journey</h2>
          <p className="section-copy">
            A frictionless path from discovery to long-form immersion designed
            for audio-first worlds.
          </p>
        </div>
        <div className="grid">
          {experienceSteps.map((step, index) => (
            <div className="card" key={step.title}>
              <div className="step-index">{index + 1}</div>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features">
        <div className="section-header">
          <h2 className="section-title">Built for deep listening</h2>
          <p className="section-copy">
            Every surface is tuned for focus, continuity, and premium playback.
          </p>
        </div>
        <div className="grid">
          {featureCards.map(card => (
            <div className="card" key={card.title}>
              <h4>{card.title}</h4>
              <p>{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="trailer">
        <div className="section-header">
          <h2 className="section-title">Hybrid audio trailer</h2>
          <p className="section-copy">
            A short immersive prologue designed to introduce the universe and
            drop listeners straight into the narrative.
          </p>
        </div>
        <div className="trailer">
          <div>
            <strong>Before you hear the story...</strong>
            <p className="muted">
              A two-minute immersion designed to introduce the universe and
              transition straight into the narrative.
            </p>
          </div>
          <audio controls preload="none">
            Your browser does not support audio playback.
          </audio>
          <span className="muted" style={{ fontSize: "0.9rem" }}>
            Trailer audio will appear here once the first episode is published.
          </span>
          <div className="tag-list">
            <span className="tag">Out-of-world intro</span>
            <span className="tag">In-world excerpt</span>
            <span className="tag">Soft close</span>
          </div>
        </div>
      </section>

      <section id="membership">
        <div className="section-header">
          <h2 className="section-title">Founders lifetime membership</h2>
          <p className="section-copy">
            One price. Every chapter. Direct support for a long-running story
            universe.
          </p>
        </div>
        <div className="grid">
          <div className="card">
            <h4>One price, full access</h4>
            <p>
              Pay once and unlock every release in the Uncharted Stars Saga
              universe, now and in the future.
            </p>
          </div>
          <div className="card">
            <h4>Member-only perks</h4>
            <p>
              Get early drops, annotated scene notes, and direct updates from the
              creator.
            </p>
          </div>
          <div className="card">
            <h4>Support the canon</h4>
            <p>
              Your membership funds new chapters, premium narration, and the
              long-form vision.
            </p>
          </div>
        </div>
        <div className="cta">
          <div>
            <h3>Ready for the first drop?</h3>
            <p className="muted">
              Join the Founders list to unlock the full library and future
              releases.
            </p>
          </div>
          <a className="button" href="/founders">
            Start Founders checkout
          </a>
        </div>
      </section>

      <section className="footer">
        <strong>NAOS Listener Platform</strong>
        <span>Built for audio-first storytelling.</span>
        <span>Need help? hello@unchartedstars.ai</span>
      </section>
    </main>
  );
}
