/**
 * GET /api/v1/org/:orgId/dependencies
 * Returns the directed dependency graph for all org and team promises.
 * Nodes: promises. Edges: depends_on relationships + cross-team bridges.
 * Requires: Authorization: Bearer pp_live_...
 */

import { validateApiKey, apiSuccess, apiError } from "@/lib/api/auth";
import { supabase } from "@/lib/supabase";

interface DependencyNode {
  id: string;
  body: string;
  status: string;
  teamId?: string;
  type: "org" | "team";
}

interface DependencyEdge {
  from: string;
  to: string;
  crossTeam: boolean;
}

export async function GET(
  request: Request,
  { params }: { params: { orgId: string } }
) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return apiError(auth.error, "UNAUTHORIZED", 401);
  if (auth.orgId !== params.orgId) return apiError("Forbidden", "FORBIDDEN", 403);

  const { data: orgPromises } = await supabase
    .from("org_promises")
    .select("id, body, status, owning_team, depends_on")
    .eq("org_id", params.orgId);

  const { data: teamRows } = await supabase
    .from("org_teams")
    .select("team_id")
    .eq("org_id", params.orgId);

  const teamIds = ((teamRows ?? []) as { team_id: string }[]).map((r) => r.team_id);
  let teamPromises: { id: string; body: string; status: string; team_id: string; depends_on: string[] }[] = [];

  if (teamIds.length > 0) {
    const { data: tp } = await supabase
      .from("team_promises")
      .select("id, body, status, team_id, depends_on")
      .in("team_id", teamIds);
    teamPromises = (tp ?? []) as typeof teamPromises;
  }

  const nodes: DependencyNode[] = [
    ...((orgPromises ?? []) as { id: string; body: string; status: string; owning_team: string }[]).map((p) => ({
      id: p.id,
      body: p.body,
      status: p.status,
      teamId: p.owning_team,
      type: "org" as const,
    })),
    ...teamPromises.map((p) => ({
      id: p.id,
      body: p.body,
      status: p.status,
      teamId: p.team_id,
      type: "team" as const,
    })),
  ];

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const edges: DependencyEdge[] = [];

  for (const p of (orgPromises ?? []) as { id: string; depends_on: string[] }[]) {
    for (const depId of (p.depends_on ?? [])) {
      const from = nodeMap.get(p.id);
      const to = nodeMap.get(depId);
      edges.push({
        from: p.id,
        to: depId,
        crossTeam: !!(from && to && from.teamId !== to.teamId),
      });
    }
  }

  for (const p of teamPromises) {
    for (const depId of (p.depends_on ?? [])) {
      const from = nodeMap.get(p.id);
      const to = nodeMap.get(depId);
      edges.push({
        from: p.id,
        to: depId,
        crossTeam: !!(from && to && from.teamId !== to.teamId),
      });
    }
  }

  return apiSuccess({ nodes, edges });
}
