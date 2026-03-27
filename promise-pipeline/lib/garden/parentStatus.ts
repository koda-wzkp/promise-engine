/**
 * Parent Status Computation — Phase 2
 *
 * A parent promise's status is computed from its children:
 *   - All children verified → parent verified
 *   - Any child degraded → parent degraded
 *   - Any child violated → parent degraded (partial failure)
 *   - All children violated → parent violated
 *
 * This mirrors the factory pattern from lib/analysis/factory.ts
 * but simplified for the personal garden context.
 */

import { PromiseStatus } from "../types/promise";
import { GardenPromise } from "../types/garden";

/**
 * Compute a parent promise's status from its children.
 * Returns null if the promise has no children (status is self-managed).
 */
export function computeParentStatus(
  parent: GardenPromise,
  allPromises: GardenPromise[]
): PromiseStatus | null {
  if (parent.children.length === 0) return null;

  const children = allPromises.filter((p) =>
    parent.children.includes(p.id)
  );

  if (children.length === 0) return null;

  const statuses = children.map((c) => c.status);

  const allVerified = statuses.every((s) => s === "verified");
  if (allVerified) return "verified";

  const allViolated = statuses.every((s) => s === "violated");
  if (allViolated) return "violated";

  const anyViolated = statuses.some((s) => s === "violated");
  if (anyViolated) return "degraded";

  const anyDegraded = statuses.some((s) => s === "degraded");
  if (anyDegraded) return "degraded";

  // Mix of declared/unverifiable — still in progress
  const anyVerified = statuses.some((s) => s === "verified");
  if (anyVerified) return "declared"; // partially complete

  return "declared";
}

/**
 * Recompute all parent statuses in the promise list.
 * Returns a new array with updated parent statuses.
 * Does not mutate the input.
 */
export function recomputeAllParentStatuses(
  promises: GardenPromise[]
): GardenPromise[] {
  const result = promises.map((p) => ({ ...p }));

  // Process bottom-up: leaf promises first, then parents
  // Simple approach: iterate until stable (max depth unlikely > 5)
  let changed = true;
  let iterations = 0;
  const maxIterations = 10;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    for (let i = 0; i < result.length; i++) {
      const p = result[i];
      if (p.children.length === 0) continue;

      const newStatus = computeParentStatus(p, result);
      if (newStatus !== null && newStatus !== p.status) {
        result[i] = { ...p, status: newStatus };
        changed = true;
      }
    }
  }

  return result;
}
