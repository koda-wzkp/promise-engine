/**
 * Lindblad master equation projection for promise state evolution.
 *
 * Structurally isomorphic to the Lindblad equation governing open quantum
 * systems (Lindblad, 1976). Validated on 67,027 IMF MONA observations
 * across 5 cohorts (R² = 0.910–0.965).
 *
 * The Hamiltonian H describes the internal energy landscape (which promise
 * states are stable). The Lindblad operators describe transition channels
 * (observation, decay, recovery). The rates γ are empirically fitted.
 *
 * Since quantum discord ≈ 0 (Test 6), the off-diagonal coherences vanish
 * and the full Lindblad reduces to the Pauli master equation on the diagonal:
 *
 *   dP_d/dt = -(γ_met + γ_notmet) · P_d + γ_decay · P_m + γ_recovery · P_n
 *   dP_m/dt = γ_met · P_d - γ_decay · P_m
 *   dP_n/dt = γ_notmet · P_d - γ_recovery · P_n
 *
 * This runs client-side using Euler integration. The state space is 3×3
 * so it's fast even on mobile.
 */

import lindbladParams from "@/parameters/lindblad_params.json";

export interface LindbladProjection {
  timePoints: number[]; // review cycles
  pDeclared: number[]; // P(still in current state) at each time
  pMet: number[]; // P(resolved successfully)
  pNotMet: number[]; // P(failed)
  crossoverCycle: number | null; // when dominant outcome overtakes declared
  crossoverDirection: "met_rising" | "not_met_rising"; // what's overtaking
  regime: string;
  dominantOutcome: "met" | "not_met"; // which state wins long-term
}

interface LindbladRegimeParams {
  E_declared: number;
  E_met: number;
  E_not_met: number;
  gamma_to_met: number;
  gamma_to_not_met: number;
  gamma_decay: number;
  gamma_recovery: number;
}

