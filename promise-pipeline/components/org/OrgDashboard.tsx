"use client";

import { useState } from "react";
import type { Org, OrgPromise } from "@/lib/types/org";
import type { GardenTeamPromise } from "@/lib/types/gardenTeam";
import { computeBottlenecks } from "@/lib/types/org";
import { OrgCascadeSimulator } from "./OrgCascadeSimulator";
import { DependencyMap } from "./DependencyMap";

type OrgView = "health" | "cascade" | "deps";

const STATUS_COLORS: Record<string, string> = {
  declared:     "bg-blue-50 text-blue-700 border-blue-200",
  verified:     "bg-green-50 text-green-700 border-green-200",
  degraded:     "bg-amber-50 text-amber-700 border-amber-200",
  violated:     "bg-red-50 text-red-700 border-red-200",
  unverifiable: "bg-gray-50 text-gray-500 border-gray-200",
};

/**
 * OrgDashboard — cross-team health, bottleneck analysis, cascade simulator,
 * and dependency map for an org.
 */
export function OrgDashboard({
  org,
  teamPromises,
  teamNames,
}: {
  org: Org;
  teamPromises: GardenTeamPromise[];
  teamNames?: Record<string, string>;
}) {
  const [view, setView] = useState<OrgView>("health");

  const orgPromises = org.orgPromises;
  const total = orgPromises.length;
  const kept = orgPromises.filter((p) => p.status === "verified").length;
  const broken = orgPromises.filter((p) => p.status === "violated").length;
  const degraded = orgPromises.filter((p) => p.status === "degraded").length;
  const completed = kept + broken;
  const fulfillmentRate = completed > 0 ? kept / completed : 0;

  const bottlenecks = computeBottlenecks(orgPromises, 5);

  // Per-team breakdown
  const teamIds = Array.from(new Set(orgPromises.map((p) => p.owningTeam)));
  const teamName = (id: string) => teamNames?.[id] ?? id.slice(0, 8);

  return (
    <div className="space-y-4">
      {/* View switcher */}
      <div className="flex gap-2 flex-wrap">
        {(["health", "cascade", "deps"] as OrgView[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              view === v
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border hover:bg-gray-50"
            }`}
          >
            {v === "health" && "Health"}
            {v === "cascade" && "What If"}
            {v === "deps" && "Dependency Map"}
          </button>
        ))}
      </div>

      {/* ── HEALTH ── */}
      {view === "health" && (
        <div className="space-y-4">
          {/* Org-level health barometer */}
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm text-gray-900">Org network health</h3>
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(fulfillmentRate * 100)}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${fulfillmentRate * 100}%`,
                  background: fulfillmentRate > 0.7 ? "#16a34a" : fulfillmentRate > 0.4 ? "#f59e0b" : "#dc2626",
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3 text-center">
              <div>
                <p className="text-lg font-bold text-green-700">{kept}</p>
                <p className="text-xs text-gray-500">Kept</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-600">{degraded}</p>
                <p className="text-xs text-gray-500">Degraded</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-600">{broken}</p>
                <p className="text-xs text-gray-500">Broken</p>
              </div>
            </div>
          </div>

          {/* Per-team breakdown */}
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-medium text-sm text-gray-900 mb-3">By team</h3>
            <div className="space-y-2">
              {teamIds.map((tid) => {
                const tp = orgPromises.filter((p) => p.owningTeam === tid);
                const tk = tp.filter((p) => p.status === "verified").length;
                const tc = tk + tp.filter((p) => p.status === "violated").length;
                const rate = tc > 0 ? tk / tc : 0;
                return (
                  <div key={tid} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-20 truncate flex-shrink-0">
                      {teamName(tid)}
                    </span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${rate * 100}%`,
                          background: rate > 0.7 ? "#16a34a" : rate > 0.4 ? "#f59e0b" : "#dc2626",
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right flex-shrink-0">
                      {Math.round(rate * 100)}%
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {tp.length} promises
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottleneck analysis */}
          {bottlenecks.length > 0 && (
            <div className="bg-white rounded-xl border p-4">
              <h3 className="font-medium text-sm text-gray-900 mb-3">Bottlenecks</h3>
              <p className="text-xs text-gray-500 mb-3">
                Promises with the most cross-team dependents — failure here cascades furthest.
              </p>
              <div className="space-y-2">
                {bottlenecks.map(({ promise: p, dependentCount }) => (
                  <div key={p.id} className={`rounded-lg border px-3 py-2 ${STATUS_COLORS[p.status] ?? ""}`}>
                    <p className="text-xs font-medium leading-snug line-clamp-1">{p.body}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs opacity-70">{teamName(p.owningTeam)}</span>
                      <span className="text-xs opacity-70">·</span>
                      <span className="text-xs opacity-70">
                        {dependentCount} dependent{dependentCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Org promises kanban */}
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-medium text-sm text-gray-900 mb-3">
              Org promises ({total})
            </h3>
            {total === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                No org-level promises yet.
              </p>
            ) : (
              <div className="space-y-2">
                {orgPromises.map((p) => (
                  <div
                    key={p.id}
                    className={`rounded-lg border px-3 py-2 ${STATUS_COLORS[p.status] ?? ""}`}
                  >
                    <p className="text-xs font-medium leading-snug line-clamp-1">{p.body}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs opacity-70">
                      <span>{teamName(p.owningTeam)}</span>
                      {p.externalDependencies.length > 0 && (
                        <span>· {p.externalDependencies.length} ext dep{p.externalDependencies.length !== 1 ? "s" : ""}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CASCADE ── */}
      {view === "cascade" && (
        <OrgCascadeSimulator orgPromises={orgPromises} teamPromises={teamPromises} />
      )}

      {/* ── DEPENDENCY MAP ── */}
      {view === "deps" && (
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-medium text-sm text-gray-900 mb-3">Dependency map</h3>
          <DependencyMap
            orgPromises={orgPromises}
            teamPromises={teamPromises}
            teamNames={teamNames}
          />
        </div>
      )}
    </div>
  );
}
