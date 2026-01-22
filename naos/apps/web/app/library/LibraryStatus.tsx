"use client";

import { useEffect, useMemo, useState } from "react";

type EntitlementStatus = "idle" | "loading" | "unlocked" | "locked" | "error";

type LibraryStatusProps = {
  email: string;
};

type EntitlementsResponse = {
  entitlements?: Array<{ productId?: string }>;
};

export default function LibraryStatus({ email }: LibraryStatusProps) {
  const [status, setStatus] = useState<EntitlementStatus>("idle");

  const encodedEmail = useMemo(() => encodeURIComponent(email), [email]);

  useEffect(() => {
    if (!email) {
      setStatus("locked");
      return;
    }

    let isMounted = true;
    setStatus("loading");

    fetch(`/api/entitlements?email=${encodedEmail}`)
      .then(async response => {
        if (!response.ok) {
          throw new Error("Entitlements request failed.");
        }
        const data = (await response.json()) as EntitlementsResponse;
        return data.entitlements ?? [];
      })
      .then(entitlements => {
        if (!isMounted) return;
        setStatus(entitlements.length > 0 ? "unlocked" : "locked");
      })
      .catch(() => {
        if (!isMounted) return;
        setStatus("error");
      });

    return () => {
      isMounted = false;
    };
  }, [email, encodedEmail]);

  if (status === "loading") {
    return <p className="muted">Checking your Founders access...</p>;
  }

  if (status === "error") {
    return (
      <p className="muted">
        We could not verify your access yet. Please refresh or contact support.
      </p>
    );
  }

  if (status === "unlocked") {
    return <p className="tag">Library unlocked</p>;
  }

  return (
    <p className="muted">
      Access not found yet. Complete checkout to unlock the full library.
    </p>
  );
}
