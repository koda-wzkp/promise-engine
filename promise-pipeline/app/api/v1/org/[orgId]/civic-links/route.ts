/**
 * GET /api/v1/org/:orgId/civic-links
 * Returns all external civic dependencies declared by this org's promises,
 * with their current synced status.
 * Requires: Authorization: Bearer pp_live_...
 */

import { validateApiKey, apiSuccess, apiError } from "@/lib/api/auth";
import { supabase } from "@/lib/supabase";
import { fetchCivicPromiseSummary } from "@/lib/garden/civicSync";

export async function GET(
  request: Request,
  { params }: { params: { orgId: string } }
) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error, "UNAUTHORIZED", 401);
  if (auth.orgId !== params.orgId) return apiError("Forbidden", "FORBIDDEN", 403);

  // Get all org promises for this org
  const { data: orgPromises } = await supabase
    .from("org_promises")
    .select("id")
    .eq("org_id", params.orgId);

  const orgPromiseIds = ((orgPromises ?? []) as { id: string }[]).map((p) => p.id);
  if (orgPromiseIds.length === 0) return apiSuccess({ civicLinks: [] });

  // Get all civic dependencies
  const { data: deps } = await supabase
    .from("civic_dependencies")
    .select("*")
    .in("org_promise_id", orgPromiseIds);

  type DepRow = {
    id: string;
    org_promise_id: string;
    civic_promise_id: string;
    civic_dashboard: string;
    label: string;
    status: string;
    last_synced_at: string | null;
  };

  // Enrich each dep with current civic promise data
  const enriched = await Promise.all(
    ((deps ?? []) as DepRow[]).map(async (dep) => {
      const summary = await fetchCivicPromiseSummary(
        dep.civic_promise_id,
        dep.civic_dashboard
      );
      return {
        id: dep.id,
        orgPromiseId: dep.org_promise_id,
        civicPromiseId: dep.civic_promise_id,
        civicDashboard: dep.civic_dashboard,
        label: dep.label,
        storedStatus: dep.status,
        currentStatus: summary?.status ?? dep.status,
        lastSyncedAt: dep.last_synced_at,
        civicPromise: summary,
      };
    })
  );

  return apiSuccess({ civicLinks: enriched });
}
