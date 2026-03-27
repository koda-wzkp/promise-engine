/**
 * GET /api/v1/org/:orgId/dependencies — Cross-team dependency map
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  return NextResponse.json({
    orgId: params.orgId,
    dependencies: [],
    message: "Cross-team dependency map endpoint. Configure Supabase to enable.",
  });
}
