import { NextResponse } from "next/server";
import { z } from "zod";

import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { getOrCreateListenerByEmail } from "@/lib/listenerEntitlements";

const CheckoutSchema = z.object({
  email: z.string().email().optional(),
  productId: z.string().min(1).optional()
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = CheckoutSchema.safeParse(payload ?? {});

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid checkout payload." },
      { status: 400 }
    );
  }

  const email = parsed.data.email;
  const productId = parsed.data.productId ?? "founders_lifetime";
  const listener = email ? await getOrCreateListenerByEmail(email) : null;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
    customer_email: email ?? undefined,
    success_url: `${env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: env.STRIPE_CANCEL_URL,
    metadata: {
      product_id: productId,
      listener_id: listener?.id ?? ""
    }
  });

  return NextResponse.json({ url: session.url });
}
