import SignupForm from "./SignupForm";

const onboardingSteps = [
  "Confirm your email and reserve your Founder account.",
  "Complete checkout to unlock the full listening library.",
  "Receive launch notes and release drops in your inbox."
];

export default function SignupPage() {
  return (
    <main>
      <nav className="nav">
        <div className="brand">
          <span className="tag">Email onboarding</span>
          <strong>Uncharted Stars Saga</strong>
        </div>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/founders">Founders checkout</a>
        </div>
        <a className="button secondary" href="/">
          Back to overview
        </a>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <span className="tag">Stay in the loop</span>
          <h1>Start with a simple email handshake.</h1>
          <p>
            We keep onboarding lightweight. Add your email now, then move
            straight into the Founders checkout when you are ready.
          </p>
        </div>
        <div className="hero-card">
          <h3>Onboarding steps</h3>
          <ul className="hero-list">
            {onboardingSteps.map(step => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="section-header">
          <h2 className="section-title">Join the Founders list</h2>
          <p className="section-copy">
            We use this address to send the checkout link, launch updates, and
            release schedules.
          </p>
        </div>
        <div className="card">
          <SignupForm />
        </div>
      </section>

      <section className="footer">
        <strong>Need help?</strong>
        <span>hello@unchartedstars.ai</span>
      </section>
    </main>
  );
}
