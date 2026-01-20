import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { proposals } from "@/drizzle/schema";
import { readScene } from "@/lib/fsRepo";
import { eq } from "drizzle-orm";

const CreateProposalSchema = z.object({
  projectId: z.string().min(1),
  scenePath: z.string().min(1),
  proposedContent: z.string().min(1),
  rationale: z.string().optional()
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") ?? "uncharted-stars";

  const rows = await db
    .select()
    .from(proposals)
    .where(eq(proposals.projectId, projectId))
    .orderBy(proposals.createdAt);

  return NextResponse.json({ ok: true, proposals: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CreateProposalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { projectId, scenePath, proposedContent, rationale } = parsed.data;

  const base = await readScene(projectId, scenePath);

  const inserted = await db
    .insert(proposals)
    .values({
      projectId,
      sceneId: scenePath,
      scenePath: base.absPath,
      baseSha256: base.sha256,
      proposedContent,
      rationale: rationale ?? ""
    })
    .returning();

  return NextResponse.json({ ok: true, proposal: inserted[0] });
}
