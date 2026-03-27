"use client";

import type { Benchmark } from "@/lib/types/phase3";

interface BenchmarkCardProps {
  benchmarks: Benchmark[];
}

/**
 * Shows how the user's promise patterns compare to community averages.
 * Only available to contributors.
 */
export function BenchmarkCard({ benchmarks }: BenchmarkCardProps) {
  if (benchmarks.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Your Benchmarks</h3>
      <div className="space-y-3">
        {benchmarks.map((b, i) => {
          const isAbove = b.userValue >= b.communityAverage;
          return (
            <div key={i} className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700 capitalize">
                    {b.domain}
                  </span>
                  <span className="text-[10px] text-gray-400">{b.metric}</span>
                </div>
                {/* Bar visualization */}
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isAbove ? "bg-emerald-400" : "bg-amber-400"}`}
                      style={{ width: `${Math.min(b.percentile, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 tabular-nums w-8 text-right">
                    {Math.round(b.percentile)}%
                  </span>
                </div>
              </div>
              <div className="text-right ml-3">
                <div className="text-xs font-medium text-gray-900">
                  {typeof b.userValue === "number" ? b.userValue.toFixed(1) : b.userValue}
                </div>
                <div className="text-[10px] text-gray-400">
                  avg {typeof b.communityAverage === "number" ? b.communityAverage.toFixed(1) : b.communityAverage}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
