import { NextResponse } from "next/server";
import { readScene } from "@/lib/fsRepo";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ sceneId: string }> }
) {
  const { sceneId } = await ctx.params;
  const { searchParams } = new URL(req.url);

  const projectId = searchParams.get("projectId") ?? "uncharted-stars";

  try {
    const scene = await readScene(projectId, decodeURIComponent(sceneId));
    return NextResponse.json({
      ok: true,
      projectId: scene.projectId,
      sceneId: scene.sceneId,
      relPath: scene.relPath,
      sha256: scene.sha256,
      content: scene.content
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to read scene";
    return NextResponse.json({ ok: false, error: message }, { status: 404 });
  }
}
