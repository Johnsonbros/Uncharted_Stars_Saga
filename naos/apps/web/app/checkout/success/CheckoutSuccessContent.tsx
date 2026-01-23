"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type VerifyState = "loading" | "success" | "error";

interface VerifyResult {
  email: string;
  productId: string;
}

export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [state, setState] = useState<VerifyState>("loading");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setState("error");
      setError("No checkout session found.");
      return;
    }

    const verifyCheckout = async () => {
      try {
        const response = await fetch(`/api/checkout/verify?session_id=${sessionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Verification failed");
        }

        setResult({
          email: data.email,
          productId: data.productId
        });
        setState("success");
      } catch (err) {
        setState("error");
        setError(err instanceof Error ? err.message : "Verification failed");
      }
    };

    verifyCheckout();
  }, [sessionId]);

  return (
    <>
      <div className="hero-content">
        {state === "loading" && (
          <>
            <span className="tag">Verifying...</span>
            <h1>Confirming your purchase</h1>
            <p>Please wait while we verify your payment and set up your account.</p>
          </>
        )}

        {state === "success" && result && (
          <>
            <span className="tag">Welcome, Founder</span>
            <h1>You're in. Welcome to the universe.</h1>
            <p>
              Your Founders membership is now active. You have lifetime access to
              every chapter in the Uncharted Stars Saga - past, present, and future.
            </p>
            <p className="muted" style={{ fontSize: "0.95rem" }}>
              Confirmation sent to <strong>{result.email}</strong>
            </p>
            <div className="hero-actions" style={{ marginTop: "24px" }}>
              <Link href="/library" className="button">
                Enter your library
              </Link>
              <Link href="/login" className="button secondary">
                Sign in to continue
              </Link>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <span className="tag" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#fca5a5" }}>
              Verification issue
            </span>
            <h1>Unable to verify checkout</h1>
            <p>
              {error || "We couldn't verify your payment. Please contact support if you were charged."}
            </p>
            <div className="hero-actions" style={{ marginTop: "24px" }}>
              <Link href="/founders" className="button">
                Try again
              </Link>
              <a href="mailto:hello@unchartedstars.ai" className="button secondary">
                Contact support
              </a>
            </div>
          </>
        )}
      </div>

      {state === "success" && (
        <div className="hero-card">
          <h3>What's next</h3>
          <ul className="hero-list">
            <li>Sign in with your email to access your library</li>
            <li>Start listening to Act I: Discovery</li>
            <li>Get notified when new chapters drop</li>
            <li>Access exclusive founder briefings</li>
          </ul>
          <div className="card highlight-card">
            <strong>Your membership</strong>
            <p className="muted">Founders Lifetime · All chapters included</p>
          </div>
        </div>
      )}
    </>
  );
}
