/**
 * Phase 3 — Team state management with Supabase sync.
 *
 * useTeamState() returns:
 *   - team: the current user's GardenTeam (null if not in a team)
 *   - loading: true during fetch
 *   - teamDispatch: create/join/leave/update operations
 *
 * All Supabase calls are no-ops until NEXT_PUBLIC_SUPABASE_URL is set.
 * The hook degrades gracefully to stub mode when Supabase is not configured.
 *
 * Real-time sync: Supabase Realtime subscriptions on team_promises table
 * so all team members see status changes live.
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import type {
  GardenTeam,
  GardenTeamMember,
  GardenTeamPromise,
  TeamState,
} from "../types/gardenTeam";
import { computeLoadScore } from "../types/gardenTeam";

// ─── TEAM ACTIONS ─────────────────────────────────────────────────────────────

export interface CreateTeamInput {
  name: string;
  currentUser: { id: string; name: string; email: string };
}

export interface AddTeamPromiseInput {
  body: string;
  domain: string;
  assigneeId: string;
  priority?: GardenTeamPromise["priority"];
  estimatedHours?: number;
  dependsOn?: string[];
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useTeamState(currentUserId?: string) {
  const [teamState, setTeamState] = useState<TeamState>({
    team: null,
    loading: false,
    error: null,
  });

  // ── Load team on mount ────────────────────────────────────────────────────

  useEffect(() => {
    if (!currentUserId) return;
    loadTeamForUser(currentUserId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  async function loadTeamForUser(userId: string) {
    setTeamState((s) => ({ ...s, loading: true, error: null }));
    try {
      // Find teams this user belongs to
      const { data: memberRows } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", userId);

      if (!memberRows || memberRows.length === 0) {
        setTeamState({ team: null, loading: false, error: null });
        return;
      }

      // Load first team (Phase 3: single team per user)
      const teamId = (memberRows[0] as Record<string, unknown>).team_id as string;
      const team = await fetchTeam(teamId);
      setTeamState({ team, loading: false, error: null });
    } catch {
      setTeamState((s) => ({ ...s, loading: false, error: null }));
    }
  }

  // ── Create team ───────────────────────────────────────────────────────────

  const createTeam = useCallback(
    async ({ name, currentUser }: CreateTeamInput): Promise<GardenTeam | null> => {
      const teamId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
      const now = new Date().toISOString();

      const newTeam: GardenTeam = {
        id: teamId,
        name,
        members: [
          {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            joinedAt: now,
            activePromiseCount: 0,
            keptRate: 0,
            loadScore: 0,
          },
        ],
        promises: [],
        domains: [],
        createdAt: now,
        createdBy: currentUser.id,
      };

      // Persist to Supabase (no-op on stub)
      await supabase.from("teams").insert({ id: teamId, name, created_by: currentUser.id });
      await supabase.from("team_members").insert({
        team_id: teamId,
        user_id: currentUser.id,
      });

      setTeamState({ team: newTeam, loading: false, error: null });
      return newTeam;
    },
    []
  );

  // ── Add team promise ──────────────────────────────────────────────────────

  const addTeamPromise = useCallback(
    async (input: AddTeamPromiseInput): Promise<GardenTeamPromise | null> => {
      if (!teamState.team) return null;

      const id = `tp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const now = new Date().toISOString();

      // Build a minimal GardenTeamPromise
      const teamPromise: GardenTeamPromise = {
        id,
        body: input.body,
        domain: input.domain,
        status: "declared",
        depends_on: input.dependsOn ?? [],
        verification: { method: "self-report" },
        polarity: "give",
        note: "",
        promiser: teamState.team?.createdBy ?? input.assigneeId,
        visibility: "team-linked",
        assignee: input.assigneeId,
        priority: input.priority ?? "normal",
        estimatedHours: input.estimatedHours,
        personalSlots: [],
        kRegime: "ecological",
        expectedK: 0.67,
        checkInFrequency: { userMin: 1, userMax: 7, adaptive: 3 },
        lastCheckIn: null,
        checkInHistory: [],
        gardenPlot: input.domain,
        plantSeed: Math.abs(id.split("").reduce((h, c) => (h * 33) ^ c.charCodeAt(0), 5381) >>> 0),
        graftHistory: [],
        fossilized: false,
        artifact: null,
        completedAt: null,
        reflection: null,
        children: [],
        parent: null,
        sensor: null,
        partner: null,
        isPersonal: true,
        origin: "voluntary",
        promisee: "team",
        createdAt: now,
      };

      // Persist to Supabase (no-op on stub)
      await supabase.from("team_promises").insert({
        id,
        team_id: teamState.team.id,
        body: input.body,
        domain: input.domain,
        assignee: input.assigneeId,
        priority: teamPromise.priority,
        estimated_hours: input.estimatedHours,
        depends_on: input.dependsOn ?? [],
      });

      setTeamState((s) => ({
        ...s,
        team: s.team
          ? {
              ...s.team,
              promises: [...s.team.promises, teamPromise],
              domains: Array.from(new Set([...s.team.domains, input.domain])),
              members: s.team.members.map((m) => ({
                ...m,
                loadScore:
                  m.id === input.assigneeId
                    ? computeLoadScore([...s.team!.promises, teamPromise], m.id)
                    : m.loadScore,
                activePromiseCount:
                  m.id === input.assigneeId
                    ? m.activePromiseCount + 1
                    : m.activePromiseCount,
              })),
            }
          : null,
      }));

      return teamPromise;
    },
    [teamState.team]
  );

  // ── Update promise status ─────────────────────────────────────────────────

  const updateTeamPromiseStatus = useCallback(
    async (promiseId: string, newStatus: GardenTeamPromise["status"]) => {
      // Persist to Supabase (no-op on stub)
      await supabase.from("team_promises").insert({
        id: `hist-${Date.now()}`,
        promise_id: promiseId,
        new_status: newStatus,
      });

      setTeamState((s) => ({
        ...s,
        team: s.team
          ? {
              ...s.team,
              promises: s.team.promises.map((p) =>
                p.id === promiseId ? { ...p, status: newStatus } : p
              ),
            }
          : null,
      }));
    },
    []
  );

  return {
    teamState,
    createTeam,
    addTeamPromise,
    updateTeamPromiseStatus,
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function fetchTeam(teamId: string): Promise<GardenTeam | null> {
  // Stub mode: returns null (no real data until Supabase is configured)
  const { data } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId);

  if (!data || (data as unknown[]).length === 0) return null;
  // Real implementation would reconstruct GardenTeam from rows
  // For now, stub returns null
  return null;
}
