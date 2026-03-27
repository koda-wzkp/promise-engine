import { Promise } from "../types/promise";
import { BayesianBelief } from "../types/bayesian";
import { WhatIfQuery } from "../types/simulation";
import { computeBelief } from "./bayesian";

/**
 * Bayesian What-If simulation.
 *
 * Instead of BFS propagation with categorical degradation, this runs
 * mean-field iteration on the promise network:
 *
 *   For each promise i:
 *     p_i ← sigmoid(β · Σⱼ W(i,j) · p_j + β · h(i))
 *
 * This is the Promise Field Equation (Nolan-Finkel, 2026b).
 *
 * Phase 1: runs ALONGSIDE the deterministic cascade, not replacing it.
 * The UI shows both results — categorical cascade (existing) and
 * Bayesian probability shifts (new).
 *
 * The deterministic cascade is a special case: when β → ∞,
 * sigmoid becomes a step function and mean-field reduces to BFS
 * with threshold degradation — exactly simulateCascade().
 */

export interface BayesianCascadeResult {
  query: WhatIfQuery;
  originalBeliefs: Record<string, BayesianBelief>;
  updatedBeliefs: Record<string, BayesianBelief>;
  probabilityShifts: {
    promiseId: string;
    originalPKept: number;
    newPKept: number;
    shift: number;          // Signed: negative = degraded
    regime: string;
  }[];
  networkHealthBefore: number;
  networkHealthAfter: number;
  networkCertaintyBefore: number;
  networkCertaintyAfter: number;
  convergenceIterations: number;
}

/**
 * Run Bayesian cascade simulation.
 *
 * @param promises - The full promise array
 * @param query - Which promise to change and to what status
 * @param beta - Inverse temperature. Higher = more deterministic.
 *   Default 0.5: moderate coupling, allows probability to propagate
 *   but doesn't produce threshold flips at depth > 2.
 *   Use beta=2.0 to approximate the deterministic cascade.
 *   Use beta=0.1 for weak coupling (evidence dominates network effects).
 */
export function simulateBayesianCascade(
  promises: Promise[],
  query: WhatIfQuery,
  beta: number = 0.5,
  maxIterations: number = 30,
  convergenceThreshold: number = 0.001
): BayesianCascadeResult {
  const n = promises.length;

  // Build index
  const idToIndex: Record<string, number> = {};
  promises.forEach((p, i) => { idToIndex[p.id] = i; });

  // Compute original beliefs
  const originalBeliefs: Record<string, BayesianBelief> = {};
  const p = new Float64Array(n); // Current probability vector
  promises.forEach((promise, i) => {
    const belief = computeBelief(promise);
    originalBeliefs[promise.id] = belief;
    p[i] = belief.pKept;
  });

  // Build coupling matrix (sparse — use adjacency list)
  // W[i][j] > 0 means promise j supports promise i
  // (j is in i's depends_on)
  const dependsOnEdges: { target: number; source: number; weight: number }[] = [];
  promises.forEach((promise, i) => {
    for (const depId of promise.depends_on) {
      const j = idToIndex[depId];
      if (j !== undefined) {
        // Weight: 1.0 for all edges in Phase 1.
        // Phase 2: learn weights from MONA co-occurrence data.
        dependsOnEdges.push({ target: i, source: j, weight: 1.0 });
      }
    }
  });

  // Build external field h(i) from verification method strength
  const h = new Float64Array(n);
  const METHOD_STRENGTH: Record<string, number> = {
    sensor: 1.0,
    benchmark: 0.8,
    audit: 0.6,
    filing: 0.4,
    "self-report": 0.2,
    none: 0.0,
  };
  promises.forEach((promise, i) => {
    h[i] = METHOD_STRENGTH[promise.verification.method] ?? 0.2;
  });

  // Apply the intervention: change the queried promise's belief
  const queryIndex = idToIndex[query.promiseId];
  if (queryIndex === undefined) {
    throw new Error(`Promise ${query.promiseId} not found`);
  }

  // Map the new status to a p_kept value
  const STATUS_TO_P: Record<string, number> = {
    verified: 0.92,
    declared: 0.55,
    degraded: 0.25,
    violated: 0.05,
    unverifiable: 0.50,
  };
  p[queryIndex] = STATUS_TO_P[query.newStatus] ?? 0.50;

  // Mean-field iteration
  let iterations = 0;
  for (let iter = 0; iter < maxIterations; iter++) {
    iterations = iter + 1;
    let maxChange = 0;

    for (let i = 0; i < n; i++) {
      if (i === queryIndex) continue; // Don't update the intervention target

      // Coupling term: Σⱼ W(i,j) · p_j
      let coupling = 0;
      for (const edge of dependsOnEdges) {
        if (edge.target === i) {
          coupling += edge.weight * p[edge.source];
        }
      }

      // Normalize coupling by number of dependencies
      const depCount = dependsOnEdges.filter(e => e.target === i).length;
      if (depCount > 0) {
        coupling /= depCount;
      }

      // Sigmoid update: p_i ← σ(β · (coupling + h(i)))
      const logit = beta * (coupling + h[i]);
      const newP = 1.0 / (1.0 + Math.exp(-logit));

      // Blend: don't let network effects completely override evidence
      // 70% original belief, 30% network-influenced
      // This prevents wild swings from single interventions
      const blended = 0.70 * originalBeliefs[promises[i].id].pKept
                    + 0.30 * newP;

      const change = Math.abs(blended - p[i]);
      if (change > maxChange) maxChange = change;
      p[i] = blended;
    }

    if (maxChange < convergenceThreshold) break;
  }

  // Build results
  const updatedBeliefs: Record<string, BayesianBelief> = {};
  const probabilityShifts: BayesianCascadeResult["probabilityShifts"] = [];

  promises.forEach((promise, i) => {
    const original = originalBeliefs[promise.id];
    const updated: BayesianBelief = {
      ...original,
      pKept: p[i],
    };
    updatedBeliefs[promise.id] = updated;

    const shift = p[i] - original.pKept;
    if (Math.abs(shift) > 0.01) { // Only report meaningful shifts
      probabilityShifts.push({
        promiseId: promise.id,
        originalPKept: original.pKept,
        newPKept: p[i],
        shift,
        regime: original.k >= 1.30 ? "computing"
              : original.k < 0.50 ? "composting"
              : "transitional",
      });
    }
  });

  probabilityShifts.sort((a, b) => Math.abs(b.shift) - Math.abs(a.shift));

  const networkHealthBefore = Object.values(originalBeliefs)
    .reduce((sum, b) => sum + b.pKept, 0) / n;
  const networkHealthAfter = promises.reduce((sum, _, i) => sum + p[i], 0) / n;

  // Certainty: higher when beliefs are spread away from 0.5
  const certBefore = Object.values(originalBeliefs)
    .reduce((sum, b) => sum + Math.abs(b.pKept - 0.5), 0) / n;
  const certAfter = promises.reduce((sum, _, i) =>
    sum + Math.abs(p[i] - 0.5), 0) / n;

  return {
    query,
    originalBeliefs,
    updatedBeliefs,
    probabilityShifts,
    networkHealthBefore,
    networkHealthAfter,
    networkCertaintyBefore: certBefore * 2, // Scale to 0-1
    networkCertaintyAfter: certAfter * 2,
    convergenceIterations: iterations,
  };
}
