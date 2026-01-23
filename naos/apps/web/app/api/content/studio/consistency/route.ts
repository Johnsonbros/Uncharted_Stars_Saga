/**
 * Studio Consistency Check API
 *
 * POST /api/content/studio/consistency - Check prose for consistency issues
 */

import { NextRequest, NextResponse } from "next/server";
import { studioService } from "@/lib/content-development";
import type { ConsistencyCheckInput } from "@/lib/content-development/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ConsistencyCheckInput;

    const { prose, context } = body;

    if (!prose || !context) {
      return NextResponse.json(
        { error: "prose and context are required" },
        { status: 400 }
      );
    }

    const result = studioService.checkConsistency({ prose, context });

    return NextResponse.json({
      issues: result.issues,
      suggestions: result.suggestions,
      hasIssues: result.issues.length > 0,
      issueCount: result.issues.length,
      errorCount: result.issues.filter(i => i.severity === "error").length,
      warningCount: result.issues.filter(i => i.severity === "warning").length
    });
  } catch (error) {
    console.error("Error checking consistency:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
