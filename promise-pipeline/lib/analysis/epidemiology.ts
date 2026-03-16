/**
 * Epidemiology Module — Promise Network Cascade Risk Analysis
 *
 * Applies epidemic spreading models to promise dependency networks.
 * Computes R₀ (basic reproduction number), Rₑ (effective reproduction number),
 * herd immunity thresholds, and superspreader scores.
 *
 * References:
 *   Kermack & McKendrick (1927). Proceedings of the Royal Society A, 115(772), 700–721.
 *   Lloyd-Smith et al. (2005). Nature, 438(7066), 355–359.
 *   Pastor-Satorras & Vespignani (2001). Physical Review Letters, 86(14), 3200–3203.
 */

import { Promise } from "../types/promise";
import { EpidemiologyMetrics, SuperspreaderScore } from "../types/analysis";

/**
 * Build a reverse dependency map: for each promise ID, which promises depend on it.
 */
function buildReverseDependencyMap(promises: Promise[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const p of promises) {
    if (!map.has(p.id)) map.set(p.id, []);
    for (const depId of p.depends_on) {
      if (!map.has(depId)) map.set(depId, []);
      map.get(depId)!.push(p.id);
    }
  }
  return map;
}

/**
 * BFS to find all connected components in the undirected dependency graph.
 * Returns a map of promise ID → component ID.
 */
function findConnectedComponents(promises: Promise[]): Map<string, number> {
  // Build undirected adjacency list
  const adj = new Map<string, Set<string>>();
  for (const p of promises) {
    if (!adj.has(p.id)) adj.set(p.id, new Set());
    for (const depId of p.depends_on) {
      if (!adj.has(depId)) adj.set(depId, new Set());
      adj.get(p.id)!.add(depId);
      adj.get(depId)!.add(p.id);
    }
  }

  const componentId = new Map<string, number>();
  let nextId = 0;

  for (const p of promises) {
    if (componentId.has(p.id)) continue;
    // BFS from this node
    const queue = [p.id];
    componentId.set(p.id, nextId);
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const neighbor of adj.get(current) || []) {
        if (!componentId.has(neighbor)) {
          componentId.set(neighbor, nextId);
          queue.push(neighbor);
        }
      }
    }
    nextId++;
  }

  return componentId;
}

/**
 * Compute epidemiology metrics for a promise network.
 *
 * R₀ > 1 means cascade failures propagate on average.
 * Rₑ > 1 (cascadeProne=true) means the network is currently in a cascade-prone state
 * accounting for the dampening effect of verified promises.
 */
export function computeEpidemiologyMetrics(
  promises: Promise[]
): EpidemiologyMetrics {
  if (promises.length === 0) {
    return {
      R0: 0,
      R0_hubs: 0,
      Re: 0,
      herdImmunityThreshold: 0,
      verifiedCount: 0,
      verificationsNeeded: 0,
      superspreaderScores: [],
      cascadeProne: false,
    };
  }

  const reverseMap = buildReverseDependencyMap(promises);
  const componentId = findConnectedComponents(promises);

  // Build domain lookup
  const domainMap = new Map<string, string>(promises.map((p) => [p.id, p.domain]));

  // Count direct dependents per promise
  const directDependentCounts = new Map<string, number>();
  for (const p of promises) {
    const dependents = reverseMap.get(p.id) || [];
    directDependentCounts.set(p.id, dependents.length);
  }

  // R₀ = total dependency edges / total promises
  const totalEdges = promises.reduce((sum, p) => sum + p.depends_on.length, 0);
  const R0 = totalEdges / promises.length;

  // R₀_hubs = mean dependent count for non-leaf promises only
  const hubCounts = [...directDependentCounts.values()].filter((c) => c > 0);
  const R0_hubs = hubCounts.length > 0
    ? hubCounts.reduce((a, b) => a + b, 0) / hubCounts.length
    : 0;

  // Rₑ = R₀ × (1 - fractionVerified)
  const verifiedCount = promises.filter((p) => p.status === "verified").length;
  const fractionVerified = verifiedCount / promises.length;
  const Re = R0 * (1 - fractionVerified);

  // Herd immunity threshold
  let herdImmunityThreshold = 0;
  let verificationsNeeded = 0;
  if (R0 > 1) {
    herdImmunityThreshold = 1 - 1 / R0;
    const targetVerified = Math.ceil(herdImmunityThreshold * promises.length);
    verificationsNeeded = Math.max(0, targetVerified - verifiedCount);
  }

  // Superspreader scores
  const superspreaderScores: SuperspreaderScore[] = promises.map((p) => {
    const directDependents = directDependentCounts.get(p.id) || 0;

    // Find all direct dependents
    const dependentIds = reverseMap.get(p.id) || [];

    // Count distinct domains among direct dependents
    const domainsSpanned = new Set(
      dependentIds.map((id) => domainMap.get(id)).filter(Boolean)
    ).size;

    // Count distinct communities (components) among direct dependents
    const communitiesSet = new Set(
      dependentIds.map((id) => componentId.get(id)).filter((c) => c !== undefined)
    );
    const communitiesBridged = Math.max(1, communitiesSet.size);

    const score = directDependents * Math.max(1, domainsSpanned) * communitiesBridged;

    return {
      promiseId: p.id,
      directDependents,
      domainsSpanned: Math.max(0, domainsSpanned),
      communitiesBridged,
      score,
    };
  });

  superspreaderScores.sort((a, b) => b.score - a.score);

  return {
    R0,
    R0_hubs,
    Re,
    herdImmunityThreshold,
    verifiedCount,
    verificationsNeeded,
    superspreaderScores,
    cascadeProne: Re > 1,
  };
}
