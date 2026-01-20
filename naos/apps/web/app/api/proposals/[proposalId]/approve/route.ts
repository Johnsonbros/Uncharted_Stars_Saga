import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { approvals, proposals } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { writeScene } from "@/lib/fsRepo";

const ApproveSchema = z.object({
  approver: z.string().optional(),
  note: z.string().optional()
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ proposalId: string }> }
) {
  const { proposalId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const parsed = ApproveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const row = await db
    .select()
    .from(proposals)
    .where(eq(proposals.id, proposalId));

  const proposal = row[0];
  if (!proposal) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  if (proposal.isApplied) {
    return NextResponse.json(
      { ok: false, error: "Already applied" },
      { status: 409 }
    );
  }

  await db.insert(approvals).values({
    proposalId: proposal.id,
    approver: parsed.data.approver ?? "creator",
    note: parsed.data.note ?? ""
  });

  await db
    .update(proposals)
    .set({ isApproved: true, approvedAt: new Date() })
    .where(eq(proposals.id, proposal.id));

  const newSha = await writeScene(proposal.scenePath, proposal.proposedContent);

  await db
    .update(proposals)
    .set({ isApplied: true, appliedAt: new Date() })
    .where(eq(proposals.id, proposal.id));

  return NextResponse.json({ ok: true, applied: true, newSha256: newSha });
}
