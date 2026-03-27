"use client";

import type { ExternalDependency } from "@/lib/types/phase4";
import type { PromiseStatus } from "@/lib/types/promise";

interface ExternalDependencyCardProps {
  dep: ExternalDependency;
  compact?: boolean;
  onLink?: (civicDashboard: string) => void;
}

const DEP_TYPE_LABELS: Record<ExternalDependency["type"], string> = {
  civic: "Civic",
  regulatory: "Regulatory",
  vendor: "Vendor",
  partner: "Partner",
};

const STATUS_BADGE: Record<PromiseStatus, string> = {
  declared: "bg-blue-100 text-blue-700",
  degraded: "bg-amber-100 text-amber-700",
  verified: "bg-emerald-100 text-emerald-700",
  violated: "bg-red-100 text-red-700",
  unverifiable: "bg-gray-100 text-gray-500",
};

export function ExternalDependencyCard({ dep, compact, onLink }: ExternalDependencyCardProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-[10px]">
        <span className={`px-1.5 py-0.5 rounded ${STATUS_BADGE[dep.status]}`}>
          {DEP_TYPE_LABELS[dep.type]}
        </span>
        <span className="text-gray-500 truncate">{dep.label}</span>
        {dep.lastSyncedAt && (
          <span className="text-gray-300 whitespace-nowrap">
            synced {new Date(dep.lastSyncedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[dep.status]}`}>
              {DEP_TYPE_LABELS[dep.type]}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[dep.status]}`}>
              {dep.status}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900">{dep.label}</p>
          {dep.civicPromiseId && (
            <p className="text-xs text-gray-400 mt-0.5">
              ID: {dep.civicPromiseId}
              {dep.civicDashboard && ` · Dashboard: ${dep.civicDashboard}`}
            </p>
          )}
          {dep.lastSyncedAt && (
            <p className="text-[10px] text-gray-300 mt-0.5">
              Last synced: {new Date(dep.lastSyncedAt).toLocaleString()}
            </p>
          )}
        </div>
        {onLink && dep.civicDashboard && (
          <button
            onClick={() => onLink(dep.civicDashboard!)}
            className="text-xs px-2 py-1 border rounded-lg text-blue-600 hover:bg-blue-50 flex-shrink-0"
          >
            View Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
