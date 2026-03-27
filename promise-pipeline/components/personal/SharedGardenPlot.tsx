"use client";

/**
 * SharedGardenPlot — Phase 2 Partner's View of Shared Plants
 *
 * A "Shared" section in the partner's garden — a small plot.
 * Shared plants grow/wilt based on the promiser's actual status.
 * Partner can "water" or "tend" (encourage) the plant.
 */

import { useState, useCallback } from "react";
import type { SharedPlant } from "@/lib/types/garden";
import type { PersonalDomain } from "@/lib/types/personal";
import { StatusBadge } from "@/components/promise/StatusBadge";

interface SharedGardenPlotProps {
  plants: SharedPlant[];
  onWater: (promiseId: string) => void;
  onEncourage: (promiseId: string, message: string) => void;
}

const DOMAIN_COLORS: Record<PersonalDomain, string> = {
  health: "#059669",
  work: "#1e40af",
  relationships: "#db2777",
  creative: "#7c3aed",
  financial: "#0891b2",
};

const DOMAIN_EMOJI: Record<PersonalDomain, string> = {
  health: "🍎",
  work: "🌳",
  relationships: "🌸",
  creative: "🌿",
  financial: "🌲",
};

const QUICK_MESSAGES = [
  "You've got this!",
  "Proud of you!",
  "Keep going!",
  "One step at a time",
];

export function SharedGardenPlot({
  plants,
  onWater,
  onEncourage,
}: SharedGardenPlotProps) {
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [showEncourage, setShowEncourage] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  if (plants.length === 0) return null;

  const handleEncourage = useCallback(
    (promiseId: string, message: string) => {
      onEncourage(promiseId, message);
      setShowEncourage(false);
      setCustomMessage("");
      setSelectedPlant(null);
    },
    [onEncourage]
  );

  return (
    <div className="mt-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
        Shared Garden
      </h3>

      <div className="bg-purple-50/50 rounded-xl border border-purple-100 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {plants.map((plant) => {
            const isWilting =
              plant.status === "degraded" || plant.status === "violated";
            const isSelected = selectedPlant === plant.promiseId;

            return (
              <div
                key={plant.promiseId}
                onClick={() =>
                  setSelectedPlant(isSelected ? null : plant.promiseId)
                }
                className={`rounded-xl border p-3 text-center cursor-pointer transition-all ${
                  isSelected
                    ? "ring-2 ring-purple-400 ring-offset-1 border-purple-300"
                    : isWilting
                    ? "border-orange-200 bg-orange-50/50"
                    : "border-purple-200 bg-white hover:shadow-sm"
                }`}
              >
                {/* Plant visual (simplified — domain emoji + status) */}
                <div className="text-3xl mb-2">
                  {DOMAIN_EMOJI[plant.domain] ?? "🌱"}
                </div>

                {/* Promiser name */}
                <p className="text-xs text-gray-500 mb-1">
                  {plant.promiserName ?? "A friend"}&apos;s
                </p>

                {/* Domain label */}
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: DOMAIN_COLORS[plant.domain] ?? "#666" }}
                >
                  {plant.domain.charAt(0).toUpperCase() + plant.domain.slice(1)}
                </p>

                <StatusBadge status={plant.status} size="xs" />

                {/* Wilting indicator */}
                {isWilting && (
                  <p className="text-[10px] text-orange-600 mt-1">
                    Needs attention
                  </p>
                )}

                {/* Last watered */}
                {plant.lastWateredAt && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    Watered{" "}
                    {new Date(plant.lastWateredAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Action panel for selected shared plant */}
        {selectedPlant && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-purple-200 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onWater(selectedPlant);
                  setSelectedPlant(null);
                }}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                💧 Water
              </button>
              <button
                onClick={() => setShowEncourage(!showEncourage)}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
              >
                🌟 Encourage
              </button>
            </div>

            {/* Encouragement messages */}
            {showEncourage && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_MESSAGES.map((msg) => (
                    <button
                      key={msg}
                      onClick={() => handleEncourage(selectedPlant, msg)}
                      className="text-xs px-2 py-1 rounded-full border border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Custom message..."
                    maxLength={80}
                    className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  />
                  <button
                    onClick={() =>
                      customMessage.trim() &&
                      handleEncourage(selectedPlant, customMessage.trim())
                    }
                    disabled={!customMessage.trim()}
                    className="px-3 py-1.5 text-xs rounded-lg bg-purple-600 text-white disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
