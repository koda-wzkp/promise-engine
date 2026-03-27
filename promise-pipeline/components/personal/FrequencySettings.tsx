"use client";

/**
 * FrequencySettings
 *
 * User sets min/max check-in bounds for a promise.
 * Displays the current adaptive frequency.
 *
 * Accessibility:
 *  - All inputs labeled
 *  - Number inputs with min/max constraints
 */

import { useState, useCallback } from "react";
import type { GardenPromise } from "@/lib/types/personal";

interface FrequencySettingsProps {
  promise: GardenPromise;
  onUpdate: (promiseId: string, min: number, max: number) => void;
  onClose: () => void;
}

export function FrequencySettings({
  promise,
  onUpdate,
  onClose,
}: FrequencySettingsProps) {
  const [min, setMin] = useState(promise.checkInFrequency.userMin);
  const [max, setMax] = useState(promise.checkInFrequency.userMax);

  const handleSave = useCallback(() => {
    const safeMin = Math.max(1, Math.min(min, 30));
    const safeMax = Math.max(safeMin, Math.min(max, 90));
    onUpdate(promise.id, safeMin, safeMax);
    onClose();
  }, [promise.id, min, max, onUpdate, onClose]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <div>
        <h4 className="font-serif font-semibold text-gray-900 text-sm">
          Check-in frequency
        </h4>
        <p className="text-xs text-gray-500 mt-0.5">
          &ldquo;{promise.body}&rdquo;
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor={`freq-min-${promise.id}`}
            className="block text-xs font-medium text-gray-600 mb-1"
          >
            Min (days)
          </label>
          <input
            id={`freq-min-${promise.id}`}
            type="number"
            min={1}
            max={30}
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />
        </div>
        <div>
          <label
            htmlFor={`freq-max-${promise.id}`}
            className="block text-xs font-medium text-gray-600 mb-1"
          >
            Max (days)
          </label>
          <input
            id={`freq-max-${promise.id}`}
            type="number"
            min={1}
            max={90}
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg px-3 py-2">
        <p className="text-xs text-gray-500">
          Current adaptive frequency:{" "}
          <span className="font-semibold text-gray-700">
            every {Math.round(promise.checkInFrequency.adaptive)} days
          </span>
        </p>
        <p className="text-xs text-gray-400 mt-0.5 capitalize">
          Regime: {promise.kRegime} (k̄ = {promise.expectedK.toFixed(2)})
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 py-2 text-sm font-medium rounded-lg bg-[#1a5f4a] text-white hover:bg-[#155240] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 text-sm text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
