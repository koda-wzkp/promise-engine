"use client";

import { useState } from "react";
import type { GardenPromise } from "@/lib/types/personal";
import type { PromiseStatus } from "@/lib/types/promise";

interface SensorThresholdProps {
  promise: GardenPromise;
  onSimulate: (promiseId: string, status: PromiseStatus) => void;
  onClose: () => void;
}

export function SensorThreshold({ promise, onSimulate, onClose }: SensorThresholdProps) {
  const sensor = promise.sensor;
  const [simulated, setSimulated] = useState<PromiseStatus | null>(null);

  if (!sensor) return null;

  function runSim(status: PromiseStatus) {
    setSimulated(status);
    onSimulate(promise.id, status);
  }

  const { threshold, metric, type, lastSync } = sensor;
  const conditionText = `${metric.replace(/_/g, " ")} ${threshold.operator === ">=" ? "≥" : threshold.operator === "<=" ? "≤" : "="} ${threshold.value} ${threshold.unit}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.3)" }}
      aria-modal="true"
      role="dialog"
      aria-label="Sensor threshold"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-serif font-semibold text-gray-900">Sensor status</h2>
            <p className="text-xs text-gray-500 mt-0.5 capitalize">{type.replace(/-/g, " ")}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-gray-400">✕</button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="bg-blue-50 rounded-xl px-4 py-3">
            <p className="text-xs text-blue-600 font-medium mb-0.5">Verified when</p>
            <p className="text-sm text-blue-900">{conditionText}</p>
          </div>

          {lastSync && (
            <p className="text-xs text-gray-400">
              Last sync: {new Date(lastSync).toLocaleDateString()}
            </p>
          )}

          {!lastSync && (
            <p className="text-xs text-amber-600">
              No sync yet — native app required for live data.
            </p>
          )}

          {/* Web simulation */}
          <div className="border border-gray-100 rounded-xl p-3 space-y-2">
            <p className="text-xs font-medium text-gray-500">Simulate (web only)</p>
            {simulated && (
              <p className="text-xs text-green-700 font-medium">
                Simulated as: {simulated}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => runSim("verified")}
                className="flex-1 py-2 text-xs font-semibold bg-green-100 text-green-800 rounded-lg hover:bg-green-200 focus-visible:outline-2 focus-visible:outline-green-600"
              >
                Met threshold
              </button>
              <button
                onClick={() => runSim("degraded")}
                className="flex-1 py-2 text-xs font-semibold bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-amber-600"
              >
                Slipping
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-semibold bg-green-700 text-white rounded-xl hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-green-600"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
