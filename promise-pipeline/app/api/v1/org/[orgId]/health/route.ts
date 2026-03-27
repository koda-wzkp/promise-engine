/**
 * GET /api/v1/org/:orgId/health — Org network health score
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  return NextResponse.json({
    orgId: params.orgId,
    health: {
      overall: 0,
      byDomain: {},
      byTeam: {},
      bottlenecks: [],
      atRisk: [],
    },
    message: "Org health endpoint. Configure Supabase to enable.",
  });
}
