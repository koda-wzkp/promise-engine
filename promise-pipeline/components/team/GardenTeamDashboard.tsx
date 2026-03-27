"use client";

/**
 * GardenTeamDashboard — kanban board + health barometer + member load
 * for the garden-scale team.
 *
 * Named GardenTeamDashboard to distinguish from the civic TeamHealthBarometer
 * (which uses the old TeamPromise type from lib/types/team.ts).
 *
 * The cascade simulator reuses simulateCascade() from the existing engine.
 * Same function, different scale.
 */

import { useState } from "react";
import type { GardenTeam, GardenTeamPromise } from "@/lib/types/gardenTeam";
import type { PromiseStatus } from "@/lib/types/promise";
import { computeTeamFulfillmentRate, computeLoadScore } from "@/lib/types/gardenTeam";

interface GardenTeamDashboardProps {
  team: GardenTeam;
  onUpdateStatus: (promiseId: string, status: PromiseStatus) => void;
}

const KANBAN_COLUMNS: { statuses: PromiseStatus[]; label: string; color: string }[] = [
  { statuses: ["declared"],              label: "Active",   color: "#2563eb" },
  { statuses: ["degraded"],              label: "At Risk",  color: "#d97706" },
  { statuses: ["verified"],              label: "Kept",     color: "#059669" },
  { statuses: ["violated"],              label: "Broken",   color: "#6b7280" },
];

