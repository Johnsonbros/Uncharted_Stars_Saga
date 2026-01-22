import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/lib/env";
import { grantEntitlement } from "@/lib/listenerEntitlements";

const GrantSchema = z.object({
  listenerId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  productId: z.string().min(1),
  accessStart: z.string().datetime().optional(),
  accessEnd: z.string().datetime().nullable().optional(),
  stripePaymentIntentId: z.string().nullable().optional(),
  stripeEventId: z.string().nullable().optional()
});

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (token !== env.ENTITLEMENTS_INTERNAL_TOKEN) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = GrantSchema.safeParse(payload ?? {});

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid entitlement grant payload." },
      { status: 400 }
    );
  }

  const entitlement = await grantEntitlement({
    listenerId: parsed.data.listenerId,
    email: parsed.data.email,
    productId: parsed.data.productId,
    accessStart: parsed.data.accessStart ? new Date(parsed.data.accessStart) : undefined,
    accessEnd: parsed.data.accessEnd ? new Date(parsed.data.accessEnd) : null,
    stripePaymentIntentId: parsed.data.stripePaymentIntentId,
    stripeEventId: parsed.data.stripeEventId
  });

  return NextResponse.json({ entitlement });
}
