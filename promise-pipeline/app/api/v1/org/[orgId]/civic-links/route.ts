/**
 * GET /api/v1/org/:orgId/civic-links — External civic dependencies + their status
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  return NextResponse.json({
    orgId: params.orgId,
    civicLinks: [],
    message: "Civic links endpoint. Configure Supabase to enable.",
  });
}
