import type { PersonalPromise } from "../types/personal";

export interface CascadeEffect {
  promiseId: string;
  body: string;
  domain: string;
}

/**
 * Get all promises that depend on a given promise (direct dependents).
 */
export function getDirectDependents(
  promiseId: string,
  promises: PersonalPromise[]
): PersonalPromise[] {
  return promises.filter((p) => p.depends_on.includes(promiseId));
}

/**
 * Get all transitive dependents (full downstream cascade).
 */
export function getTransitiveDependents(
  promiseId: string,
  promises: PersonalPromise[]
): PersonalPromise[] {
  const visited = new Set<string>();
  const result: PersonalPromise[] = [];
  const queue = [promiseId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const dependents = promises.filter(
      (p) => p.depends_on.includes(current) && !visited.has(p.id)
    );

    for (const dep of dependents) {
      visited.add(dep.id);
      result.push(dep);
      queue.push(dep.id);
    }
  }

  return result;
}

/**
 * Get all upstream dependencies (what this promise depends on).
 */
export function getUpstreamDependencies(
  promiseId: string,
  promises: PersonalPromise[]
): PersonalPromise[] {
  const promise = promises.find((p) => p.id === promiseId);
  if (!promise) return [];

  const visited = new Set<string>();
  const result: PersonalPromise[] = [];
  const queue = [...promise.depends_on];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const dep = promises.find((p) => p.id === currentId);
    if (dep) {
      result.push(dep);
      queue.push(...dep.depends_on);
    }
  }

  return result;
}

/**
 * Simulate "What If" — what happens if a promise is dropped.
 * Returns affected promises for visual display (no state mutation).
 */
export function simulateWhatIf(
  promiseId: string,
  promises: PersonalPromise[]
): CascadeEffect[] {
  const dependents = getTransitiveDependents(promiseId, promises);
  return dependents.map((p) => ({
    promiseId: p.id,
    body: p.body,
    domain: p.domain,
  }));
}
