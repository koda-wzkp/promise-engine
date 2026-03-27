"use client";

import { useMemo } from "react";
import type { Org, OrgPromise, CrossTeamDependency } from "@/lib/types/phase4";
import type { PromiseStatus } from "@/lib/types/promise";
import { OrgTree } from "./OrgTree";
import { CrossTeamBridge } from "./CrossTeamBridge";

interface OrgGardenProps {
  org: Org;
  teamNames: Record<string, string>;
  onSelectPromise?: (promiseId: string) => void;
  onStatusUpdate?: (promiseId: string, status: PromiseStatus) => void;
}

const STATUS_WEATHER: Record<PromiseStatus, string> = {
  declared: "Partly cloudy",
  degraded: "Overcast, gusty",
  verified: "Clear skies",
  violated: "Storm warning",
  unverifiable: "Fog",
};

export function OrgGarden({ org, teamNames, onSelectPromise, onStatusUpdate }: OrgGardenProps) {
  // Group org promises by owning team
  const promisesByTeam = useMemo(() => {
    const map = new Map<string, OrgPromise[]>();
    for (const p of org.orgPromises) {
      const team = p.owningTeam;
      if (!map.has(team)) map.set(team, []);
      map.get(team)!.push(p);
    }
    return map;
  }, [org.orgPromises]);

  // Compute cross-team dependencies
  const crossTeamDeps = useMemo(() => {
    const deps: CrossTeamDependency[] = [];
    for (const promise of org.orgPromises) {
      for (const depId of promise.depends_on) {
        const dep = org.orgPromises.find((p) => p.id === depId);
        if (dep && dep.owningTeam !== promise.owningTeam) {
          deps.push({
            fromPromiseId: promise.id,
            fromTeamId: promise.owningTeam,
            toPromiseId: dep.id,
            toTeamId: dep.owningTeam,
          });
        }
      }
    }
    return deps;
  }, [org.orgPromises]);

  // Org-wide weather based on overall status
  const healthyCount = org.orgPromises.filter((p) => p.status === "verified").length;
  const totalCount = org.orgPromises.length;
  const healthRatio = totalCount > 0 ? healthyCount / totalCount : 0;
  const weather = healthRatio > 0.7 ? "Clear" : healthRatio > 0.4 ? "Cloudy" : "Stormy";

  return (
    <div className="space-y-6">
      {/* Org landscape header */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900">{org.name}</h2>
            <p className="text-sm text-gray-500">
              {org.teams.length} teams · {org.orgPromises.length} org-level promises · Weather: {weather}
            </p>
          </div>
        </div>

        {/* Cross-team bridges (top-level view of dependencies) */}
        {crossTeamDeps.length > 0 && (
          <div className="mt-3 pt-3 border-t border-green-200/50">
            <p className="text-xs font-medium text-gray-600 mb-2">
              Cross-team dependencies ({crossTeamDeps.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {crossTeamDeps.map((dep, i) => (
                <CrossTeamBridge
                  key={i}
                  dep={dep}
                  fromTeamName={teamNames[dep.fromTeamId] ?? dep.fromTeamId}
                  toTeamName={teamNames[dep.toTeamId] ?? dep.toTeamId}
                  fromStatus={org.orgPromises.find((p) => p.id === dep.fromPromiseId)?.status ?? "declared"}
                  toStatus={org.orgPromises.find((p) => p.id === dep.toPromiseId)?.status ?? "declared"}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Team plots */}
      {org.teams.map((teamId) => {
        const teamPromises = promisesByTeam.get(teamId) ?? [];
        return (
          <div key={teamId} className="bg-white rounded-xl border p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {teamNames[teamId] ?? teamId}
              <span className="text-gray-400 ml-2">
                {teamPromises.length} promise{teamPromises.length !== 1 ? "s" : ""}
              </span>
            </h3>
            {teamPromises.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {teamPromises.map((p) => (
                  <OrgTree
                    key={p.id}
                    promise={p}
                    teamName={teamNames[p.owningTeam] ?? p.owningTeam}
                    contributingTeamNames={p.contributingTeams.map(
                      (t) => teamNames[t] ?? t
                    )}
                    onSelect={() => onSelectPromise?.(p.id)}
                    onStatusUpdate={onStatusUpdate}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No org-level promises assigned yet.</p>
            )}
          </div>
        );
      })}

      {org.orgPromises.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <p className="text-gray-500 text-sm">No org-level promises yet.</p>
          <p className="text-gray-400 text-xs mt-1">
            Create org promises that span teams to see the garden view.
          </p>
        </div>
      )}
    </div>
  );
}
