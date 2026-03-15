import type { PersonalDomain } from "../types/personal";
import type { CheckIn } from "../types/check-in";
import type { PersonalPromise } from "../types/personal";

/**
 * Calculate reliability score for a set of check-ins.
 * Reliability = (kept * 1.0 + partial * 0.5) / total
 */
export function calculateReliability(checkIns: CheckIn[]): number {
  if (checkIns.length === 0) return 0;

  let score = 0;
  for (const ci of checkIns) {
    if (ci.response === "kept") score += 1.0;
    else if (ci.response === "partial") score += 0.5;
  }
  return score / checkIns.length;
}

/**
 * Calculate per-domain reliability from check-ins and promises.
 */
export function calculateDomainReliability(
  promises: PersonalPromise[],
  checkIns: CheckIn[]
): Record<PersonalDomain, number> {
  const result: Record<PersonalDomain, number> = {
    health: 0,
    work: 0,
    relationships: 0,
    creative: 0,
    financial: 0,
  };

  const domains: PersonalDomain[] = ["health", "work", "relationships", "creative", "financial"];
  for (const domain of domains) {
    const domainPromiseIds = new Set(
      promises.filter((p) => p.domain === domain).map((p) => p.id)
    );
    const domainCheckIns = checkIns.filter((ci) => domainPromiseIds.has(ci.promiseId));
    result[domain] = calculateReliability(domainCheckIns);
  }

  return result;
}

/**
 * Calculate overall garden reliability from check-ins.
 */
export function calculateOverallReliability(checkIns: CheckIn[]): number {
  return calculateReliability(checkIns);
}

/**
 * Calculate trend (improving/stable/declining) by comparing two periods.
 * Returns delta: positive = improving, negative = declining, near-zero = stable.
 */
export function calculateTrend(
  currentPeriodCheckIns: CheckIn[],
  previousPeriodCheckIns: CheckIn[]
): number {
  const current = calculateReliability(currentPeriodCheckIns);
  const previous = calculateReliability(previousPeriodCheckIns);
  return current - previous;
}

/**
 * Get trend arrow for display.
 */
export function getTrendArrow(trend: number): string {
  if (trend > 0.05) return "↑";
  if (trend < -0.05) return "↓";
  return "→";
}
