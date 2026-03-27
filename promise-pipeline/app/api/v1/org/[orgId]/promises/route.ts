/**
 * GET /api/v1/org/:orgId/promises — All org promises
 * POST /api/v1/org/:orgId/promises — Create org promise
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  // In production, this would query Supabase with API key auth.
  // For now, return a structured placeholder.
  return NextResponse.json({
    orgId: params.orgId,
    promises: [],
    message: "Org promises endpoint. Configure Supabase to enable.",
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const body = await request.json();

    if (!body.body || !body.domain || !body.owningTeam) {
      return NextResponse.json(
        { error: "Missing required fields: body, domain, owningTeam" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orgId: params.orgId,
      promiseId: `ORG-${Date.now()}`,
      message: "Org promise created. Configure Supabase to persist.",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
