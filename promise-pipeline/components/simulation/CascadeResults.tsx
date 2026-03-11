"use client";

import { CascadeResult } from "@/lib/types/simulation";
import { Promise as PromiseType } from "@/lib/types/promise";
import StatusBadge from "../promise/StatusBadge";

interface CascadeResultsProps {
  result: CascadeResult;
  promises: PromiseType[];
  onReset: () => void;
}

export default function CascadeResults({ result, promises, onReset }: CascadeResultsProps) {
  const healthDelta = result.newNetworkHealth - result.originalNetworkHealth;

  return (
    <div className="space-y-4 rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-bold text-gray-900">Cascade Results</h3>
        <button
          onClick={onReset}
          className="rounded bg-white px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
        >
          Reset
        </button>
      </div>

      {/* Health score change */}
      <div className="flex items-center gap-4 rounded bg-white p-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{result.originalNetworkHealth}</p>
          <p className="text-[10px] text-gray-400">Before</p>
        </div>
        <div className="text-xl text-gray-300">→</div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${healthDelta < 0 ? "text-red-600" : "text-green-600"}`}>
            {result.newNetworkHealth}
          </p>
          <p className="text-[10px] text-gray-400">After</p>
        </div>
        <div className={`ml-auto text-sm font-semibold ${healthDelta < 0 ? "text-red-600" : "text-green-600"}`}>
          {healthDelta >= 0 ? "+" : ""}{healthDelta}
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs text-gray-700">{result.summary}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded bg-white p-2">
          <p className="text-lg font-bold text-gray-900">{result.affectedPromises.length}</p>
          <p className="text-[10px] text-gray-400">Affected</p>
        </div>
        <div className="rounded bg-white p-2">
          <p className="text-lg font-bold text-gray-900">{result.cascadeDepth}</p>
          <p className="text-[10px] text-gray-400">Max Depth</p>
        </div>
        <div className="rounded bg-white p-2">
          <p className="text-lg font-bold text-gray-900">{result.domainsAffected.length}</p>
          <p className="text-[10px] text-gray-400">Domains</p>
        </div>
      </div>

      {/* Affected promises */}
      {result.affectedPromises.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase text-gray-400">Affected Promises</h4>
          <div className="space-y-1.5">
            {result.affectedPromises.map((a) => {
              const promise = promises.find((p) => p.id === a.promiseId);
              return (
                <div key={a.promiseId} className="flex items-center gap-2 rounded bg-white p-2 text-xs">
                  <span className="font-mono text-gray-400">{a.promiseId}</span>
                  <StatusBadge status={a.originalStatus} size="sm" />
                  <span className="text-gray-300">→</span>
                  <StatusBadge status={a.newStatus} size="sm" simulated />
                  <span className="ml-auto text-[10px] text-gray-400">depth {a.cascadeDepth}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
