/**
 * Five-Field Analysis Module — Barrel Export
 *
 * Re-exports all analysis functions and types. Provides runDiagnostic()
 * as a convenience function that runs all four deterministic modules
 * in a single call.
 *
 * The probabilistic field is populated separately via simulateProbabilisticCascade()
 * when a What If query is active — it requires a query parameter not available
 * during the default diagnostic run.
 */

export { computeEpidemiologyMetrics } from "./epidemiology";
export { computeReliabilityMetrics } from "./reliability";
export { computeInformationMetrics } from "./information";
export { computeStrategyMetrics } from "./strategy";
export { computeHeuristicCPTs, simulateProbabilisticCascade } from "./probabilistic";

export type {
  EpidemiologyMetrics,
  SuperspreaderScore,
  FMEAEntry,
  ReliabilityMetrics,
  InformationMetrics,
  AgencyCostEntry,
  StrategyMetrics,
  StatusDistribution,
  HeuristicCPTEntry,
  ProbabilisticCascadeResult,
  FiveFieldDiagnostic,
} from "../types/analysis";

import { Promise } from "../types/promise";
import { FiveFieldDiagnostic } from "../types/analysis";
import { computeEpidemiologyMetrics } from "./epidemiology";
import { computeReliabilityMetrics } from "./reliability";
import { computeInformationMetrics } from "./information";
import { computeStrategyMetrics } from "./strategy";

/**
 * Run all four deterministic diagnostic modules and return a combined result.
 *
 * The `probabilistic` field is omitted from the default run — call
 * simulateProbabilisticCascade() separately when a What If query is active.
 *
 * @param promises - The promise network to analyze
 * @param actorReliability - Optional map of promiser ID → reliability score (0–1)
 *   for FMEA occurrence scoring. Pass historical performance data when available.
 */
export function runDiagnostic(
  promises: Promise[],
  actorReliability?: Record<string, number>
): FiveFieldDiagnostic {
  return {
    epidemiology: computeEpidemiologyMetrics(promises),
    reliability: computeReliabilityMetrics(promises, actorReliability),
    information: computeInformationMetrics(promises),
    strategy: computeStrategyMetrics(promises),
  };
}