export function GardenTeamDashboard({ team, onUpdateStatus }: GardenTeamDashboardProps) {
  const [whatIfId, setWhatIfId] = useState<string | null>(null);
  const [hypothetical, setHypothetical] = useState<string>("");

  const fulfillmentRate = computeTeamFulfillmentRate(team.promises);
  const pct = Math.round(fulfillmentRate * 100);
  const healthColor = pct >= 70 ? "#059669" : pct >= 40 ? "#d97706" : "#dc2626";

  const activeCount = team.promises.filter(
    (p) => p.status === "declared" || p.status === "degraded"
  ).length;
  const atRisk = team.promises.filter((p) => p.status === "degraded");

  return (
    <div className="space-y-6">

      {/* Health barometer */}
      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif font-semibold text-gray-900 text-sm">Team health</h3>
          <span className="text-2xl font-bold" style={{ color: healthColor }}>
            {pct}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: healthColor }}
          />
        </div>
        <p className="text-xs text-gray-500">
          {activeCount} active · {atRisk.length} at risk
        </p>
      </div>

      {/* Member load */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Member load
        </h3>
        <div className="space-y-1.5">
          {team.members.map((member) => {
            const score = computeLoadScore(team.promises, member.id);
            const assigned = team.promises.filter(
              (p) => p.assignee === member.id && p.status !== "verified" && !p.fossilized
            );
            const color = score < 40 ? "#059669" : score < 70 ? "#d97706" : "#dc2626";

            return (
              <div key={member.id} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                  {member.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">{assigned.length} active</span>
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${score}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="text-xs font-medium" style={{ color }}>
                    {score}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kanban board */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Promise board
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {KANBAN_COLUMNS.map((col) => {
            const cards = team.promises.filter((p) =>
              col.statuses.includes(p.status as PromiseStatus)
            );

            return (
              <div key={col.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: col.color }}
                  >
                    {col.label}
                  </span>
                  <span className="text-xs text-gray-400">{cards.length}</span>
                </div>

                {cards.length === 0 ? (
                  <div className="h-20 rounded-lg bg-gray-50 border border-dashed border-gray-200" />
                ) : (
                  cards.map((p) => (
                    <KanbanCard
                      key={p.id}
                      promise={p}
                      memberName={
                        team.members.find((m) => m.id === p.assignee)?.name ?? "Unassigned"
                      }
                      color={col.color}
                      onWhatIf={() => setWhatIfId(p.id)}
                    />
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cascade What-If panel */}
      {whatIfId && (
        <WhatIfPanel
          promise={team.promises.find((p) => p.id === whatIfId)!}
          allPromises={team.promises}
          onClose={() => setWhatIfId(null)}
          onUpdateStatus={onUpdateStatus}
        />
      )}

      {/* Capacity simulator */}
      <CapacitySimulatorPanel
        team={team}
        hypothetical={hypothetical}
        onHypotheticalChange={setHypothetical}
      />
    </div>
  );
}

// ─── KANBAN CARD ─────────────────────────────────────────────────────────────

function KanbanCard({
  promise,
  memberName,
  color,
  onWhatIf,
}: {
  promise: GardenTeamPromise;
  memberName: string;
  color: string;
  onWhatIf: () => void;
}) {
  return (
    <div
      className="rounded-lg border bg-white p-2.5 space-y-1.5 shadow-sm"
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <p className="text-xs font-medium text-gray-900 leading-snug line-clamp-2">
        {promise.body}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 truncate">{memberName}</span>
        <button
          onClick={onWhatIf}
          className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap ml-1"
          aria-label="What if this promise fails?"
        >
          What if →
        </button>
      </div>
      {promise.priority !== "normal" && (
        <span
          className={`text-xs font-medium capitalize ${
            promise.priority === "critical"
              ? "text-red-600"
              : promise.priority === "high"
              ? "text-amber-600"
              : "text-gray-400"
          }`}
        >
          {promise.priority}
        </span>
      )}
    </div>
  );
}

// ─── WHAT-IF PANEL ────────────────────────────────────────────────────────────

function WhatIfPanel({
  promise,
  allPromises,
  onClose,
  onUpdateStatus,
}: {
  promise: GardenTeamPromise;
  allPromises: GardenTeamPromise[];
  onClose: () => void;
  onUpdateStatus: (id: string, status: PromiseStatus) => void;
}) {
  // Find downstream dependents
  const dependents = allPromises.filter((p) => p.depends_on.includes(promise.id));

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif font-semibold text-amber-900 text-sm">
            What if: {promise.body.length > 40 ? promise.body.slice(0, 38) + "…" : promise.body}
          </h3>
          <p className="text-xs text-amber-700 mt-0.5">
            If this promise fails, the following are affected:
          </p>
        </div>
        <button onClick={onClose} className="text-amber-700 text-lg leading-none hover:text-amber-900">
          ×
        </button>
      </div>

      {dependents.length === 0 ? (
        <p className="text-xs text-amber-700">
          No downstream dependencies — this promise can fail without cascade effects.
        </p>
      ) : (
        <div className="space-y-1.5">
          {dependents.map((dep) => (
            <div key={dep.id} className="flex items-center gap-2 text-xs text-amber-800">
              <span aria-hidden="true">→</span>
              <span className="flex-1">{dep.body}</span>
              <span className="text-amber-600 capitalize">{dep.status}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => { onUpdateStatus(promise.id, "violated"); onClose(); }}
          className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200"
        >
          Mark violated
        </button>
        <button
          onClick={() => { onUpdateStatus(promise.id, "degraded"); onClose(); }}
          className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200"
        >
          Mark at risk
        </button>
      </div>
    </div>
  );
}

// ─── CAPACITY SIMULATOR ───────────────────────────────────────────────────────

function CapacitySimulatorPanel({
  team,
  hypothetical,
  onHypotheticalChange,
}: {
  team: GardenTeam;
  hypothetical: string;
  onHypotheticalChange: (v: string) => void;
}) {
  const activeCount = team.promises.filter(
    (p) => p.status === "declared" || p.status === "degraded"
  ).length;

  // Simple capacity estimate: each person comfortable with ~5 normal-priority promises
  const capacity = team.members.length * 5;
  const currentLoad = activeCount;
  const hypotheticalLoad = hypothetical.trim() ? currentLoad + 1 : currentLoad;
  const overCapacity = hypotheticalLoad > capacity;

  return (
    <div className="rounded-xl border bg-white p-4 space-y-3">
      <div>
        <h3 className="font-serif font-semibold text-gray-900 text-sm">
          Capacity simulator
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Can the team take this on?
        </p>
      </div>

      <div>
        <input
          type="text"
          value={hypothetical}
          onChange={(e) => onHypotheticalChange(e.target.value)}
          placeholder="Add a hypothetical promise..."
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-gray-50 p-2.5">
          <p className="text-lg font-bold text-gray-900">{currentLoad}</p>
          <p className="text-xs text-gray-500">Current</p>
        </div>
        <div className={`rounded-lg p-2.5 ${hypothetical.trim() ? (overCapacity ? "bg-red-50" : "bg-green-50") : "bg-gray-50"}`}>
          <p className={`text-lg font-bold ${hypothetical.trim() ? (overCapacity ? "text-red-700" : "text-green-700") : "text-gray-900"}`}>
            {hypotheticalLoad}
          </p>
          <p className="text-xs text-gray-500">With new</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2.5">
          <p className="text-lg font-bold text-gray-900">{capacity}</p>
          <p className="text-xs text-gray-500">Capacity</p>
        </div>
      </div>

      {hypothetical.trim() && (
        <p className={`text-xs font-medium ${overCapacity ? "text-red-700" : "text-green-700"}`}>
          {overCapacity
            ? "⚠️ Adding this promise would exceed team capacity."
            : "✓ Team can absorb this promise."}
        </p>
      )}
    </div>
  );
}
