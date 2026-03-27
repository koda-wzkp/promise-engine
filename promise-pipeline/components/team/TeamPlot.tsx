"use client";

import type { TeamGardenPromise } from "@/lib/types/phase3";
import type { PromiseStatus } from "@/lib/types/promise";

interface TeamPlotProps {
  promise: TeamGardenPromise;
  assigneeName: string;
  isOwn: boolean;
  onStatusUpdate?: (promiseId: string, status: PromiseStatus) => void;
  onCreateSubPromise?: (teamPromiseId: string) => void;
}

const STATUS_LABELS: Record<PromiseStatus, string> = {
  declared: "Declared",
  degraded: "At Risk",
  verified: "Kept",
  violated: "Broken",
  unverifiable: "Unverifiable",
};

const STATUS_COLORS: Record<PromiseStatus, string> = {
  declared: "border-blue-200 bg-blue-50",
  degraded: "border-amber-200 bg-amber-50",
  verified: "border-emerald-200 bg-emerald-50",
  violated: "border-red-200 bg-red-50",
  unverifiable: "border-gray-200 bg-gray-50",
};

const STATUS_DOT: Record<PromiseStatus, string> = {
  declared: "bg-blue-400",
  degraded: "bg-amber-400",
  verified: "bg-emerald-400",
  violated: "bg-red-400",
  unverifiable: "bg-gray-400",
};

export function TeamPlot({
  promise,
  assigneeName,
  isOwn,
  onStatusUpdate,
  onCreateSubPromise,
}: TeamPlotProps) {
  const isTerminal = promise.status === "verified" || promise.status === "violated";

  return (
    <div className={`rounded-xl border p-4 ${STATUS_COLORS[promise.status]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${STATUS_DOT[promise.status]}`} />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {promise.domain}
            </span>
            <span className="text-xs text-gray-400">
              {STATUS_LABELS[promise.status]}
            </span>
          </div>
          <p className="text-sm text-gray-900 font-medium">{promise.body}</p>
          <p className="text-xs text-gray-500 mt-1">
            Assigned to {assigneeName}
          </p>
        </div>

        {/* Personal slots indicator */}
        {promise.personalSlots.length > 0 && (
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {promise.personalSlots.length} sub-promise{promise.personalSlots.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Own promise actions */}
      {isOwn && !isTerminal && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200/50">
          {(promise.status === "declared" || promise.status === "degraded") && onStatusUpdate && (
            <>
              <button
                onClick={() => onStatusUpdate(promise.id, "verified")}
                className="text-xs px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Mark Kept
              </button>
              <button
                onClick={() => onStatusUpdate(promise.id, "degraded")}
                className="text-xs px-3 py-1 rounded-lg bg-white/80 border text-amber-700 hover:bg-white"
              >
                Flag Risk
              </button>
            </>
          )}
          {onCreateSubPromise && (
            <button
              onClick={() => onCreateSubPromise(promise.id)}
              className="text-xs px-3 py-1 rounded-lg bg-white/80 border text-gray-600 hover:bg-white ml-auto"
            >
              Break Down
            </button>
          )}
        </div>
      )}
    </div>
  );
}
