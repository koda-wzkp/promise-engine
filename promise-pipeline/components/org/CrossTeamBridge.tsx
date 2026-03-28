"use client";

import type { PromiseStatus } from "@/lib/types/promise";

const STATUS_BRIDGE_COLOR: Record<PromiseStatus, string> = {
  declared:     "#3b82f6",
  verified:     "#16a34a",
  degraded:     "#f59e0b",
  violated:     "#dc2626",
  unverifiable: "#9ca3af",
};

/**
 * CrossTeamBridge — renders a visual dependency path between two team plots
 * in the org garden. Animates a pulse when the source promise is degraded.
 */
export function CrossTeamBridge({
  fromTeamId,
  toTeamId,
  fromStatus,
  toStatus,
  label,
}: {
  fromTeamId: string;
  toTeamId: string;
  fromStatus: PromiseStatus;
  toStatus: PromiseStatus;
  label: string;
}) {
  const isStressed = fromStatus === "degraded" || fromStatus === "violated";
  const color = STATUS_BRIDGE_COLOR[fromStatus] ?? "#9ca3af";

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
      style={{
        background: isStressed ? `${color}18` : "#f9fafb",
        border: `1px solid ${isStressed ? color : "#e5e7eb"}`,
      }}
      aria-label={`Dependency from ${fromTeamId} to ${toTeamId}: ${label}`}
    >
      {/* Source team badge */}
      <span
        className="px-2 py-0.5 rounded text-xs font-medium"
        style={{ background: STATUS_BRIDGE_COLOR[fromStatus] + "20", color: STATUS_BRIDGE_COLOR[fromStatus] }}
      >
        {fromTeamId.slice(0, 6)}
      </span>

      {/* Bridge line */}
      <div className="flex-1 relative h-3 flex items-center">
        <div
          className="w-full h-0.5 rounded"
          style={{
            background: isStressed
              ? `linear-gradient(90deg, ${color}, ${color}88, ${color})`
              : "#d1d5db",
          }}
        />
        {isStressed && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full animate-pulse"
            style={{ background: color, left: "50%" }}
            aria-hidden="true"
          />
        )}
        {/* Arrow */}
        <span
          className="absolute right-0 top-1/2 -translate-y-1/2 text-xs"
          style={{ color }}
        >
          →
        </span>
      </div>

      {/* Destination team badge */}
      <span
        className="px-2 py-0.5 rounded text-xs font-medium"
        style={{ background: STATUS_BRIDGE_COLOR[toStatus] + "20", color: STATUS_BRIDGE_COLOR[toStatus] }}
      >
        {toTeamId.slice(0, 6)}
      </span>

      <span className="ml-1 text-gray-500 truncate max-w-[120px]">{label}</span>
    </div>
  );
}
