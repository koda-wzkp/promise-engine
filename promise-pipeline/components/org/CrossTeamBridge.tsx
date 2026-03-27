"use client";

import type { CrossTeamDependency } from "@/lib/types/phase4";
import type { PromiseStatus } from "@/lib/types/promise";

interface CrossTeamBridgeProps {
  dep: CrossTeamDependency;
  fromTeamName: string;
  toTeamName: string;
  fromStatus: PromiseStatus;
  toStatus: PromiseStatus;
}

const STATUS_COLOR: Record<PromiseStatus, string> = {
  declared: "text-blue-600",
  degraded: "text-amber-600",
  verified: "text-emerald-600",
  violated: "text-red-600",
  unverifiable: "text-gray-400",
};

/**
 * Visual bridge between two team plots showing a cross-team dependency.
 * When either side is degraded/violated, the bridge pulses.
 */
export function CrossTeamBridge({
  dep,
  fromTeamName,
  toTeamName,
  fromStatus,
  toStatus,
}: CrossTeamBridgeProps) {
  const isStressed =
    fromStatus === "degraded" ||
    fromStatus === "violated" ||
    toStatus === "degraded" ||
    toStatus === "violated";

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
        isStressed
          ? "border-amber-300 bg-amber-50 animate-pulse"
          : "border-gray-200 bg-white"
      }`}
      title={`${fromTeamName} depends on ${toTeamName}`}
    >
      <span className={`font-medium ${STATUS_COLOR[fromStatus]}`}>
        {fromTeamName}
      </span>
      <span className="text-gray-300">→</span>
      <span className={`font-medium ${STATUS_COLOR[toStatus]}`}>
        {toTeamName}
      </span>
      {dep.stress !== undefined && dep.stress > 0.3 && (
        <span className="text-[10px] text-amber-500">
          ({Math.round(dep.stress * 100)}% stress)
        </span>
      )}
    </div>
  );
}
