"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type EntitlementSummary = {
  id: string;
  status?: string;
  tier?: string | null;
};

type AccessState = "idle" | "loading" | "ready" | "error";

export default function LibraryPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [state, setState] = useState<AccessState>("idle");
  const [entitlements, setEntitlements] = useState<EntitlementSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      return;
    }

    let isActive = true;
    setState("loading");
    setError(null);

    fetch(`/api/entitlements?email=${encodeURIComponent(email)}`)
      .then(async response => {
        if (!response.ok) {
          throw new Error("Unable to load entitlements.");
        }
        return (await response.json()) as { entitlements: EntitlementSummary[] };
      })
      .then(data => {
        if (!isActive) {
          return;
        }
        setEntitlements(data.entitlements ?? []);
        setState("ready");
      })
      .catch(fetchError => {
        if (!isActive) {
          return;
        }
        setState("error");
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load entitlements."
        );
      });

    return () => {
      isActive = false;
    };
  }, [email]);

  const accessUnlocked = entitlements.length > 0;

  return (
    <main>
      <nav className="nav">
        <div className="brand">
          <span className="tag">Listener library</span>
          <strong>Uncharted Stars Saga</strong>
        </div>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/founders">Founders checkout</a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <span className="tag">Library access</span>
          <h1>Your listening library is ready.</h1>
          <p>
            We verify your Founders access before unlocking chapters, audio
            drops, and future releases.
          </p>
        </div>
        <div className="hero-card">
          <h3>Access status</h3>
          <div
            className="card"
            data-testid="library-access-status"
            aria-live="polite"
          >
            {email ? (
              <>
                {state === "loading" && <span>Checking access...</span>}
                {state === "error" && (
                  <span className="muted">{error}</span>
                )}
                {state === "ready" && accessUnlocked && (
                  <strong>Library access unlocked.</strong>
                )}
                {state === "ready" && !accessUnlocked && (
                  <span>Library locked. Complete payment to continue.</span>
                )}
              </>
            ) : (
              <span>Enter checkout to verify access.</span>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="section-header">
          <h2 className="section-title">Next steps</h2>
          <p className="section-copy">
            Founders can immediately continue into Act I and keep listening as
            new chapters publish.
          </p>
        </div>
        <div className="card">
          <ul className="hero-list">
            <li>Resume from your last saved chapter.</li>
            <li>Keep up with new audio drops as they launch.</li>
            <li>Access bonus founder briefings.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
