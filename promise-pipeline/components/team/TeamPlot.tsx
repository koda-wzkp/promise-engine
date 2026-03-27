"use client";

/**
 * TeamPlot — a single member's plot in the shared team garden.
 * Shows team-linked plants (one per assigned promise).
 * Private sub-promises are invisible here.
 */

import type { GardenTeamMember, GardenTeamPromise } from "@/lib/types/gardenTeam";

const STATUS_PLANT: Record<string, { emoji: string; color: string }> = {
  declared:     { emoji: "🌱", color: "#2563eb" },
  verified:     { emoji: "🌳", color: "#059669" },
  degraded:     { emoji: "🍂", color: "#d97706" },
  violated:     { emoji: "🪨", color: "#6b7280" },
  unverifiable: { emoji: "🌫️", color: "#9ca3af" },
};

const PRIORITY_RING: Record<string, string> = {
  critical: "ring-2 ring-red-500",
  high:     "ring-2 ring-amber-400",
  normal:   "",
  low:      "opacity-75",
};

interface TeamPlotProps {
  member: GardenTeamMember;
  promises: GardenTeamPromise[];
  isCurrentUser: boolean;
}

export function TeamPlot({ member, promises, isCurrentUser }: TeamPlotProps) {
  const assigned = promises.filter((p) => p.assignee === member.id);

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 ${
        isCurrentUser ? "border-green-300 bg-green-50/50" : "bg-white"
      }`}
      aria-label={`${member.name}'s plot`}
    >
      {/* Member header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
          {member.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {member.name}
            {isCurrentUser && (
              <span className="ml-1 text-xs text-green-700 font-normal">(you)</span>
            )}
          </p>
          {member.role && (
            <p className="text-xs text-gray-400 truncate">{member.role}</p>
          )}
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">
          {assigned.filter((p) => p.status !== "verified" && p.status !== "violated").length} active
        </span>
      </div>

      {/* Plants */}
      {assigned.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-3">
          No team promises assigned
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {assigned.map((p) => {
            const plant = STATUS_PLANT[p.status] ?? STATUS_PLANT.declared;
            const ring = PRIORITY_RING[p.priority] ?? "";

            return (
              <div
                key={p.id}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-50 ${ring}`}
                title={`${p.body} · ${p.status} · ${p.priority}`}
              >
                <span className="text-2xl" aria-hidden="true">{plant.emoji}</span>
                <p
                  className="text-xs text-center leading-tight line-clamp-2"
                  style={{ color: plant.color }}
                >
                  {p.body.length > 30 ? p.body.slice(0, 28) + "…" : p.body}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
