/**
 * Phase 4 — Org-level types.
 *
 * The org is the zoom level between team and civic.
 * One org → multiple teams → many members.
 *
 * OrgPromise extends GardenPromise and adds:
 *   - visibility: 'org'
 *   - owningTeam: team responsible for delivery
 *   - contributingTeams: teams whose work feeds into this
 *   - externalDependencies: links to civic/regulatory promises
 */

import type { GardenPromise } from "./personal";
import type { PromiseStatus } from "./promise";

// ─── EXTERNAL DEPENDENCY ─────────────────────────────────────────────────────

export type ExternalDependencyType = "civic" | "regulatory" | "vendor" | "partner";

export interface ExternalDependency {
  id: string;
  type: ExternalDependencyType;
  /** Human-readable label: "Oregon HB 2021", "Gresham CAP UFT-04" */
  label: string;
  /** References a promise ID in a civic dashboard (e.g. "GRE-UFT-04", "P001") */
  civicPromiseId?: string;
  /** Which civic dashboard dataset: "gresham" | "hb2021" | "jcpoa" | "iss" */
  civicDashboard?: "gresham" | "hb2021" | "jcpoa" | "iss";
  /** Last known status — synced from civic data */
  status: PromiseStatus;
  /** ISO timestamp of last status sync */
  lastSyncedAt: string | null;
}

// ─── ORG PROMISE ─────────────────────────────────────────────────────────────

export interface OrgPromise extends Omit<GardenPromise, "visibility"> {
  visibility: "org";
  /** Team responsible for delivery */
  owningTeam: string;
  /** Teams whose work feeds into this promise */
  contributingTeams: string[];
  /** Dependencies on external civic/regulatory promises */
  externalDependencies: ExternalDependency[];
}

// ─── ORG ENTITY ──────────────────────────────────────────────────────────────

export interface Org {
  id: string;
  name: string;
  /** Team IDs belonging to this org */
  teams: string[];
  orgPromises: OrgPromise[];
  domains: string[];
  createdAt: string;
  createdBy: string;
  /** Stripe customer ID — null until billing is set up */
  stripeCustomerId: string | null;
  /** Stripe subscription ID */
  stripeSubscriptionId: string | null;
}

// ─── ORG STATE ───────────────────────────────────────────────────────────────

export interface OrgState {
  org: Org | null;
  loading: boolean;
  error: string | null;
}

export const INITIAL_ORG_STATE: OrgState = {
  org: null,
  loading: false,
  error: null,
};

// ─── WEBHOOK CONFIG ───────────────────────────────────────────────────────────

export type WebhookEvent = "status_change" | "cascade" | "civic_update" | "health_alert";

export interface WebhookConfig {
  id: string;
  orgId: string;
  url: string;
  events: WebhookEvent[];
  /** Alert when org health drops below this 0–100 score */
  healthThreshold?: number;
  active: boolean;
  createdAt: string;
}

// ─── API KEY ─────────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  orgId: string;
  /** Only shown once on creation. Stored as hash in DB. */
  keyPreview: string;  // e.g. "pp_live_abc...xyz"
  label: string;
  rateLimitDaily: number;
  createdAt: string;
  lastUsedAt: string | null;
}

// ─── PRICING ─────────────────────────────────────────────────────────────────

export const ORG_PRICE_PER_USER_MONTH = 29; // USD

// ─── ORG HELPERS ─────────────────────────────────────────────────────────────

/**
 * Compute bottleneck promises — those with the most cross-team dependents.
 * A bottleneck is a promise whose failure cascades across team boundaries.
 */
export function computeBottlenecks(
  orgPromises: OrgPromise[],
  topN = 5
): Array<{ promise: OrgPromise; dependentCount: number }> {
  return orgPromises
    .map((p) => ({
      promise: p,
      dependentCount: orgPromises.filter((other) => other.depends_on.includes(p.id)).length,
    }))
    .sort((a, b) => b.dependentCount - a.dependentCount)
    .slice(0, topN);
}

/**
 * Find all org promises that depend on a given civic promise ID.
 * Used when a civic status update cascades into the org network.
 */
export function orgPromisesByCivicId(
  orgPromises: OrgPromise[],
  civicPromiseId: string
): OrgPromise[] {
  return orgPromises.filter((p) =>
    p.externalDependencies.some((dep) => dep.civicPromiseId === civicPromiseId)
  );
}
