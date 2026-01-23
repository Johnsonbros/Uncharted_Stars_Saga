import Link from "next/link";
import { getCurrentSession } from "@/lib/auth";

const featureCards = [
  {
    title: "Listener-first player",
    description:
      "Seamless playback with progress tracking, chapter resume, and a distraction-free soundscape.",
    icon: "headphones"
  },
  {
    title: "Founders access",
    description:
      "One-time membership unlocks every episode, bonus releases, and behind-the-scenes notes.",
    icon: "key"
  },
  {
    title: "Story intelligence",
    description:
      "Canon-aware recaps and context keep the universe consistent across years of releases.",
    icon: "brain"
  }
];

const experienceSteps = [
  {
    title: "Discover",
    description: "Start with the hybrid audio trailer that drops you straight into the universe."
  },
  {
    title: "Join",
    description: "Unlock the full library with a single Founders purchase. No subscriptions."
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

const faqItems = [
  {
    question: "What is Founders membership?",
    answer:
      "A one-time $49 payment that grants lifetime access to every chapter in the Uncharted Stars Saga universe - past, present, and future."
  },
  {
    question: "How is audio delivered?",
    answer:
      "Stream directly from our player with automatic progress sync, or download chapters for offline listening."
  },
  {
    question: "Can I read instead of listen?",
    answer:
      "Yes. Every chapter includes a clean reading mode alongside the audio. Switch between formats anytime."
  },
  {
    question: "How often are new chapters released?",
    answer:
      "New content drops seasonally, with founder-exclusive updates between major releases."
  }
];

async function NavLinks() {
  const session = await getCurrentSession();

  return (
    <>
      <div className="nav-links">
        <a href="#experience">Experience</a>
        <a href="#features">Features</a>
        <a href="#trailer">Audio trailer</a>
        <a href="#membership">Membership</a>
      </div>
      {session?.isAuthenticated ? (
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link href="/library" className="button secondary">
            My Library
          </Link>
          <Link href="/account" className="button secondary" style={{ padding: "10px 16px" }}>
            Account
          </Link>
        </div>
      ) : (
        <Link href="/login" className="button secondary">
          Sign in
        </Link>
      )}
    </>
  );
}

export default async function HomePage() {
  return (
    <main>
      <nav className="nav">
        <div className="brand">
          <span className="tag">NAOS Listener Platform</span>
          <strong>Uncharted Stars Saga</strong>
        </div>
        <NavLinks />
      </nav>

      <section className="hero">
        <div className="hero-content">
          <span className="tag">Audiobook-first universe</span>
          <h1>A premium listening universe built for immersion.</h1>
          <p>
            NAOS delivers cinematic audio storytelling with clean reading mode and a
            community that stays with the story for the long haul. No subscriptions.
            No interruptions. Just story.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/founders">
              Become a Founder
            </Link>
            <a className="button secondary" href="#trailer">
              Play the trailer
            </a>
          </div>
          <div className="hero-stats">
            {highlightStats.map((stat) => (
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
              automatic progress sync across all your devices.
            </p>
          </div>
          <ul className="hero-list">
            <li>Immediate access to every published chapter.</li>
            <li>Progress sync across sessions and devices.</li>
            <li>Clean player built for long-form listening.</li>
            <li>Behind-the-scenes production notes.</li>
          </ul>
          <div className="card highlight-card">
            <strong>Now playing</strong>
            <p className="muted">"Act I: Discovery" · 46 min · Resume from 18:42</p>
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
          {featureCards.map((card) => (
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
              transition straight into the narrative. Out-of-world intro meets
              in-world excerpt.
            </p>
          </div>
          <div
            style={{
              padding: "48px 24px",
              background: "rgba(124, 92, 255, 0.08)",
              borderRadius: "12px",
              textAlign: "center"
            }}
          >
            <p className="muted" style={{ margin: 0 }}>
              Audio trailer coming soon. Join the Founders list to be notified.
            </p>
          </div>
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
              universe, now and in the future. No recurring fees.
            </p>
          </div>
          <div className="card">
            <h4>Member-only perks</h4>
            <p>
              Get early drops, annotated scene notes, and direct updates from the
              creator between major releases.
            </p>
          </div>
          <div className="card">
            <h4>Support the canon</h4>
            <p>
              Your membership funds new chapters, premium narration, and the
              long-form vision of the universe.
            </p>
          </div>
        </div>
        <div className="cta">
          <div>
            <h3>Ready for the first drop?</h3>
            <p className="muted">
              Join the Founders list to unlock the full library and all future
              releases.
            </p>
          </div>
          <Link className="button" href="/founders">
            Start Founders checkout
          </Link>
        </div>
      </section>

      <section id="faq">
        <div className="section-header">
          <h2 className="section-title">Frequently asked questions</h2>
          <p className="section-copy">
            Everything you need to know about the Uncharted Stars Saga experience.
          </p>
        </div>
        <div style={{ display: "grid", gap: "16px" }}>
          {faqItems.map((item) => (
            <div
              className="card"
              key={item.question}
              style={{ gridTemplateColumns: "1fr" }}
            >
              <h4 style={{ marginBottom: "8px" }}>{item.question}</h4>
              <p style={{ margin: 0 }}>{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="footer">
        <strong>NAOS Listener Platform</strong>
        <span>Built for audio-first storytelling.</span>
        <div style={{ display: "flex", gap: "24px", marginTop: "8px" }}>
          <Link href="/login">Sign in</Link>
          <Link href="/founders">Become a Founder</Link>
          <span>hello@unchartedstars.ai</span>
        </div>
      </section>
    </main>
  );
}
