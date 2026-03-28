"use client";

import { useState } from "react";
import type { OrgPromise } from "@/lib/types/org";
import type { GardenTeamPromise } from "@/lib/types/gardenTeam";
import type { CascadeResult } from "@/lib/types/simulation";
import type { PromiseStatus } from "@/lib/types/promise";
import { simulateCascade } from "@/lib/simulation/cascade";
import type { Promise as PPPromise } from "@/lib/types/promise";

const STATUS_OPTIONS: PromiseStatus[] = ["degraded", "violated", "declared", "verified"];

/**
 * OrgCascadeSimulator — What If at org scale.
 *
 * Select any org/team promise, set a hypothetical status, see cascading
 * effects across all teams. Uses the same simulateCascade() engine as
 * civic dashboards and team views — no new engine needed.
 */
export function OrgCascadeSimulator({
  orgPromises,
  teamPromises,
}: {
  orgPromises: OrgPromise[];
  teamPromises: GardenTeamPromise[];
}) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [hypotheticalStatus, setHypotheticalStatus] = useState<PromiseStatus>("degraded");
  const [result, setResult] = useState<CascadeResult | null>(null);

  const allPromises: PPPromise[] = [
    ...orgPromises as unknown as PPPromise[],
    ...teamPromises as unknown as PPPromise[],
  ];

  const allOptions = [
    ...orgPromises.map((p) => ({ id: p.id, label: `[Org] ${p.body.slice(0, 60)}` })),
    ...teamPromises.map((p) => ({ id: p.id, label: `[Team] ${p.body.slice(0, 60)}` })),
  ];

  function runSimulation() {
    if (!selectedId) return;
    const query = {
      promiseId: selectedId,
      newStatus: hypotheticalStatus,
    };
    const r = simulateCascade(allPromises, query);
    setResult(r);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border p-4 space-y-3">
        <h3 className="font-medium text-sm text-gray-900">Org-scale What If</h3>
        <p className="text-xs text-gray-500">
          Select a promise, set a hypothetical status, and see how the cascade
          propagates across all teams.
        </p>

        {/* Promise selector */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">Promise</label>
          <select
            value={selectedId}
            onChange={(e) => { setSelectedId(e.target.value); setResult(null); }}
            className="w-full text-xs border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a promise…</option>
            {allOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Status selector */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">Hypothetical status</label>
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { setHypotheticalStatus(s); setResult(null); }}
                className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                  hypotheticalStatus === s
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={runSimulation}
          disabled={!selectedId}
          className="w-full py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Simulate cascade
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <h4 className="font-medium text-sm text-gray-900">Cascade results</h4>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">
                {result.affectedPromises?.length ?? 0}
              </p>
              <p className="text-xs text-gray-500">Affected</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-amber-600">
                {result.newNetworkHealth != null
                  ? Math.round(result.newNetworkHealth * 100) + "%"
                  : "—"}
              </p>
              <p className="text-xs text-gray-500">Health after</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-red-600">
                {result.affectedPromises?.filter((a) => a.newStatus === "violated").length ?? 0}
              </p>
              <p className="text-xs text-gray-500">Would break</p>
            </div>
          </div>

          {result.affectedPromises && result.affectedPromises.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-500">Affected promises:</p>
              {result.affectedPromises.slice(0, 10).map((a) => {
                const p = allPromises.find((x) => x.id === a.promiseId);
                return (
                  <div
                    key={a.promiseId}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-xs"
                  >
                    <span className="flex-1 truncate text-gray-700">
                      {p?.body?.slice(0, 60) ?? a.promiseId}
                    </span>
                    <span className="text-gray-400">
                      {a.originalStatus} → {a.newStatus}
                    </span>
                  </div>
                );
              })}
              {result.affectedPromises.length > 10 && (
                <p className="text-xs text-gray-400 text-center">
                  +{result.affectedPromises.length - 10} more
                </p>
              )}
            </div>
          )}

          {result.affectedPromises?.length === 0 && (
            <p className="text-xs text-green-700 text-center py-2">
              No downstream effects — this promise has no dependents.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
