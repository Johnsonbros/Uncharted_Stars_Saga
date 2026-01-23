/**
 * Profile Updates API
 *
 * GET /api/content/updates - Get pending profile updates
 * POST /api/content/updates - Apply profile updates
 */

import { NextRequest, NextResponse } from "next/server";
import type {
  ProfileUpdate,
  ApproveUpdatesRequest,
  RejectUpdatesRequest
} from "@/lib/content-development/types";

// In-memory store for demo - would be database in production
const pendingUpdates: Map<string, ProfileUpdate> = new Map();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entryId = searchParams.get("entryId");
    const status = searchParams.get("status") || "pending";

    let updates = Array.from(pendingUpdates.values());

    // Filter by entry ID if specified
    if (entryId) {
      updates = updates.filter(u => u.entryId === entryId);
    }

    // Filter by status
    updates = updates.filter(u => u.status === status);

    return NextResponse.json({
      updates,
      totalCount: updates.length
    });
  } catch (error) {
    console.error("Error getting profile updates:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is an approve or reject action
    if (body.action === "approve") {
      const { updateIds, approvedBy } = body as ApproveUpdatesRequest & { action: string };

      if (!updateIds || updateIds.length === 0) {
        return NextResponse.json(
          { error: "updateIds is required" },
          { status: 400 }
        );
      }

      const approved: ProfileUpdate[] = [];
      const notFound: string[] = [];

      for (const updateId of updateIds) {
        const update = pendingUpdates.get(updateId);
        if (update) {
          update.status = "approved";
          update.approvedBy = approvedBy || "system";
          update.approvedAt = new Date();
          approved.push(update);
        } else {
          notFound.push(updateId);
        }
      }

      return NextResponse.json({
        approved,
        notFound,
        approvedCount: approved.length
      });
    }

    if (body.action === "reject") {
      const { updateIds, reason } = body as RejectUpdatesRequest & { action: string };

      if (!updateIds || updateIds.length === 0) {
        return NextResponse.json(
          { error: "updateIds is required" },
          { status: 400 }
        );
      }

      const rejected: ProfileUpdate[] = [];
      const notFound: string[] = [];

      for (const updateId of updateIds) {
        const update = pendingUpdates.get(updateId);
        if (update) {
          update.status = "rejected";
          rejected.push(update);
        } else {
          notFound.push(updateId);
        }
      }

      return NextResponse.json({
        rejected,
        notFound,
        rejectedCount: rejected.length
      });
    }

    // Creating a new update
    const update = body as ProfileUpdate;

    if (!update.entryId || !update.fieldPath || update.newValue === undefined) {
      return NextResponse.json(
        { error: "entryId, fieldPath, and newValue are required" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const newUpdate: ProfileUpdate = {
      ...update,
      id,
      status: "pending",
      autoApplied: false,
      createdAt: new Date()
    };

    pendingUpdates.set(id, newUpdate);

    return NextResponse.json({
      update: newUpdate
    }, { status: 201 });
  } catch (error) {
    console.error("Error processing profile update:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
