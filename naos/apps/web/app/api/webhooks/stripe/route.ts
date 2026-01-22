import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import {
  grantEntitlement,
  recordStripeEventIfNew,
  revokeEntitlementsByPaymentIntent
} from "@/lib/listenerEntitlements";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  const isNew = await recordStripeEventIfNew(event.id, event.type);
  if (!isNew) {
    return NextResponse.json({ received: true, idempotent: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_email ?? session.customer_details?.email ?? undefined;
      const productId = session.metadata?.product_id ?? "founders_lifetime";
      const paymentIntent =
        typeof session.payment_intent === "string" ? session.payment_intent : null;

      if (email) {
        await grantEntitlement({
          email,
          productId,
          stripePaymentIntentId: paymentIntent,
          stripeEventId: event.id
        });
      }
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntent =
        typeof charge.payment_intent === "string" ? charge.payment_intent : null;
      if (paymentIntent) {
        await revokeEntitlementsByPaymentIntent(paymentIntent);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
