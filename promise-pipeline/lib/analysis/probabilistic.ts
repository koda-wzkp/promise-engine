/**
 * Probabilistic / Bayesian Module — Heuristic CPTs and Probabilistic Cascade Simulation
 *
 * Bridges deterministic cascade simulation and full Bayesian inference.
 * Uses rule-based heuristic Conditional Probability Tables (CPTs) to produce
 * probability distributions over promise statuses given parent states.
 *
 * The probabilistic cascade result is usually less severe than the deterministic
 * result because it accounts for probability at each edge rather than assuming
 * worst-case propagation. Showing both communicates uncertainty to decision-makers.
 *
 * References:
 *   Pearl (2009). Causality (2nd ed.). Cambridge University Press.
 *   Koller & Friedman (2009). Probabilistic Graphical Models. MIT Press.
 */

import { Promise, PromiseStatus } from "../types/promise";
import {
  StatusDistribution,
  HeuristicCPTEntry,
  ProbabilisticCascadeResult,
} from "../types/analysis";

/** Status weights for expected health computation (matches scoring.ts). */
const STATUS_WEIGHTS: Record<PromiseStatus, number> = {
  verified: 100,
  declared: 60,
  degraded: 30,
  violated: 0,
  unverifiable: 20,
};

const ALL_STATUSES: PromiseStatus[] = [
  "verified",
  "declared",
  "degraded",
  "violated",
  "unverifiable",
];

/**
 * Create a StatusDistribution with `concentration` probability on `status`
 * and the remaining probability spread evenly across the other 4 statuses.
 */
function statusToDistribution(
  status: PromiseStatus,
  concentration: number
): StatusDistribution {
  const remaining = (1 - concentration) / (ALL_STATUSES.length - 1);
  const dist = {} as StatusDistribution;
  for (const s of ALL_STATUSES) {
    dist[s] = s === status ? concentration : remaining;
  }
  return dist;
}

/**
 * Renormalize a StatusDistribution so probabilities sum to 1.
 */
function normalize(dist: StatusDistribution): StatusDistribution {
  const total = ALL_STATUSES.reduce((sum, s) => sum + dist[s], 0);
  if (total === 0) return statusToDistribution("unverifiable", 1.0);
  const result = {} as StatusDistribution;
  for (const s of ALL_STATUSES) result[s] = dist[s] / total;
  return result;
}

/**
 * Build a reverse dependency map: for each promise ID, which promises depend on it.
 */
function buildReverseMap(promises: Promise[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const p of promises) {
    if (!map.has(p.id)) map.set(p.id, []);
    for (const depId of p.depends_on) {
      if (!map.has(depId)) map.set(depId, []);
      map.get(depId)!.push(p.id);
    }
  }
  return map;
}

/**
 * Compute heuristic Conditional Probability Tables for all promises.
 *
 * For each promise, generates a posterior StatusDistribution given the
 * actual statuses of its dependency parents. These are rule-based heuristics —
 * not learned from data — intended as a bridge to full Bayesian inference.
 */
export function computeHeuristicCPTs(
  promises: Promise[]
): Record<string, HeuristicCPTEntry> {
  const promiseMap = new Map(promises.map((p) => [p.id, p]));
  const result: Record<string, HeuristicCPTEntry> = {};

  for (const p of promises) {
    const parents = p.depends_on
      .map((id) => promiseMap.get(id))
      .filter(Boolean) as Promise[];

    const parentStates: Record<string, PromiseStatus> = {};
    for (const parent of parents) parentStates[parent.id] = parent.status;

    let posterior: StatusDistribution;

    if (parents.length === 0) {
      // No parents: distribution centered on own status at 80%
      posterior = statusToDistribution(p.status, 0.8);
    } else {
      // Classify parent health
      const violatedCount = parents.filter((par) => par.status === "violated").length;
      const degradedCount = parents.filter((par) => par.status === "degraded").length;
      const verifiedCount = parents.filter((par) => par.status === "verified").length;
      const declaredCount = parents.filter((par) => par.status === "declared").length;
      const total = parents.length;

      const violatedFraction = violatedCount / total;
      const degradedFraction = degradedCount / total;
      const healthyFraction = (verifiedCount + 0.5 * declaredCount) / total;

      if (violatedFraction > 0.5) {
        // Majority of parents violated → high probability of violation/degradation
        posterior = {
          verified: 0.02,
          declared: 0.03,
          degraded: 0.25,
          violated: 0.65,
          unverifiable: 0.05,
        };
      } else if (violatedFraction > 0) {
        // Some parents violated → significant degradation risk
        posterior = {
          verified: 0.05,
          declared: 0.10,
          degraded: 0.50,
          violated: 0.30,
          unverifiable: 0.05,
        };
      } else if (degradedFraction > 0.5) {
        // Majority degraded → likely degraded
        posterior = {
          verified: 0.10,
          declared: 0.10,
          degraded: 0.55,
          violated: 0.15,
          unverifiable: 0.10,
        };
      } else if (degradedFraction > 0) {
        // Some degraded → elevated risk
        posterior = {
          verified: 0.25,
          declared: 0.15,
          degraded: 0.35,
          violated: 0.10,
          unverifiable: 0.15,
        };
      } else if (healthyFraction > 0.8) {
        // Most parents healthy → center on own status with verification boost
        const base = statusToDistribution(p.status, 0.7);
        base.verified = Math.min(1, base.verified + 0.10);
        posterior = normalize(base);
      } else {
        // Mixed/uncertain → center on own status at 50%
        posterior = statusToDistribution(p.status, 0.5);
      }
    }

    // Find most likely status
    let mostLikelyStatus: PromiseStatus = "declared";
    let highestProb = 0;
    for (const s of ALL_STATUSES) {
      if (posterior[s] > highestProb) {
        highestProb = posterior[s];
        mostLikelyStatus = s;
      }
    }

    result[p.id] = {
      promiseId: p.id,
      posterior,
      parentStates,
      mostLikelyStatus,
      confidence: highestProb,
    };
  }

  return result;
}

