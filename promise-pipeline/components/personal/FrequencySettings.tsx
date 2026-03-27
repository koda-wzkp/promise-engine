"use client";

import { useState } from "react";
import type { GardenPromise } from "@/lib/types/personal";

interface FrequencySettingsProps {
  promise: GardenPromise;
  onSave: (promiseId: string, min: number, max: number) => void;
  onClose: () => void;
}

export function FrequencySettings({ promise, onSave, onClose }: FrequencySettingsProps) {
  const [min, setMin] = useState(promise.checkInFrequency.userMin);
  const [max, setMax] = useState(promise.checkInFrequency.userMax);

  const adaptive = promise.checkInFrequency.adaptive;
  const canSave = min >= 1 && max >= min;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.3)" }}
      aria-modal="true"
      role="dialog"
      aria-label="Check-in frequency settings"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b flex items-center justify-between">
          <h2 className="font-serif font-semibold text-gray-900">Check-in frequency</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-gray-400"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          <p className="text-xs text-gray-500 leading-relaxed">
            The system computes an optimal frequency based on your promise&apos;s k-regime.
            Set bounds here to prevent over- or under-checking.
          </p>

          <div>
            <label htmlFor="min-days" className="text-sm font-medium text-gray-700 mb-1 block">
              Minimum days between check-ins
            </label>
            <div className="flex items-center gap-3">
              <input
                id="min-days"
                type="range"
                min={1}
                max={14}
                value={min}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setMin(v);
                  if (max < v) setMax(v);
                }}
                className="flex-1 accent-green-700"
              />
              <span className="text-sm font-medium text-gray-700 w-12 text-right">
                {min}d
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="max-days" className="text-sm font-medium text-gray-700 mb-1 block">
              Maximum days between check-ins
            </label>
            <div className="flex items-center gap-3">
              <input
                id="max-days"
                type="range"
                min={min}
                max={30}
                value={max}
                onChange={(e) => setMax(Number(e.target.value))}
                className="flex-1 accent-green-700"
              />
              <span className="text-sm font-medium text-gray-700 w-12 text-right">
                {max}d
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500">
            <span className="font-medium text-gray-700">Adaptive frequency: </span>
            every {Math.round(adaptive)} day{Math.round(adaptive) !== 1 ? "s" : ""}
            <span className="block mt-0.5 text-gray-400">
              Based on {promise.kRegime} regime (k ={" "}
              {promise.expectedK.toFixed(2)})
            </span>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm text-gray-500 border rounded-xl hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={() => { if (canSave) { onSave(promise.id, min, max); onClose(); } }}
            disabled={!canSave}
            className="flex-1 py-2.5 text-sm font-semibold bg-green-700 text-white rounded-xl disabled:opacity-40 hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-green-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
