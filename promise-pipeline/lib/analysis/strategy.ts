/**
 * Game Theory / Strategy Module — Agency Cost and Incentive Compatibility Analysis
 *
 * Applies principal-agent theory to promise verification networks.
 * Quantifies moral hazard, agency costs, and incentive compatibility
 * for each promise based on its verification mechanism.
 *
 * References:
 *   Jensen & Meckling (1976). Journal of Financial Economics, 3(4), 305–360.
 *   Hurwicz (1960). In Arrow, Karlin, & Suppes (Eds.), Mathematical Methods in the Social Sciences.
 *   Myerson (1981). Mathematics of Operations Research, 6(1), 58–73.
 */

import { Promise, VerificationMethod } from "../types/promise";
import { AgencyCostEntry, StrategyMetrics } from "../types/analysis";

/**
 * Monitoring quality of each verification method (0–1).
 * 1 = perfect monitoring (promiser cannot game the signal).
 * 0 = complete information asymmetry (promiser controls the signal entirely).
 */
const VERIFICATION_QUALITY: Record<VerificationMethod, number> = {
  sensor: 0.95,
  audit: 0.80,
  benchmark: 0.70,
  filing: 0.50,
  "self-report": 0.20,
  none: 0.00,
};

/**
 * Classify a verification method as incentive-compatible, partially compatible, or not.
 *
 * - yes: promiser doesn't control the signal → truthful reporting is the default
 * - partial: independent oversight exists but promiser has some influence
 * - no: promiser controls the signal and has no incentive to report truthfully
 */
function assessIncentiveCompatibility(
  method: VerificationMethod
): "yes" | "partial" | "no" {
  if (method === "sensor" || method === "audit") return "yes";
  if (method === "filing" || method === "benchmark") return "partial";
  return "no";
}

/**
 * Build a reverse dependency count map: how many promises depend on each promise.
 */
function buildDownstreamCounts(promises: Promise[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const p of promises) {
    for (const depId of p.depends_on) {
      counts.set(depId, (counts.get(depId) || 0) + 1);
    }
  }
  return counts;
}

/**
 * Compute strategy metrics for a promise network.
 *
 * Key outputs:
 * - Agency cost per promise (moral hazard × downstream amplification)
 * - Incentive compatibility classification per promise
 * - Per-agent average moral hazard
 */
export function computeStrategyMetrics(promises: Promise[]): StrategyMetrics {
  if (promises.length === 0) {
    return {
      agencyCosts: [],
      highestAgencyCost: [],
      incentiveCompatibility: { compatible: 0, partial: 0, incompatible: 0, total: 0 },
      agentMoralHazard: {},
    };
  }

  const downstreamCounts = buildDownstreamCounts(promises);

  const agencyCosts: AgencyCostEntry[] = promises.map((p) => {
    const method = p.verification.method;
    const verificationQuality = VERIFICATION_QUALITY[method];
    const moralHazard = 1 - verificationQuality;
    const downstreamCount = downstreamCounts.get(p.id) || 0;
    const agencyCost = moralHazard * (1 + downstreamCount * 0.2);
    const incentiveCompatible = assessIncentiveCompatibility(method);

    const compatibilityText =
      incentiveCompatible === "yes"
        ? "Verification IS incentive-compatible."
        : incentiveCompatible === "partial"
        ? "Verification is PARTIALLY incentive-compatible."
        : "Verification is NOT incentive-compatible.";

    const explanation =
      `${p.id} (${p.body.slice(0, 60)}${p.body.length > 60 ? "..." : ""}): ` +
      `Moral hazard ${moralHazard.toFixed(2)} — ${method === "none" ? "no verification mechanism exists" : `verification is ${method}`}. ` +
      `${downstreamCount} downstream dependent${downstreamCount !== 1 ? "s" : ""} amplify undetected failure risk. ` +
      `Agency cost: ${agencyCost.toFixed(2)}. ${compatibilityText}`;

    return {
      promiseId: p.id,
      promiseBody: p.body,
      promiser: p.promiser,
      moralHazard,
      verificationQuality,
      downstreamCount,
      agencyCost,
      incentiveCompatible,
      explanation,
    };
  });

  agencyCosts.sort((a, b) => b.agencyCost - a.agencyCost);
  const highestAgencyCost = agencyCosts.slice(0, 5);

  // Incentive compatibility summary
  const incentiveCompatibility = {
    compatible: 0,
    partial: 0,
    incompatible: 0,
    total: promises.length,
  };
  for (const entry of agencyCosts) {
    if (entry.incentiveCompatible === "yes") incentiveCompatibility.compatible++;
    else if (entry.incentiveCompatible === "partial") incentiveCompatibility.partial++;
    else incentiveCompatibility.incompatible++;
  }

  // Per-agent average moral hazard
  const agentHazardGroups = new Map<string, number[]>();
  for (const entry of agencyCosts) {
    if (!agentHazardGroups.has(entry.promiser)) agentHazardGroups.set(entry.promiser, []);
    agentHazardGroups.get(entry.promiser)!.push(entry.moralHazard);
  }
  const agentMoralHazard: Record<string, number> = {};
  for (const [agent, hazards] of agentHazardGroups.entries()) {
    agentMoralHazard[agent] = hazards.reduce((a, b) => a + b, 0) / hazards.length;
  }

  return { agencyCosts, highestAgencyCost, incentiveCompatibility, agentMoralHazard };
}
