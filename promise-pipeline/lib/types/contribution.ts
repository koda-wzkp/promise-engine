/**
 * Phase 3 — Anonymous Data Contribution types.
 *
 * Two contribution tiers:
 *   Level C (aggregate): monthly summary, 8 fields, no individual promise data
 *   Level A (schema):    per-transition records, 5 fields, batched 50+
 *
 * No user identity is ever transmitted — batch_id is a fresh random UUID
 * generated locally, never linked to a user account.
 */

// ─── CONTRIBUTION LEVEL ───────────────────────────────────────────────────────

/** C = aggregate only (default). A = 5-field schema transitions (opt-up). */
export type ContributionLevel = "C" | "A";

// ─── CONTRIBUTION STATE (persisted in localStorage) ──────────────────────────

export interface ContributionState {
  /** Whether the user has opted in to data contribution */
  enabled: boolean;
  /** Contribution tier selected by the user */
  level: ContributionLevel;
  /** ISO date the user first opted in */
  enabledAt: string | null;
  /** ISO date of the last batch successfully sent */
  lastSentAt: string | null;
  /** Batch IDs sent — for local audit log only, never linked to identity */
  sentBatchIds: string[];
  /** Whether the opt-in prompt has been shown (shown after 1 month of use) */
  promptShown: boolean;
  /** Whether the opt-up prompt (Level C → A) has been shown (after 3 months Level C) */
  optUpShown: boolean;
}

export const INITIAL_CONTRIBUTION_STATE: ContributionState = {
  enabled: false,
  level: "C",
  enabledAt: null,
  lastSentAt: null,
  sentBatchIds: [],
  promptShown: false,
  optUpShown: false,
};

// ─── LEVEL C: AGGREGATE CONTRIBUTION ─────────────────────────────────────────

/**
 * Monthly aggregate — computed locally, shipped once per month.
 * Contains NO individual promise data. NO timestamps. NO user identity.
 */
export interface AggregateContribution {
  /** Fresh random UUID generated locally each batch — never linked to user */
  batch_id: string;
  /** "YYYY-MM" — the calendar month this covers */
  period_month: string;
  /** Total promises created during the period */
  promise_count: number;
  /** Array of expectedK values across all promises this period */
  k_distribution: number[];
  /** Fraction of completed promises that were kept (0–1) */
  fulfillment_rate: number;
  /** Mean days from declared to resolution (kept or fossilized) */
  mean_dwell_days: number;
  /** verification_method → count */
  verification_mix: Record<string, number>;
  /** domain → count */
  domain_mix: Record<string, number>;
}

// ─── LEVEL A: SCHEMA CONTRIBUTION ────────────────────────────────────────────

/**
 * Per-transition record. Five fields. No promise text. No names. No dates.
 * Never sent in batches smaller than 50.
 */
export interface TransitionRecord {
  /** Promise domain category (e.g. "health", "work") */
  domain: string;
  /** Verification method label */
  verification_method: string;
  /** Days from declared to this transition */
  dwell_time_days: number;
  /** e.g. "declared_to_verified", "declared_to_violated" */
  status_transition: string;
  /** KRegime at time of transition: "composting" | "ecological" | "physics" */
  k_regime: string;
}

export interface SchemaContribution {
  /** Fresh random UUID generated locally each batch */
  batch_id: string;
  /** Always 50 or more records */
  transitions: TransitionRecord[];
}

// ─── UNION TYPE FOR API ───────────────────────────────────────────────────────

export type ContributionPayload = AggregateContribution | SchemaContribution;

export function isAggregateContribution(p: ContributionPayload): p is AggregateContribution {
  return "period_month" in p;
}

export function isSchemaContribution(p: ContributionPayload): p is SchemaContribution {
  return "transitions" in p;
}
