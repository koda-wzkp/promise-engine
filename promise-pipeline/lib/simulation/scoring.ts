import { Promise, PromiseStatus } from "../types/promise";
import { NetworkHealthScore } from "../types/simulation";
import { statusWeights } from "../utils/colors";
import { getDependents } from "./graph";

/**
 * Calculate network health score from promise statuses.
 * Weights: verified=100, declared=60, degraded=30, violated=0, unverifiable=20
 */
export function calculateNetworkHealth(promises: Promise[]): NetworkHealthScore {
  if (promises.length === 0) {
    return { overall: 0, byDomain: {}, byAgent: {}, bottlenecks: [], atRisk: [] };
  }

  // Overall score
  const overall = Math.round(
    promises.reduce((sum, p) => sum + statusWeights[p.status], 0) / promises.length
  );

  // Score by domain
  const byDomain: Record<string, number> = {};
  const domainGroups = new Map<string, Promise[]>();
  for (const p of promises) {
    if (!domainGroups.has(p.domain)) domainGroups.set(p.domain, []);
    domainGroups.get(p.domain)!.push(p);
  }
  domainGroups.forEach((group, domain) => {
    byDomain[domain] = Math.round(
      group.reduce((sum: number, p: Promise) => sum + statusWeights[p.status], 0) / group.length
    );
  });

  // Score by agent (promiser)
  const byAgent: Record<string, number> = {};
  const agentGroups = new Map<string, Promise[]>();
  for (const p of promises) {
    if (!agentGroups.has(p.promiser)) agentGroups.set(p.promiser, []);
    agentGroups.get(p.promiser)!.push(p);
  }
  agentGroups.forEach((group, agent) => {
    byAgent[agent] = Math.round(
      group.reduce((sum: number, p: Promise) => sum + statusWeights[p.status], 0) / group.length
    );
  });

  // Bottlenecks: promises with the most dependents
  const depCounts = new Map<string, number>();
  for (const p of promises) {
    depCounts.set(p.id, getDependents(p.id, promises).length);
  }
  const sorted = Array.from(depCounts.entries()).sort((a, b) => b[1] - a[1]);
  const bottlenecks = sorted.filter(([, count]) => count > 0).map(([id]) => id);

  // At risk: promises that have upstream dependencies in failing state
  const healthyStatuses: PromiseStatus[] = ["verified", "declared", "kept", "delayed", "modified"];
  const failingStatuses: PromiseStatus[] = ["violated", "degraded", "broken", "repealed", "legally_challenged"];
  const atRisk: string[] = [];
  for (const p of promises) {
    if (healthyStatuses.includes(p.status)) {
      const hasFailingUpstream = p.depends_on.some((depId) => {
        const dep = promises.find((d) => d.id === depId);
        return dep && failingStatuses.includes(dep.status);
      });
      if (hasFailingUpstream) atRisk.push(p.id);
    }
  }

  return { overall, byDomain, byAgent, bottlenecks, atRisk };
}

/**
 * Identify bottleneck promises: promises with the most dependents.
 * Returns sorted by dependent count descending.
 */
export function identifyBottlenecks(promises: Promise[]): { id: string; dependentCount: number }[] {
  const results: { id: string; dependentCount: number }[] = [];
  for (const p of promises) {
    const count = getDependents(p.id, promises).length;
    if (count > 0) {
      results.push({ id: p.id, dependentCount: count });
    }
  }
  return results.sort((a, b) => b.dependentCount - a.dependentCount);
}
