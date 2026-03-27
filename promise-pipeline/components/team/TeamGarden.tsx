"use client";

import { useMemo } from "react";
import type { Team, TeamGardenPromise } from "@/lib/types/phase3";
import type { PromiseStatus } from "@/lib/types/promise";
import { TeamPlot } from "./TeamPlot";

interface TeamGardenProps {
  team: Team;
  currentUserId?: string;
  onStatusUpdate?: (promiseId: string, status: PromiseStatus) => void;
  onCreateSubPromise?: (teamPromiseId: string) => void;
}

const STATUS_COLORS: Record<PromiseStatus, string> = {
  declared: "bg-blue-100 text-blue-800",
  degraded: "bg-amber-100 text-amber-800",
  verified: "bg-emerald-100 text-emerald-800",
  violated: "bg-red-100 text-red-800",
  unverifiable: "bg-gray-100 text-gray-800",
};

export function TeamGarden({ team, currentUserId, onStatusUpdate, onCreateSubPromise }: TeamGardenProps) {
  const myPromises = useMemo(
    () => team.promises.filter((p) => p.assignee === currentUserId),
    [team.promises, currentUserId]
  );

  const otherPromises = useMemo(
    () => team.promises.filter((p) => p.assignee !== currentUserId),
    [team.promises, currentUserId]
  );

  const memberMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of team.members) {
      map.set(m.userId ?? m.id, m.name);
    }
    return map;
  }, [team.members]);

  return (
    <div className="space-y-6">
      {/* Team header */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-semibold text-gray-900">{team.name}</h2>
            <p className="text-sm text-gray-500">
              {team.members.length} members · {team.promises.length} team promises
            </p>
          </div>
          {team.subscriptionStatus && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              team.subscriptionStatus === "active"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}>
              {team.subscriptionStatus}
            </span>
          )}
        </div>
      </div>

      {/* My assigned promises (with sub-promise slots) */}
      {myPromises.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">My Assignments</h3>
          <div className="grid gap-3">
            {myPromises.map((p) => (
              <TeamPlot
                key={p.id}
                promise={p}
                assigneeName="You"
                isOwn
                onStatusUpdate={onStatusUpdate}
                onCreateSubPromise={onCreateSubPromise}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other team members' promises (read-only garden view) */}
      {otherPromises.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Team Garden</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {otherPromises.map((p) => (
              <TeamPlot
                key={p.id}
                promise={p}
                assigneeName={memberMap.get(p.assignee) ?? "Team member"}
                isOwn={false}
              />
            ))}
          </div>
        </div>
      )}

      {team.promises.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <p className="text-gray-500 text-sm">No team promises yet.</p>
          <p className="text-gray-400 text-xs mt-1">Team promises will appear here when assigned.</p>
        </div>
      )}
    </div>
  );
}
