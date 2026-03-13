import {
  NetworkPromise,
  NetworkAgent,
  NetworkConfig,
  CapacityQuery,
  CapacityResult,
} from "../types/network";

/**
 * Simulate the impact of adding a new promise to the network.
 *
 * Load score formula:
 *   base = activePromises / capacityThreshold * 100
 *   urgencyBonus = count(due within 7 days) * (urgencyMultiplier - 1)
 *   dependencyBonus = count(2+ dependents) * (dependencyMultiplier - 1)
 *   loadScore = min(100, base + urgencyBonus + dependencyBonus)
 */
export function simulateCapacity(
  promises: NetworkPromise[],
  agents: NetworkAgent[],
  query: CapacityQuery,
  config: NetworkConfig
): CapacityResult {
  const assigneeId = query.hypotheticalPromise.promiser;
  const threshold = config.capacityThreshold ?? 8;
  const urgencyMul = config.capacityUrgencyMultiplier ?? 1.5;
  const depMul = config.capacityDependencyMultiplier ?? 1.3;

  // Current active promises for the assignee
  const activeStatuses = ["declared", "degraded"];
  const assigneeActive = promises.filter(
    (p) => (p.promiser === assigneeId || p.assignedTo === assigneeId) && activeStatuses.includes(p.status)
  );

  // Calculate current load
  const currentLoad = calculateLoadScore(assigneeActive, promises, threshold, urgencyMul, depMul);

  // Projected load (one more promise)
  const projectedCount = assigneeActive.length + 1;
  const projectedLoad = calculateLoadScore(
    [...assigneeActive, { target: query.hypotheticalPromise.target, depends_on: query.hypotheticalPromise.depends_on ?? [] } as NetworkPromise],
    promises,
    threshold,
    urgencyMul,
    depMul
  );

  // Identify at-risk promises
  const atRiskPromises: { promiseId: string; reason: string }[] = [];

  if (projectedLoad >= 80) {
    // When overloaded, promises due soonest are at risk
    const sorted = [...assigneeActive]
      .filter((p) => p.target)
      .sort((a, b) => (a.target ?? "").localeCompare(b.target ?? ""));

    for (const p of sorted.slice(0, 3)) {
      atRiskPromises.push({
        promiseId: p.id,
        reason: `Due ${p.target} — agent load at ${Math.round(projectedLoad)}%`,
      });
    }
  }

  // Health impact
  const weights = config.statusWeights;
  const currentHealth = promises.length > 0
    ? Math.round(promises.reduce((s, p) => s + (weights[p.status] ?? 50), 0) / promises.length)
    : 100;

  // New promise starts as declared
  const newTotal = promises.length + 1;
  const newHealth = Math.round(
    (promises.reduce((s, p) => s + (weights[p.status] ?? 50), 0) + (weights["declared"] ?? 60)) / newTotal
  );

  // Generate recommendation
  let recommendation: string;
  if (projectedLoad < 50) {
    recommendation = `${getAgentName(assigneeId, agents)} has capacity. Adding this promise brings their load to ${Math.round(projectedLoad)}%.`;
  } else if (projectedLoad < 80) {
    recommendation = `${getAgentName(assigneeId, agents)} is moderately loaded (${Math.round(projectedLoad)}%). Consider deadlines carefully.`;
  } else {
    recommendation = `${getAgentName(assigneeId, agents)} is at ${Math.round(projectedLoad)}% capacity. Adding more promises risks degrading existing commitments.`;
  }

  return {
    canAbsorb: projectedLoad < 80,
    assigneeCurrentLoad: Math.round(currentLoad),
    assigneeProjectedLoad: Math.round(projectedLoad),
    atRiskPromises,
    networkHealthBefore: currentHealth,
    networkHealthAfter: newHealth,
    recommendation,
  };
}

function calculateLoadScore(
  activePromises: Pick<NetworkPromise, "target" | "depends_on">[],
  allPromises: Pick<NetworkPromise, "id" | "depends_on">[],
  threshold: number,
  urgencyMul: number,
  depMul: number,
): number {
  const base = (activePromises.length / threshold) * 100;

  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  const urgentCount = activePromises.filter((p) => {
    if (!p.target) return false;
    const deadline = new Date(p.target).getTime();
    return deadline - now <= sevenDays && deadline >= now;
  }).length;

  // Count promises with 2+ dependents
  const highDepCount = activePromises.filter((p) => {
    if (!("id" in p)) return false;
    const id = (p as { id: string }).id;
    return allPromises.filter((op) => op.depends_on.includes(id)).length >= 2;
  }).length;

  const urgencyBonus = urgentCount * (urgencyMul - 1) * 10;
  const depBonus = highDepCount * (depMul - 1) * 10;

  return Math.min(100, base + urgencyBonus + depBonus);
}

function getAgentName(id: string, agents: NetworkAgent[]): string {
  return agents.find((a) => a.id === id)?.name ?? id;
}
