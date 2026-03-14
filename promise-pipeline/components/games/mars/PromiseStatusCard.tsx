"use client";

import { MarsPromise, marsDomainColors } from "../../../lib/types/mars-game";
import { computeStatus } from "../../../lib/games/mars-engine";

interface PromiseStatusCardProps {
  promise: MarsPromise;
  compact?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  verified: "Verified",
  declared: "Declared",
  degraded: "Degraded",
  violated: "Violated",
  unverifiable: "Unverifiable",
};

const STATUS_COLORS: Record<string, string> = {
  verified: "#00ff88",
  declared: "#60a5fa",
  degraded: "#f59e0b",
  violated: "#ef4444",
  unverifiable: "#a78bfa",
};

export default function PromiseStatusCard({
  promise,
  compact = false,
}: PromiseStatusCardProps) {
  const status = computeStatus(promise);
  const domainColor = marsDomainColors[promise.domain] ?? "#64748b";
  const statusColor = STATUS_COLORS[status] ?? "#9ca3af";

  const progressBarColor =
    status === "verified"
      ? "#00ff88"
      : status === "degraded"
        ? "#f59e0b"
        : status === "violated"
          ? "#ef4444"
          : status === "unverifiable"
            ? "#a78bfa"
            : "#60a5fa";

  return (
    <article
      className="rounded border-l-4 bg-[#1a1f36] p-3"
      style={{ borderLeftColor: domainColor }}
      aria-label={`Promise ${promise.id}: ${promise.body}. Status: ${STATUS_LABELS[status] ?? status}. Progress: ${Math.round(promise.progress)} percent.`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="font-mono text-xs font-bold shrink-0"
            style={{ color: domainColor }}
          >
            {promise.id}
          </span>
          <span
            className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded shrink-0`}
            style={{ color: statusColor, border: `1px solid ${statusColor}33` }}
          >
            {STATUS_LABELS[status] ?? status}
          </span>
        </div>
        <span className="font-mono text-xs text-[#9ca3af] shrink-0">
          {Math.round(promise.progress)}%
        </span>
      </div>

      {!compact && (
        <p className="mt-1 font-mono text-xs text-[#e5e7eb] leading-relaxed">
          {promise.body}
        </p>
      )}

      {/* Progress bar */}
      <div
        className="mt-2 h-1 rounded-full bg-[#2d3748] overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(promise.progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${promise.id} progress`}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${promise.progress}%`,
            backgroundColor: progressBarColor,
          }}
        />
      </div>

      {promise.id === "P7" && !compact && (
        <p className="mt-2 font-mono text-[10px] text-[#a78bfa] leading-relaxed">
          Shielding contractor reports {Math.round(promise.progress)}% reduction.
          Independent measurement infrastructure does not exist on Mars. This
          promise cannot be verified by anyone outside Helios Corp.
        </p>
      )}

      {promise.id === "P5" && !compact && (
        <p className="mt-1 font-mono text-[10px] text-[#9ca3af]">
          Computed from P4 (mining, 70%) + P8 (comms, 30%)
        </p>
      )}
    </article>
  );
}
