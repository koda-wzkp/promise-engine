"use client";

import { useState } from "react";
import type { Org } from "@/lib/types/org";
import type { GardenTeam } from "@/lib/types/gardenTeam";
import { OrgTree } from "./OrgTree";
import { CrossTeamBridge } from "./CrossTeamBridge";
import { CivicZoomTransition } from "./CivicZoomTransition";
import type { ExternalDependency } from "@/lib/types/org";
import type { PromiseStatus } from "@/lib/types/promise";

const PLOT_COLORS = [
  "#dcfce7", "#dbeafe", "#fef9c3", "#fce7f3",
  "#ede9fe", "#ffedd5", "#f0fdf4", "#eff6ff",
];

/**
 * OrgGarden — the org-level landscape.
 *
 * Renders team plots side-by-side, org-level promise trees spanning plots,
 * and cross-team dependency bridges. Zoom continues: org → team → plant → sub-promise.
 */
export function OrgGarden({
  org,
  teams,
  onZoomToTeam,
}: {
  org: Org;
  teams: GardenTeam[];
  onZoomToTeam?: (teamId: string) => void;
}) {
  const [civicZoomDep, setCivicZoomDep] = useState<ExternalDependency | null>(null);

  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const teamNames = Object.fromEntries(teams.map((t) => [t.id, t.name]));

  // Cross-team dependencies: org promises that depend on team promises
  const crossTeamBridges: {
    fromTeamId: string;
    toTeamId: string;
    fromStatus: PromiseStatus;
    toStatus: PromiseStatus;
    label: string;
  }[] = [];

  for (const op of org.orgPromises) {
    for (const depId of op.depends_on) {
      // Find which team this dependency belongs to
      const toTeam = teams.find((t) =>
        t.promises.some((p) => p.id === depId)
      );
      if (toTeam && toTeam.id !== op.owningTeam) {
        const depPromise = toTeam.promises.find((p) => p.id === depId);
        crossTeamBridges.push({
          fromTeamId: op.owningTeam,
          toTeamId: toTeam.id,
          fromStatus: op.status as PromiseStatus,
          toStatus: (depPromise?.status ?? "declared") as PromiseStatus,
          label: op.body.slice(0, 40),
        });
      }
    }
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden border"
      style={{ background: "linear-gradient(180deg, #e0f2fe 0%, #f0fdf4 60%, #fef9c3 100%)" }}
      role="region"
      aria-label={`Org garden: ${org.name}`}
    >
      {/* Org header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg font-bold text-gray-900">{org.name}</h2>
          <p className="text-xs text-gray-500">
            {teams.length} team{teams.length !== 1 ? "s" : ""} ·{" "}
            {org.orgPromises.length} org promise{org.orgPromises.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xl" aria-hidden="true">🏔</span>
          <span className="text-xs text-gray-400">Org landscape</span>
        </div>
      </div>

      {/* Team plots */}
      <div className="px-4 pb-4">
        {teams.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400">
            No teams yet. Add teams to see their plots here.
          </div>
        ) : (
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${Math.min(teams.length, 3)}, 1fr)`,
            }}
          >
            {teams.map((team, i) => {
              const color = PLOT_COLORS[i % PLOT_COLORS.length];
              const active = team.promises.filter(
                (p) => p.status !== "verified" && p.status !== "violated"
              ).length;
              const kept = team.promises.filter((p) => p.status === "verified").length;

              return (
                <button
                  key={team.id}
                  onClick={() => onZoomToTeam?.(team.id)}
                  className="rounded-xl border p-3 text-left transition-all hover:shadow-md hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-green-600"
                  style={{ background: color, borderColor: color }}
                  aria-label={`Team ${team.name}: ${team.promises.length} promises`}
                >
                  <p className="text-xs font-semibold text-gray-700 truncate">{team.name}</p>
                  <div className="mt-2 flex gap-1.5 flex-wrap">
                    {team.promises.slice(0, 4).map((p) => (
                      <span
                        key={p.id}
                        className="text-lg"
                        aria-hidden="true"
                        title={p.body}
                      >
                        {p.status === "verified"
                          ? "🌲"
                          : p.status === "degraded"
                          ? "🍂"
                          : p.status === "violated"
                          ? "🪵"
                          : "🌱"}
                      </span>
                    ))}
                    {team.promises.length > 4 && (
                      <span className="text-xs text-gray-500 self-center">
                        +{team.promises.length - 4}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <span>{active} active</span>
                    {kept > 0 && <span>· {kept} kept</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Cross-team bridges */}
        {crossTeamBridges.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-xs text-gray-500 font-medium">Cross-team dependencies:</p>
            {crossTeamBridges.map((b, i) => (
              <CrossTeamBridge
                key={i}
                fromTeamId={teamNames[b.fromTeamId] ?? b.fromTeamId}
                toTeamId={teamNames[b.toTeamId] ?? b.toTeamId}
                fromStatus={b.fromStatus}
                toStatus={b.toStatus}
                label={b.label}
              />
            ))}
          </div>
        )}

        {/* Org-level trees */}
        {org.orgPromises.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-gray-500 font-medium">Org promises:</p>
            {org.orgPromises.map((op) => (
              <OrgTree
                key={op.id}
                promise={op}
                teamNames={teamNames}
                onZoomToCivic={(dep) => setCivicZoomDep(dep)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Civic zoom transition overlay */}
      {civicZoomDep && (
        <CivicZoomTransition
          dependency={civicZoomDep}
          onClose={() => setCivicZoomDep(null)}
          onOpenCivicDashboard={(dashboard) => {
            // Navigate to the civic dashboard — handled by routing layer
            if (typeof window !== "undefined") {
              window.location.href = `/dashboards/${dashboard}`;
            }
          }}
        />
      )}
    </div>
  );
}
