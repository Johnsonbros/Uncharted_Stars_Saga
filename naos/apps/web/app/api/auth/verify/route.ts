import { NextRequest, NextResponse } from "next/server";

import { verifyMagicLink } from "@/lib/auth";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      `${env.APP_URL}/login?error=missing_token`
    );
  }

  try {
    const session = await verifyMagicLink(token);

    if (!session) {
      return NextResponse.redirect(
        `${env.APP_URL}/login?error=invalid_or_expired`
      );
    }

    // Redirect to library on successful login
    return NextResponse.redirect(`${env.APP_URL}/library`);
  } catch (error) {
    console.error("[Auth] Verify error:", error);
    return NextResponse.redirect(
      `${env.APP_URL}/login?error=verification_failed`
    );
  }
}
