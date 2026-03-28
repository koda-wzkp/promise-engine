"use client";

import { useEffect, useState } from "react";
import type { ExternalDependency } from "@/lib/types/org";
import type { PromiseStatus } from "@/lib/types/promise";
import { fetchCivicPromiseSummary } from "@/lib/garden/civicSync";

const STATUS_COLORS: Record<PromiseStatus, string> = {
  declared:     "bg-blue-50 text-blue-700 border-blue-200",
  verified:     "bg-green-50 text-green-700 border-green-200",
  degraded:     "bg-amber-50 text-amber-700 border-amber-200",
  violated:     "bg-red-50 text-red-700 border-red-200",
  unverifiable: "bg-gray-50 text-gray-500 border-gray-200",
};

const TYPE_ICONS: Record<ExternalDependency["type"], string> = {
  civic:      "🏛",
  regulatory: "⚖️",
  vendor:     "🤝",
  partner:    "🔗",
};

interface CivicSummary {
  id: string;
  body: string;
  domain: string;
  status: PromiseStatus;
  promiser: string;
}

/**
 * Displays an external dependency (civic/regulatory/vendor/partner) for an org promise.
 * Lazily loads civic promise details from local data files.
 */
export function ExternalDependencyCard({
  dependency,
  onZoomIn,
}: {
  dependency: ExternalDependency;
  onZoomIn?: () => void;
}) {
  const [civic, setCivic] = useState<CivicSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dependency.civicPromiseId || !dependency.civicDashboard) return;
    setLoading(true);
    fetchCivicPromiseSummary(dependency.civicPromiseId, dependency.civicDashboard)
      .then((s) => setCivic(s))
      .finally(() => setLoading(false));
  }, [dependency.civicPromiseId, dependency.civicDashboard]);

  const status = civic?.status ?? dependency.status;

  return (
    <div className={`rounded-xl border p-4 ${STATUS_COLORS[status]}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5" aria-hidden="true">
          {TYPE_ICONS[dependency.type]}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
              {dependency.type}
            </span>
            <span className={`px-1.5 py-0.5 text-xs rounded border ${STATUS_COLORS[status]}`}>
              {status}
            </span>
          </div>
          <p className="text-sm font-medium mt-1 leading-snug">{dependency.label}</p>
          {loading && (
            <p className="text-xs opacity-60 mt-1">Loading civic data…</p>
          )}
          {civic && (
            <p className="text-xs opacity-75 mt-1 line-clamp-2">{civic.body}</p>
          )}
          {civic && (
            <p className="text-xs opacity-60 mt-0.5">
              Promiser: {civic.promiser} · Domain: {civic.domain}
            </p>
          )}
          {dependency.lastSyncedAt && (
            <p className="text-xs opacity-50 mt-1">
              Synced {new Date(dependency.lastSyncedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        {onZoomIn && dependency.civicPromiseId && (
          <button
            onClick={onZoomIn}
            className="flex-shrink-0 px-2 py-1 text-xs rounded-lg border hover:bg-white/50 transition-colors"
            aria-label={`Zoom into ${dependency.label}`}
          >
            Zoom ↑
          </button>
        )}
      </div>
    </div>
  );
}
