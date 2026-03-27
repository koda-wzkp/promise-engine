"use client";

import { useMemo } from "react";
import type { Org, OrgBottleneck, CrossTeamDependency } from "@/lib/types/phase4";
import type { PromiseStatus } from "@/lib/types/promise";

interface OrgDashboardProps {
  org: Org;
  teamNames: Record<string, string>;
  onRunSimulation?: (promiseId: string) => void;
}

const STATUS_COLORS: Record<PromiseStatus, string> = {
  declared: "bg-blue-400",
  degraded: "bg-amber-400",
  verified: "bg-emerald-400",
  violated: "bg-red-400",
  unverifiable: "bg-gray-300",
};

export function OrgDashboard({ org, teamNames, onRunSimulation }: OrgDashboardProps) {
  // Compute team health (percentage of verified promises per team)
  const teamHealth = useMemo(() => {
    const health: Record<string, { total: number; verified: number; degraded: number; violated: number }> = {};
    for (const teamId of org.teams) {
      health[teamId] = { total: 0, verified: 0, degraded: 0, violated: 0 };
    }
    for (const p of org.orgPromises) {
      if (!health[p.owningTeam]) {
        health[p.owningTeam] = { total: 0, verified: 0, degraded: 0, violated: 0 };
      }
      health[p.owningTeam].total++;
      if (p.status === "verified") health[p.owningTeam].verified++;
      if (p.status === "degraded") health[p.owningTeam].degraded++;
      if (p.status === "violated") health[p.owningTeam].violated++;
    }
    return health;
  }, [org.orgPromises, org.teams]);

  // Compute bottlenecks (promises with most dependents)
  const bottlenecks = useMemo(() => {
    const dependentCount = new Map<string, number>();
    for (const p of org.orgPromises) {
      for (const depId of p.depends_on) {
        dependentCount.set(depId, (dependentCount.get(depId) ?? 0) + 1);
      }
    }
    const sorted = [...dependentCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return sorted.map(([promiseId, count]): OrgBottleneck => {
      const promise = org.orgPromises.find((p) => p.id === promiseId);
      const crossTeam = org.orgPromises.filter(
        (p) => p.depends_on.includes(promiseId) && p.owningTeam !== promise?.owningTeam
      ).length;
      return {
        promiseId,
        promiseBody: promise?.body ?? promiseId,
        owningTeam: promise?.owningTeam ?? "",
        dependentCount: count,
        crossTeamDependentCount: crossTeam,
        status: promise?.status ?? "declared",
      };
    });
  }, [org.orgPromises]);

  // Domain health
  const domainHealth = useMemo(() => {
    const domains = new Map<string, { total: number; verified: number }>();
    for (const p of org.orgPromises) {
      if (!domains.has(p.domain)) domains.set(p.domain, { total: 0, verified: 0 });
      domains.get(p.domain)!.total++;
      if (p.status === "verified") domains.get(p.domain)!.verified++;
    }
    return domains;
  }, [org.orgPromises]);

  // External dependency summary
  const civicDeps = useMemo(() => {
    const deps = org.orgPromises.flatMap((p) => p.externalDependencies);
    const byStatus: Record<string, number> = {};
    for (const d of deps) {
      byStatus[d.status] = (byStatus[d.status] ?? 0) + 1;
    }
    return { total: deps.length, byStatus };
  }, [org.orgPromises]);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard
          label="Teams"
          value={org.teams.length}
        />
        <StatCard
          label="Org Promises"
          value={org.orgPromises.length}
        />
        <StatCard
          label="Civic Dependencies"
          value={civicDeps.total}
        />
        <StatCard
          label="Cross-team Deps"
          value={bottlenecks.reduce((s, b) => s + b.crossTeamDependentCount, 0)}
        />
      </div>

      {/* Team Health */}
      <div className="bg-white rounded-xl border p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Cross-Team Health</h3>
        <div className="space-y-3">
          {org.teams.map((teamId) => {
            const h = teamHealth[teamId] ?? { total: 0, verified: 0, degraded: 0, violated: 0 };
            const healthPct = h.total > 0 ? (h.verified / h.total) * 100 : 0;
            return (
              <div key={teamId} className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-700 w-32 truncate">
                  {teamNames[teamId] ?? teamId}
                </span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      h.violated > 0 ? "bg-red-400" : h.degraded > 0 ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                    style={{ width: `${healthPct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-16 text-right">
                  {h.verified}/{h.total} kept
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottleneck Analysis */}
      {bottlenecks.length > 0 && (
        <div className="bg-white rounded-xl border p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Bottleneck Analysis</h3>
          <div className="space-y-2">
            {bottlenecks.map((b) => (
              <div
                key={b.promiseId}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{b.promiseBody}</p>
                  <p className="text-[10px] text-gray-500">
                    {teamNames[b.owningTeam] ?? b.owningTeam} ·{" "}
                    {b.dependentCount} dependent{b.dependentCount !== 1 ? "s" : ""}
                    {b.crossTeamDependentCount > 0 && (
                      <span className="text-amber-600">
                        {" "}({b.crossTeamDependentCount} cross-team)
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[b.status]}`} />
                  {onRunSimulation && (
                    <button
                      onClick={() => onRunSimulation(b.promiseId)}
                      className="text-[10px] px-2 py-0.5 border rounded text-gray-500 hover:bg-white"
                    >
                      What If?
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Domain Health */}
      <div className="bg-white rounded-xl border p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Domain Health Across Teams</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {[...domainHealth.entries()].map(([domain, h]) => (
            <div key={domain} className="p-2 rounded-lg bg-gray-50">
              <span className="text-xs font-medium text-gray-700 capitalize">{domain}</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${h.total > 0 ? (h.verified / h.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500">{h.verified}/{h.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border p-4 text-center">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
