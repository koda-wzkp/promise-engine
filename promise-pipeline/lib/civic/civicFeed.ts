/**
 * Civic Data Feed — Syncs external civic dependency statuses
 * from the Promise Pipeline civic dashboards (HB 2021, Gresham CAP).
 *
 * Reads from lib/data/ files (same data the demo dashboards render).
 * In production, this would query a civic promise API.
 */

import type { PromiseStatus } from "../types/promise";
import type { Org, OrgPromise, ExternalDependency, ZoomChainLevel } from "../types/phase4";
import type { Promise as PPPromise, DashboardData } from "../types/promise";

// Lazy-loaded civic data
let _hb2021: DashboardData | null = null;
let _gresham: DashboardData | null = null;

async function loadDashboard(dashboard: string): Promise<DashboardData | null> {
  try {
    if (dashboard === "hb2021") {
      if (!_hb2021) {
        const mod = await import("../data/hb2021");
        _hb2021 = mod.hb2021Data;
      }
      return _hb2021;
    }
    if (dashboard === "gresham") {
      if (!_gresham) {
        const mod = await import("../data/gresham");
        _gresham = mod.greshamData;
      }
      return _gresham;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch the current status of a civic promise from dashboard data.
 */
export async function fetchCivicPromiseStatus(
  civicPromiseId: string,
  civicDashboard: string
): Promise<PromiseStatus | null> {
  const data = await loadDashboard(civicDashboard);
  if (!data) return null;

  const promise = data.promises.find(
    (p) => p.id === civicPromiseId || p.ref === civicPromiseId
  );
  return promise?.status ?? null;
}

/**
 * Fetch full civic promise data for display.
 */
export async function fetchCivicPromise(
  civicPromiseId: string,
  civicDashboard: string
): Promise<PPPromise | null> {
  const data = await loadDashboard(civicDashboard);
  if (!data) return null;

  return data.promises.find(
    (p) => p.id === civicPromiseId || p.ref === civicPromiseId
  ) ?? null;
}

/**
 * Sync all civic dependencies for an org.
 * Returns list of dependencies whose status changed.
 */
export async function syncCivicDependencies(
  org: Org
): Promise<{ promiseId: string; dep: ExternalDependency; oldStatus: PromiseStatus; newStatus: PromiseStatus }[]> {
  const changes: { promiseId: string; dep: ExternalDependency; oldStatus: PromiseStatus; newStatus: PromiseStatus }[] = [];

  for (const promise of org.orgPromises) {
    for (const dep of promise.externalDependencies) {
      if (!dep.civicPromiseId || !dep.civicDashboard) continue;

      const newStatus = await fetchCivicPromiseStatus(dep.civicPromiseId, dep.civicDashboard);
      if (newStatus && newStatus !== dep.status) {
        changes.push({
          promiseId: promise.id,
          dep,
          oldStatus: dep.status,
          newStatus,
        });
      }
    }
  }

  return changes;
}

/**
 * Build the full NCTP zoom chain from a personal promise up to civic/state level.
 * Returns the chain of levels for the CivicZoomTransition component.
 */
export function buildZoomChain(
  promiseId: string,
  promises: { id: string; parent: string | null; body: string; status: PromiseStatus; domain: string; teamPromiseId?: string }[],
  teamName?: string,
  org?: Org
): ZoomChainLevel[] {
  const chain: ZoomChainLevel[] = [];

  // Find the promise
  const promise = promises.find((p) => p.id === promiseId);
  if (!promise) return chain;

  // Walk up the parent chain to find the root
  let current = promise;
  const ancestry: typeof promises = [current];
  while (current.parent) {
    const parent = promises.find((p) => p.id === current.parent);
    if (!parent) break;
    ancestry.unshift(parent);
    current = parent;
  }

  // Build chain from bottom up
  // If clicked promise is a sub-promise, show sub-promise level
  if (promise.parent) {
    chain.push({
      level: "sub-promise",
      label: promise.body,
      promiseId: promise.id,
      status: promise.status,
    });
  }

  // Personal promise (the root of the local chain, or the clicked promise if no parent)
  const rootPersonal = ancestry[0];
  chain.push({
    level: "personal",
    label: rootPersonal.body,
    promiseId: rootPersonal.id,
    status: rootPersonal.status,
  });

  // Team level (if this is a team-linked promise)
  const teamPromiseId = (rootPersonal as any).teamPromiseId;
  if (teamPromiseId && teamName) {
    chain.push({
      level: "team",
      label: `Team promise: ${rootPersonal.body}`,
      promiseId: teamPromiseId,
      status: rootPersonal.status,
      entityName: teamName,
    });
  }

  // Org level (find org promise that this team promise feeds into)
  if (org) {
    for (const orgPromise of org.orgPromises) {
      const isContributing =
        orgPromise.depends_on.includes(teamPromiseId ?? rootPersonal.id) ||
        orgPromise.contributingTeams.some((t) => t === (rootPersonal as any).teamId);

      if (isContributing) {
        chain.push({
          level: "org",
          label: orgPromise.body,
          promiseId: orgPromise.id,
          status: orgPromise.status,
          entityName: org.name,
        });

        // Civic dependencies
        for (const dep of orgPromise.externalDependencies) {
          chain.push({
            level: "civic-dependency",
            label: dep.label,
            promiseId: dep.civicPromiseId,
            status: dep.status,
          });

          // Civic dashboard
          if (dep.civicDashboard) {
            chain.push({
              level: "civic-dashboard",
              label: dep.civicDashboard === "gresham"
                ? "Gresham Climate Action Plan"
                : dep.civicDashboard === "hb2021"
                ? "Oregon HB 2021"
                : dep.civicDashboard,
              entityName: dep.civicDashboard,
            });
          }
        }
        break; // Use first matching org promise
      }
    }
  }

  return chain;
}
