import { Promise, PromiseStatus, VerificationMethod } from "../types/promise";
import { BayesianBelief, NetworkBelief, DynamicalRegime } from "../types/bayesian";

// ─── EMPIRICAL k VALUES ─────────────────────────────────────
// Source: The Verification Paradox, Table 1 (Section 3.1)
// Mapped from MONA verification structures to Promise Pipeline
// verification.method values.
//
// The mapping logic:
//   "none"        → No verification exists at all. Deeper ecology than
//                   even MONA's Declared SB (k=0.36). Use k=0.25.
//   "self-report" → Promiser evaluates own fulfillment. Equivalent to
//                   MONA Declared (promiser claims compliance, no
//                   independent check). k=0.37.
//   "filing"      → Structured promiser-submitted data (PUC filings,
//                   SEC reports). Like MONA's SPC Declared — structured
//                   but not independently verified. k=0.43.
//   "audit"       → Independent third-party assessment. This IS the
//                   promisee verification event. Equivalent to MONA's
//                   Met regime where assessment has occurred. k=0.66.
//   "benchmark"   → Standardized threshold evaluation. Slightly stronger
//                   than audit — the standard is external and reproducible.
//                   k=0.72.
//   "sensor"      → Automated independent measurement. The promiser is
//                   cut out of the verification loop entirely. Closest
//                   to MONA's Not-met regime (k=0.90) where outcomes
//                   are physics-like and stochastic. k=0.85.

const VERIFICATION_K_MAP: Record<VerificationMethod, number> = {
  none: 0.25,
  "self-report": 0.37,
  filing: 0.43,
  audit: 0.66,
  benchmark: 0.72,
  sensor: 0.85,
};

// ─── STATUS k MODIFIERS ─────────────────────────────────────
// Once a promise has been assessed (status ≠ declared, ≠ unverifiable),
// its k shifts to reflect the assessed regime. This is the assessment
// boundary from Section 3.1.
//
// The status provides a FLOOR on k — assessment has occurred, so the
// promise is at least partially in the computing regime regardless
// of the underlying verification method.

const STATUS_K_FLOOR: Record<PromiseStatus, number | null> = {
  declared: null,        // No floor — use verification method k directly
  verified: 0.66,        // Assessment happened, physics regime minimum
  degraded: 0.52,        // Fragile regime (= Met-with-delay from MONA)
  violated: 0.90,        // Known failure, constant hazard
  unverifiable: null,    // No floor — deep ecology
};

// ─── STATUS → p_kept PRIORS ─────────────────────────────────
// Initial belief from the categorical status.
// These come from the Verification Paradox Table 1 mapping:
//   verified    → high confidence of fulfillment
//   declared    → stated but untested, moderate prior
//   degraded    → evidence of slippage
//   violated    → evidence of failure
//   unverifiable → maximum entropy (0.5, we genuinely don't know)

const STATUS_P_KEPT: Record<PromiseStatus, number> = {
  verified: 0.88,
  declared: 0.55,
  degraded: 0.32,
  violated: 0.08,
  unverifiable: 0.50,
};

/**
 * Compute the Bayesian belief for a single promise.
 *
 * This is a PURE FUNCTION — it derives the belief from the promise's
 * existing fields (status, verification.method) without modifying
 * the promise or requiring any additional stored state.
 *
 * Phase 1: belief is computed on render, not stored.
 * Phase 2: belief is stored and updated incrementally.
 */
