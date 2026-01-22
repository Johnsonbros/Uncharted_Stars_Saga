import FoundersCheckoutForm from "./FoundersCheckoutForm";

const perks = [
  "Lifetime access to every published chapter",
  "Exclusive founder updates and production notes",
  "Early access to new arcs and audio drops",
  "Direct line to the creator via release briefings"
];

export default function FoundersPage() {
  return (
    <main>
      <nav className="nav">
        <div className="brand">
          <span className="tag">Founders checkout</span>
          <strong>Uncharted Stars Saga</strong>
        </div>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/signup">Email onboarding</a>
        </div>
        <a className="button secondary" href="/">
          Back to overview
        </a>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <span className="tag">Lifetime membership</span>
          <h1>Become a Founder and unlock the full saga.</h1>
          <p>
            Founders receive permanent access to every chapter, audio drop, and
            behind-the-scenes update. One payment funds the long-form universe.
          </p>
          <div className="hero-actions">
            <span className="tag">$49 one-time</span>
            <span className="tag">All chapters included</span>
          </div>
        </div>
        <div className="hero-card">
          <h3>Founders include</h3>
          <ul className="hero-list">
            {perks.map(perk => (
              <li key={perk}>{perk}</li>
            ))}
          </ul>
          <div className="card highlight-card">
            <strong>Launch pack</strong>
            <p className="muted">
              Immediate access to Act I plus lifetime access to every new
              chapter drop.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="section-header">
          <h2 className="section-title">Reserve your Founder seat</h2>
          <p className="section-copy">
            Enter your email to start checkout. We will also use this address
            for release notes and onboarding updates.
          </p>
        </div>
        <div className="card">
          <FoundersCheckoutForm />
        </div>
      </section>

      <section className="footer">
        <strong>Questions?</strong>
        <span>hello@unchartedstars.ai</span>
      </section>
    </main>
  );
}
