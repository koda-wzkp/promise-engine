"use client";

import type { OrgPromise } from "@/lib/types/phase4";
import type { PromiseStatus } from "@/lib/types/promise";
import { ExternalDependencyCard } from "./ExternalDependencyCard";

interface OrgTreeProps {
  promise: OrgPromise;
  teamName: string;
  contributingTeamNames: string[];
  onSelect?: () => void;
  onStatusUpdate?: (promiseId: string, status: PromiseStatus) => void;
}

const STATUS_BG: Record<PromiseStatus, string> = {
  declared: "border-blue-200 bg-blue-50/50",
  degraded: "border-amber-200 bg-amber-50/50",
  verified: "border-emerald-200 bg-emerald-50/50",
  violated: "border-red-200 bg-red-50/50",
  unverifiable: "border-gray-200 bg-gray-50/50",
};

const STATUS_DOT: Record<PromiseStatus, string> = {
  declared: "bg-blue-400",
  degraded: "bg-amber-400",
  verified: "bg-emerald-400",
  violated: "bg-red-400",
  unverifiable: "bg-gray-400",
};

const STATUS_LABEL: Record<PromiseStatus, string> = {
  declared: "Declared",
  degraded: "At Risk",
  verified: "Kept",
  violated: "Broken",
  unverifiable: "Unverifiable",
};

export function OrgTree({
  promise,
  teamName,
  contributingTeamNames,
  onSelect,
  onStatusUpdate,
}: OrgTreeProps) {
  const isTerminal = promise.status === "verified" || promise.status === "violated";

  return (
    <div
      className={`rounded-xl border p-4 cursor-pointer hover:shadow-sm transition-shadow ${STATUS_BG[promise.status]}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect?.()}
      aria-label={`Org promise: ${promise.body}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[promise.status]}`} />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {promise.domain}
            </span>
            <span className="text-[10px] text-gray-400">{STATUS_LABEL[promise.status]}</span>
          </div>
          <p className="text-sm font-medium text-gray-900">{promise.body}</p>
        </div>
      </div>

      {/* Ownership */}
      <div className="text-xs text-gray-500 mb-2">
        <span className="font-medium">Owned by:</span> {teamName}
        {contributingTeamNames.length > 0 && (
          <span className="text-gray-400">
            {" "}· Contributing: {contributingTeamNames.join(", ")}
          </span>
        )}
      </div>

      {/* Dependencies count */}
      {promise.depends_on.length > 0 && (
        <p className="text-[10px] text-gray-400 mb-2">
          Depends on {promise.depends_on.length} other promise{promise.depends_on.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* External dependencies */}
      {promise.externalDependencies.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {promise.externalDependencies.map((dep, i) => (
            <ExternalDependencyCard key={i} dep={dep} compact />
          ))}
        </div>
      )}

      {/* Actions */}
      {!isTerminal && onStatusUpdate && (
        <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200/50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusUpdate(promise.id, "verified");
            }}
            className="text-xs px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Mark Kept
          </button>
          {promise.status === "declared" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusUpdate(promise.id, "degraded");
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-white border text-amber-700 hover:bg-amber-50"
            >
              Flag Risk
            </button>
          )}
        </div>
      )}
    </div>
  );
}