export function computeBelief(promise: Promise): BayesianBelief {
  // Base k from verification method
  const methodK = VERIFICATION_K_MAP[promise.verification.method] ?? 0.37;

  // Status floor (if promise has been assessed)
  const statusFloor = STATUS_K_FLOOR[promise.status];

  // Effective k: max of method k and status floor
  // If no floor (declared/unverifiable), use method k directly
  const effectiveK = statusFloor !== null
    ? Math.max(methodK, statusFloor)
    : methodK;

  // p_kept from status
  const basePKept = STATUS_P_KEPT[promise.status] ?? 0.50;

  // Adjust p_kept by progress if available
  let pKept = basePKept;
  if (promise.progress !== undefined && promise.required !== undefined
      && promise.required > 0) {
    // Blend status prior with progress evidence
    const progressRatio = Math.min(promise.progress / promise.required, 1.0);
    // Weight: 60% status prior, 40% progress evidence
    pKept = 0.6 * basePKept + 0.4 * progressRatio;
  }

  // Clamp to [0.01, 0.99]
  pKept = Math.max(0.01, Math.min(0.99, pKept));

  // Evidence count: verified/violated = at least 1 assessment event
  // declared/unverifiable = 0
  const evidenceCount =
    promise.status === "verified" || promise.status === "violated" ? 2
    : promise.status === "degraded" ? 1
    : 0;

  // Tau: estimate from status
  // Phase 1: rough estimate. Phase 2: actual time series.
  let tau = 0;
  if (promise.status === "declared" || promise.status === "unverifiable") {
    // Unassessed promises accumulate tau
    // Use a default of 3 (moderate stagnation) for Phase 1
    tau = 3;
  }

  // Lambda: use the empirical values from the paper
  // Declared λ=1.5, Met λ=15.9, Not-met λ=21.6, Met-delay λ=6.2
  const lambdaMap: Record<PromiseStatus, number> = {
    declared: 1.5,
    verified: 15.9,
    degraded: 6.2,
    violated: 21.6,
    unverifiable: 1.5,
  };
  const lambdaScale = lambdaMap[promise.status] ?? 1.5;

  return {
    pKept,
    k: effectiveK,
    tau,
    lambdaScale,
    evidenceCount,
    lastEvidence: null, // Phase 2: populated from verification events
  };
}

/**
 * Compute the instantaneous hazard rate.
 *
 * h(tau) = (k / lambda) * (tau / lambda)^(k-1)
 *
 * When k < 1: hazard DECREASES with tau (composting)
 * When k = 1: hazard is CONSTANT (physics)
 * When k > 1: hazard INCREASES (pressure building)
 */
export function hazardRate(belief: BayesianBelief): number {
  if (belief.tau === 0) {
    return belief.k / belief.lambdaScale;
  }
  return (belief.k / belief.lambdaScale)
    * Math.pow(belief.tau / belief.lambdaScale, belief.k - 1);
}

/**
 * Compute the Beta distribution variance for uncertainty quantification.
 *
 * Models belief as Beta(alpha, beta) where:
 *   alpha = evidenceCount * pKept + 1 (prior)
 *   beta  = evidenceCount * (1 - pKept) + 1 (prior)
 *
 * High variance = uncertain (declared territory)
 * Low variance + high pKept = confident fulfillment (verified)
 * Low variance + low pKept = confident failure (violated)
 */
export function beliefVariance(belief: BayesianBelief): number {
  const a = belief.evidenceCount * belief.pKept + 1.0;
  const b = belief.evidenceCount * (1.0 - belief.pKept) + 1.0;
  const total = a + b;
  return (a * b) / (total * total * (total + 1));
}

/**
 * Classify which dynamical regime a promise is in.
 */
export function classifyRegime(belief: BayesianBelief): DynamicalRegime {
  if (belief.k >= 0.70) return "computing";
  if (belief.k < 0.40) return "composting";
  return "transitional";
}

/**
 * Compute the marginal value of verifying this promise NOW.
 *
 * High urgency = promise is in a recoverable composting state where
 * the next verification event would shift it into computing regime.
 *
 * The score is highest for promises that:
 * - Have moderate k (0.25-0.55) — still recoverable
 * - Have high variance — uncertain state
 * - Have tau > 1 — have been unverified long enough to matter
 * - Have dependents — verification has network effects
 *
 * Returns a score from 0 to 1. Higher = more urgent.
 */
