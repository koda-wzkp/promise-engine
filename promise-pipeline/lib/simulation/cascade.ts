import { Promise, PromiseStatus } from "../types/promise";
import { WhatIfQuery, CascadeResult, AffectedPromise, NetworkHealthScore } from "../types/simulation";
import { calculateNetworkHealth } from "./scoring";

/**
 * Degrade a status by one level.
 * verified → degraded, declared → degraded, degraded → violated
 * violated and unverifiable stay as-is.
 */
function degradeStatus(status: PromiseStatus): PromiseStatus {
  switch (status) {
    case "verified": return "degraded";
    case "declared": return "degraded";
    case "degraded": return "violated";
    case "violated": return "violated";
    case "unverifiable": return "unverifiable";
    // ACA extended statuses
    case "kept": return "partial";
    case "partial": return "broken";
    case "delayed": return "broken";
    case "modified": return "partial";
    case "broken": return "broken";
    case "legally_challenged": return "broken";
    case "repealed": return "repealed";
    default: return status;
  }
}

/**
 * Deterministic cascade propagation engine.
 *
 * Given a promise network and a hypothetical state change,
 * propagates effects through the dependency graph using BFS.
 *
 * Rules:
 * 1. If a promise is set to "violated", direct dependents degrade by one level.
 * 2. If a promise is set to "unverifiable", dependents are flagged but don't change.
 * 3. Cascades propagate transitively with diminishing effect:
 *    depth 1 = full degradation, depth 2+ = one additional level at each step.
 * 4. A promise already at "violated" stays violated.
 * 5. Conflicts are flagged in insights, not cascaded.
 *
 * Returns a CascadeResult describing effects without modifying original data.
 */
export function simulateCascade(
  promises: Promise[],
  query: WhatIfQuery
): CascadeResult {
  const originalHealth = calculateNetworkHealth(promises);
  const affected: AffectedPromise[] = [];

  // Build reverse adjacency: for each promise, which promises depend on it?
  const reverseDeps = new Map<string, string[]>();
  for (const p of promises) {
    for (const depId of p.depends_on) {
      if (!reverseDeps.has(depId)) reverseDeps.set(depId, []);
      reverseDeps.get(depId)!.push(p.id);
    }
  }

  // Map promise IDs to their simulated statuses
  const simulatedStatuses = new Map<string, PromiseStatus>();
  for (const p of promises) {
    simulatedStatuses.set(p.id, p.status);
  }

  // Apply the initial query
  const targetPromise = promises.find((p) => p.id === query.promiseId);
  if (!targetPromise) {
    return {
      query,
      originalNetworkHealth: originalHealth.overall,
      newNetworkHealth: originalHealth.overall,
      affectedPromises: [],
      cascadeDepth: 0,
      domainsAffected: [],
      summary: "Promise not found.",
    };
  }

  simulatedStatuses.set(query.promiseId, query.newStatus);

  // BFS cascade propagation
  // Queue entries: [promiseId, cascadeDepth]
  const queue: [string, number][] = [[query.promiseId, 0]];
  const visited = new Set<string>([query.promiseId]);
  let maxDepth = 0;

  while (queue.length > 0) {
    const [currentId, depth] = queue.shift()!;
    const currentStatus = simulatedStatuses.get(currentId)!;

    // Only propagate from negative states
    const propagatingStatuses: PromiseStatus[] = [
      "degraded", "violated", "broken", "repealed", "legally_challenged",
    ];
    if (!propagatingStatuses.includes(currentStatus)) continue;

    const dependents = reverseDeps.get(currentId) ?? [];
    for (const depId of dependents) {
      if (visited.has(depId)) continue;
      visited.add(depId);

      const depPromise = promises.find((p) => p.id === depId);
      if (!depPromise) continue;

      const originalDepStatus = depPromise.status;
      const currentSimulatedStatus = simulatedStatuses.get(depId)!;

      // Non-degradable statuses
      if (currentSimulatedStatus === "unverifiable" || currentSimulatedStatus === "repealed") continue;

      // Apply degradation
      let newStatus: PromiseStatus;
      const hardFailures: PromiseStatus[] = ["violated", "broken", "repealed"];
      const healthyStatuses: PromiseStatus[] = ["verified", "declared", "kept", "delayed", "modified"];

      if (hardFailures.includes(currentStatus)) {
        // Hard upstream failure: degrade by one level
        newStatus = degradeStatus(currentSimulatedStatus);
      } else {
        // Soft upstream degradation: degrade only if we're still healthy
        if (healthyStatuses.includes(currentSimulatedStatus)) {
          newStatus = degradeStatus(currentSimulatedStatus);
        } else {
          newStatus = currentSimulatedStatus; // Already in a negative state
        }
      }

      if (newStatus !== currentSimulatedStatus) {
        simulatedStatuses.set(depId, newStatus);
        const newDepth = depth + 1;
        maxDepth = Math.max(maxDepth, newDepth);

        affected.push({
          promiseId: depId,
          originalStatus: originalDepStatus,
          newStatus,
          cascadeDepth: newDepth,
          reason: generateAffectedReason(depPromise, currentId, promises, newStatus),
        });

        queue.push([depId, newDepth]);
      }
    }
  }

  // Compute new network health with simulated statuses
  const simulatedPromises = promises.map((p) => ({
    ...p,
    status: simulatedStatuses.get(p.id) ?? p.status,
  }));
  const newHealth = calculateNetworkHealth(simulatedPromises);

  // Domains affected
  const domainsAffected = Array.from(new Set(affected.map((a) => {
    const p = promises.find((pr) => pr.id === a.promiseId);
    return p?.domain ?? "Unknown";
  })));

  return {
    query,
    originalNetworkHealth: originalHealth.overall,
    newNetworkHealth: newHealth.overall,
    affectedPromises: affected,
    cascadeDepth: maxDepth,
    domainsAffected,
    summary: generateCascadeNarrative(
      query, affected, originalHealth.overall, newHealth.overall, domainsAffected, promises
    ),
  };
}

