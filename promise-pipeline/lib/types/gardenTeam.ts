/**
 * Phase 3 — Garden-specific team types.
 *
 * Distinct from the existing lib/types/team.ts (which is for civic dashboards).
 * These types model the personal → team → org NCTP projection at the garden scale.
 *
 * The NCTP projection:
 *   - Team promise body flows DOWN (team assigns → member sees)
 *   - Personal sub-promise details stay PRIVATE (never sync)
 *   - Promise status flows UP (member updates → team sees plant health)
 */

import type { GardenPromise } from "./personal";
import type { PromiseStatus } from "./promise";

// ─── TEAM ENTITY ─────────────────────────────────────────────────────────────

export interface GardenTeam {
  id: string;
  name: string;
  members: GardenTeamMember[];
  promises: GardenTeamPromise[];
  domains: string[];
  createdAt: string;
  createdBy: string;  // user ID
}

// ─── TEAM MEMBER ─────────────────────────────────────────────────────────────

export interface GardenTeamMember {
  id: string;          // Supabase user ID
  name: string;
  email: string;
  role?: string;
  joinedAt: string;
  /** Number of active team promises assigned to this member */
  activePromiseCount: number;
  /** Fraction of resolved team promises that were kept (0–1) */
  keptRate: number;
  /** Aggregate load score (0–100) — derived from promise count × priority weights */
  loadScore: number;
}

// ─── TEAM PROMISE ─────────────────────────────────────────────────────────────

/**
 * A promise assigned to a specific team member.
 * Extends GardenPromise but overrides visibility to 'team-linked'.
 *
 * The team sees: body, status, domain, depends_on
 * The team does NOT see: personalSlots content, check-in history, sub-promises
 */
export interface GardenTeamPromise extends Omit<GardenPromise, "visibility"> {
  visibility: "team-linked";
  /** ID of the assigned team member */
  assignee: string;
  /** IDs of personal sub-promises created by the assignee to fulfill this */
  personalSlots: string[];
  estimatedHours?: number;
  priority: "critical" | "high" | "normal" | "low";
}

// ─── TEAM STATE ───────────────────────────────────────────────────────────────

export interface TeamState {
  /** The current user's team, or null if not in a team */
  team: GardenTeam | null;
  /** Loading state */
  loading: boolean;
  /** Error message, if any */
  error: string | null;
}

export const INITIAL_TEAM_STATE: TeamState = {
  team: null,
  loading: false,
  error: null,
};

// ─── PRIORITY WEIGHTS (for load score computation) ───────────────────────────

export const PRIORITY_WEIGHTS: Record<string, number> = {
  critical: 4,
  high:     3,
  normal:   2,
  low:      1,
};

/**
 * Compute a member's load score (0–100) from their assigned promises.
 * Based on priority-weighted count relative to a comfortable maximum (10).
 */
export function computeLoadScore(promises: GardenTeamPromise[], memberId: string): number {
  const assigned = promises.filter((p) => p.assignee === memberId && p.status !== "verified" && p.status !== "violated");
  const weightedSum = assigned.reduce((sum, p) => sum + (PRIORITY_WEIGHTS[p.priority] ?? 2), 0);
  const MAX_COMFORTABLE = 20; // 10 normal-priority promises
  return Math.min(100, Math.round((weightedSum / MAX_COMFORTABLE) * 100));
}

/**
 * Compute the team's aggregate fulfillment rate.
 */
export function computeTeamFulfillmentRate(promises: GardenTeamPromise[]): number {
  const resolved = promises.filter(
    (p) => p.status === "verified" || p.status === "violated" || p.fossilized
  );
  if (resolved.length === 0) return 0;
  const kept = resolved.filter((p) => p.status === "verified" && !p.fossilized);
  return kept.length / resolved.length;
}

/**
 * Create an empty personal sub-promise slot for a received team promise.
 * Returns the stub GardenPromise that the member fills in.
 */
export function createPersonalSlot(teamPromise: GardenTeamPromise): Omit<GardenPromise, "plantSeed"> {
  return {
    ...teamPromise,
    id: `slot-${teamPromise.id}-${Date.now()}`,
    visibility: "private" as const,
    parent: teamPromise.id,
    children: [],
    body: teamPromise.body, // Read-only, synced from team — member adds sub-promises
    status: "declared" as PromiseStatus,
    checkInHistory: [],
    graftHistory: [],
    lastCheckIn: null,
    fossilized: false,
    artifact: null,
    completedAt: null,
    reflection: null,
    sensor: null,
    partner: null,
    depends_on: [],
    createdAt: new Date().toISOString(),
  };
}
