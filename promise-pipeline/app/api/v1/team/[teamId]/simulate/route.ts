/**
 * POST /api/v1/team/:teamId/simulate
 * Run a cascade simulation on a team's promise network.
 * Body: { whatIfQuery: WhatIfQuery }
 * Requires: Authorization: Bearer pp_live_...
 */

import { validateApiKey, apiSuccess, apiError } from "@/lib/api/auth";
import { supabase } from "@/lib/supabase";
import { simulateCascade } from "@/lib/simulation/cascade";
import type { Promise as PPPromise } from "@/lib/types/promise";
import type { WhatIfQuery } from "@/lib/types/simulation";

export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error, "UNAUTHORIZED", 401);

  // Verify this team belongs to the authenticated org
  const { data: orgTeam } = await supabase
    .from("org_teams")
    .select("org_id")
    .eq("team_id", params.teamId)
    .eq("org_id", auth.orgId);

  if (!orgTeam || (orgTeam as unknown[]).length === 0) {
    return apiError("Team not found in your org", "FORBIDDEN", 403);
  }

  let body: { whatIfQuery?: WhatIfQuery };
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", "BAD_REQUEST", 400);
  }

  if (!body.whatIfQuery) {
    return apiError("Missing whatIfQuery in request body", "BAD_REQUEST", 400);
  }

  const { data: promises } = await supabase
    .from("team_promises")
    .select("*")
    .eq("team_id", params.teamId);

  const result = simulateCascade((promises ?? []) as unknown as PPPromise[], body.whatIfQuery);

  return apiSuccess({ simulation: result });
}
