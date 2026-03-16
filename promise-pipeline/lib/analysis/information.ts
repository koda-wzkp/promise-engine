/**
 * Information Theory Module — Verification Channel Capacity Analysis
 *
 * Applies Shannon information theory to promise verification networks.
 * Quantifies the information gap created by weak or absent verification
 * mechanisms — making the equity verification gap analytically precise.
 *
 * References:
 *   Shannon (1948). Bell System Technical Journal, 27(3), 379–423.
 *   Cover & Thomas (2006). Elements of Information Theory (2nd ed.). Wiley.
 *   Kullback & Leibler (1951). Annals of Mathematical Statistics, 22(1), 79–86.
 */

import { Promise, PromiseStatus, VerificationMethod } from "../types/promise";
import { InformationMetrics } from "../types/analysis";

/**
 * Heuristic channel capacity per promise by verification method (bits).
 * log₂(5) ≈ 2.32 bits is the theoretical max; sensor gets 2.1 (near-perfect).
 * Ordering matters more than exact values — can be calibrated empirically.
 */
const CHANNEL_CAPACITY: Record<VerificationMethod, number> = {
  sensor: 2.1,
  audit: 1.8,
  benchmark: 1.5,
  filing: 1.2,
  "self-report": 0.6,
  none: 0.0,
};

/** Maximum practical capacity per promise (sensor quality). */
const MAX_CAPACITY_PER_PROMISE = 2.1;

/**
 * Shannon entropy of a probability distribution.
 * H = -Σ p(x) × log₂(p(x)) for all x with p(x) > 0
 */
function shannonEntropy(counts: Map<string, number>): number {
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  if (total === 0) return 0;

  let h = 0;
  for (const count of counts.values()) {
    if (count === 0) continue;
    const p = count / total;
    h -= p * Math.log2(p);
  }
  return h;
}

/**
 * Compute information theory metrics for a promise network.
 *
 * Key outputs:
 * - Channel capacity: how much information the verification infrastructure can carry
 * - Verification gap: the unobservable fraction of network state
 * - Domain information gain: how much knowing the domain predicts status
 */
export function computeInformationMetrics(promises: Promise[]): InformationMetrics {
  if (promises.length === 0) {
    return {
      actualChannelCapacity: 0,
      maxChannelCapacity: 0,
      capacityRatio: 0,
      verificationGapBits: 0,
      unobservablePercent: 0,
      capacityByMethod: {},
      conditionalEntropyByDomain: {},
      domainInformationGain: 0,
      statusEntropy: 0,
    };
  }

  // Channel capacity aggregation
  let actualChannelCapacity = 0;
  const methodGroups = new Map<string, { count: number; totalCapacity: number }>();

  for (const p of promises) {
    const method = p.verification.method;
    const cap = CHANNEL_CAPACITY[method];
    actualChannelCapacity += cap;

    if (!methodGroups.has(method)) methodGroups.set(method, { count: 0, totalCapacity: 0 });
    const group = methodGroups.get(method)!;
    group.count++;
    group.totalCapacity += cap;
  }

  const maxChannelCapacity = MAX_CAPACITY_PER_PROMISE * promises.length;
  const capacityRatio = maxChannelCapacity > 0 ? actualChannelCapacity / maxChannelCapacity : 0;
  const verificationGapBits = maxChannelCapacity - actualChannelCapacity;
  const unobservablePercent = maxChannelCapacity > 0
    ? (verificationGapBits / maxChannelCapacity) * 100
    : 0;

  // Build capacity by method breakdown
  const capacityByMethod: InformationMetrics["capacityByMethod"] = {};
  for (const [method, group] of methodGroups.entries()) {
    capacityByMethod[method] = {
      count: group.count,
      capacityPerPromise: CHANNEL_CAPACITY[method as VerificationMethod] ?? 0,
      totalCapacity: group.totalCapacity,
    };
  }

  // Shannon entropy of overall status distribution H(status)
  const overallStatusCounts = new Map<string, number>();
  for (const p of promises) {
    overallStatusCounts.set(p.status, (overallStatusCounts.get(p.status) || 0) + 1);
  }
  const statusEntropy = shannonEntropy(overallStatusCounts);

  // Group by domain
  const domainGroups = new Map<string, Promise[]>();
  for (const p of promises) {
    if (!domainGroups.has(p.domain)) domainGroups.set(p.domain, []);
    domainGroups.get(p.domain)!.push(p);
  }

  // Conditional entropy H(status | domain=d) for each domain
  const conditionalEntropyByDomain: Record<string, number> = {};
  let weightedConditionalEntropy = 0;

  for (const [domain, domainPromises] of domainGroups.entries()) {
    const domainStatusCounts = new Map<string, number>();
    for (const p of domainPromises) {
      domainStatusCounts.set(p.status, (domainStatusCounts.get(p.status) || 0) + 1);
    }
    const domainEntropy = shannonEntropy(domainStatusCounts);
    conditionalEntropyByDomain[domain] = domainEntropy;
    // Weight by domain size
    weightedConditionalEntropy += (domainPromises.length / promises.length) * domainEntropy;
  }

  // Information gain = H(status) - H(status | domain)
  const domainInformationGain = Math.max(0, statusEntropy - weightedConditionalEntropy);

  return {
    actualChannelCapacity,
    maxChannelCapacity,
    capacityRatio,
    verificationGapBits,
    unobservablePercent,
    capacityByMethod,
    conditionalEntropyByDomain,
    domainInformationGain,
    statusEntropy,
  };
}
