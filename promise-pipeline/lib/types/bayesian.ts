/**
 * Bayesian belief distribution for a single promise.
 *
 * Parameterized by the Weibull shape k from the Verification Paradox:
 *   k < 0.4  → composting regime (ecological, stagnating)
 *   k ≈ 0.5  → transitional (fragile)
 *   k > 0.7  → computing regime (physics-like, predictable)
 *
 * The named status (verified/declared/degraded/violated/unverifiable)
 * is DERIVED from this distribution, not the other way around.
 */

export interface BayesianBelief {
  pKept: number;            // P(promise is kept), 0 to 1
  k: number;                // Weibull shape parameter
  tau: number;              // Dwell time: periods since last state change
  lambdaScale: number;      // Weibull scale parameter (reviews)
  evidenceCount: number;    // Number of verification events observed
  lastEvidence: string | null; // ISO timestamp of most recent verification
}

/**
 * Network-level Bayesian metrics.
 */
export interface NetworkBelief {
  networkHealth: number;       // Mean p_kept across all promises (0-1)
  networkCertainty: number;    // Inverse of mean variance (0-1)
  regimeDistribution: {
    computing: number;         // Fraction of promises with k >= 0.70
    composting: number;        // Fraction of promises with k < 0.40
    transitional: number;      // The rest
  };
  verificationUrgency: {       // Promises where checking NOW has highest impact
    promiseId: string;
    urgencyScore: number;      // Higher = more urgent to verify
    urgencyType: UrgencyType;  // Classification driving the score
    reason: string;            // Human-readable explanation
  }[];
}

/**
 * Urgency type from the two-category urgency system.
 *
 * MONITOR_BOTTLENECK: High-dependency promises where failure cascades far.
 * PREVENT_COMPOSTING: Low-k promises approaching verification window closure.
 * STANDARD: Everything else.
 */
export type UrgencyType = "MONITOR_BOTTLENECK" | "PREVENT_COMPOSTING" | "STANDARD";

/**
 * Regime classification for display.
 */
export type DynamicalRegime = "computing" | "composting" | "transitional";
