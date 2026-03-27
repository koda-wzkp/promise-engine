/**
 * Contribution Computation — Local-only aggregate + schema computation.
 *
 * All computation happens on-device. Only the result is sent.
 * Level C: monthly aggregate JSON (no PII, no promise text)
 * Level A: batched transition records (50+ per batch, five fields only)
 */

import type { GardenPromise } from "../types/garden";
import type {
  AggregateContribution,
  SchemaContribution,
  TransitionRecord,
  ContributionLevel,
} from "../types/phase3";

/**
 * Compute a Level C aggregate contribution from local promise data.
 * Returns null if not enough data for a meaningful aggregate.
 */
export function computeAggregate(
  promises: GardenPromise[],
  periodMonth: string
): AggregateContribution | null {
  if (promises.length < 3) return null;

  const completed = promises.filter(
    (p) => p.status === "verified" || p.status === "violated"
  );
  const fulfilled = completed.filter((p) => p.status === "verified");

  // k-distribution: count promises by number of children (nesting depth proxy)
  const kBuckets: number[] = [0, 0, 0, 0, 0]; // 0, 1, 2, 3, 4+
  for (const p of promises) {
    const k = Math.min(p.children.length, 4);
    kBuckets[k]++;
  }

  // Mean dwell time (days from declared → completed)
  const dwellDays = completed
    .filter((p) => p.createdAt && p.completedAt)
    .map((p) => {
      const start = new Date(p.createdAt).getTime();
      const end = new Date(p.completedAt!).getTime();
      return (end - start) / (1000 * 60 * 60 * 24);
    });
  const meanDwell = dwellDays.length > 0
    ? dwellDays.reduce((a, b) => a + b, 0) / dwellDays.length
    : 0;

  // Verification method mix
  const verificationMix: Record<string, number> = {};
  for (const p of promises) {
    const method = p.verification.method;
    verificationMix[method] = (verificationMix[method] ?? 0) + 1;
  }

  // Domain mix
  const domainMix: Record<string, number> = {};
  for (const p of promises) {
    domainMix[p.domain] = (domainMix[p.domain] ?? 0) + 1;
  }

  return {
    batch_id: `C-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    period_month: periodMonth,
    promise_count: promises.length,
    k_distribution: kBuckets,
    fulfillment_rate: completed.length > 0 ? fulfilled.length / completed.length : 0,
    mean_dwell_days: Math.round(meanDwell * 10) / 10,
    verification_mix: verificationMix,
    domain_mix: domainMix,
  };
}

/**
 * Compute Level A schema contribution — batched transition records.
 * Only includes completed promises. Returns null if fewer than 50 transitions.
 */
export function computeSchemaContribution(
  promises: GardenPromise[]
): SchemaContribution | null {
  const completed = promises.filter(
    (p) =>
      (p.status === "verified" || p.status === "violated") &&
      p.createdAt &&
      p.completedAt
  );

  if (completed.length < 50) return null;

  const transitions: TransitionRecord[] = completed.map((p) => {
    const dwellDays = Math.round(
      (new Date(p.completedAt!).getTime() - new Date(p.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // k regime based on children count
    const childCount = p.children.length;
    const kRegime = childCount === 0 ? "leaf" : childCount <= 2 ? "branch" : "root";

    return {
      domain: p.domain,
      verification_method: p.verification.method,
      dwell_time_days: dwellDays,
      status_transition: `declared->${p.status}`,
      k_regime: kRegime,
    };
  });

  return {
    batch_id: `A-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    transitions,
  };
}

/**
 * Determine what can be contributed at a given level.
 */
export function canContribute(
  promises: GardenPromise[],
  level: ContributionLevel
): { ready: boolean; reason?: string } {
  if (level === "C") {
    if (promises.length < 3) {
      return { ready: false, reason: "Need at least 3 promises for aggregate data" };
    }
    return { ready: true };
  }

  // Level A
  const completed = promises.filter(
    (p) => p.status === "verified" || p.status === "violated"
  );
  if (completed.length < 50) {
    return {
      ready: false,
      reason: `Need at least 50 completed promises for schema data (currently ${completed.length})`,
    };
  }
  return { ready: true };
}
