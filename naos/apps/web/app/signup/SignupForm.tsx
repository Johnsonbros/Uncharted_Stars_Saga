"use client";

import { useEffect, useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/onboarding/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error("Signup failed. Please try again.");
      }

      setState("success");
      setMessage("You are on the list. Next step: choose a membership tier.");
    } catch (signupError) {
      setState("error");
      setMessage(
        signupError instanceof Error
          ? signupError.message
          : "Signup failed. Please try again."
      );
    }
  };

  return (
    <form
      className="studio-form"
      data-hydrated={isHydrated ? "true" : "false"}
      onSubmit={handleSubmit}
    >
      <label>
        Email address
        <input
          type="email"
          required
          placeholder="you@signal.io"
          value={email}
          onChange={event => setEmail(event.target.value)}
        />
      </label>
      <button className="button" type="submit" disabled={state === "loading"}>
        {state === "loading" ? "Saving..." : "Join the Founders list"}
      </button>
      {message && <span className="muted">{message}</span>}
      {state === "success" && (
        <a className="button secondary" href="/founders">
          Continue to checkout
        </a>
      )}
    </form>
  );
}
