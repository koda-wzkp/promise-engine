/**
 * GET /api/v1/team/:teamId/promises — Team promises
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  return NextResponse.json({
    teamId: params.teamId,
    promises: [],
    message: "Team promises endpoint. Configure Supabase to enable.",
  });
}
