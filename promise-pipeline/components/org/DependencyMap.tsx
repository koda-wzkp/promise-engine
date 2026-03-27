"use client";

import { useMemo } from "react";
import type { Org, CrossTeamDependency } from "@/lib/types/phase4";
import type { PromiseStatus } from "@/lib/types/promise";

interface DependencyMapProps {
  org: Org;
  teamNames: Record<string, string>;
  onSelectPromise?: (promiseId: string) => void;
}

const STATUS_BG: Record<PromiseStatus, string> = {
  declared: "bg-blue-100 border-blue-200",
  degraded: "bg-amber-100 border-amber-200",
  verified: "bg-emerald-100 border-emerald-200",
  violated: "bg-red-100 border-red-200",
  unverifiable: "bg-gray-100 border-gray-200",
};

/**
 * Directed graph of all cross-team dependencies.
 * Rendered as a list-based adjacency view (not SVG graph).
 */
export function DependencyMap({ org, teamNames, onSelectPromise }: DependencyMapProps) {
  // Build adjacency list grouped by team
  const { adjacency, crossTeamDeps } = useMemo(() => {
    const adj = new Map<string, { promise: typeof org.orgPromises[0]; deps: string[]; dependents: string[] }>();

    for (const p of org.orgPromises) {
      adj.set(p.id, { promise: p, deps: [...p.depends_on], dependents: [] });
    }

    // Build reverse lookup (who depends on me)
    for (const p of org.orgPromises) {
      for (const depId of p.depends_on) {
        const entry = adj.get(depId);
        if (entry) {
          entry.dependents.push(p.id);
        }
      }
    }

    // Cross-team deps
    const ctDeps: CrossTeamDependency[] = [];
    for (const p of org.orgPromises) {
      for (const depId of p.depends_on) {
        const dep = org.orgPromises.find((pp) => pp.id === depId);
        if (dep && dep.owningTeam !== p.owningTeam) {
          ctDeps.push({
            fromPromiseId: p.id,
            fromTeamId: p.owningTeam,
            toPromiseId: dep.id,
            toTeamId: dep.owningTeam,
          });
        }
      }
    }

    return { adjacency: adj, crossTeamDeps: ctDeps };
  }, [org.orgPromises]);

  // Group by team
  const byTeam = useMemo(() => {
    const map = new Map<string, typeof org.orgPromises>();
    for (const p of org.orgPromises) {
      if (!map.has(p.owningTeam)) map.set(p.owningTeam, []);
      map.get(p.owningTeam)!.push(p);
    }
    return map;
  }, [org.orgPromises]);

  if (org.orgPromises.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-xl border">
        <p className="text-sm text-gray-500">No org promises to map.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-1">Dependency Map</h3>
        <p className="text-xs text-gray-500 mb-4">
          {org.orgPromises.length} promises · {crossTeamDeps.length} cross-team dependencies
        </p>

        {[...byTeam.entries()].map(([teamId, promises]) => (
          <div key={teamId} className="mb-4 last:mb-0">
            <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">
              {teamNames[teamId] ?? teamId}
            </h4>
            <div className="space-y-1.5">
              {promises.map((p) => {
                const entry = adjacency.get(p.id);
                const hasCrossTeamDep = p.depends_on.some((depId) => {
                  const dep = org.orgPromises.find((pp) => pp.id === depId);
                  return dep && dep.owningTeam !== p.owningTeam;
                });
                const hasCrossTeamDependent = entry?.dependents.some((depId) => {
                  const dep = org.orgPromises.find((pp) => pp.id === depId);
                  return dep && dep.owningTeam !== p.owningTeam;
                });

                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectPromise?.(p.id)}
                    className={`w-full text-left p-2 rounded-lg border text-xs transition-colors ${STATUS_BG[p.status]} hover:shadow-sm`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 truncate">{p.body}</span>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        {hasCrossTeamDep && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">
                            ← cross-team
                          </span>
                        )}
                        {hasCrossTeamDependent && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-600">
                            → cross-team
                          </span>
                        )}
                      </div>
                    </div>
                    {(entry?.deps.length ?? 0) > 0 && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Depends on: {entry!.deps.map((d) => {
                          const dp = org.orgPromises.find((pp) => pp.id === d);
                          return dp ? dp.body.slice(0, 30) : d;
                        }).join(", ")}
                      </p>
                    )}
                    {p.externalDependencies.length > 0 && (
                      <p className="text-[10px] text-blue-500 mt-0.5">
                        Civic: {p.externalDependencies.map((d) => d.label).join(", ")}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
