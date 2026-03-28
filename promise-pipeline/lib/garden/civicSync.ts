/**
 * Phase 4 — Civic sync library.
 *
 * Reads status from the existing civic dashboard data files.
 * No network calls — civic data is currently static local data.
 *
 * When org promises declare external dependencies on civic promises
 * (e.g. "Gresham CAP GRE-UFT-04"), this module resolves their current
 * status from the corresponding data file and surfaces any changes
 * that should cascade through the org promise network.
 */

import type { ExternalDependency, OrgPromise, Org } from "../types/org";
import type { PromiseStatus } from "../types/promise";

// ─── CIVIC DASHBOARD REGISTRY ─────────────────────────────────────────────────

/**
 * Maps civic dashboard slugs to their data modules.
 * Lazy-loaded so the org module doesn't bundle all civic data by default.
 */
const CIVIC_LOADERS: Record<string, () => Promise<{ promises: { id: string; status: PromiseStatus }[] }>> = {
  gresham: () => import("../data/gresham").then((m) => ({ promises: m.promises ?? [] })),
  hb2021:  () => import("../data/hb2021").then((m) => ({ promises: m.promises ?? [] })),
  // jcpoa and iss are available but not typically linked to org promises
};

// Fallback: try common export names
async function loadCivicData(dashboard: string): Promise<{ id: string; status: PromiseStatus }[]> {
  const loader = CIVIC_LOADERS[dashboard];
  if (!loader) return [];

  try {
    const mod = await loader();
    return mod.promises;
  } catch {
    return [];
  }
}

// ─── STATUS LOOKUP ────────────────────────────────────────────────────────────

/**
 * Look up the current status of a civic promise by ID and dashboard.
 * Returns null if not found.
 */
export async function fetchCivicPromiseStatus(
  civicPromiseId: string,
  dashboard: string
): Promise<PromiseStatus | null> {
  const promises = await loadCivicData(dashboard);
  const found = promises.find((p) => p.id === civicPromiseId);
  return found?.status ?? null;
}

// ─── SYNC ─────────────────────────────────────────────────────────────────────

export interface CivicSyncResult {
  /** Promise IDs whose civic dependency status changed */
  updatedOrgPromiseIds: string[];
  /** Map of dep ID → new status */
  statusChanges: Record<string, PromiseStatus>;
}

/**
 * Sync all external civic dependencies for an org.
 * Returns IDs of org promises whose dependency status changed.
 *
 * Callers should run an org cascade for each affected promise.
 */
export async function syncCivicDependencies(org: Org): Promise<CivicSyncResult> {
  const updatedOrgPromiseIds: string[] = [];
  const statusChanges: Record<string, PromiseStatus> = {};

  for (const promise of org.orgPromises) {
    for (const dep of promise.externalDependencies) {
      if (!dep.civicPromiseId || !dep.civicDashboard) continue;

      const currentStatus = await fetchCivicPromiseStatus(dep.civicPromiseId, dep.civicDashboard);
      if (currentStatus === null) continue;

      if (currentStatus !== dep.status) {
        statusChanges[dep.id] = currentStatus;
        if (!updatedOrgPromiseIds.includes(promise.id)) {
          updatedOrgPromiseIds.push(promise.id);
        }
      }
    }
  }

  return { updatedOrgPromiseIds, statusChanges };
}

// ─── CIVIC PROMISE LOOKUP ─────────────────────────────────────────────────────

/**
 * Get the full civic promise data (body, domain, etc.) for display
 * in the ExternalDependencyCard and CivicZoomTransition.
 */
export async function fetchCivicPromiseSummary(
  civicPromiseId: string,
  dashboard: string
): Promise<{
  id: string;
  body: string;
  domain: string;
  status: PromiseStatus;
  promiser: string;
} | null> {
  try {
    let allPromises: Record<string, unknown>[] = [];

    if (dashboard === "gresham") {
      const mod = await import("../data/gresham");
      allPromises = (mod.promises ?? []) as unknown as Record<string, unknown>[];
    } else if (dashboard === "hb2021") {
      const mod = await import("../data/hb2021");
      allPromises = (mod.promises ?? []) as unknown as Record<string, unknown>[];
    }

    const found = allPromises.find((p) => p.id === civicPromiseId) as Record<string, unknown> | undefined;
    if (!found) return null;

    return {
      id: found.id as string,
      body: found.body as string,
      domain: found.domain as string,
      status: found.status as PromiseStatus,
      promiser: found.promiser as string,
    };
  } catch {
    return null;
  }
}

// ─── CIVIC LINK SUGGESTIONS ───────────────────────────────────────────────────

/**
 * Suggest relevant civic promises for an org promise based on domain overlap.
 * Used in CivicLinkSetup to help users find relevant civic dependencies.
 */
export async function suggestCivicLinks(
  orgPromiseDomain: string,
  dashboard: "gresham" | "hb2021"
): Promise<Array<{ id: string; body: string; domain: string; status: PromiseStatus }>> {
  try {
    let allPromises: Record<string, unknown>[] = [];

    if (dashboard === "gresham") {
      const mod = await import("../data/gresham");
      allPromises = (mod.promises ?? []) as unknown as Record<string, unknown>[];
    } else if (dashboard === "hb2021") {
      const mod = await import("../data/hb2021");
      allPromises = (mod.promises ?? []) as unknown as Record<string, unknown>[];
    }

    // Filter by domain similarity (case-insensitive partial match)
    const lower = orgPromiseDomain.toLowerCase();
    const relevant = allPromises.filter((p) => {
      const d = (p.domain as string).toLowerCase();
      return d.includes(lower) || lower.includes(d.split(" ")[0]);
    });

    return (relevant.slice(0, 10) as Record<string, unknown>[]).map((p) => ({
      id: p.id as string,
      body: (p.body as string).slice(0, 120),
      domain: p.domain as string,
      status: p.status as PromiseStatus,
    }));
  } catch {
    return [];
  }
}
