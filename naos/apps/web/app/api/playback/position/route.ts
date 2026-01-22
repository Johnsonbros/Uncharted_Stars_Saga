import { NextResponse } from "next/server";

import {
  getPlaybackPosition,
  upsertPlaybackPosition
} from "@/lib/listenerPlaybackPositions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listenerId = searchParams.get("listenerId");
  const assetId = searchParams.get("assetId");

  if (!listenerId || !assetId) {
    return NextResponse.json(
      { error: "Provide listenerId and assetId." },
      { status: 400 }
    );
  }

  const position = await getPlaybackPosition(listenerId, assetId);
  return NextResponse.json({ position });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    listenerId?: string;
    assetId?: string;
    positionSeconds?: number;
  };

  if (!payload.listenerId || !payload.assetId) {
    return NextResponse.json(
      { error: "listenerId and assetId are required." },
      { status: 400 }
    );
  }

  if (typeof payload.positionSeconds !== "number" || payload.positionSeconds < 0) {
    return NextResponse.json(
      { error: "positionSeconds must be a non-negative number." },
      { status: 400 }
    );
  }

  const position = await upsertPlaybackPosition({
    listenerId: payload.listenerId,
    assetId: payload.assetId,
    positionSeconds: payload.positionSeconds
  });

  return NextResponse.json({ position });
}
