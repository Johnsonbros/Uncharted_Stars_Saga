import { Suspense } from "react";
import Link from "next/link";
import LoginContent from "./LoginContent";

function LoadingState() {
  return (
    <>
      <div className="hero-content">
        <span className="tag">Sign in</span>
        <h1>Access your listening library.</h1>
        <p>Loading...</p>
      </div>
      <div className="hero-card">
        <h3>Sign in with email</h3>
        <div style={{ marginTop: "16px" }}>
          <div style={{ display: "grid", gap: "16px" }}>
            <input
              type="email"
              placeholder="your@email.com"
              disabled
              style={{
                padding: "12px 16px",
                fontSize: "1rem",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                background: "var(--surface)",
                color: "var(--text)"
              }}
            />
            <button className="button" disabled>
              Send login link
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <main>
      <nav className="nav">
        <div className="brand">
          <span className="tag">Listener login</span>
          <Link href="/">
            <strong>Uncharted Stars Saga</strong>
          </Link>
        </div>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/founders">Become a Founder</Link>
        </div>
      </nav>

      <section className="hero">
        <Suspense fallback={<LoadingState />}>
          <LoginContent />
        </Suspense>
      </section>

      <section className="footer">
        <strong>NAOS Listener Platform</strong>
        <span>Built for audio-first storytelling.</span>
        <span>Need help? hello@unchartedstars.ai</span>
      </section>
    </main>
  );
}
