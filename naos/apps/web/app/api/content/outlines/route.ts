/**
 * Outlines API
 *
 * POST /api/content/outlines - Create a new outline
 * GET /api/content/outlines - List outlines for a project
 */

import { NextRequest, NextResponse } from "next/server";
import { outlineService } from "@/lib/content-development";
import type { CreateOutlineRequest } from "@/lib/content-development/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateOutlineRequest;

    const { projectId, level, parentId, title, initialConcept } = body;

    if (!projectId || !level || !title) {
      return NextResponse.json(
        { error: "projectId, level, and title are required" },
        { status: 400 }
      );
    }

    const result = outlineService.createOutline(
      {
        level,
        parentId,
        initialConcept: initialConcept || title
      },
      projectId
    );

    // Update the title
    outlineService.updateOutline(result.outlineDraft.id, { title });

    return NextResponse.json({
      sessionId: result.sessionId,
      outline: result.outlineDraft,
      guidingQuestions: result.guidingQuestions
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating outline:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get("projectId");
    const level = searchParams.get("level");
    const parentId = searchParams.get("parentId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    let outlines = outlineService.getOutlinesByProject(projectId);

    // Filter by level if specified
    if (level) {
      outlines = outlines.filter(o => o.outlineLevel === level);
    }

    // Filter by parent if specified
    if (parentId) {
      outlines = outlineService.getChildOutlines(parentId);
    }

    return NextResponse.json({
      outlines,
      count: outlines.length
    });
  } catch (error) {
    console.error("Error listing outlines:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
