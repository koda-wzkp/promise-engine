/**
 * GET /api/v1/team/:teamId/promises
 * Returns all promises for a team.
 * Requires: Authorization: Bearer pp_live_... (org that owns this team)
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

  return apiSuccess({ promises: promises ?? [] });
}
