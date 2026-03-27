/**
 * GET /api/v1/team/:teamId/health — Team health
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  return NextResponse.json({
    teamId: params.teamId,
    health: {
      overall: 0,
      byDomain: {},
      byAgent: {},
      bottlenecks: [],
      atRisk: [],
    },
    message: "Team health endpoint. Configure Supabase to enable.",
  });
}
