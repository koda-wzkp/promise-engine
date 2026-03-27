"use client";

import type { GardenPromise } from "@/lib/types/personal";

interface SharedGardenPlotProps {
  sharedPromises: GardenPromise[];
  onWater: (promiseId: string) => void;
  onCheckIn: (promiseId: string) => void;
}

const STATUS_HEALTH: Record<string, { label: string; bar: string; bg: string }> = {
  verified:     { label: "Thriving",  bar: "bg-green-500", bg: "bg-green-50" },
  declared:     { label: "Dormant",   bar: "bg-gray-400",  bg: "bg-gray-50" },
  degraded:     { label: "Wilting",   bar: "bg-amber-500", bg: "bg-amber-50" },
  violated:     { label: "Dormant",   bar: "bg-gray-300",  bg: "bg-gray-50" },
  unverifiable: { label: "Unknown",   bar: "bg-gray-200",  bg: "bg-gray-50" },
};

export function SharedGardenPlot({ sharedPromises, onWater, onCheckIn }: SharedGardenPlotProps) {
  if (sharedPromises.length === 0) return null;

  return (
    <section aria-label="Shared garden" className="space-y-2">
      <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide px-1">
        Shared
      </h3>
      {sharedPromises.map((p) => {
        const partner = p.partner!;
        const health = STATUS_HEALTH[p.status] ?? STATUS_HEALTH.declared;
        const showBody = partner.visibility.showBody;

        return (
          <div key={p.id} className={`rounded-xl border p-3 ${health.bg}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">
                  with {partner.partnerName}
                  {partner.inviteStatus === "pending" && (
                    <span className="ml-1 text-amber-600">· pending</span>
                  )}
                </p>
                {showBody ? (
                  <p className="text-sm text-gray-800 font-medium leading-snug">{p.body}</p>
                ) : (
                  <p className="text-sm text-gray-500 capitalize">{p.domain}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${health.bar}`}
                      style={{ width: p.status === "verified" ? "100%" : p.status === "degraded" ? "40%" : "20%" }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{health.label}</span>
                </div>
              </div>
              <button
                onClick={() => onWater(p.id)}
                className="px-3 py-1.5 text-xs font-semibold bg-green-700 text-white rounded-lg hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-green-600 flex-shrink-0"
                aria-label={`Water ${showBody ? p.body : p.domain + " promise"}`}
              >
                Water
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}
