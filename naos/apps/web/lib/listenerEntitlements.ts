import { and, eq, gt, isNull, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { entitlements, listeners, stripeEvents } from "@/drizzle/schema";

export type EntitlementGrantInput = {
  listenerId?: string;
  email?: string;
  productId: string;
  accessStart?: Date;
  accessEnd?: Date | null;
  stripePaymentIntentId?: string | null;
  stripeEventId?: string | null;
};

export async function getOrCreateListenerByEmail(email: string) {
  const [existing] = await db.select().from(listeners).where(eq(listeners.email, email));
  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(listeners)
    .values({ email, status: "pending" })
    .returning();

  return created;
}

export async function markListenerActive(listenerId: string) {
  await db
    .update(listeners)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(listeners.id, listenerId));
}

export async function grantEntitlement(input: EntitlementGrantInput) {
  let listenerId = input.listenerId;

  if (!listenerId && input.email) {
    const listener = await getOrCreateListenerByEmail(input.email);
    listenerId = listener.id;
  }

  if (!listenerId) {
    throw new Error("Listener identity is required to grant entitlement.");
  }

  const [entitlement] = await db
    .insert(entitlements)
    .values({
      listenerId,
      productId: input.productId,
      accessStart: input.accessStart ?? new Date(),
      accessEnd: input.accessEnd ?? null,
      status: "active",
      stripePaymentIntentId: input.stripePaymentIntentId ?? null,
      stripeEventId: input.stripeEventId ?? null,
      updatedAt: new Date()
    })
    .returning();

  await markListenerActive(listenerId);

  return entitlement;
}

export async function listActiveEntitlementsByListenerId(listenerId: string) {
  const now = new Date();
  return db
    .select()
    .from(entitlements)
    .where(
      and(
        eq(entitlements.listenerId, listenerId),
        eq(entitlements.status, "active"),
        or(isNull(entitlements.accessEnd), gt(entitlements.accessEnd, now))
      )
    );
}

export async function listActiveEntitlementsByEmail(email: string) {
  const listener = await getOrCreateListenerByEmail(email);
  return listActiveEntitlementsByListenerId(listener.id);
}

export async function revokeEntitlementsByPaymentIntent(paymentIntentId: string) {
  await db
    .update(entitlements)
    .set({
      status: "revoked",
      accessEnd: new Date(),
      updatedAt: new Date()
    })
    .where(eq(entitlements.stripePaymentIntentId, paymentIntentId));
}

export async function recordStripeEventIfNew(eventId: string, type: string) {
  const [inserted] = await db
    .insert(stripeEvents)
    .values({ id: eventId, type })
    .onConflictDoNothing()
    .returning({ id: stripeEvents.id });

  return Boolean(inserted);
}
