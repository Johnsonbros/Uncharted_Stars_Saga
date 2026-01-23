import { NextRequest, NextResponse } from "next/server";

import { verifySignedUrl, readAudioFile, getAudioContentType } from "@/lib/audioStorage";
import { requireAuth, hasChapterAccess } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");
  const expires = request.nextUrl.searchParams.get("expires");
  const sig = request.nextUrl.searchParams.get("sig");

  // Validate parameters
  if (!path || !expires || !sig) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const expiresTimestamp = parseInt(expires, 10);
  if (isNaN(expiresTimestamp)) {
    return NextResponse.json(
      { error: "Invalid expiration timestamp" },
      { status: 400 }
    );
  }

  // Verify signature
  if (!verifySignedUrl(path, expiresTimestamp, sig)) {
    return NextResponse.json(
      { error: "Invalid or expired signature" },
      { status: 403 }
    );
  }

  // Check authentication and entitlements
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Extract chapter ID from path (audio/{chapterSlug}/master.mp3)
  const pathParts = path.split("/");
  const chapterId = pathParts[1] || "";

  const hasAccess = await hasChapterAccess(chapterId, session);
  if (!hasAccess) {
    return NextResponse.json(
      { error: "Access denied. Founders membership required." },
      { status: 403 }
    );
  }

  // Get audio stream
  const stream = await readAudioFile(path);
  if (!stream) {
    // In development without audio files, return a placeholder response
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        {
          error: "Audio file not found",
          message: "In development mode. Add audio files to public/audio/{slug}/master.mp3"
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Audio file not found" },
      { status: 404 }
    );
  }

  // Determine content type from path
  const format = path.split(".").pop() || "mp3";
  const contentType = getAudioContentType(format);

  // Return streaming response with appropriate headers
  return new NextResponse(stream, {
    headers: {
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
