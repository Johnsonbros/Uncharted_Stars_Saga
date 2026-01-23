/**
 * Outline Detail API
 *
 * GET /api/content/outlines/:outlineId - Get outline details
 * PUT /api/content/outlines/:outlineId - Update outline
 * DELETE /api/content/outlines/:outlineId - Delete outline
 */

import { NextRequest, NextResponse } from "next/server";
import { outlineService } from "@/lib/content-development";
import type { UpdateOutlineRequest } from "@/lib/content-development/types";

interface RouteParams {
  params: Promise<{
    outlineId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { outlineId } = await params;

    const outline = outlineService.getOutline(outlineId);

    if (!outline) {
      return NextResponse.json(
        { error: `Outline ${outlineId} not found` },
        { status: 404 }
      );
    }

    // Get children if any
    const children = outlineService.getChildOutlines(outlineId);

    return NextResponse.json({
      outline,
      children,
      hasChildren: children.length > 0
    });
  } catch (error) {
    console.error("Error getting outline:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { outlineId } = await params;
    const body = await request.json() as UpdateOutlineRequest;

    const outline = outlineService.getOutline(outlineId);

    if (!outline) {
      return NextResponse.json(
        { error: `Outline ${outlineId} not found` },
        { status: 404 }
      );
    }

    const updates: Partial<typeof outline> = {};

    if (body.title !== undefined) {
      updates.title = body.title;
    }

    if (body.subtitle !== undefined) {
      updates.subtitle = body.subtitle;
    }

    if (body.content !== undefined) {
      updates.content = { ...outline.content, ...body.content } as typeof outline.content;
    }

    if (body.status !== undefined) {
      updates.status = body.status;
    }

    if (body.canonStatus !== undefined) {
      updates.canonStatus = body.canonStatus;
    }

    const updated = outlineService.updateOutline(outlineId, updates);

    return NextResponse.json({
      outline: updated
    });
  } catch (error) {
    console.error("Error updating outline:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { outlineId } = await params;

    const outline = outlineService.getOutline(outlineId);

    if (!outline) {
      return NextResponse.json(
        { error: `Outline ${outlineId} not found` },
        { status: 404 }
      );
    }

    const deleted = outlineService.deleteOutline(outlineId);

    return NextResponse.json({
      success: deleted,
      message: deleted ? "Outline deleted successfully" : "Failed to delete outline"
    });
  } catch (error) {
    console.error("Error deleting outline:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
