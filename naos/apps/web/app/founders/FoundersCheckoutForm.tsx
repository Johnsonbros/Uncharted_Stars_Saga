"use client";

import { useState } from "react";

type CheckoutState = "idle" | "loading" | "error";

export default function FoundersCheckoutForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<CheckoutState>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("loading");
    setError(null);

    try {
      const response = await fetch("/api/checkout/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error("Checkout could not be started.");
      }

      const data = (await response.json()) as { url?: string };
      if (!data.url) {
        throw new Error("Checkout session URL missing.");
      }

      window.location.href = data.url;
    } catch (checkoutError) {
      setState("error");
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Checkout could not be started."
      );
      return;
    }
  };

  return (
    <form className="studio-form" onSubmit={handleSubmit}>
      <label>
        Email address
        <input
          type="email"
          name="email"
          required
          placeholder="you@signal.io"
          value={email}
          onChange={event => setEmail(event.target.value)}
        />
      </label>
      <button className="button" type="submit" disabled={state === "loading"}>
        {state === "loading" ? "Starting checkout..." : "Continue to payment"}
      </button>
      {state === "error" && <span className="muted">{error}</span>}
    </form>
  );
}
