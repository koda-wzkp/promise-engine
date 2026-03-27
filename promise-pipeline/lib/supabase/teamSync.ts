/**
 * Team Sync — Supabase real-time subscription for team promise status.
 *
 * Sync boundary: team status syncs to Supabase.
 * Personal sub-promises NEVER sync — they stay in localStorage.
 *
 * All Supabase calls are async and gracefully degrade when the library
 * or env vars are unavailable.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { isSupabaseConfigured, getSupabase } from "./client";
import type { PromiseStatus } from "../types/promise";
import type { Team, TeamGardenPromise } from "../types/phase3";
import type { GardenAction } from "../types/garden";

type Dispatch = (action: GardenAction) => void;

let activeSubscription: { unsubscribe: () => void } | null = null;

/**
 * Subscribe to real-time team promise updates from Supabase.
 */
export async function subscribeToTeam(teamId: string, dispatch: Dispatch) {
  if (!isSupabaseConfigured()) return;

  unsubscribeFromTeam();

  const supabase = await getSupabase();
  if (!supabase) return;

  const channel = supabase
    .channel(`team-${teamId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "team_promises",
        filter: `team_id=eq.${teamId}`,
      },
      (payload: any) => {
        const { id, status } = payload.new as { id: string; status: PromiseStatus };
        dispatch({ type: "TEAM_STATUS_UPDATE", promiseId: id, newStatus: status });
      }
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "team_promises",
        filter: `team_id=eq.${teamId}`,
      },
      (payload: any) => {
        const row = payload.new as any;
        const teamPromise: TeamGardenPromise = {
          id: row.id,
          isTeam: true,
          promiser: row.assignee,
          promisee: "team",
          body: row.body,
          domain: row.domain,
          status: row.status ?? "declared",
          note: "",
          verification: row.verification ?? { method: "self-report" },
          depends_on: row.depends_on ?? [],
          polarity: "give",
          origin: "imposed",
          createdAt: row.created_at,
          assignee: row.assignee,
          visibility: "team-linked",
          personalSlots: [],
        };
        dispatch({ type: "TEAM_PROMISE_RECEIVED", teamPromise, teamId });
      }
    )
    .subscribe();

  activeSubscription = channel;
}

/** Unsubscribe from team real-time updates. */
export function unsubscribeFromTeam() {
  if (activeSubscription) {
    activeSubscription.unsubscribe();
    activeSubscription = null;
  }
}

/** Push personal promise status up to the team (status flows up). */
export async function syncStatusToTeam(
  teamPromiseId: string,
  status: PromiseStatus
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = await getSupabase();
  if (!supabase) return;

  await supabase
    .from("team_promises")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", teamPromiseId);
}

/** Fetch team data from Supabase. */
export async function fetchTeam(teamId: string): Promise<Team | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("teams")
    .select("*, team_members(*), team_promises(*)")
    .eq("id", teamId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    members: (data.team_members ?? []).map((m: any) => ({
      id: m.id,
      name: m.name,
      type: "team-member" as const,
      short: (m.name ?? "").slice(0, 3).toUpperCase(),
      role: m.role ?? "",
      activePromiseCount: 0,
      keptRate: 0,
      mtkp: 0,
      loadScore: 0,
      userId: m.user_id,
      joinedAt: m.joined_at ?? m.created_at,
    })),
    promises: (data.team_promises ?? []).map((p: any) => ({
      id: p.id,
      isTeam: true,
      promiser: p.assignee,
      promisee: "team",
      body: p.body,
      domain: p.domain,
      status: p.status ?? "declared",
      note: "",
      verification: p.verification ?? { method: "self-report" },
      depends_on: p.depends_on ?? [],
      polarity: "give",
      origin: "imposed",
      createdAt: p.created_at,
      assignee: p.assignee,
      visibility: "team-linked",
      personalSlots: p.personal_slots ?? [],
    })),
    domains: data.domains ?? [],
    createdAt: data.created_at,
    createdBy: data.created_by,
    subscriptionId: data.subscription_id,
    subscriptionStatus: data.subscription_status,
  };
}

/** Create a new team in Supabase. */
export async function createTeam(
  name: string,
  createdBy: string
): Promise<Team | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("teams")
    .insert({ name, created_by: createdBy, domains: [] })
    .select()
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    members: [],
    promises: [],
    domains: [],
    createdAt: data.created_at,
    createdBy: data.created_by,
  };
}

/** Join an existing team. */
export async function joinTeam(
  teamId: string,
  userId: string,
  name: string,
  role: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = await getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from("team_members")
    .insert({
      team_id: teamId,
      user_id: userId,
      name,
      role,
      joined_at: new Date().toISOString(),
    });

  return !error;
}