/**
 * Simulate a probabilistic cascade given a hypothetical status change.
 *
 * 1. Creates a modified promise array with the query promise's status changed.
 * 2. Computes heuristic CPTs for the modified network.
 * 3. Identifies promises where the most likely status changed.
 * 4. Computes BFS cascade depth for each affected promise.
 * 5. Returns expected network health as a probability-weighted average.
 *
 * The probabilistic health estimate is usually less severe than the deterministic
 * result because it does not assume worst-case at every edge.
 */
export function simulateProbabilisticCascade(
  promises: Promise[],
  query: { promiseId: string; newStatus: PromiseStatus }
): ProbabilisticCascadeResult {
  // Original CPTs (before the change)
  const originalCPTs = computeHeuristicCPTs(promises);

  // Original network health (simple status-weight average)
  const originalNetworkHealth =
    promises.reduce((sum, p) => sum + STATUS_WEIGHTS[p.status], 0) / promises.length;

  // Create modified promise array
  const modifiedPromises: Promise[] = promises.map((p) =>
    p.id === query.promiseId ? { ...p, status: query.newStatus } : p
  );

  // Compute CPTs for modified network
  const modifiedCPTs = computeHeuristicCPTs(modifiedPromises);

  // Collect posteriors for all promises
  const posteriors: Record<string, StatusDistribution> = {};
  for (const [id, entry] of Object.entries(modifiedCPTs)) {
    posteriors[id] = entry.posterior;
  }

  // Build reverse map for BFS depth computation
  const reverseMap = buildReverseMap(promises);

  // Compute cascade depths via BFS from query promise
  const depths = new Map<string, number>();
  const queue: Array<{ id: string; depth: number }> = [
    { id: query.promiseId, depth: 0 },
  ];
  const visited = new Set<string>([query.promiseId]);

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    const dependents = reverseMap.get(id) || [];
    for (const dep of dependents) {
      if (!visited.has(dep)) {
        visited.add(dep);
        depths.set(dep, depth + 1);
        queue.push({ id: dep, depth: depth + 1 });
      }
    }
  }

  // Identify affected promises: most likely status changed from original
  const affectedPromises: ProbabilisticCascadeResult["affectedPromises"] = [];
  for (const p of promises) {
    if (p.id === query.promiseId) continue;
    const original = originalCPTs[p.id];
    const modified = modifiedCPTs[p.id];
    if (!original || !modified) continue;

    if (modified.mostLikelyStatus !== original.mostLikelyStatus) {
      affectedPromises.push({
        promiseId: p.id,
        originalStatus: p.status,
        mostLikelyNewStatus: modified.mostLikelyStatus,
        confidence: modified.confidence,
        cascadeDepth: depths.get(p.id) ?? 1,
      });
    }
  }

  // Expected network health: E[health] = Σ over promises of (Σ_s posterior[s] × weight[s])
  let expectedHealthSum = 0;
  for (const p of modifiedPromises) {
    const cpt = modifiedCPTs[p.id];
    if (!cpt) {
      expectedHealthSum += STATUS_WEIGHTS[p.status];
      continue;
    }
    let expectedContribution = 0;
    for (const s of ALL_STATUSES) {
      expectedContribution += cpt.posterior[s] * STATUS_WEIGHTS[s];
    }
    expectedHealthSum += expectedContribution;
  }
  const expectedNetworkHealth = expectedHealthSum / modifiedPromises.length;

  return {
    query,
    posteriors,
    affectedPromises,
    expectedNetworkHealth,
    originalNetworkHealth,
  };
}
