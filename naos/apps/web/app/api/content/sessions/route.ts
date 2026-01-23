/**
 * Content Sessions API
 *
 * POST /api/content/sessions - Create a new content development session
 * GET /api/content/sessions - List sessions for a project
 */

import { NextRequest, NextResponse } from "next/server";
import {
  discoveryService,
  developmentService,
  outlineService,
  studioService
} from "@/lib/content-development";
import type {
  ContentSessionType,
  CreateSessionRequest
} from "@/lib/content-development/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateSessionRequest;

    const { projectId, sessionType, targetType, targetId, initialInput } = body;

    if (!projectId || !sessionType) {
      return NextResponse.json(
        { error: "projectId and sessionType are required" },
        { status: 400 }
      );
    }

    let result;

    switch (sessionType) {
      case "discovery":
        if (!initialInput) {
          return NextResponse.json(
            { error: "initialInput (topic) is required for discovery mode" },
            { status: 400 }
          );
        }
        result = discoveryService.startSession(
          {
            topic: initialInput,
            mode: (targetType as "character" | "setting" | "plot" | "open") || "open"
          },
          projectId
        );
        return NextResponse.json({
          sessionId: result.sessionId,
          sessionType: "discovery",
          response: result.openingPrompt
        });

      case "development":
        if (!targetType) {
          return NextResponse.json(
            { error: "targetType (entry type) is required for development mode" },
            { status: 400 }
          );
        }
        result = developmentService.startSession(
          {
            entryType: targetType as any,
            entryId: targetId
          },
          projectId
        );
        return NextResponse.json({
          sessionId: result.sessionId,
          sessionType: "development",
          response: result.nextQuestion,
          profile: result.currentProfile,
          completionStatus: result.completionStatus
        });

      case "outline":
        if (!targetType) {
          return NextResponse.json(
            { error: "targetType (outline level) is required for outline mode" },
            { status: 400 }
          );
        }
        result = outlineService.createOutline(
          {
            level: targetType as any,
            parentId: targetId,
            initialConcept: initialInput
          },
          projectId
        );
        return NextResponse.json({
          sessionId: result.sessionId,
          sessionType: "outline",
          outline: result.outlineDraft,
          guidingQuestions: result.guidingQuestions
        });

      case "studio":
        if (!targetId) {
          return NextResponse.json(
            { error: "targetId (scene ID) is required for studio mode" },
            { status: 400 }
          );
        }
        result = studioService.startWritingSession(targetId, projectId);
        return NextResponse.json({
          sessionId: result.sessionId,
          sessionType: "studio",
          context: result.context,
          currentBeat: result.currentBeat,
          totalBeats: result.totalBeats,
          warnings: result.warnings
        });

      default:
        return NextResponse.json(
          { error: `Unknown session type: ${sessionType}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error creating content session:", error);
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
    const sessionType = searchParams.get("sessionType") as ContentSessionType | null;

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    // In production, would query database
    // For now, return empty list or mock data
    const sessions: unknown[] = [];

    return NextResponse.json({
      sessions,
      count: sessions.length
    });
  } catch (error) {
    console.error("Error listing content sessions:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
