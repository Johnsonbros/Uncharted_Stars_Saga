import { NextResponse } from "next/server";
import { buildNarrativeStateSnapshot } from "@/lib/narrative/service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") ?? "uncharted-stars";

  try {
    const snapshot = await buildNarrativeStateSnapshot(projectId);
    return NextResponse.json({ ok: true, snapshot });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load narrative state.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
