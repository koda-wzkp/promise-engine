"use client";

import type { OrgPromise } from "@/lib/types/org";
import type { PromiseStatus } from "@/lib/types/promise";
import { ExternalDependencyCard } from "./ExternalDependencyCard";

const STATUS_GLYPH: Record<PromiseStatus, string> = {
  declared:     "🌳",
  verified:     "🌲",
  degraded:     "🍂",
  violated:     "🪵",
  unverifiable: "🌿",
};

const STATUS_COLOR: Record<PromiseStatus, string> = {
  declared:     "border-blue-200 bg-blue-50/50",
  verified:     "border-green-300 bg-green-50/50",
  degraded:     "border-amber-300 bg-amber-50/50",
  violated:     "border-red-300 bg-red-50/50",
  unverifiable: "border-gray-200 bg-gray-50/50",
};

/**
 * OrgTree — large tree spanning multiple team plots.
 * Visualizes an org-level promise with its owning team, contributing teams,
 * and any external civic dependencies.
 */
export function OrgTree({
  promise,
  teamNames,
  onZoomToCivic,
}: {
  promise: OrgPromise;
  teamNames?: Record<string, string>;
  onZoomToCivic?: (dep: OrgPromise["externalDependencies"][number]) => void;
}) {
  const glyph = STATUS_GLYPH[promise.status] ?? "🌳";
  const teamName = (id: string) => teamNames?.[id] ?? id.slice(0, 8);

  return (
    <div
      className={`rounded-2xl border-2 p-5 ${STATUS_COLOR[promise.status]}`}
      role="article"
      aria-label={`Org promise: ${promise.body}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="text-3xl mt-0.5 flex-shrink-0" aria-hidden="true">{glyph}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 leading-snug text-sm">{promise.body}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className="px-2 py-0.5 text-xs rounded bg-white/80 border text-gray-700">
              {promise.status}
            </span>
            <span className="px-2 py-0.5 text-xs rounded bg-white/80 border text-gray-600">
              {promise.domain}
            </span>
          </div>
        </div>
      </div>

      {/* Team spans */}
      <div className="mt-3 flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="font-medium">Owner:</span>
          <span className="px-2 py-0.5 bg-white/80 rounded border">{teamName(promise.owningTeam)}</span>
        </div>
        {promise.contributingTeams.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="font-medium">Contributors:</span>
            {promise.contributingTeams.map((tid) => (
              <span key={tid} className="px-2 py-0.5 bg-white/80 rounded border">{teamName(tid)}</span>
            ))}
          </div>
        )}
      </div>

      {/* Dependencies on other promises */}
      {promise.depends_on.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-1">Depends on:</p>
          <div className="flex flex-wrap gap-1.5">
            {promise.depends_on.map((id) => (
              <span key={id} className="px-2 py-0.5 text-xs bg-white/70 rounded border text-gray-600">
                {id.slice(0, 10)}…
              </span>
            ))}
          </div>
        </div>
      )}

      {/* External / civic dependencies */}
      {promise.externalDependencies.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-gray-500">External dependencies:</p>
          {promise.externalDependencies.map((dep) => (
            <ExternalDependencyCard
              key={dep.id}
              dependency={dep}
              onZoomIn={
                dep.civicPromiseId && onZoomToCivic
                  ? () => onZoomToCivic(dep)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
