/**
 * Authentication utilities for the Listener Platform
 *
 * Implements email-based magic link authentication with secure session management.
 * Sessions are stored in PostgreSQL with HTTP-only cookies for the session token.
 */

import { cookies } from "next/headers";
import { randomBytes, createHash } from "crypto";
import { eq, and, gt } from "drizzle-orm";

import { db } from "@/lib/db";
import { listeners, sessions, magicLinks, entitlements } from "@/drizzle/schema";

const SESSION_COOKIE_NAME = "naos_session";
const SESSION_DURATION_DAYS = 30;
const MAGIC_LINK_DURATION_MINUTES = 15;

export interface ListenerSession {
  listenerId: string;
  email: string;
  membershipType: "founders" | "standard" | null;
  isAuthenticated: boolean;
}

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Hash a token for secure storage
 */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Get the current listener session from cookies
 */
export async function getCurrentSession(): Promise<ListenerSession | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const hashedToken = hashToken(sessionToken);
  const now = new Date();

  // Find valid session
  const [session] = await db
    .select({
      listenerId: sessions.listenerId,
      email: listeners.email
    })
    .from(sessions)
    .innerJoin(listeners, eq(sessions.listenerId, listeners.id))
    .where(
      and(
        eq(sessions.token, hashedToken),
        gt(sessions.expiresAt, now)
      )
    );

  if (!session) {
    return null;
  }

  // Check for active entitlements to determine membership type
  const activeEntitlements = await db
    .select({ productId: entitlements.productId })
    .from(entitlements)
    .where(
      and(
        eq(entitlements.listenerId, session.listenerId),
        eq(entitlements.status, "active")
      )
    );

  const hasFoundersAccess = activeEntitlements.some(
    (e) => e.productId === "founders-lifetime" || e.productId.includes("founders")
  );

  return {
    listenerId: session.listenerId,
    email: session.email,
    membershipType: hasFoundersAccess ? "founders" : (activeEntitlements.length > 0 ? "standard" : null),
    isAuthenticated: true
  };
}

/**
 * Create a magic link for email authentication
 */
export async function createMagicLink(email: string): Promise<string> {
  const token = generateToken();
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + MAGIC_LINK_DURATION_MINUTES * 60 * 1000);

  await db.insert(magicLinks).values({
    email: email.toLowerCase().trim(),
    token: hashedToken,
    expiresAt
  });

  return token;
}

/**
 * Verify a magic link token and create a session
 */
export async function verifyMagicLink(token: string): Promise<ListenerSession | null> {
  const hashedToken = hashToken(token);
  const now = new Date();

  // Find and validate magic link
  const [link] = await db
    .select()
    .from(magicLinks)
    .where(
      and(
        eq(magicLinks.token, hashedToken),
        gt(magicLinks.expiresAt, now)
      )
    );

  if (!link || link.usedAt) {
    return null;
  }

  // Mark magic link as used
  await db
    .update(magicLinks)
    .set({ usedAt: now })
    .where(eq(magicLinks.id, link.id));

  // Get or create listener
  let [listener] = await db
    .select()
    .from(listeners)
    .where(eq(listeners.email, link.email));

  if (!listener) {
    [listener] = await db
      .insert(listeners)
      .values({
        email: link.email,
        status: "active"
      })
      .returning();
  } else if (listener.status !== "active") {
    await db
      .update(listeners)
      .set({ status: "active", updatedAt: now })
      .where(eq(listeners.id, listener.id));
  }

  // Create session
  const sessionToken = generateToken();
  const sessionHashedToken = hashToken(sessionToken);
  const sessionExpiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    listenerId: listener.id,
    token: sessionHashedToken,
    expiresAt: sessionExpiresAt
  });

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: sessionExpiresAt,
    path: "/"
  });

  // Get membership status
  const activeEntitlements = await db
    .select({ productId: entitlements.productId })
    .from(entitlements)
    .where(
      and(
        eq(entitlements.listenerId, listener.id),
        eq(entitlements.status, "active")
      )
    );

  const hasFoundersAccess = activeEntitlements.some(
    (e) => e.productId === "founders-lifetime" || e.productId.includes("founders")
  );

  return {
    listenerId: listener.id,
    email: listener.email,
    membershipType: hasFoundersAccess ? "founders" : (activeEntitlements.length > 0 ? "standard" : null),
    isAuthenticated: true
  };
}

/**
 * Create a session directly for a listener (used after Stripe checkout)
 */
export async function createSession(listenerId: string, email: string): Promise<void> {
  const sessionToken = generateToken();
  const sessionHashedToken = hashToken(sessionToken);
  const sessionExpiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    listenerId,
    token: sessionHashedToken,
    expiresAt: sessionExpiresAt
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: sessionExpiresAt,
    path: "/"
  });
}

/**
 * Destroy the current listener session (logout)
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    const hashedToken = hashToken(sessionToken);
    await db.delete(sessions).where(eq(sessions.token, hashedToken));
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Verify if the current user has access to a specific chapter
 */
export async function hasChapterAccess(
  chapterId: string,
  session: ListenerSession | null
): Promise<boolean> {
  if (!session || !session.isAuthenticated) {
    return false;
  }

  // Founders have access to all chapters
  if (session.membershipType === "founders") {
    return true;
  }

  // Check for specific chapter entitlements (future: per-chapter purchases)
  const activeEntitlements = await db
    .select()
    .from(entitlements)
    .where(
      and(
        eq(entitlements.listenerId, session.listenerId),
        eq(entitlements.status, "active")
      )
    );

  // For now, any active entitlement grants access
  return activeEntitlements.length > 0;
}

/**
 * Middleware helper to protect routes that require authentication
 */
export async function requireAuth(): Promise<ListenerSession | null> {
  const session = await getCurrentSession();
  return session?.isAuthenticated ? session : null;
}

/**
 * Verify listener identity by email (returns listener ID if exists)
 */
export async function verifyListenerEmail(email: string): Promise<string | null> {
  const [listener] = await db
    .select()
    .from(listeners)
    .where(eq(listeners.email, email.toLowerCase().trim()));

  return listener?.id ?? null;
}

/**
 * Clean up expired sessions and magic links (run periodically)
 */
export async function cleanupExpiredTokens(): Promise<void> {
  const now = new Date();

  await db.delete(sessions).where(gt(now, sessions.expiresAt));
  await db.delete(magicLinks).where(gt(now, magicLinks.expiresAt));
}
