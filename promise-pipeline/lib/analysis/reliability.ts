/**
 * Reliability Engineering Module — FMEA and Network Reliability Analysis
 *
 * Applies Failure Mode and Effect Analysis (FMEA) to promise networks.
 * Computes Risk Priority Numbers (RPN = Severity × Occurrence × Detection)
 * and probabilistic network reliability via geometric mean.
 *
 * References:
 *   Stamatis (2003). Failure Mode and Effect Analysis: FMEA from Theory to Execution. ASQ.
 *   Vesely et al. (1981). Fault Tree Handbook. NUREG-0492. U.S. NRC.
 *   Rausand & Høyland (2004). System Reliability Theory. Wiley.
 */

import { Promise, PromiseStatus, VerificationMethod } from "../types/promise";
import { FMEAEntry, ReliabilityMetrics } from "../types/analysis";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Get all transitive downstream dependents via BFS through the reverse depends_on map.
 */
function getTransitiveDependents(
  promiseId: string,
  reverseMap: Map<string, string[]>
): string[] {
  const result: string[] = [];
  const visited = new Set<string>();
  const queue = [promiseId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const deps = reverseMap.get(current) || [];
    for (const dep of deps) {
      if (!visited.has(dep)) {
        visited.add(dep);
        result.push(dep);
        queue.push(dep);
      }
    }
  }

  return result;
}

const STATUS_OCCURRENCE: Record<PromiseStatus, number> = {
  verified: 2,
  declared: 5,
  degraded: 7,
  violated: 10,
  unverifiable: 6,
};

const DETECTION_SCORES: Record<VerificationMethod, number> = {
  sensor: 1,
  audit: 3,
  benchmark: 4,
  filing: 5,
  "self-report": 7,
  none: 10,
};

const STATUS_RELIABILITY: Record<PromiseStatus, number> = {
  verified: 0.95,
  declared: 0.60,
  degraded: 0.30,
  violated: 0.05,
  unverifiable: 0.40,
};

const VERIFICATION_BOOST: Record<VerificationMethod, number> = {
  sensor: 0.04,
  audit: 0.03,
  benchmark: 0.02,
  filing: 0.01,
  "self-report": 0.0,
  none: -0.05,
};

function severityLabel(score: number): string {
  if (score >= 7) return "High";
  if (score >= 4) return "Moderate";
  return "Low";
}

function occurrenceLabel(score: number): string {
  if (score >= 7) return "High likelihood of failure";
  if (score >= 4) return "Moderate likelihood of failure";
  return "Low likelihood of failure";
}

function detectionLabel(score: number): string {
  if (score >= 7) return "Hard to detect";
  if (score >= 4) return "Moderately detectable";
  return "Easily detected";
}

function rpnPriority(rpn: number): "critical" | "high" | "medium" | "low" {
  if (rpn > 200) return "critical";
  if (rpn > 100) return "high";
  if (rpn > 50) return "medium";
  return "low";
}

/**
 * Compute FMEA and network reliability metrics for a promise network.
 *
 * @param promises - Array of promises to analyze
 * @param actorReliability - Optional map of promiser ID → reliability score (0–1).
 *   When provided, used to compute Occurrence scores instead of status-based heuristics.
 */
export function computeReliabilityMetrics(
  promises: Promise[],
  actorReliability?: Record<string, number>
): ReliabilityMetrics {
  if (promises.length === 0) {
    return { fmea: [], criticalPromises: [], networkReliability: 1, promiseReliabilities: {} };
  }

  // Build reverse dependency map for transitive dependent lookup
  const reverseMap = new Map<string, string[]>();
  for (const p of promises) {
    if (!reverseMap.has(p.id)) reverseMap.set(p.id, []);
    for (const depId of p.depends_on) {
      if (!reverseMap.has(depId)) reverseMap.set(depId, []);
      reverseMap.get(depId)!.push(p.id);
    }
  }

  // Build domain lookup
  const domainMap = new Map<string, string>(promises.map((p) => [p.id, p.domain]));

  const fmea: FMEAEntry[] = promises.map((p) => {
    // Severity: transitive downstream dependents × domain spread
    const allDependents = getTransitiveDependents(p.id, reverseMap);
    const dependentCount = allDependents.length;
    const domainsAffected = new Set(
      allDependents.map((id) => domainMap.get(id)).filter(Boolean)
    ).size;
    const severity = clamp(dependentCount * 2 + domainsAffected, 1, 10);

    // Occurrence: from actor reliability or status heuristic
    let occurrence: number;
    if (actorReliability && actorReliability[p.promiser] !== undefined) {
      occurrence = clamp(Math.round((1 - actorReliability[p.promiser]) * 10), 1, 10);
    } else {
      occurrence = STATUS_OCCURRENCE[p.status];
    }

    // Detection: verification method quality
    const method = p.verification.method;
    const detection = DETECTION_SCORES[method];

    const RPN = severity * occurrence * detection;

    const explanation =
      `${severityLabel(severity)} severity: failure cascades to ${dependentCount} downstream ` +
      `promise${dependentCount !== 1 ? "s" : ""} across ${domainsAffected} domain${domainsAffected !== 1 ? "s" : ""}. ` +
      `${occurrenceLabel(occurrence)} based on ${actorReliability ? "actor reliability data" : `current status (${p.status})`}. ` +
      `${detectionLabel(detection)}: verification is ${method}.`;

    return {
      promiseId: p.id,
      promiseBody: p.body,
      domain: p.domain,
      severity,
      occurrence,
      detection,
      RPN,
      priority: rpnPriority(RPN),
      explanation,
    };
  });

  fmea.sort((a, b) => b.RPN - a.RPN);
  const criticalPromises = fmea.slice(0, 5);

  // Per-promise reliability
  const promiseReliabilities: Record<string, number> = {};
  for (const p of promises) {
    const base = STATUS_RELIABILITY[p.status];
    const boost = VERIFICATION_BOOST[p.verification.method];
    promiseReliabilities[p.id] = clamp(base + boost, 0.01, 0.99);
  }

  // Network reliability = geometric mean = exp(mean(ln(r_i)))
  const logSum = Object.values(promiseReliabilities).reduce(
    (sum, r) => sum + Math.log(r),
    0
  );
  const networkReliability = Math.exp(logSum / promises.length);

  return { fmea, criticalPromises, networkReliability, promiseReliabilities };
}
