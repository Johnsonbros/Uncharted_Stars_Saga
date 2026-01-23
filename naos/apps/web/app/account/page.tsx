import Link from "next/link";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";

import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { listeners, entitlements } from "@/drizzle/schema";
import AccountSettings from "./AccountSettings";

function formatDate(date: Date | null): string {
  if (!date) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

async function getAccountData(listenerId: string) {
  const [listener] = await db
    .select()
    .from(listeners)
    .where(eq(listeners.id, listenerId));

  if (!listener) return null;

  const activeEntitlements = await db
    .select()
    .from(entitlements)
    .where(
      and(
        eq(entitlements.listenerId, listenerId),
        eq(entitlements.status, "active")
      )
    );

  const hasFoundersAccess = activeEntitlements.some(
    (e) => e.productId === "founders-lifetime" || e.productId.includes("founders")
  );

  return {
    email: listener.email,
    joinedDate: listener.createdAt,
    membershipType: hasFoundersAccess
      ? "Founders Lifetime"
      : activeEntitlements.length > 0
        ? "Standard"
        : "None",
    membershipStatus: activeEntitlements.length > 0 ? "Active" : "Inactive"
  };
}

export default async function AccountPage() {
  const session = await getCurrentSession();

  if (!session?.isAuthenticated) {
    redirect("/login?return=/account");
  }

  const accountData = await getAccountData(session.listenerId);

  if (!accountData) {
    redirect("/login?return=/account");
  }

  return (
    <div className="studio-shell">
      <nav className="nav">
        <div className="brand">
          <span className="tag">NAOS Listener Platform</span>
          <Link href="/">
            <strong>Uncharted Stars Saga</strong>
          </Link>
        </div>
        <div className="nav-links">
          <Link href="/library">Library</Link>
          <Link href="/account" style={{ color: "var(--accent)" }}>
            Account
          </Link>
          <Link href="/api/auth/logout">Sign out</Link>
        </div>
      </nav>

      <div className="studio-main">
        <div className="studio-section">
          <div className="section-header">
            <h1 className="section-title">Account settings</h1>
            <p className="section-copy">
              Manage your membership, preferences, and playback settings.
            </p>
          </div>

          {/* Membership Info */}
          <div className="studio-card highlight">
            <h3 style={{ margin: "0 0 16px" }}>Membership</h3>
            <div className="studio-status">
              <div>
                <span className="muted">Email</span>
                <span>{accountData.email}</span>
              </div>
              <div>
                <span className="muted">Membership type</span>
                <span>{accountData.membershipType}</span>
              </div>
              <div>
                <span className="muted">Status</span>
                <span className="studio-pill">{accountData.membershipStatus}</span>
              </div>
              <div>
                <span className="muted">Member since</span>
                <span>{formatDate(accountData.joinedDate)}</span>
              </div>
            </div>

            {accountData.membershipType === "None" && (
              <div style={{ marginTop: "20px" }}>
                <Link href="/founders" className="button">
                  Become a Founder
                </Link>
              </div>
            )}
          </div>

          {/* Client-side settings */}
          <AccountSettings />

          {/* Support */}
          <div className="studio-card soft">
            <h3 style={{ margin: "0 0 12px" }}>Need help?</h3>
            <p className="muted" style={{ margin: 0 }}>
              For billing questions, technical support, or feedback, email us at{" "}
              <a
                href="mailto:hello@unchartedstars.ai"
                style={{ color: "var(--accent)", textDecoration: "underline" }}
              >
                hello@unchartedstars.ai
              </a>
            </p>
          </div>
        </div>
      </div>

      <section className="footer">
        <strong>NAOS Listener Platform</strong>
        <span>Built for audio-first storytelling.</span>
        <span>Need help? hello@unchartedstars.ai</span>
      </section>
    </div>
  );
}
