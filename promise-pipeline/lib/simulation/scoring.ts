import { Promise, PromiseStatus } from "../types/promise";
import { calculateBetweenness, countDependents } from "./graph";

export const STATUS_WEIGHTS: Record<PromiseStatus, number> = {
  verified: 100,
  declared: 60,
  degraded: 30,
  violated: 0,
  unverifiable: 20,
};

export const CERTAINTY_WEIGHTS: Record<PromiseStatus, number> = {
  verified: 1.0,
  violated: 0.9,
  degraded: 0.6,
  declared: 0.3,
  unverifiable: 0.0,
};

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const k = key(item);
    if (!groups[k]) groups[k] = [];
    groups[k].push(item);
  }
  return groups;
}

/**
 * Calculate the health score for an array of promises.
 */
export function healthScore(promises: Promise[]): number {
  if (promises.length === 0) return 0;
  return (
    promises.reduce((sum, p) => sum + STATUS_WEIGHTS[p.status], 0) /
    promises.length
  );
}

/**
 * Get status breakdown counts.
 */
export function statusBreakdown(
  promises: Promise[]
): Record<PromiseStatus, number> {
  const counts: Record<PromiseStatus, number> = {
    verified: 0,
    declared: 0,
    degraded: 0,
    violated: 0,
    unverifiable: 0,
  };
  for (const p of promises) {
    counts[p.status]++;
  }
  return counts;
}

/**
 * Calculate domain health scores.
 */
export function domainHealthScores(
  promises: Promise[]
): Record<string, number> {
  const byDomain = groupBy(promises, (p) => p.domain);
  const scores: Record<string, number> = {};
  for (const [domain, dps] of Object.entries(byDomain)) {
    scores[domain] = healthScore(dps);
  }
  return scores;
}

/**
 * Calculate agent reliability scores.
 */
export function agentReliabilityScores(
  promises: Promise[]
): Record<string, { score: number; total: number }> {
  const byAgent = groupBy(promises, (p) => p.promiser);
  const scores: Record<string, { score: number; total: number }> = {};
  for (const [agent, aps] of Object.entries(byAgent)) {
    scores[agent] = { score: healthScore(aps), total: aps.length };
  }
  return scores;
}

/**
 * Generate a narrative grade explanation.
 */
export function generateGradeExplanation(
  promises: Promise[],
  grade: string
): string {
  const breakdown = statusBreakdown(promises);
  const total = promises.length;
  const verifiedPct = Math.round((breakdown.verified / total) * 100);
  const violatedPct = Math.round((breakdown.violated / total) * 100);
  const unverifiablePct = Math.round((breakdown.unverifiable / total) * 100);

  const parts: string[] = [];

  if (verifiedPct > 50) {
    parts.push(`${verifiedPct}% of promises are verified, indicating strong follow-through`);
  }
  if (violatedPct > 0) {
    parts.push(
      `${breakdown.violated} promise${breakdown.violated !== 1 ? "s" : ""} violated`
    );
  }
  if (unverifiablePct > 10) {
    parts.push(
      `${breakdown.unverifiable} promise${breakdown.unverifiable !== 1 ? "s" : ""} lack verification mechanisms`
    );
  }
  if (breakdown.degraded > 0) {
    parts.push(
      `${breakdown.degraded} promise${breakdown.degraded !== 1 ? "s are" : " is"} degraded`
    );
  }

  return `Grade: ${grade}. ${parts.join(". ")}.`;
}

/**
 * Calculate network entropy — how much uncertainty exists in the network.
 *
 * Returns 0-100 where:
 *   0 = complete certainty (all promises verified or confirmed violated)
 *   100 = complete uncertainty (all promises unverifiable)
 *
 * This is distinct from health: a network can be healthy but uncertain
 * (many declared promises not yet tested) or unhealthy but certain
 * (many confirmed violations).
 */
