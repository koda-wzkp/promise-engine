/**
 * Org Sync — Supabase operations for org-level data.
 *
 * Org data lives on Supabase. Personal data stays local.
 * Uses the same lazy-loaded client from ./client.ts.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { isSupabaseConfigured, getSupabase } from "./client";
import type { PromiseStatus } from "../types/promise";
import type { Org, OrgPromise, ExternalDependency, ApiKey, WebhookConfig } from "../types/phase4";
import type { GardenAction } from "../types/garden";

type Dispatch = (action: GardenAction) => void;

let activeOrgSubscription: { unsubscribe: () => void } | null = null;

/** Subscribe to org-level real-time updates. */
export async function subscribeToOrg(orgId: string, dispatch: Dispatch) {
  if (!isSupabaseConfigured()) return;
  unsubscribeFromOrg();

  const supabase = await getSupabase();
  if (!supabase) return;

  const channel = supabase
    .channel(`org-${orgId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "org_promises",
        filter: `org_id=eq.${orgId}`,
      },
      (payload: any) => {
        const { id, status } = payload.new as { id: string; status: PromiseStatus };
        dispatch({ type: "UPDATE_ORG_PROMISE_STATUS", promiseId: id, newStatus: status });
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "civic_dependencies",
      },
      (payload: any) => {
        const row = payload.new as any;
        dispatch({
          type: "CIVIC_STATUS_UPDATE",
          civicPromiseId: row.civic_promise_id,
          civicDashboard: row.civic_dashboard,
          newStatus: row.status,
        });
      }
    )
    .subscribe();

  activeOrgSubscription = channel;
}

/** Unsubscribe from org real-time updates. */
export function unsubscribeFromOrg() {
  if (activeOrgSubscription) {
    activeOrgSubscription.unsubscribe();
    activeOrgSubscription = null;
  }
}

/** Fetch full org data from Supabase. */
export async function fetchOrg(orgId: string): Promise<Org | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("orgs")
    .select("*, org_teams(team_id), org_promises(*, civic_dependencies(*))")
    .eq("id", orgId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    teams: (data.org_teams ?? []).map((t: any) => t.team_id),
    orgPromises: (data.org_promises ?? []).map((p: any) => mapOrgPromise(p)),
    domains: data.domains ?? [],
    createdAt: data.created_at,
    createdBy: data.created_by,
    stripeCustomerId: data.stripe_customer_id,
    stripeSubscriptionId: data.stripe_subscription_id,
    subscriptionStatus: data.subscription_status,
  };
}

function mapOrgPromise(p: any): OrgPromise {
  return {
    id: p.id,
    isPersonal: false as any,
    visibility: "org",
    promiser: p.owning_team,
    promisee: "org",
    body: p.body,
    domain: p.domain,
    status: p.status ?? "declared",
    note: "",
    verification: { method: (p.verification_method ?? "filing") as any },
    depends_on: p.depends_on ?? [],
    polarity: "give",
    origin: "voluntary",
    createdAt: p.created_at,
    children: [],
    parent: null,
    owningTeam: p.owning_team,
    contributingTeams: p.contributing_teams ?? [],
    externalDependencies: (p.civic_dependencies ?? []).map((d: any) => ({
      type: "civic" as const,
      label: d.label,
      civicPromiseId: d.civic_promise_id,
      civicDashboard: d.civic_dashboard,
      status: d.status ?? "declared",
      lastSyncedAt: d.last_synced_at,
    })),
  };
}

/** Create a new org in Supabase. */
export async function createOrg(name: string, createdBy: string): Promise<Org | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("orgs")
    .insert({ name, created_by: createdBy, domains: [] })
    .select()
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    teams: [],
    orgPromises: [],
    domains: [],
    createdAt: data.created_at,
    createdBy: data.created_by,
  };
}

/** Add a team to an org. */
export async function addTeamToOrg(orgId: string, teamId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = await getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from("org_teams")
    .insert({ org_id: orgId, team_id: teamId });

  return !error;
}

/** Create an org-level promise in Supabase. */
export async function createOrgPromise(
  orgId: string,
  promise: OrgPromise
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = await getSupabase();
  if (!supabase) return false;

  const { error } = await supabase.from("org_promises").insert({
    id: promise.id,
    org_id: orgId,
    body: promise.body,
    domain: promise.domain,
    status: promise.status,
    owning_team: promise.owningTeam,
    contributing_teams: promise.contributingTeams,
    depends_on: promise.depends_on,
    verification_method: promise.verification.method,
  });

  if (error) return false;

  // Insert civic dependencies
  for (const dep of promise.externalDependencies) {
    await supabase.from("civic_dependencies").insert({
      org_promise_id: promise.id,
      civic_promise_id: dep.civicPromiseId,
      civic_dashboard: dep.civicDashboard,
      label: dep.label,
      status: dep.status,
    });
  }

  return true;
}

/** Update org promise status. */
export async function updateOrgPromiseStatus(
  promiseId: string,
  status: PromiseStatus
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = await getSupabase();
  if (!supabase) return;

  await supabase
    .from("org_promises")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", promiseId);
}
