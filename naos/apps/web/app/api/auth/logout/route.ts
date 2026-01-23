import { NextResponse } from "next/server";

import { destroySession } from "@/lib/auth";
import { env } from "@/lib/env";

export async function POST() {
  try {
    await destroySession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Auth] Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await destroySession();

    return NextResponse.redirect(`${env.APP_URL}/`);
  } catch (error) {
    console.error("[Auth] Logout error:", error);
    return NextResponse.redirect(`${env.APP_URL}/`);
  }
}
