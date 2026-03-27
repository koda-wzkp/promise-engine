"use client";

/**
 * SharedGardenPlot — Partner's view of shared plants.
 *
 * A small garden plot showing plants shared by accountability partners.
 * Partner sees domain + status (plant health) by default.
 * Body and sub-promises visible only with explicit permission.
 */

import type { SharedPlant } from "@/lib/types/garden-phase2";
import type { PromiseStatus } from "@/lib/types/promise";
import { StatusBadge } from "@/components/promise/StatusBadge";

interface SharedGardenPlotProps {
  plants: SharedPlant[];
  onWater: (promiseId: string) => void;
  onEncourage: (promiseId: string) => void;
}

const DOMAIN_EMOJI: Record<string, string> = {
  health: "🌿",
  work: "🌳",
  relationships: "🌸",
  creative: "🍄",
  financial: "🌲",
};

const HEALTH_BG: Record<PromiseStatus, string> = {
  verified: "bg-green-50 border-green-200",
  declared: "bg-white border-gray-200",
  degraded: "bg-amber-50 border-amber-200",
  violated: "bg-red-50 border-red-200",
  unverifiable: "bg-gray-50 border-gray-200",
};

export function SharedGardenPlot({
  plants,
  onWater,
  onEncourage,
}: SharedGardenPlotProps) {
  if (plants.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        Shared Garden
      </h3>
      <p className="text-xs text-gray-400">
        Plants from accountability partners. Water them to confirm check-ins.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {plants.map((plant) => (
          <div
            key={plant.promiseId}
            className={`rounded-xl border p-3 ${HEALTH_BG[plant.status]}`}
          >
            {/* Domain + emoji */}
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-lg" aria-hidden="true">
                {DOMAIN_EMOJI[plant.domain] || "🌱"}
              </span>
              <span className="text-xs font-medium text-gray-600 capitalize">
                {plant.domain}
              </span>
            </div>

            {/* Status */}
            <StatusBadge status={plant.status} size="xs" />

            {/* Body (if visible) */}
            {plant.body && (
              <p className="text-xs text-gray-700 mt-2 line-clamp-2">
                {plant.body}
              </p>
            )}

            {/* Sub-promise status dots (if visible) */}
            {plant.childStatuses && plant.childStatuses.length > 0 && (
              <div className="flex gap-1 mt-2" aria-label="Sub-promise statuses">
                {plant.childStatuses.map((status, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      status === "verified"
                        ? "bg-green-500"
                        : status === "violated"
                        ? "bg-gray-400"
                        : status === "degraded"
                        ? "bg-amber-400"
                        : "bg-gray-300"
                    }`}
                    aria-label={`Sub-promise ${i + 1}: ${status}`}
                  />
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-1.5 mt-3">
              <button
                onClick={() => onWater(plant.promiseId)}
                className="flex-1 py-1.5 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                aria-label="Water this plant (confirm check-in)"
              >
                Water
              </button>
              <button
                onClick={() => onEncourage(plant.promiseId)}
                className="flex-1 py-1.5 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                aria-label="Send encouragement"
              >
                Tend
              </button>
            </div>

            {/* Last watered */}
            {plant.lastWatered && (
              <p className="text-xs text-gray-400 mt-1.5 text-center">
                Watered{" "}
                {new Date(plant.lastWatered).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
