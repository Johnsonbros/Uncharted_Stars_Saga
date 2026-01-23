import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        session: null
      });
    }

    return NextResponse.json({
      authenticated: true,
      session: {
        listenerId: session.listenerId,
        email: session.email,
        membershipType: session.membershipType
      }
    });
  } catch (error) {
    console.error("[Auth] Session check error:", error);
    return NextResponse.json(
      { error: "Failed to check session" },
      { status: 500 }
    );
  }
}
