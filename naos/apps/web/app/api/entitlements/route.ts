import { NextResponse } from "next/server";

import {
  listActiveEntitlementsByEmail,
  listActiveEntitlementsByListenerId
} from "@/lib/listenerEntitlements";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listenerId = searchParams.get("listenerId");
  const email = searchParams.get("email");

  if (!listenerId && !email) {
    return NextResponse.json(
      { error: "Provide listenerId or email." },
      { status: 400 }
    );
  }

  const entitlements = listenerId
    ? await listActiveEntitlementsByListenerId(listenerId)
    : await listActiveEntitlementsByEmail(email as string);

  return NextResponse.json({ entitlements });
}