function generateAffectedReason(
  promise: Promise,
  upstreamId: string,
  allPromises: Promise[],
  newStatus: PromiseStatus
): string {
  const upstream = allPromises.find((p) => p.id === upstreamId);
  const upstreamLabel = upstream
    ? `${upstream.id} ("${upstream.body.slice(0, 50)}...")`
    : upstreamId;
  return `Depends on ${upstreamLabel}. Status changes to ${newStatus}.`;
}

/**
 * Generate a human-readable narrative explaining cascade effects.
 */
function generateCascadeNarrative(
  query: WhatIfQuery,
  affected: AffectedPromise[],
  originalHealth: number,
  newHealth: number,
  domains: string[],
  promises: Promise[]
): string {
  const source = promises.find((p) => p.id === query.promiseId);
  if (!source) return "No cascade effects.";

  if (affected.length === 0) {
    return `Changing "${source.body}" to ${query.newStatus} has no downstream effects. No other promises depend on this commitment.`;
  }

  const healthDelta = newHealth - originalHealth;
  const violatedCount = affected.filter((a) => a.newStatus === "violated").length;
  const degradedCount = affected.filter((a) => a.newStatus === "degraded").length;

  let narrative = `Changing "${source.body}" to ${query.newStatus} affects ${affected.length} downstream promise${affected.length === 1 ? "" : "s"}`;
  narrative += ` across ${domains.length} domain${domains.length === 1 ? "" : "s"} (${domains.join(", ")}).`;
  narrative += ` Network health drops from ${originalHealth} to ${newHealth} (${healthDelta >= 0 ? "+" : ""}${healthDelta}).`;

  if (violatedCount > 0) {
    narrative += ` ${violatedCount} promise${violatedCount === 1 ? " becomes" : "s become"} violated.`;
  }
  if (degradedCount > 0) {
    narrative += ` ${degradedCount} promise${degradedCount === 1 ? " degrades" : "s degrade"}.`;
  }

  return narrative;
}

/**
 * Apply cascade result to produce a modified promise array for display.
 * Does NOT mutate the original array.
 */
export function applySimulation(
  promises: Promise[],
  query: WhatIfQuery,
  result: CascadeResult
): Promise[] {
  const statusMap = new Map<string, PromiseStatus>();
  statusMap.set(query.promiseId, query.newStatus);
  for (const a of result.affectedPromises) {
    statusMap.set(a.promiseId, a.newStatus);
  }

  return promises.map((p) => ({
    ...p,
    status: statusMap.get(p.id) ?? p.status,
  }));
}
