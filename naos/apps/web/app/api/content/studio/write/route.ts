/**
 * Studio Write API
 *
 * POST /api/content/studio/write - Write a beat in a scene
 */

import { NextRequest, NextResponse } from "next/server";
import { studioService } from "@/lib/content-development";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { sceneId, beatNumber, userGuidance } = body;

    if (!sceneId || beatNumber === undefined) {
      return NextResponse.json(
        { error: "sceneId and beatNumber are required" },
        { status: 400 }
      );
    }

    const result = studioService.writeBeat({
      sceneId,
      beatNumber,
      userGuidance
    });

    return NextResponse.json({
      prose: result.prose,
      consistencyCheck: result.consistencyCheck,
      profileDiscoveries: result.profileDiscoveries
    });
  } catch (error) {
    console.error("Error writing beat:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
