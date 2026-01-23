import { NextResponse } from "next/server";

import {
  getPlaybackPosition,
  upsertPlaybackPosition
} from "@/lib/listenerPlaybackPositions";
import { getCurrentSession } from "@/lib/auth";

function resolveAssetId(searchParams: URLSearchParams, body?: Record<string, unknown>) {
  if (body && typeof body.chapterId === "string") {
    return body.chapterId;
  }
  if (body && typeof body.assetId === "string") {
    return body.assetId;
  }
  return searchParams.get("chapterId") ?? searchParams.get("assetId");
}

export async function GET(request: Request) {
  const session = await getCurrentSession();
  const { searchParams } = new URL(request.url);
  const assetId = resolveAssetId(searchParams);

  // Use session listenerId if authenticated, otherwise fall back to query param
  const listenerId = session?.listenerId ?? searchParams.get("listenerId");

  if (!listenerId || !assetId) {
    return NextResponse.json(
      { error: "Provide listenerId and chapterId." },
      { status: 400 }
    );
  }

  const playbackPosition = await getPlaybackPosition(listenerId, assetId);

  return NextResponse.json({ playbackPosition });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  const body = (await request.json()) as Record<string, unknown>;

  // Prefer session-based authentication
  const listenerId = session?.listenerId ?? (typeof body.listenerId === "string" ? body.listenerId : undefined);
  const email = session?.email ?? (typeof body.email === "string" ? body.email : undefined);

  const assetId = resolveAssetId(new URL(request.url).searchParams, body);
  const rawPositionSeconds =
    typeof body.positionSeconds === "number" ? body.positionSeconds : undefined;

  if (!assetId || rawPositionSeconds === undefined) {
    return NextResponse.json(
      { error: "Provide chapterId and positionSeconds." },
      { status: 400 }
    );
  }

  if (!Number.isFinite(rawPositionSeconds) || rawPositionSeconds < 0) {
    return NextResponse.json(
      { error: "positionSeconds must be a non-negative number." },
      { status: 400 }
    );
  }

  if (!Number.isInteger(rawPositionSeconds)) {
    return NextResponse.json(
      { error: "positionSeconds must be an integer." },
      { status: 400 }
    );
  }

  if (!listenerId && !email) {
    return NextResponse.json(
      { error: "Authentication required to save playback position." },
      { status: 401 }
    );
  }

  const playbackPosition = await upsertPlaybackPosition({
    listenerId,
    email,
    assetId,
    positionSeconds: rawPositionSeconds
  });

  return NextResponse.json({ playbackPosition });
}
