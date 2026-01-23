import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createMagicLink } from "@/lib/auth";
import { env } from "@/lib/env";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address")
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = LoginSchema.parse(body);

    const token = await createMagicLink(email);
    const magicLinkUrl = `${env.APP_URL}/api/auth/verify?token=${token}`;

    // In production, send this via email
    // For development, we return it in the response (remove in production)
    console.log(`[Auth] Magic link for ${email}: ${magicLinkUrl}`);

    // TODO: Integrate with email service (e.g., Resend, SendGrid)
    // await sendMagicLinkEmail(email, magicLinkUrl);

    return NextResponse.json({
      success: true,
      message: "Check your email for a login link.",
      // Remove this in production - only for development
      ...(process.env.NODE_ENV !== "production" && { devLink: magicLinkUrl })
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    console.error("[Auth] Login error:", error);
    return NextResponse.json(
      { error: "Failed to send login link" },
      { status: 500 }
    );
  }
}
