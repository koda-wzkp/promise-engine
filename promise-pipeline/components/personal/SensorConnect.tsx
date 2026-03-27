"use client";

import { useState } from "react";
import type { GardenPromise, SensorConnection, SensorType } from "@/lib/types/personal";

interface SensorConnectProps {
  promise: GardenPromise;
  onConnect: (promiseId: string, sensor: SensorConnection) => void;
  onDisconnect: (promiseId: string) => void;
  onClose: () => void;
}

const SENSORS: { type: SensorType; label: string; description: string; metrics: { value: string; label: string }[] }[] = [
  {
    type: "apple-health",
    label: "Apple Health",
    description: "Steps, workouts, sleep, heart rate",
    metrics: [
      { value: "workout_sessions", label: "Workout sessions" },
      { value: "steps_per_day",    label: "Steps per day" },
      { value: "sleep_start_hour", label: "Sleep by time" },
    ],
  },
  {
    type: "google-fit",
    label: "Google Fit",
    description: "Activity, sleep, heart points",
    metrics: [
      { value: "activity_minutes", label: "Active minutes" },
      { value: "heart_points",     label: "Heart points" },
    ],
  },
  {
    type: "screen-time",
    label: "Screen Time",
    description: "App usage, pickups, downtime",
    metrics: [
      { value: "screen_time_after_hour", label: "Screen time after hour" },
      { value: "daily_pickups",          label: "Daily pickups" },
    ],
  },
  {
    type: "calendar",
    label: "Calendar",
    description: "Event attendance, meeting commitments",
    metrics: [
      { value: "events_attended", label: "Events attended" },
    ],
  },
];

export function SensorConnect({ promise, onConnect, onDisconnect, onClose }: SensorConnectProps) {
  const existing = promise.sensor;
  const [selected, setSelected] = useState<SensorType | null>(existing?.type ?? null);
  const [metric, setMetric] = useState(existing?.metric ?? "");
  const [operator, setOperator] = useState<">=" | "<=" | "==">(">=" as ">=");
  const [value, setValue] = useState(existing?.threshold.value ?? 3);
  const [unit, setUnit] = useState(existing?.threshold.unit ?? "times/week");
  const [step, setStep] = useState<"select" | "configure">(existing ? "configure" : "select");

  const selectedSensor = SENSORS.find((s) => s.type === selected);

  function handleConnect() {
    if (!selected || !metric) return;
    const sensor: SensorConnection = {
      type: selected,
      metric,
      threshold: { operator, value, unit },
      connectedAt: new Date().toISOString(),
      lastSync: null,
      simulatedValue: null,
    };
    onConnect(promise.id, sensor);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.3)" }}
      aria-modal="true"
      role="dialog"
      aria-label="Connect a sensor"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b flex items-center justify-between">
          <h2 className="font-serif font-semibold text-gray-900">
            {step === "select" ? "Connect a sensor" : "Set threshold"}
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-gray-400">✕</button>
        </div>

        <div className="px-5 py-4 space-y-3 max-h-80 overflow-y-auto">
          {/* Native-only note */}
          <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700">
            Apple Health and Screen Time require the native app. In the browser, use Simulate to test.
          </div>

          {step === "select" && (
            <div className="space-y-2">
              {SENSORS.map((s) => (
                <button
                  key={s.type}
                  onClick={() => { setSelected(s.type); setMetric(s.metrics[0].value); setStep("configure"); }}
                  className={`w-full text-left px-3 py-3 rounded-xl border transition-colors focus-visible:outline-2 focus-visible:outline-green-600 ${
                    selected === s.type ? "border-green-400 bg-green-50" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-800">{s.label}</p>
                  <p className="text-xs text-gray-500">{s.description}</p>
                </button>
              ))}
            </div>
          )}

          {step === "configure" && selectedSensor && (
            <div className="space-y-3">
              <button onClick={() => setStep("select")} className="text-xs text-green-700 hover:underline">
                ← {selectedSensor.label}
              </button>

              <div>
                <label htmlFor="sensor-metric" className="text-sm font-medium text-gray-700 mb-1 block">Metric</label>
                <select
                  id="sensor-metric"
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  {selectedSensor.metrics.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor="sensor-op" className="text-sm font-medium text-gray-700 mb-1 block">Condition</label>
                  <select
                    id="sensor-op"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value as ">=" | "<=" | "==")}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value=">=">at least</option>
                    <option value="<=">no more than</option>
                    <option value="==">exactly</option>
                  </select>
                </div>
                <div className="w-20">
                  <label htmlFor="sensor-val" className="text-sm font-medium text-gray-700 mb-1 block">Amount</label>
                  <input
                    id="sensor-val"
                    type="number"
                    min={1}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="sensor-unit" className="text-sm font-medium text-gray-700 mb-1 block">Unit</label>
                <input
                  id="sensor-unit"
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="times/week"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600">
                Verified when: {metric.replace(/_/g, " ")} {operator === ">=" ? "≥" : operator === "<=" ? "≤" : "="} {value} {unit}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 flex gap-2">
          {existing && (
            <button
              onClick={() => { onDisconnect(promise.id); onClose(); }}
              className="py-2.5 px-4 text-sm text-red-500 border border-red-200 rounded-xl hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-400"
            >
              Disconnect
            </button>
          )}
          {step === "configure" && (
            <button
              onClick={handleConnect}
              disabled={!metric}
              className="flex-1 py-2.5 text-sm font-semibold bg-green-700 text-white rounded-xl disabled:opacity-40 hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-green-600"
            >
              {existing ? "Update" : "Connect"}
            </button>
          )}
          {step === "select" && (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm text-gray-500 border rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
