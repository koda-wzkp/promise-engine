/**
 * Phase 4 Types — Org + Civic Zoom
 *
 * Extends Phase 3 with:
 * - Org-level network (multiple teams, org promises)
 * - External civic/regulatory dependencies
 * - Cross-team dependency visualization
 * - API access (keys, webhooks)
 * - Full NCTP zoom chain: personal → team → org → civic → state
 */

import { PromiseStatus, VerificationMethod } from "./promise";
import { GardenPromise } from "./garden";
import type { CascadeResult, NetworkHealthScore } from "./simulation";
import type { Team } from "./phase3";

// ─── ORG STRUCTURE ──────────────────────────────────────────────────────────

export interface Org {
  id: string;
  name: string;
  teams: string[];                // team IDs
  orgPromises: OrgPromise[];      // promises that span teams
  domains: string[];
  createdAt: string;
  createdBy: string;
  /** Stripe billing */
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: "active" | "past_due" | "canceled";
}

export interface OrgPromise extends GardenPromise {
  visibility: "org";
  /** Team responsible for delivery */
  owningTeam: string;
  /** Teams whose work feeds into this */
  contributingTeams: string[];
  /** External civic/regulatory dependencies */
  externalDependencies: ExternalDependency[];
}

export interface ExternalDependency {
  type: "civic" | "regulatory" | "vendor" | "partner";
  label: string;                  // e.g., "Oregon HB 2021", "Gresham CAP UFT-04"
  civicPromiseId?: string;        // links to a promise in a civic dashboard
  civicDashboard?: string;        // e.g., "gresham", "hb2021"
  status: PromiseStatus;          // tracked independently or synced from civic data
  lastSyncedAt?: string;
}

// ─── CROSS-TEAM DEPENDENCIES ────────────────────────────────────────────────

export interface CrossTeamDependency {
  fromPromiseId: string;
  fromTeamId: string;
  toPromiseId: string;
  toTeamId: string;
  /** Stress level from cascade propagation (0-1) */
  stress?: number;
}

// ─── API ACCESS ─────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  orgId: string;
  /** Display label for the key */
  label: string;
  /** Prefix shown (e.g., "pk_...abc") — full key shown only at creation */
  keyPrefix: string;
  createdAt: string;
  lastUsedAt?: string;
  rateLimitDaily: number;
}

export interface WebhookConfig {
  id: string;
  orgId: string;
  url: string;
  events: WebhookEvent[];
  healthThreshold?: number;       // trigger when health drops below this
  active: boolean;
  createdAt: string;
}

export type WebhookEvent =
  | "status_change"
  | "cascade"
  | "civic_update"
  | "health_alert";

// ─── ORG DASHBOARD ──────────────────────────────────────────────────────────

export interface OrgDashboardData {
  org: Org;
  teamHealthScores: Record<string, number>;
  crossTeamDeps: CrossTeamDependency[];
  bottlenecks: OrgBottleneck[];
  overallHealth: number;
  domainHealth: Record<string, number>;
}

export interface OrgBottleneck {
  promiseId: string;
  promiseBody: string;
  owningTeam: string;
  dependentCount: number;
  crossTeamDependentCount: number;
  status: PromiseStatus;
}

// ─── CIVIC ZOOM ─────────────────────────────────────────────────────────────

/** Represents a single level in the full NCTP zoom chain */
export interface ZoomChainLevel {
  level: "sub-promise" | "personal" | "team" | "org" | "civic-dependency" | "civic-dashboard" | "state";
  label: string;
  promiseId?: string;
  promiseBody?: string;
  status?: PromiseStatus;
  entityName?: string;            // team name, org name, dashboard title
}

// ─── PHASE 4 STATE EXTENSIONS ───────────────────────────────────────────────

export interface Phase4State {
  /** Org the user belongs to (if any) */
  org?: Org;
  /** API keys for the org */
  apiKeys?: ApiKey[];
  /** Webhook configurations */
  webhooks?: WebhookConfig[];
  /** Cached org dashboard data */
  orgDashboard?: OrgDashboardData;
}

// ─── PHASE 4 ACTIONS ────────────────────────────────────────────────────────

export type Phase4Action =
  // Org
  | { type: "CREATE_ORG"; org: Org }
  | { type: "JOIN_ORG"; orgId: string }
  | { type: "LEAVE_ORG" }
  | { type: "SET_ORG"; org: Org }
  | { type: "CREATE_ORG_PROMISE"; promise: OrgPromise }
  | { type: "UPDATE_ORG_PROMISE_STATUS"; promiseId: string; newStatus: PromiseStatus }

  // External dependencies
  | { type: "ADD_EXTERNAL_DEPENDENCY"; promiseId: string; dep: ExternalDependency }
  | { type: "REMOVE_EXTERNAL_DEPENDENCY"; promiseId: string; depLabel: string }
  | { type: "CIVIC_STATUS_UPDATE"; civicPromiseId: string; civicDashboard: string; newStatus: PromiseStatus }

  // Cross-team
  | { type: "CROSS_TEAM_DEPENDENCY"; fromPromiseId: string; toPromiseId: string }
  | { type: "ORG_CASCADE"; result: CascadeResult }

  // API management
  | { type: "ADD_API_KEY"; key: ApiKey }
  | { type: "REVOKE_API_KEY"; keyId: string }
  | { type: "ADD_WEBHOOK"; webhook: WebhookConfig }
  | { type: "REMOVE_WEBHOOK"; webhookId: string }
  | { type: "UPDATE_WEBHOOK"; webhookId: string; updates: Partial<WebhookConfig> }

  // Dashboard
  | { type: "SYNC_ORG_DASHBOARD"; dashboard: OrgDashboardData };
