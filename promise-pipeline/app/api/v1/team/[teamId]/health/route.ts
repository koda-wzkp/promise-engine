/**
 * GET /api/v1/team/:teamId/health
 * Returns the team health score: fulfillment rate, per-member load,
 * and domain breakdown.
 * Requires: Authorization: Bearer pp_live_...
 */

import { validateApiKey, apiSuccess, apiError } from "@/lib/api/auth";
import { supabase } from "@/lib/supabase";

export async function GET(
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

  const { data: promises } = await supabase
    .from("team_promises")
    .select("*")
    .eq("team_id", params.teamId);

  const { data: members } = await supabase
    .from("team_members")
    .select("user_id, role")
    .eq("team_id", params.teamId);

  const allPromises = (promises ?? []) as {
    id: string; body: string; status: string; assignee: string; domain: string;
  }[];

  const total = allPromises.length;
  const kept = allPromises.filter((p) => p.status === "verified").length;
  const broken = allPromises.filter((p) => p.status === "violated").length;
  const degraded = allPromises.filter((p) => p.status === "degraded").length;
  const completed = kept + broken;
  const fulfillmentRate = completed > 0 ? kept / completed : 0;

  // Per-member load
  const memberIds = ((members ?? []) as { user_id: string }[]).map((m) => m.user_id);
  const byMember = Object.fromEntries(
    memberIds.map((memberId: string) => {
      const mp = allPromises.filter((p) => p.assignee === memberId);
      const active = mp.filter((p) => p.status !== "verified" && p.status !== "violated").length;
      return [memberId, { total: mp.length, active }];
    })
  );

  // Per-domain breakdown
  const domains = Array.from(new Set(allPromises.map((p) => p.domain)));
  const byDomain = Object.fromEntries(
    domains.map((domain) => {
      const dp = allPromises.filter((p) => p.domain === domain);
      const dk = dp.filter((p) => p.status === "verified").length;
      const db = dp.filter((p) => p.status === "violated").length;
      const dc = dk + db;
      return [domain, { total: dp.length, kept: dk, broken: db, fulfillmentRate: dc > 0 ? dk / dc : 0 }];
    })
  );

  return apiSuccess({
    teamId: params.teamId,
    total,
    kept,
    broken,
    degraded,
    fulfillmentRate,
    byMember,
    byDomain,
  });
}
