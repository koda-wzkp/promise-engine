"use client";

/**
 * ContributionPlant — appears in the garden when the user has opted into
 * data contribution. Represents their commitment to the collective dataset.
 *
 * States:
 *   active   — contributing (animated, green)
 *   dormant  — opted out / paused (gray, still visible)
 *   sending  — batch being sent (pulse animation)
 */

import type { ContributionState } from "@/lib/types/contribution";
import type { GardenAction } from "@/lib/garden/gardenState";

interface ContributionPlantProps {
  contribution: ContributionState;
  dispatch: React.Dispatch<GardenAction>;
}

export function ContributionPlant({ contribution, dispatch }: ContributionPlantProps) {
  if (!contribution.enabled && !contribution.lastSentAt) return null;

  const isActive = contribution.enabled;
  const lastSent = contribution.lastSentAt
    ? new Date(contribution.lastSentAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div
      className={`rounded-2xl border-2 p-4 transition-all ${
        isActive
          ? "border-green-300 bg-green-50"
          : "border-gray-200 bg-gray-50 opacity-75"
      }`}
      role="region"
      aria-label="Contribution plant"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Plant icon */}
          <div
            className={`text-3xl transition-all ${
              isActive ? "animate-[sway_3s_ease-in-out_infinite]" : "grayscale"
            }`}
            aria-hidden="true"
            style={
              isActive
                ? {
                    animation: "sway 3s ease-in-out infinite",
                    display: "inline-block",
                  }
                : {}
            }
          >
            {isActive ? "🌿" : "🍂"}
          </div>

          <div>
            <p className="font-serif font-semibold text-sm text-gray-900">
              Contribution promise
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {isActive
                ? `Contributing ${contribution.level === "A" ? "schema" : "aggregate"} data monthly`
                : "Contribution paused — data no longer flowing"}
            </p>
            {lastSent && (
              <p className="text-xs text-gray-400 mt-0.5">
                Last batch sent {lastSent}
              </p>
            )}
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={() =>
            dispatch(isActive ? { type: "DISABLE_CONTRIBUTION" } : { type: "ENABLE_CONTRIBUTION", level: contribution.level })
          }
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
            isActive
              ? "bg-white border border-red-200 text-red-600 hover:bg-red-50"
              : "bg-white border border-green-200 text-green-700 hover:bg-green-50"
          }`}
          aria-label={isActive ? "Pause contribution" : "Resume contribution"}
        >
          {isActive ? "Pause" : "Resume"}
        </button>
      </div>

      {isActive && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <div className="flex items-center justify-between text-xs text-green-700">
            <span>{contribution.sentBatchIds.length} batch{contribution.sentBatchIds.length !== 1 ? "es" : ""} contributed</span>
            <span className="uppercase tracking-wide font-semibold">
              Level {contribution.level}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