export function verificationUrgency(
  belief: BayesianBelief,
  dependentCount: number
): number {
  const variance = beliefVariance(belief);

  // Recoverable? k between 0.25 and 0.55 is the sweet spot
  const recoverability =
    belief.k >= 0.25 && belief.k <= 0.55
      ? 1.0 - Math.abs(belief.k - 0.40) / 0.15 // Peak at k=0.40
      : 0.0;

  // Uncertainty factor
  const uncertaintyFactor = Math.min(variance * 10, 1.0);

  // Dwell time factor (diminishing returns after tau=5)
  const dwellFactor = Math.min(belief.tau / 5, 1.0);

  // Network leverage (more dependents = more urgent)
  const leverageFactor = Math.min(dependentCount / 5, 1.0);

  // Composite score
  const raw = recoverability * 0.35
    + uncertaintyFactor * 0.25
    + dwellFactor * 0.20
    + leverageFactor * 0.20;

  return Math.max(0, Math.min(1, raw));
}

/**
 * Generate human-readable reason for urgency.
 */
export function urgencyReason(
  promise: Promise,
  belief: BayesianBelief,
  urgencyScore: number,
  dependentCount: number
): string {
  // Suppress unused variable warning — promise available for Phase 2 enrichment
  void promise;

  if (urgencyScore < 0.2) return "Low urgency — stable or already assessed.";

  const regime = classifyRegime(belief);
  const parts: string[] = [];

  if (regime === "composting") {
    parts.push(`Composting (k=${belief.k.toFixed(2)}) — stagnating without verification`);
  } else if (regime === "transitional") {
    parts.push(`Transitional (k=${belief.k.toFixed(2)}) — approaching composting threshold`);
  }

  if (belief.tau > 2) {
    parts.push(`${belief.tau} review periods without assessment`);
  }

  if (dependentCount > 0) {
    parts.push(`${dependentCount} downstream promise${dependentCount > 1 ? "s" : ""} depend on this`);
  }

  const variance = beliefVariance(belief);
  if (variance > 0.15) {
    parts.push("High uncertainty — outcome unknown");
  }

  return parts.join(". ") + ".";
}

/**
 * Compute network-level Bayesian metrics.
 *
 * This produces the aggregate metrics displayed in the Summary tab:
 * - Network health (mean pKept)
 * - Network certainty (inverse of mean variance)
 * - Regime distribution (what fraction of promises are in each regime)
 * - Top 5 verification urgency targets
 */
export function computeNetworkBelief(
  promises: Promise[],
  dependentCounts: Record<string, number>
): NetworkBelief {
  const beliefs = promises.map(computeBelief);
  const n = beliefs.length;

  if (n === 0) {
    return {
      networkHealth: 0,
      networkCertainty: 0,
      regimeDistribution: { computing: 0, composting: 0, transitional: 0 },
      verificationUrgency: [],
    };
  }

  // Network health: mean pKept
  const networkHealth = beliefs.reduce((sum, b) => sum + b.pKept, 0) / n;

  // Network certainty: 1 - mean(variance) scaled to 0-1
  const meanVariance = beliefs.reduce((sum, b) => sum + beliefVariance(b), 0) / n;
  const networkCertainty = Math.max(0, Math.min(1, 1.0 - meanVariance * 10));

  // Regime distribution
  const computing = beliefs.filter(b => b.k >= 0.70).length / n;
  const composting = beliefs.filter(b => b.k < 0.40).length / n;
  const transitional = 1.0 - computing - composting;

  // Verification urgency — top 5
  const urgencyScores = promises.map((p, i) => {
    const depCount = dependentCounts[p.id] ?? 0;
    const score = verificationUrgency(beliefs[i], depCount);
    const reason = urgencyReason(p, beliefs[i], score, depCount);
    return { promiseId: p.id, urgencyScore: score, reason };
  });

  urgencyScores.sort((a, b) => b.urgencyScore - a.urgencyScore);
  const topUrgency = urgencyScores.slice(0, 5).filter(u => u.urgencyScore > 0.1);

  return {
    networkHealth,
    networkCertainty,
    regimeDistribution: { computing, composting, transitional },
    verificationUrgency: topUrgency,
  };
}
