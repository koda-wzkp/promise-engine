"use client";

import { NetworkHealthScore } from "@/lib/types/simulation";

interface TeamHealthBarProps {
  health: NetworkHealthScore;
}

export default function TeamHealthBar({ health }: TeamHealthBarProps) {
  const score = Math.round(health.overall);
  const color = score >= 70 ? "#1a5f4a" : score >= 40 ? "#b45309" : "#b91c1c";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Team Health
      </h3>

      <div className="flex items-end gap-2">
        <span className="font-serif text-4xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="mb-1 text-sm text-gray-400">/ 100</span>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>

      {health.bottlenecks.length > 0 && (
        <p className="mt-2 text-xs text-gray-500">
          Bottleneck: {health.bottlenecks[0]}
        </p>
      )}
    </div>
  );
}
