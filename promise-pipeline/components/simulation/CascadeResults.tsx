"use client";

import { CascadeResult } from "@/lib/types/simulation";
import { Promise as PromiseType } from "@/lib/types/promise";
import StatusBadge from "../promise/StatusBadge";

interface CascadeResultsProps {
  result: CascadeResult;
  promises: PromiseType[];
  onReset: () => void;
  onPromiseClick?: (promiseId: string) => void;
}

export default function CascadeResults({ result, promises, onReset, onPromiseClick }: CascadeResultsProps) {
  const healthDelta = result.newNetworkHealth - result.originalNetworkHealth;

  // Sort affected promises by cascade depth
  const sortedAffected = [...result.affectedPromises].sort(
    (a, b) => a.cascadeDepth - b.cascadeDepth
  );

  // Build a more specific narrative
  const specificNarrative = buildSpecificNarrative(result, promises);

  // Health bar widths
  const maxHealth = 100;
  const beforeWidth = (result.originalNetworkHealth / maxHealth) * 100;
  const afterWidth = (result.newNetworkHealth / maxHealth) * 100;

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

      {/* Health score before/after mini bar chart */}
      <div className="rounded bg-white p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-10 text-right text-[10px] text-gray-400">Before</span>
            <div className="flex-1">
              <div className="h-4 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="flex h-full items-center justify-end rounded-full bg-gray-300 pr-1.5 transition-all"
                  style={{ width: `${beforeWidth}%` }}
                >
                  <span className="font-mono text-[9px] font-bold text-gray-600">{result.originalNetworkHealth}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-10 text-right text-[10px] text-gray-400">After</span>
            <div className="flex-1">
              <div className="h-4 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`flex h-full items-center justify-end rounded-full pr-1.5 transition-all ${
                    healthDelta < 0 ? "bg-red-400" : "bg-green-400"
                  }`}
                  style={{ width: `${afterWidth}%` }}
                >
                  <span className="font-mono text-[9px] font-bold text-white">{result.newNetworkHealth}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={`mt-2 text-right text-sm font-bold ${healthDelta < 0 ? "text-red-600" : "text-green-600"}`}>
          {healthDelta >= 0 ? "+" : ""}{healthDelta} points
        </div>
      </div>

      {/* Specific narrative */}
      <p className="text-xs leading-relaxed text-gray-700">{specificNarrative}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded bg-white p-2">
          <p className="font-mono text-lg font-bold text-gray-900">{result.affectedPromises.length}</p>
          <p className="text-[10px] text-gray-400">Affected</p>
        </div>
        <div className="rounded bg-white p-2">
          <p className="font-mono text-lg font-bold text-gray-900">{result.cascadeDepth}</p>
          <p className="text-[10px] text-gray-400">Max Depth</p>
        </div>
        <div className="rounded bg-white p-2">
          <p className="font-mono text-lg font-bold text-gray-900">{result.domainsAffected.length}</p>
          <p className="text-[10px] text-gray-400">Domains</p>
        </div>
      </div>

      {/* Affected promises — sorted by cascade depth with visual nesting */}
      {sortedAffected.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase text-gray-400">Cascade Chain</h4>
          <div className="space-y-1">
            {sortedAffected.map((a) => {
              const promise = promises.find((p) => p.id === a.promiseId);
              const indent = (a.cascadeDepth - 1) * 12;

              return (
                <button
                  key={a.promiseId}
                  onClick={() => onPromiseClick?.(a.promiseId)}
                  className="flex w-full items-center gap-2 rounded bg-white p-2 text-left text-xs transition-colors hover:bg-gray-50"
                  style={{ marginLeft: indent }}
                >
                  {a.cascadeDepth > 1 && (
                    <span className="text-[10px] text-gray-300">↳</span>
                  )}
                  <span className="font-mono font-semibold text-gray-500">{a.promiseId}</span>
                  <StatusBadge status={a.originalStatus} size="sm" />
                  <span className="text-gray-300">→</span>
                  <StatusBadge status={a.newStatus} size="sm" simulated />
                  {promise && (
                    <span className="ml-auto max-w-[80px] truncate text-[10px] text-gray-400">
                      {promise.body}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function buildSpecificNarrative(result: CascadeResult, promises: PromiseType[]): string {
  const source = promises.find((p) => p.id === result.query.promiseId);
  if (!source) return result.summary;

  if (result.affectedPromises.length === 0) {
    return `Setting "${source.body}" to ${result.query.newStatus} has no downstream effects.`;
  }

  const parts: string[] = [];
  parts.push(
    `Setting [${source.body}] to ${result.query.newStatus} affects ${result.affectedPromises.length} downstream promise${result.affectedPromises.length === 1 ? "" : "s"}:`
  );

  // List first 3 affected promises specifically
  const toShow = result.affectedPromises.slice(0, 3);
  for (const a of toShow) {
    const p = promises.find((pr) => pr.id === a.promiseId);
    if (p) {
      const bodyShort = p.body.length > 50 ? p.body.slice(0, 50) + "…" : p.body;
      parts.push(`[${bodyShort}] degrades to ${a.newStatus}`);
    }
  }

  if (result.affectedPromises.length > 3) {
    parts.push(`…and ${result.affectedPromises.length - 3} more.`);
  }

  return parts.join(" ");
}
