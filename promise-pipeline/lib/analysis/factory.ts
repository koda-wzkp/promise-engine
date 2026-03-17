/**
 * Promise Factory Analysis — Computed Status & Progress
 *
 * A factory's status and progress are derived from its children,
 * not assigned directly. The factory never has its own check-in.
 *
 * First identified: Paris Agreement analysis (March 2026).
 * The treaty is a meta-promise that generates NDCs.
 */

import { Promise, PromiseStatus, PromiseFactory } from "../types/promise";

/** Status-to-score mapping for weighted completion computation. */
const STATUS_WEIGHTS: Record<PromiseStatus, number> = {
  verified: 1.0,
  declared: 0.5,
  degraded: 0.3,
  violated: 0.0,
  unverifiable: 0.2,
};

/**
 * Compute a factory's status from its children.
 * The factory never has its own check-in — its status emerges.
 *
 * Rules:
 *   If no children exist yet → "declared" (factory exists but hasn't produced anything)
 *   If completion condition met → "verified"
 *   If completion condition partially met → "degraded"
 *   If majority of children violated → "violated"
 *   If children are unverifiable → "unverifiable"
 */
export function computeFactoryStatus(
  factory: PromiseFactory,
  allPromises: Promise[]
): PromiseStatus {
  const children = allPromises.filter(p => factory.childPromises.includes(p.id));

  if (children.length === 0) return "declared";

  switch (factory.completionCondition.type) {
    case "all": {
      const allVerified = children.every(c => c.status === "verified");
      if (allVerified) return "verified";
      const anyViolated = children.some(c => c.status === "violated");
      if (anyViolated) return "degraded";
      return "declared";
    }

    case "threshold": {
      const threshold = factory.completionCondition.threshold ?? 0.7;
      const verifiedFraction = children.filter(c => c.status === "verified").length / children.length;
      const violatedFraction = children.filter(c => c.status === "violated").length / children.length;

      if (verifiedFraction >= threshold) return "verified";
      if (violatedFraction > (1 - threshold)) return "violated";
      if (verifiedFraction > 0) return "degraded";
      return "declared";
    }

    case "weighted": {
      const weights = factory.completionCondition.weights ?? {};
      let totalWeight = 0;
      let weightedScore = 0;

      for (const child of children) {
        const w = weights[child.id] ?? 1;
        totalWeight += w;
        weightedScore += w * STATUS_WEIGHTS[child.status];
      }

      const score = totalWeight > 0 ? weightedScore / totalWeight : 0;
      if (score >= 0.85) return "verified";
      if (score >= 0.5) return "degraded";
      if (score >= 0.2) return "degraded";
      return "violated";
    }
  }
}

/**
 * Compute a factory's progress as the weighted average of children's progress.
 * Returns 0–1.
 */
export function computeFactoryProgress(
  factory: PromiseFactory,
  allPromises: Promise[]
): number {
  const children = allPromises.filter(p => factory.childPromises.includes(p.id));
  if (children.length === 0) return 0;

  const weights = factory.completionCondition.weights;

  if (weights && factory.completionCondition.type === "weighted") {
    let totalWeight = 0;
    let weightedProgress = 0;
    for (const child of children) {
      const w = weights[child.id] ?? 1;
      totalWeight += w;
      weightedProgress += w * (child.progress ?? 0) / 100;
    }
    return totalWeight > 0 ? weightedProgress / totalWeight : 0;
  }

  // Default: simple average
  const avg = children.reduce((sum, c) => sum + ((c.progress ?? 0) / 100), 0) / children.length;
  return avg;
}

/**
 * Generate a human-readable narrative for a factory node in cascade results.
 * Instead of "P001 degrades from verified to degraded", produces:
 * "Goal 'Lose 30 pounds' degrades because 2 of its 5 sub-promises have failed"
 */
export function generateFactoryNarrative(
  factory: PromiseFactory,
  allPromises: Promise[],
  newStatus: PromiseStatus
): string {
  const children = allPromises.filter(p => factory.childPromises.includes(p.id));
  const totalChildren = children.length;
  const violatedChildren = children.filter(c => c.status === "violated" || c.status === "degraded").length;
  const verifiedChildren = children.filter(c => c.status === "verified").length;

  if (totalChildren === 0) {
    return `Goal "${factory.body}" has no sub-promises yet`;
  }

  if (newStatus === "verified") {
    return `Goal "${factory.body}" achieved: ${verifiedChildren}/${totalChildren} sub-promises verified`;
  }

  if (newStatus === "violated") {
    return `Goal "${factory.body}" failed: ${violatedChildren}/${totalChildren} sub-promises have failed`;
  }

  return `Goal "${factory.body}" degrades because ${violatedChildren} of its ${totalChildren} sub-promises have failed`;
}
