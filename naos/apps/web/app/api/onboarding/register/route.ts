import { NextResponse } from "next/server";
import { z } from "zod";

import { getOrCreateListenerByEmail } from "@/lib/listenerEntitlements";

const RegisterSchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(payload ?? {});

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const listener = await getOrCreateListenerByEmail(parsed.data.email);

  return NextResponse.json({
    listenerId: listener.id,
    status: listener.status
  });
}
