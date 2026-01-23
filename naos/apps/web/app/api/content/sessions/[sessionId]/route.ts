/**
 * Content Session Detail API
 *
 * GET /api/content/sessions/:sessionId - Get session details
 * POST /api/content/sessions/:sessionId - Continue session (send message)
 * DELETE /api/content/sessions/:sessionId - End session
 */

import { NextRequest, NextResponse } from "next/server";
import {
  discoveryService,
  developmentService,
  outlineService,
  studioService
} from "@/lib/content-development";
import type { ContinueSessionRequest } from "@/lib/content-development/types";

interface RouteParams {
  params: Promise<{
    sessionId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;

    // Try to find session in each service
    let session = discoveryService.getSession(sessionId);
    if (session) {
      const capturedConcepts = discoveryService.getCapturedConcepts(sessionId);
      return NextResponse.json({
        session,
        sessionType: "discovery",
        capturedConcepts
      });
    }

    session = developmentService.getSession(sessionId);
    if (session) {
      const profile = developmentService.getProfilePreview(sessionId);
      return NextResponse.json({
        session,
        sessionType: "development",
        profile
      });
    }

    session = outlineService.getSession(sessionId);
    if (session) {
      const outline = session.targetId ? outlineService.getOutline(session.targetId) : null;
      return NextResponse.json({
        session,
        sessionType: "outline",
        outline
      });
    }

    session = studioService.getSession(sessionId);
    if (session) {
      const writingSession = studioService.getWritingSession(sessionId);
      return NextResponse.json({
        session,
        sessionType: "studio",
        writingSession
      });
    }

    return NextResponse.json(
      { error: `Session ${sessionId} not found` },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error getting content session:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const body = await request.json() as ContinueSessionRequest;

    const { userInput } = body;

    if (!userInput) {
      return NextResponse.json(
        { error: "userInput is required" },
        { status: 400 }
      );
    }

    // Try to find and continue session in each service
    let session = discoveryService.getSession(sessionId);
    if (session) {
      const result = discoveryService.respond({
        sessionId,
        userInput
      });
      return NextResponse.json({
        sessionType: "discovery",
        extractedConcepts: result.extractedConcepts,
        response: result.followUpPrompt,
        threadsOpened: result.threadsOpened
      });
    }

    session = developmentService.getSession(sessionId);
    if (session) {
      const result = developmentService.processAnswer({
        sessionId,
        answer: userInput
      });
      return NextResponse.json({
        sessionType: "development",
        extractedFields: result.extractedFields,
        needsClarification: result.needsClarification,
        profile: result.profilePreview,
        response: result.nextQuestion,
        completionStatus: result.completionStatus
      });
    }

    session = outlineService.getSession(sessionId);
    if (session) {
      const result = outlineService.developOutline({
        sessionId,
        userInput
      });
      return NextResponse.json({
        sessionType: "outline",
        updates: result.outlineUpdates,
        nextQuestions: result.nextQuestions,
        drillDownOptions: result.drillDownOptions
      });
    }

    // Studio mode uses different endpoints for writing
    session = studioService.getSession(sessionId);
    if (session) {
      return NextResponse.json(
        { error: "Studio sessions use /api/content/studio/write endpoint" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Session ${sessionId} not found` },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error continuing content session:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const outcome = searchParams.get("outcome") as "completed" | "abandoned" | null;

    // Try to find and end session in each service
    let session = discoveryService.getSession(sessionId);
    if (session) {
      discoveryService.endSession(sessionId, outcome || "abandoned");
      return NextResponse.json({ success: true, sessionType: "discovery" });
    }

    session = developmentService.getSession(sessionId);
    if (session) {
      developmentService.endSession(sessionId, outcome || "abandoned");
      return NextResponse.json({ success: true, sessionType: "development" });
    }

    session = outlineService.getSession(sessionId);
    if (session) {
      outlineService.endSession(sessionId);
      return NextResponse.json({ success: true, sessionType: "outline" });
    }

    session = studioService.getSession(sessionId);
    if (session) {
      const summary = studioService.endWritingSession(sessionId);
      return NextResponse.json({
        success: true,
        sessionType: "studio",
        summary
      });
    }

    return NextResponse.json(
      { error: `Session ${sessionId} not found` },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error ending content session:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