interface RegimeMetadata {
  crossoverDirection: "met_rising" | "not_met_rising";
  dominantOutcome: "met" | "not_met";
  optimalReviewInterval: number;
  description: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const regimesData = (lindbladParams as any).regimes;

function getRegimeParams(regime: string): LindbladRegimeParams {
  const r = regimesData[regime] || regimesData["transitional"];

  return {
    E_declared: r.E_declared.mean,
    E_met: r.E_met.mean,
    E_not_met: r.E_not_met.mean,
    gamma_to_met: r.gamma_to_met.mean,
    gamma_to_not_met: r.gamma_to_not_met.mean,
    gamma_decay: r.gamma_decay.mean,
    gamma_recovery: r.gamma_recovery.mean,
  };
}

function getRegimeMetadata(regime: string): RegimeMetadata {
  const r = regimesData[regime] || regimesData["transitional"];

  return {
    crossoverDirection: r.crossover_direction || "met_rising",
    dominantOutcome: r.dominant_outcome || "met",
    optimalReviewInterval: r.optimal_review_interval || 3,
    description: r.description || "",
  };
}

/**
 * Determine regime from verification method and k value.
 */
export function classifyLindbladRegime(
  verificationMethod: string,
  k?: number
): string {
  if (k !== undefined) {
    if (k > 1.5) return "pressure";
    if (k > 1.3) return "computing";
    if (k < 0.5) return "composting";
    return "transitional";
  }

  switch (verificationMethod) {
    case "audit":
    case "sensor":
      return "computing";
    case "filing":
    case "benchmark":
      return "transitional";
    case "self-report":
      return "composting";
    case "none":
      return "composting";
    default:
      return "transitional";
  }
}

/**
 * Project the Lindblad state evolution for a promise.
 */
export function projectLindbladState(
  regime: string,
  maxCycles: number = 20,
  stepsPerCycle: number = 10
): LindbladProjection {
  const params = getRegimeParams(regime);
  const metadata = getRegimeMetadata(regime);
  const dt = 1.0 / stepsPerCycle;
  const totalSteps = maxCycles * stepsPerCycle;

  let pD = 1.0;
  let pM = 0.0;
  let pN = 0.0;

  const timePoints: number[] = [0];
  const pDeclared: number[] = [1.0];
  const pMet: number[] = [0.0];
  const pNotMet: number[] = [0.0];
  let crossoverCycle: number | null = null;

  for (let step = 1; step <= totalSteps; step++) {
    const t = step * dt;

    const dpD =
      -(params.gamma_to_met + params.gamma_to_not_met) * pD +
      params.gamma_decay * pM +
      params.gamma_recovery * pN;
    const dpM = params.gamma_to_met * pD - params.gamma_decay * pM;
    const dpN = params.gamma_to_not_met * pD - params.gamma_recovery * pN;

    pD = Math.max(0, pD + dpD * dt);
    pM = Math.max(0, pM + dpM * dt);
    pN = Math.max(0, pN + dpN * dt);

    const total = pD + pM + pN;
    if (total > 0) {
      pD /= total;
      pM /= total;
      pN /= total;
    }

    if (step % stepsPerCycle === 0) {
      timePoints.push(t);
      pDeclared.push(pD);
      pMet.push(pM);
      pNotMet.push(pN);

      // Crossover: check in the direction appropriate for this regime
      if (crossoverCycle === null) {
        if (metadata.crossoverDirection === "not_met_rising" && pN > pD) {
          crossoverCycle = t;
        } else if (
          metadata.crossoverDirection === "met_rising" &&
          pM > pD
        ) {
          crossoverCycle = t;
        }
      }
    }
  }

  return {
    timePoints,
    pDeclared,
    pMet,
    pNotMet,
    crossoverCycle,
    crossoverDirection: metadata.crossoverDirection,
    regime,
    dominantOutcome: metadata.dominantOutcome,
  };
}

/**
 * Get the crossover cycle for a promise.
 *
 * The crossover is the review cycle where the dominant outcome overtakes
 * the current state. The DIRECTION of crossover is the decision signal:
 *
 * - met_rising: resolution is overtaking inertia. The system is working,
 *   just slowly. Patience rewarded. Don't over-monitor (Zeno risk).
 *
 * - not_met_rising: failure is overtaking the current state. The system
 *   is breaking. Intervene before the crossover.
 */
export function getCrossoverInfo(
  verificationMethod: string,
  k?: number
): {
  cycle: number | null;
  direction: "met_rising" | "not_met_rising";
  action: string;
} {
  const regime = classifyLindbladRegime(verificationMethod, k);
  const metadata = getRegimeMetadata(regime);
  const r = regimesData[regime];
  const cycle = r?.crossover_cycle?.mean ?? null;

  const action =
    metadata.crossoverDirection === "met_rising"
      ? "Resolution trending — monitor, don't over-intervene"
      : "Failure trending — intervene before cycle " +
        (cycle ? Math.floor(cycle) : "?");

  return { cycle, direction: metadata.crossoverDirection, action };
}

/**
 * Get Zeno-aware optimal review frequency for a promise.
 *
 * Based on the quantum Zeno effect finding (ρ = −0.191, p < 0.0001):
 * too-frequent observation freezes promises in their current state.
 * The optimal frequency depends on the regime.
 *
 * Computing: review frequently — observation drives resolution.
 * Composting: review LESS frequently — continuous monitoring creates
 *   inertia. Schedule fewer, higher-stakes reviews with explicit
 *   resolution deadlines.
 * Pressure: time reviews to coincide with peak pressure.
 * Transitional: moderate frequency, watch for regime shift.
 */
export function getOptimalReviewInterval(
  regime: string,
  crossoverCycle: number | null
): { interval: number; rationale: string; zenoRisk: boolean } {
  switch (regime) {
    case "computing":
      return {
        interval: 2,
        rationale:
          "Computing regime — observation drives resolution. Review frequently.",
        zenoRisk: false,
      };
    case "composting":
      return {
        interval: crossoverCycle
          ? Math.max(3, Math.floor(crossoverCycle * 0.6))
          : 5,
        rationale:
          "Composting regime — frequent review creates Zeno effect (freezes state). Review less often with explicit resolution deadlines.",
        zenoRisk: true,
      };
    case "pressure":
      return {
        interval: crossoverCycle
          ? Math.max(1, Math.floor(crossoverCycle * 0.8))
          : 2,
        rationale:
          "Pressure regime — external forces accumulating. Time review to coincide with peak pressure.",
        zenoRisk: false,
      };
    case "transitional":
    default:
      return {
        interval: 3,
        rationale:
          "Transitional regime — moderate review frequency. Watch for regime shift toward computing or composting.",
        zenoRisk: false,
      };
  }
}

/**
 * Get the full Lindblad analysis for a promise.
 * Convenience function that combines regime classification, projection,
 * crossover analysis, and review scheduling.
 */
export function analyzePromiseDynamics(
  verificationMethod: string,
  k?: number,
  maxCycles: number = 20
): {
  regime: string;
  projection: LindbladProjection;
  crossover: { cycle: number | null; direction: string; action: string };
  review: { interval: number; rationale: string; zenoRisk: boolean };
} {
  const regime = classifyLindbladRegime(verificationMethod, k);
  const projection = projectLindbladState(regime, maxCycles);
  const crossover = getCrossoverInfo(verificationMethod, k);
  const review = getOptimalReviewInterval(regime, projection.crossoverCycle);

  return { regime, projection, crossover, review };
}
