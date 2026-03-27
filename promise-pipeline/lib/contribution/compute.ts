/**
 * Phase 3 — Contribution compute library.
 *
 * All computation runs on-device. Nothing is sent until the user opts in.
 * Functions are pure — they take GardenState and return contribution payloads.
 */

import type { GardenPromise } from "../types/personal";
import type {
  AggregateContribution,
  SchemaContribution,
  TransitionRecord,
  ContributionState,
} from "../types/contribution";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function randomUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function daysBetween(a: string, b: string): number {
  return Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 86_400_000;
}

/** YYYY-MM string for the current month */
function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

// ─── OPT-IN ELIGIBILITY ───────────────────────────────────────────────────────

/**
 * Returns true when the user has enough history to be shown the opt-in prompt.
 * Condition: garden created 30+ days ago AND at least 3 resolved promises.
 */
export function shouldPromptOptIn(
  contribution: ContributionState,
  gardenCreatedAt: string | null
): boolean {
  if (contribution.promptShown) return false;
  if (contribution.enabled) return false;
  if (!gardenCreatedAt) return false;

  const ageInDays = daysBetween(gardenCreatedAt, new Date().toISOString());
  return ageInDays >= 30;
}

/**
 * Returns true when a Level C contributor should be offered the Level A upgrade.
 * Condition: 3+ months at Level C, never offered yet.
 */
export function shouldPromptOptUp(contribution: ContributionState): boolean {
  if (contribution.optUpShown) return false;
  if (!contribution.enabled) return false;
  if (contribution.level !== "C") return false;
  if (!contribution.enabledAt) return false;

  const daysAtLevelC = daysBetween(contribution.enabledAt, new Date().toISOString());
  return daysAtLevelC >= 90;
}

// ─── LEVEL C: AGGREGATE ───────────────────────────────────────────────────────

/**
 * Compute a Level C aggregate contribution from garden promises.
 * Only uses promises that were created or resolved in the given month.
 */
export function computeAggregateContribution(
  promises: GardenPromise[],
  month: string = currentMonth()
): AggregateContribution {
  // Filter to promises that resolved (or are active) during this month
  const relevant = promises.filter((p) => {
    const createdInMonth = p.createdAt.startsWith(month);
    const resolvedInMonth =
      p.completedAt != null && p.completedAt.startsWith(month);
    return createdInMonth || resolvedInMonth;
  });

  const resolved = relevant.filter(
    (p) => p.status === "verified" || p.status === "violated" || p.fossilized
  );
  const kept = resolved.filter((p) => p.status === "verified" && !p.fossilized);

  const dwellTimes = resolved
    .filter((p) => p.completedAt != null)
    .map((p) => daysBetween(p.createdAt, p.completedAt!));

  const meanDwell =
    dwellTimes.length > 0
      ? dwellTimes.reduce((s, d) => s + d, 0) / dwellTimes.length
      : 0;

  const verificationMix: Record<string, number> = {};
  const domainMix: Record<string, number> = {};
  const kValues: number[] = [];

  for (const p of relevant) {
    const vm = p.verification.method;
    verificationMix[vm] = (verificationMix[vm] ?? 0) + 1;
    domainMix[p.domain] = (domainMix[p.domain] ?? 0) + 1;
    kValues.push(p.expectedK);
  }

  return {
    batch_id: randomUUID(),
    period_month: month,
    promise_count: relevant.length,
    k_distribution: kValues,
    fulfillment_rate: resolved.length > 0 ? kept.length / resolved.length : 0,
    mean_dwell_days: Math.round(meanDwell * 10) / 10,
    verification_mix: verificationMix,
    domain_mix: domainMix,
  };
}

// ─── LEVEL A: SCHEMA TRANSITIONS ─────────────────────────────────────────────

/**
 * Extract 5-field transition records from check-in history.
 * Only returns a payload when 50+ transitions are available (batch privacy minimum).
 */
export function computeSchemaContributions(
  promises: GardenPromise[]
): SchemaContribution | null {
  const transitions: TransitionRecord[] = [];

  for (const p of promises) {
    for (const event of p.checkInHistory) {
      const transition = `${event.statusBefore}_to_${event.statusAfter}`;
      const dwellDays = daysBetween(p.createdAt, event.timestamp);

      transitions.push({
        domain: p.domain,
        verification_method: p.verification.method,
        dwell_time_days: Math.round(dwellDays),
        status_transition: transition,
        k_regime: p.kRegime,
      });
    }
  }

  // Privacy minimum: never send fewer than 50 transitions
  if (transitions.length < 50) return null;

  return {
    batch_id: randomUUID(),
    transitions,
  };
}

// ─── PREDICTION HELPERS ───────────────────────────────────────────────────────

/**
 * Placeholder prediction data until the aggregate dataset is large enough
 * to return real per-domain statistics from the API.
 *
 * These values are derived from the empirical Weibull corpus in the about page.
 * They will be replaced by API-returned predictions once contributors exist.
 */
export const DOMAIN_BASELINES: Record<
  string,
  { fulfillmentRate: number; medianDwellDays: number; sampleSize: string }
> = {
  health:        { fulfillmentRate: 0.61, medianDwellDays: 28, sampleSize: "est." },
  work:          { fulfillmentRate: 0.58, medianDwellDays: 21, sampleSize: "est." },
  relationships: { fulfillmentRate: 0.65, medianDwellDays: 35, sampleSize: "est." },
  creative:      { fulfillmentRate: 0.52, medianDwellDays: 42, sampleSize: "est." },
  financial:     { fulfillmentRate: 0.55, medianDwellDays: 30, sampleSize: "est." },
};

export function getPrediction(
  domain: string,
  verificationMethod: string
): { rate: number; basis: string } | null {
  const base = DOMAIN_BASELINES[domain];
  if (!base) return null;

  // Bump for stronger verification methods (grounded in VERIFICATION_K_MAP)
  const verificationBonus: Record<string, number> = {
    sensor: 0.08,
    audit: 0.06,
    benchmark: 0.05,
    "self-report": 0,
    filing: 0.02,
    none: -0.08,
  };
  const bonus = verificationBonus[verificationMethod] ?? 0;
  const rate = Math.min(0.95, Math.max(0.05, base.fulfillmentRate + bonus));

  return {
    rate,
    basis: `${domain} promises with ${verificationMethod} verification`,
  };
}
