/**
 * POST /api/v1/org/:orgId/simulate
 * Run a cascade simulation on the org promise network.
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
  { params }: { params: { orgId: string } }
) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error, "UNAUTHORIZED", 401);
  if (auth.orgId !== params.orgId) return apiError("Forbidden", "FORBIDDEN", 403);

  let body: { whatIfQuery?: WhatIfQuery };
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", "BAD_REQUEST", 400);
  }

  if (!body.whatIfQuery) {
    return apiError("Missing whatIfQuery in request body", "BAD_REQUEST", 400);
  }

  const { data: orgPromises } = await supabase
    .from("org_promises")
    .select("*")
    .eq("org_id", params.orgId);

  // Also include team promises for cross-team cascade
  const { data: teamRows } = await supabase
    .from("org_teams")
    .select("team_id")
    .eq("org_id", params.orgId);

  const teamIds = ((teamRows ?? []) as { team_id: string }[]).map((r) => r.team_id);
  let teamPromises: PPPromise[] = [];

  if (teamIds.length > 0) {
    const { data: tp } = await supabase
      .from("team_promises")
      .select("*")
      .in("team_id", teamIds);
    teamPromises = (tp ?? []) as unknown as PPPromise[];
  }

  const allPromises: PPPromise[] = [
    ...((orgPromises ?? []) as unknown as PPPromise[]),
    ...teamPromises,
  ];

  const result = simulateCascade(allPromises, body.whatIfQuery);

  return apiSuccess({ simulation: result });
}
