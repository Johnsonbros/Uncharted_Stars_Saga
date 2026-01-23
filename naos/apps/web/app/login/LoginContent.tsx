"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type LoginState = "idle" | "submitting" | "sent" | "error";

const errorMessages: Record<string, string> = {
  missing_token: "Login link is invalid.",
  invalid_or_expired: "This login link has expired. Please request a new one.",
  verification_failed: "Unable to verify your login. Please try again."
};

export default function LoginContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [state, setState] = useState<LoginState>("idle");
  const [error, setError] = useState<string | null>(
    errorCode ? errorMessages[errorCode] || "An error occurred." : null
  );
  const [devLink, setDevLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("submitting");
    setError(null);
    setDevLink(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send login link");
      }

      setState("sent");

      // Show dev link in development
      if (data.devLink) {
        setDevLink(data.devLink);
      }
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Failed to send login link");
    }
  };

  return (
    <>
      <div className="hero-content">
        <span className="tag">Sign in</span>
        <h1>Access your listening library.</h1>
        <p>
          Enter your email to receive a secure login link. No password needed.
        </p>
      </div>

      <div className="hero-card">
        {state === "sent" ? (
          <div style={{ textAlign: "center" }}>
            <h3>Check your email</h3>
            <p className="muted" style={{ marginTop: "12px" }}>
              We sent a login link to <strong>{email}</strong>. Click the link to sign in.
            </p>
            <p className="muted" style={{ marginTop: "16px", fontSize: "0.9rem" }}>
              The link expires in 15 minutes. If you don't see the email, check your spam folder.
            </p>

            {devLink && (
              <div
                className="card highlight-card"
                style={{ marginTop: "24px", textAlign: "left" }}
              >
                <strong>Development Mode</strong>
                <p className="muted" style={{ marginTop: "8px", fontSize: "0.85rem" }}>
                  Click to sign in (email not sent in dev):
                </p>
                <a
                  href={devLink}
                  className="button"
                  style={{ marginTop: "12px", display: "inline-block" }}
                >
                  Sign in now
                </a>
              </div>
            )}

            <button
              onClick={() => {
                setState("idle");
                setEmail("");
              }}
              className="button secondary"
              style={{ marginTop: "24px" }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <h3>Sign in with email</h3>
            <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
              <div style={{ display: "grid", gap: "16px" }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={state === "submitting"}
                  style={{
                    padding: "12px 16px",
                    fontSize: "1rem",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    background: "var(--surface)",
                    color: "var(--text)"
                  }}
                />

                {error && (
                  <p style={{ color: "#ef4444", margin: 0, fontSize: "0.9rem" }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="button"
                  disabled={state === "submitting" || !email}
                >
                  {state === "submitting" ? "Sending..." : "Send login link"}
                </button>
              </div>
            </form>

            <div style={{ marginTop: "24px", textAlign: "center" }}>
              <p className="muted" style={{ fontSize: "0.9rem" }}>
                Don't have access yet?{" "}
                <Link href="/founders" style={{ color: "var(--accent)" }}>
                  Become a Founder
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
