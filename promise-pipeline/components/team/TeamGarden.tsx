"use client";

/**
 * TeamGarden — shared landscape visible to all team members.
 *
 * Shows each member's plot with their team-linked plants.
 * Private sub-promises are NOT visible here.
 * Garden weather reflects aggregate g_obs / g_dec across team promises.
 */

import type { GardenTeam, GardenTeamPromise } from "@/lib/types/gardenTeam";
import { TeamPlot } from "./TeamPlot";

interface TeamGardenProps {
  team: GardenTeam;
  currentUserId: string;
}

export function TeamGarden({ team, currentUserId }: TeamGardenProps) {
  const activeCount = team.promises.filter(
    (p) => p.status !== "verified" && p.status !== "violated" && !p.fossilized
  ).length;

  const atRiskCount = team.promises.filter((p) => p.status === "degraded").length;

  // Simple weather indicator from team promise health
  const totalResolved = team.promises.filter(
    (p) => p.status === "verified" || p.status === "violated"
  ).length;
  const keptCount = team.promises.filter((p) => p.status === "verified").length;
  const keptRate = totalResolved > 0 ? keptCount / totalResolved : 0.7;

  const weatherEmoji = keptRate >= 0.75 ? "☀️" : keptRate >= 0.5 ? "⛅" : "🌧️";
  const weatherLabel = keptRate >= 0.75 ? "Clear" : keptRate >= 0.5 ? "Cloudy" : "Stormy";

  return (
    <div className="space-y-4">
      {/* Garden header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg font-bold text-gray-900">
            {team.name}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {team.members.length} member{team.members.length !== 1 ? "s" : ""}
            &nbsp;·&nbsp;{activeCount} active promise{activeCount !== 1 ? "s" : ""}
            {atRiskCount > 0 && (
              <span className="text-amber-600 ml-1">
                · {atRiskCount} at risk
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <span aria-hidden="true">{weatherEmoji}</span>
          <span className="text-gray-500 text-xs">{weatherLabel}</span>
        </div>
      </div>

      {/* Garden landscape — member plots */}
      {team.members.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-2xl mb-2" aria-hidden="true">🌿</p>
          <p className="text-sm text-gray-500">
            No team members yet. Share the invite link to grow your garden.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {team.members.map((member) => (
            <TeamPlot
              key={member.id}
              member={member}
              promises={team.promises}
              isCurrentUser={member.id === currentUserId}
            />
          ))}
        </div>
      )}

      {/* Dependency paths between plots (simplified: just list deps) */}
      {team.promises.some((p) => p.depends_on.length > 0) && (
        <div className="rounded-xl bg-gray-50 border p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Dependencies
          </p>
          <div className="space-y-1">
            {team.promises
              .filter((p) => p.depends_on.length > 0)
              .map((p) => (
                <DependencyLine key={p.id} promise={p} allPromises={team.promises} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DependencyLine({
  promise,
  allPromises,
}: {
  promise: GardenTeamPromise;
  allPromises: GardenTeamPromise[];
}) {
  const deps = promise.depends_on
    .map((id) => allPromises.find((p) => p.id === id))
    .filter(Boolean) as GardenTeamPromise[];

  return (
    <p className="text-xs text-gray-500">
      <span className="font-medium text-gray-700">
        {promise.body.length > 30 ? promise.body.slice(0, 28) + "…" : promise.body}
      </span>
      {" ← "}
      {deps.map((d, i) => (
        <span key={d.id}>
          {i > 0 && ", "}
          <span className={d.status === "degraded" || d.status === "violated" ? "text-amber-600" : ""}>
            {d.body.length > 25 ? d.body.slice(0, 23) + "…" : d.body}
          </span>
        </span>
      ))}
    </p>
  );
}
