/**
 * GET /api/v1/org/:orgId/health
 * Returns the org network health score: fulfillment rate, per-team breakdown,
 * and top bottleneck promises.
 * Requires: Authorization: Bearer pp_live_...
 */

import { validateApiKey, apiSuccess, apiError } from "@/lib/api/auth";
import { supabase } from "@/lib/supabase";
import { computeBottlenecks } from "@/lib/types/org";
import type { OrgPromise } from "@/lib/types/org";

export async function GET(
  request: Request,
  { params }: { params: { orgId: string } }
) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error, "UNAUTHORIZED", 401);
  if (auth.orgId !== params.orgId) return apiError("Forbidden", "FORBIDDEN", 403);

  const { data: promises } = await supabase
    .from("org_promises")
    .select("*")
    .eq("org_id", params.orgId);

  const orgPromises = (promises ?? []) as unknown as OrgPromise[];

  const total = orgPromises.length;
  const kept = orgPromises.filter((p) => p.status === "verified").length;
  const broken = orgPromises.filter((p) => p.status === "violated").length;
  const degraded = orgPromises.filter((p) => p.status === "degraded").length;
  const completed = kept + broken;
  const fulfillmentRate = completed > 0 ? kept / completed : 0;

  // Per-team health
  const teamIds = Array.from(new Set(orgPromises.map((p) => p.owningTeam)));
  const byTeam = Object.fromEntries(
    teamIds.map((teamId) => {
      const teamPromises = orgPromises.filter((p) => p.owningTeam === teamId);
      const tk = teamPromises.filter((p) => p.status === "verified").length;
      const tb = teamPromises.filter((p) => p.status === "violated").length;
      const tc = tk + tb;
      return [
        teamId,
        {
          total: teamPromises.length,
          kept: tk,
          broken: tb,
          degraded: teamPromises.filter((p) => p.status === "degraded").length,
          fulfillmentRate: tc > 0 ? tk / tc : 0,
        },
      ];
    })
  );

  const bottlenecks = computeBottlenecks(orgPromises, 5);

  return apiSuccess({
    orgId: params.orgId,
    total,
    kept,
    broken,
    degraded,
    fulfillmentRate,
    byTeam,
    bottlenecks: bottlenecks.map(({ promise: p, dependentCount }) => ({
      id: p.id,
      body: p.body,
      status: p.status,
      owningTeam: p.owningTeam,
      dependentCount,
    })),
  });
}
