import { NextResponse } from "next/server";

import {
  getPlaybackPosition,
  upsertPlaybackPosition
} from "@/lib/listenerPlaybackPositions";

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
  const { searchParams } = new URL(request.url);
  const listenerId = searchParams.get("listenerId");
  const assetId = resolveAssetId(searchParams);

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
  const body = (await request.json()) as Record<string, unknown>;
  const listenerId = typeof body.listenerId === "string" ? body.listenerId : undefined;
  const email = typeof body.email === "string" ? body.email : undefined;
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
      { error: "Provide listenerId or email." },
      { status: 400 }
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
