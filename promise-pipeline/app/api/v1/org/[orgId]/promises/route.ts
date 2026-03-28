/**
 * GET /api/v1/org/:orgId/promises
 * Returns all org-level promises for the org.
 * Requires: Authorization: Bearer pp_live_...
 */

import { validateApiKey, apiSuccess, apiError } from "@/lib/api/auth";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: { orgId: string } }
) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error, "UNAUTHORIZED", 401);
  if (auth.orgId !== params.orgId) return apiError("Forbidden", "FORBIDDEN", 403);

  const { data, error } = await supabase
    .from("org_promises")
    .select("*")
    .eq("org_id", params.orgId);

  if (error) return apiError("Failed to load org promises", "DB_ERROR", 500);

  return apiSuccess({ promises: data ?? [] });
}
