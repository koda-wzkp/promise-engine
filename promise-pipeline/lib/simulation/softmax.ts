/**
 * Softmax attention allocation for promise networks.
 *
 * k_i = softmax(a_i / τ) × K_total
 *
 * Based on empirical findings from MONA conservation test:
 *   K_total = 0.490 × n_promises (conserved budget)
 *   τ controls concentration vs diffusion of attention
 */

import { Promise as PromiseType } from "@/lib/types/promise";
import { STATUS_WEIGHTS } from "./scoring";

// MONA-derived constant: conserved attention budget per promise
export const ATTENTION_BETA = 0.490;

export interface AttentionAllocation {
  promiseId: string;
  rawWeight: number;    // a_i: the slider value (0.10 to 1.0)
  kEffective: number;   // output k after softmax
  kBaseline: number;    // k at default weights, τ=1.0
  kDelta: number;       // change from baseline k
}

export interface AllocationResult {
  allocations: AttentionAllocation[];
  kTotal: number;       // actual budget used (sum of clamped k_i)
  tau: number;          // temperature used
  networkHealth: number; // k-weighted health score
  healthDelta: number;  // change from baseline allocation health
}

/**
 * Numerically stable softmax with temperature scaling.
 */
export function softmax(weights: number[], tau: number = 1.0): number[] {
  const scaled = weights.map((w) => w / Math.max(tau, 0.001));
  const maxScaled = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - maxScaled));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / Math.max(sumExps, 1e-9));
}

/**
 * Default attention weights based on verification method.
 * These become the slider starting positions.
 */
export function defaultWeights(
  promises: PromiseType[]
): Record<string, number> {
  const methodWeights: Record<string, number> = {
    sensor: 0.90,
    audit: 0.85,
    filing: 0.70,
    benchmark: 0.75,
    "self-report": 0.45,
    none: 0.10,
  };
  const result: Record<string, number> = {};
  for (const p of promises) {
    result[p.id] = methodWeights[p.verification?.method ?? "none"] ?? 0.37;
  }
  return result;
}

/**
 * Allocate attention across promises using softmax.
 *
 * @param promises - array of promises with current status and verification method
 * @param weights - raw attention weights per promise (a_i), keyed by promise ID.
 *   Defaults to verification-method-based weights via defaultWeights().
 * @param tau - temperature parameter (default 1.0)
 * @param budgetOverride - total k budget; defaults to ATTENTION_BETA × n
 */
export function allocateAttention(
  promises: PromiseType[],
  weights?: Record<string, number>,
  tau: number = 1.0,
  budgetOverride?: number
): AllocationResult {
  const n = promises.length;
  if (n === 0) {
    return { allocations: [], kTotal: 0, tau, networkHealth: 0, healthDelta: 0 };
  }

  const kBudget = budgetOverride ?? ATTENTION_BETA * n;

  // Baseline allocation: default weights, τ=1.0
  const baseWeights = defaultWeights(promises);
  const baseRaw = promises.map((p) => baseWeights[p.id] ?? 0.37);
  const baseProbs = softmax(baseRaw, 1.0);
  const baseKs = baseProbs.map((s) =>
    Math.min(0.95, Math.max(0.05, s * kBudget))
  );
  const baseKSum = baseKs.reduce((a, b) => a + b, 0);
  const baseHealth =
    promises.reduce(
      (sum, p, i) => sum + STATUS_WEIGHTS[p.status] * baseKs[i],
      0
    ) / Math.max(baseKSum, 1e-9);

  // Current allocation
  const effectiveWeights = weights ?? baseWeights;
  const rawWeights = promises.map((p) => effectiveWeights[p.id] ?? 0.37);
  const probs = softmax(rawWeights, tau);
  const ks = probs.map((s) => Math.min(0.95, Math.max(0.05, s * kBudget)));
  const kSum = ks.reduce((a, b) => a + b, 0);

  // Network health: k-weighted average of status scores.
  // A promise with very low k contributes minimally to the health signal —
  // neglected promises are invisible risks, not confidence.
  const networkHealth =
    promises.reduce(
      (sum, p, i) => sum + STATUS_WEIGHTS[p.status] * ks[i],
      0
    ) / Math.max(kSum, 1e-9);

  const allocations: AttentionAllocation[] = promises.map((p, i) => ({
    promiseId: p.id,
    rawWeight: rawWeights[i],
    kEffective: ks[i],
    kBaseline: baseKs[i],
    kDelta: ks[i] - baseKs[i],
  }));

  return {
    allocations,
    kTotal: kSum,
    tau,
    networkHealth,
    healthDelta: networkHealth - baseHealth,
  };
}
