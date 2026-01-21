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

export default function HomePage() {
  return (
    <main>
      <nav className="nav">
        <div>
          <div className="tag">NAOS Listener Platform</div>
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
        <div>
          <div className="tag">Audiobook-first universe</div>
          <h1>Uncharted Stars Saga is a premium listening universe.</h1>
          <p>
            NAOS delivers a cinematic audio experience, clean reading mode, and a
            community that stays with the story for the long haul.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a className="button" href="#membership">
              Become a Founder
            </a>
            <a className="button secondary" href="#trailer">
              Play the trailer
            </a>
          </div>
        </div>
        <div className="hero-card">
          <h3>What you get</h3>
          <ul style={{ margin: 0, paddingLeft: 20, color: "var(--muted)" }}>
            <li>Immediate access to every published chapter.</li>
            <li>Progress sync across sessions and devices.</li>
            <li>Clean player built for long-form listening.</li>
          </ul>
          <div className="card">
            <strong>Now playing</strong>
            <p style={{ marginTop: 8 }}>
              “Act I: Discovery” · 46 min · Resume from 18:42
            </p>
          </div>
        </div>
      </section>

      <section id="experience">
        <h2 className="section-title">The listener journey</h2>
        <div className="grid">
          {experienceSteps.map(step => (
            <div className="card" key={step.title}>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features">
        <h2 className="section-title">Built for deep listening</h2>
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
        <h2 className="section-title">Hybrid audio trailer</h2>
        <div className="trailer">
          <div>
            <strong>Before you hear the story...</strong>
            <p style={{ color: "var(--muted)", marginTop: 8 }}>
              A two-minute immersion designed to introduce the universe and
              transition straight into the narrative.
            </p>
          </div>
          <audio controls preload="none">
            Your browser does not support audio playback.
          </audio>
          <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            Trailer audio will appear here once the first episode is published.
          </span>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span className="tag">Out-of-world intro</span>
            <span className="tag">In-world excerpt</span>
            <span className="tag">Soft close</span>
          </div>
        </div>
      </section>

      <section id="membership">
        <h2 className="section-title">Founders lifetime membership</h2>
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
        <div style={{ marginTop: 24 }}>
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
