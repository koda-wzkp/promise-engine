import { TeamPromise, TeamMember } from "../types/team";

/**
 * Calculate team utilization metrics using queueing theory.
 *
 * Little's Law: L = λW
 *   L = average number of active (in-progress) promises
 *   λ = average arrival rate (new promises per time unit)
 *   W = average time to complete a promise
 *
 * Utilization ρ = λ / μ where μ = service rate (completions per time unit)
 * When ρ approaches 1.0, the queue grows unboundedly — the team cannot
 * keep up with incoming commitments.
 *
 * This is predictive: it flags overload BEFORE promises start breaking,
 * based on rate trends rather than current status counts.
 */

export interface UtilizationMetrics {
  teamUtilization: number;          // 0-1, where ≥ 0.85 is danger zone
  arrivalRate: number;              // promises per week
  completionRate: number;           // promises per week
  averageCompletionDays: number;    // mean time to complete
  expectedQueueLength: number;      // predicted active promises at steady state
  timeToOverload: number | null;    // weeks until ρ ≥ 1.0 at current trend, or null if stable
  byMember: Record<string, {
    utilization: number;
    activeCount: number;
    completionRate: number;
  }>;
}

function computeUtilization(arrivalRate: number, completionRate: number): number {
  if (completionRate > 0) return arrivalRate / completionRate;
  return arrivalRate > 0 ? 1.0 : 0;
}

export function calculateUtilization(
  promises: TeamPromise[],
  members: TeamMember[],
  windowWeeks: number = 4,
): UtilizationMetrics {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowWeeks * 7 * 24 * 60 * 60 * 1000);

  // Group promises by member upfront
  const byMemberMap: Record<string, TeamPromise[]> = {};
  for (const m of members) byMemberMap[m.id] = [];
  for (const p of promises) {
    if (byMemberMap[p.promiser]) {
      byMemberMap[p.promiser].push(p);
    }
  }

  // Calculate arrival rate: promises created in the window
  const arrivedInWindow = promises.filter((p) => {
    const created = new Date(p.createdAt || now.toISOString());
    return created >= windowStart;
  });
  const arrivalRate = arrivedInWindow.length / windowWeeks;

  // Calculate completion rate: verified promises created in the window
  // (completedAt not available on TeamPromise, so use createdAt as proxy)
  const completedInWindow = promises.filter((p) => {
    if (p.status !== "verified") return false;
    const created = new Date(p.createdAt || now.toISOString());
    return created >= windowStart;
  });
  const completionRate = completedInWindow.length / windowWeeks;

  // Average completion time
  const promisesWithEstimates = promises.filter((p) => p.estimatedHours);
  const avgCompletionDays =
    promisesWithEstimates.length > 0
      ? promisesWithEstimates.reduce((sum, p) => sum + (p.estimatedHours! / 8), 0) /
        promisesWithEstimates.length
      : 7;

  const utilization = computeUtilization(arrivalRate, completionRate);

  // Expected queue length (Little's Law)
  const expectedQueueLength = arrivalRate * (avgCompletionDays / 7);

  // Time to overload
  const timeToOverload =
    utilization >= 1.0
      ? 0
      : utilization >= 0.85
      ? Math.round((1.0 - utilization) / 0.05)
      : null;

  // Per-member breakdown using pre-grouped data
  const byMember: Record<
    string,
    { utilization: number; activeCount: number; completionRate: number }
  > = {};
  for (const member of members) {
    const memberPromises = byMemberMap[member.id] || [];
    let memberActive = 0;
    let memberCompleted = 0;
    let memberArrived = 0;

    for (const p of memberPromises) {
      if (p.status === "declared" || p.status === "degraded") memberActive++;
      if (p.status === "verified") memberCompleted++;
      const created = new Date(p.createdAt || now.toISOString());
      if (created >= windowStart) memberArrived++;
    }

    const memberRate = memberCompleted / windowWeeks;
    const memberArrivalRate = memberArrived / windowWeeks;

    byMember[member.id] = {
      utilization: computeUtilization(memberArrivalRate, memberRate),
      activeCount: memberActive,
      completionRate: memberRate,
    };
  }

  return {
    teamUtilization: Math.min(utilization, 2.0),
    arrivalRate,
    completionRate,
    averageCompletionDays: Math.round(avgCompletionDays * 10) / 10,
    expectedQueueLength: Math.round(expectedQueueLength * 10) / 10,
    timeToOverload,
    byMember,
  };
}