export function calculateNetworkEntropy(promises: Promise[]): {
  overall: number;
  byDomain: Record<string, number>;
  byStatus: Record<PromiseStatus, number>;
  verificationCoverage: number;
} {
  if (promises.length === 0)
    return {
      overall: 0,
      byDomain: {},
      byStatus: {
        verified: 0,
        declared: 0,
        degraded: 0,
        violated: 0,
        unverifiable: 0,
      },
      verificationCoverage: 0,
    };

  // Single pass: accumulate uncertainty, domain groups, status counts, verification count
  const domainGroups: Record<string, Promise[]> = {};
  const byStatus: Record<PromiseStatus, number> = {
    verified: 0, declared: 0, degraded: 0, violated: 0, unverifiable: 0,
  };
  let totalUncertainty = 0;
  let withVerification = 0;

  for (const p of promises) {
    totalUncertainty += 1.0 - CERTAINTY_WEIGHTS[p.status];
    byStatus[p.status]++;
    if (p.verification.method !== "none") withVerification++;
    if (!domainGroups[p.domain]) domainGroups[p.domain] = [];
    domainGroups[p.domain].push(p);
  }

  const overall = (totalUncertainty / promises.length) * 100;

  // By domain
  const byDomain: Record<string, number> = {};
  for (const [domain, group] of Object.entries(domainGroups)) {
    const domUncertainty = group.reduce(
      (sum, p) => sum + (1.0 - CERTAINTY_WEIGHTS[p.status]), 0
    );
    byDomain[domain] = (domUncertainty / group.length) * 100;
  }

  const verificationCoverage = (withVerification / promises.length) * 100;

  return { overall, byDomain, byStatus, verificationCoverage };
}

/**
 * A point in the entropy time series.
 */
export interface EntropyTimePoint {
  date: string;           // ISO date
  label?: string;         // optional event label: "U.S. Withdrawal"
  entropy: number;        // 0-100
  healthScore: number;    // 0-100
  verificationCoverage: number; // % with functioning verification
  promiseCount: number;
}

/**
 * Calculate entropy at each historical snapshot.
 *
 * Verification coverage accounts for verification dependencies:
 * a promise with method !== "none" but whose dependsOnPromise is
 * violated counts as effectively unverified.
 */
export function calculateEntropyTimeSeries(
  snapshots: { date: string; label?: string; promises: Promise[] }[],
): EntropyTimePoint[] {
  return snapshots.map(snapshot => {
    const entropy = calculateNetworkEntropy(snapshot.promises);
    const health = healthScore(snapshot.promises);

    // Build lookup map for O(1) access
    const promiseMap = new Map(snapshot.promises.map(p => [p.id, p]));

    const effectivelyVerified = snapshot.promises.filter(p => {
      if (p.verification.method === "none") return false;
      if (!p.verification.dependsOnPromise) return true;
      const verifier = promiseMap.get(p.verification.dependsOnPromise);
      if (!verifier) return true;
      return verifier.status !== "violated" && verifier.status !== "unverifiable";
    }).length;

    return {
      date: snapshot.date,
      label: snapshot.label,
      entropy: entropy.overall,
      healthScore: health,
      verificationCoverage: (effectivelyVerified / snapshot.promises.length) * 100,
      promiseCount: snapshot.promises.length,
    };
  });
}

/**
 * Identify high-leverage promises using both dependent count
 * and betweenness centrality.
 *
 * Returns promises sorted by a combined leverage score:
 *   leverage = 0.5 * normalizedDependentCount + 0.5 * betweennessCentrality
 *
 * This catches both "hub" nodes (many dependents) and "bridge" nodes
 * (few dependents but critical structural position).
 */
export function identifyHighLeverageNodes(
  promises: Promise[],
  precomputedBetweenness?: Record<string, number>,
): {
  promiseId: string;
  dependentCount: number;
  betweenness: number;
  leverage: number;
}[] {
  const betweenness = precomputedBetweenness ?? calculateBetweenness(promises);
  const dependentCounts = countDependents(promises);
  const maxDeps = Math.max(...dependentCounts.values(), 1);

  return promises
    .map((p) => ({
      promiseId: p.id,
      dependentCount: dependentCounts.get(p.id) || 0,
      betweenness: betweenness[p.id] || 0,
      leverage:
        0.5 * (((dependentCounts.get(p.id) || 0)) / maxDeps) +
        0.5 * (betweenness[p.id] || 0),
    }))
    .sort((a, b) => b.leverage - a.leverage);
}
