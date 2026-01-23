import { NextRequest, NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { createSession } from "@/lib/auth";
import { getOrCreateListenerByEmail } from "@/lib/listenerEntitlements";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session_id parameter" },
      { status: 400 }
    );
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed", status: checkoutSession.payment_status },
        { status: 400 }
      );
    }

    const email =
      checkoutSession.customer_email ?? checkoutSession.customer_details?.email;

    if (!email) {
      return NextResponse.json(
        { error: "No email associated with this checkout" },
        { status: 400 }
      );
    }

    // Get or create listener and create session
    const listener = await getOrCreateListenerByEmail(email);

    try {
      await createSession(listener.id, email);
    } catch {
      // Session creation might fail in API context, that's okay
      // The client will handle it
    }

    return NextResponse.json({
      success: true,
      email,
      listenerId: listener.id,
      productId: checkoutSession.metadata?.product_id ?? "founders_lifetime"
    });
  } catch (error) {
    console.error("[Checkout] Verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify checkout session" },
      { status: 500 }
    );
  }
}
