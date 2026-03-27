"use client";

import { useState, useMemo, useCallback } from "react";
import type { Org } from "@/lib/types/phase4";
import type { PromiseStatus, Promise as PPPromise } from "@/lib/types/promise";
import type { CascadeResult, WhatIfQuery } from "@/lib/types/simulation";
import { simulateCascade, calculateNetworkHealth } from "@/lib/simulation/cascade";

interface OrgCascadeSimulatorProps {
  org: Org;
  teamNames: Record<string, string>;
}

/**
 * What If at org scale — "What if Engineering misses the API deadline?"
 * Uses the same simulateCascade() engine from Promise Pipeline.
 */
export function OrgCascadeSimulator({ org, teamNames }: OrgCascadeSimulatorProps) {
  const [selectedPromise, setSelectedPromise] = useState<string>("");
  const [targetStatus, setTargetStatus] = useState<PromiseStatus>("violated");
  const [result, setResult] = useState<CascadeResult | null>(null);

  // Convert OrgPromise[] to Promise[] for the cascade engine
  const enginePromises: PPPromise[] = useMemo(
    () =>
      org.orgPromises.map((p) => ({
        id: p.id,
        promiser: p.owningTeam,
        promisee: "org",
        body: p.body,
        domain: p.domain,
        status: p.status,
        note: "",
        verification: p.verification,
        depends_on: p.depends_on,
        polarity: p.polarity,
        origin: p.origin,
      })),
    [org.orgPromises]
  );

  const runSimulation = useCallback(() => {
    if (!selectedPromise) return;
    const query: WhatIfQuery = { promiseId: selectedPromise, newStatus: targetStatus };
    const cascadeResult = simulateCascade(enginePromises, query);
    setResult(cascadeResult);
  }, [selectedPromise, targetStatus, enginePromises]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Org Cascade Simulator</h3>
        <p className="text-xs text-gray-500 mb-4">
          Select a promise and a hypothetical status change to see how the cascade
          propagates across teams.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="sim-promise" className="block text-xs font-medium text-gray-600 mb-1">
              Promise
            </label>
            <select
              id="sim-promise"
              value={selectedPromise}
              onChange={(e) => setSelectedPromise(e.target.value)}
              className="w-full border rounded-lg px-2 py-1.5 text-sm bg-white"
            >
              <option value="">Select a promise...</option>
              {org.orgPromises.map((p) => (
                <option key={p.id} value={p.id}>
                  [{teamNames[p.owningTeam] ?? p.owningTeam}] {p.body.slice(0, 60)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sim-status" className="block text-xs font-medium text-gray-600 mb-1">
              What if status becomes...
            </label>
            <select
              id="sim-status"
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as PromiseStatus)}
              className="w-full border rounded-lg px-2 py-1.5 text-sm bg-white"
            >
              <option value="degraded">Degraded (at risk)</option>
              <option value="violated">Violated (broken)</option>
              <option value="verified">Verified (kept)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={runSimulation}
              disabled={!selectedPromise}
              className="px-4 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              Simulate
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-xl border p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Cascade Result</h4>

          <div className="grid gap-3 sm:grid-cols-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-gray-900">
                {result.affectedPromises.length}
              </p>
              <p className="text-xs text-gray-500">Affected</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{result.cascadeDepth}</p>
              <p className="text-xs text-gray-500">Cascade Depth</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className={`text-lg font-bold ${
                result.newNetworkHealth < result.originalNetworkHealth
                  ? "text-red-600"
                  : "text-emerald-600"
              }`}>
                {result.newNetworkHealth > result.originalNetworkHealth ? "+" : ""}
                {Math.round(result.newNetworkHealth - result.originalNetworkHealth)}
              </p>
              <p className="text-xs text-gray-500">Health Delta</p>
            </div>
          </div>

          {result.domainsAffected.length > 0 && (
            <p className="text-xs text-gray-500 mb-2">
              Domains affected: {result.domainsAffected.join(", ")}
            </p>
          )}

          {result.summary && (
            <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
              {result.summary}
            </p>
          )}

          {result.affectedPromises.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {result.affectedPromises.slice(0, 10).map((a) => {
                const promise = org.orgPromises.find((p) => p.id === a.promiseId);
                return (
                  <div key={a.promiseId} className="flex items-center gap-2 text-xs p-1.5 rounded bg-gray-50">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      a.newStatus === "violated" ? "bg-red-400" :
                      a.newStatus === "degraded" ? "bg-amber-400" : "bg-blue-400"
                    }`} />
                    <span className="text-gray-700 truncate flex-1">
                      {promise?.body ?? a.promiseId}
                    </span>
                    <span className="text-gray-400 whitespace-nowrap">
                      {a.originalStatus} → {a.newStatus}
                    </span>
                  </div>
                );
              })}
              {result.affectedPromises.length > 10 && (
                <p className="text-[10px] text-gray-400 pl-3">
                  +{result.affectedPromises.length - 10} more
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
