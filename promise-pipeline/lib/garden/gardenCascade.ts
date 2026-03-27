/**
 * Garden Cascade — Personal Promise Dependency Propagation (Phase 2)
 *
 * Simplified cascade engine for the personal garden context.
 * Reuses the BFS pattern from lib/simulation/cascade.ts but
 * adapted for GardenPromise and visual stress propagation.
 *
 * When a promise degrades:
 * 1. Run cascade through dependency graph
 * 2. Dependent promises show visual stress (not status change)
 * 3. Optional notification: "Your X promise may be affected..."
 */

import { PromiseStatus } from "../types/promise";
import { GardenPromise, GardenNotification } from "../types/garden";

export interface CascadeEffect {
  promiseId: string;
  /** Visual stress level to apply (0-1) */
  stressLevel: number;
  /** Cascade depth from the source */
  depth: number;
  /** Human-readable reason */
  reason: string;
  /** Source promise that triggered the cascade */
  sourceId: string;
}

/**
 * Propagate visual stress through the dependency graph.
 *
 * Unlike the civic cascade engine, the personal garden cascade
 * does NOT change promise statuses. It only computes stress levels
 * for visual feedback (leaf droop, color shift, pulsing connections).
 */
export function propagateGardenCascade(
  promises: GardenPromise[],
  changedId: string,
  newStatus: PromiseStatus
): CascadeEffect[] {
  // Only propagate for negative status changes
  if (newStatus === "verified" || newStatus === "declared") return [];

  const promiseMap = new Map(promises.map((p) => [p.id, p]));
  const source = promiseMap.get(changedId);
  if (!source) return [];

  // Build reverse adjacency: for each promise, which promises depend on it?
  const dependents = new Map<string, string[]>();
  for (const p of promises) {
    for (const depId of p.depends_on) {
      if (!dependents.has(depId)) dependents.set(depId, []);
      dependents.get(depId)!.push(p.id);
    }
  }

  const effects: CascadeEffect[] = [];
  const visited = new Set<string>([changedId]);
  const queue: { id: string; depth: number }[] = [];

  // Seed with direct dependents
  const directDeps = dependents.get(changedId) || [];
  for (const depId of directDeps) {
    queue.push({ id: depId, depth: 1 });
  }

  const stressFromStatus: Record<string, number> = {
    degraded: 0.4,
    violated: 0.8,
    unverifiable: 0.3,
  };

  const baseStress = stressFromStatus[newStatus] ?? 0.2;

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);

    const promise = promiseMap.get(id);
    if (!promise) continue;

    // Stress attenuates with depth
    const depthFactor = Math.pow(0.6, depth - 1);
    const stress = Math.min(1, baseStress * depthFactor);

    if (stress < 0.05) continue; // Below visual threshold

    effects.push({
      promiseId: id,
      stressLevel: stress,
      depth,
      reason: `Affected by "${source.body}" (${newStatus})`,
      sourceId: changedId,
    });

    // Continue BFS
    const nextDeps = dependents.get(id) || [];
    for (const nextId of nextDeps) {
      if (!visited.has(nextId)) {
        queue.push({ id: nextId, depth: depth + 1 });
      }
    }
  }

  return effects;
}

/**
 * Generate notifications for cascade effects.
 * Only generates notifications for direct dependents (depth 1)
 * to avoid notification spam.
 */
export function generateCascadeNotifications(
  effects: CascadeEffect[],
  promises: GardenPromise[]
): GardenNotification[] {
  const promiseMap = new Map(promises.map((p) => [p.id, p]));

  return effects
    .filter((e) => e.depth === 1 && e.stressLevel >= 0.3)
    .map((e) => {
      const affected = promiseMap.get(e.promiseId);
      const source = promiseMap.get(e.sourceId);
      return {
        id: `notif-cascade-${Date.now()}-${e.promiseId}`,
        type: "dependency-stress" as const,
        channel: "in-app" as const,
        recipientId: "self",
        promiseId: e.promiseId,
        message: `Your ${affected?.domain ?? "promise"} promise "${affected?.body ?? ""}" may be affected because "${source?.body ?? ""}" is struggling`,
        createdAt: new Date().toISOString(),
        read: false,
      };
    });
}
