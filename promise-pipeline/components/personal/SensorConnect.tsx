"use client";

/**
 * SensorConnect — Phase 2 Sensor Integration Flow
 *
 * Per promise: "Connect a sensor" toggle.
 * When connected:
 * - verification.method changes to 'sensor'
 * - kRegime shifts to 'physics' (k ≈ 1.1)
 * - Plant material changes to crystalline/metallic
 * - Status updates automatically based on sensor data
 */

import { useState, useCallback } from "react";
import type { SensorType, SensorThreshold } from "@/lib/types/garden";
import type { GardenPromise } from "@/lib/types/garden";
import type { PersonalDomain } from "@/lib/types/personal";

interface SensorConnectProps {
  promise: GardenPromise;
  onConnect: (sensorType: SensorType, threshold: SensorThreshold) => void;
  onDisconnect: () => void;
  onClose: () => void;
}

interface SensorOption {
  type: SensorType;
  label: string;
  icon: string;
  description: string;
  suggestedDomains: PersonalDomain[];
}

const SENSORS: SensorOption[] = [
  {
    type: "apple-health",
    label: "Apple Health / Google Fit",
    icon: "❤️",
    description: "Exercise, sleep, steps, workouts",
    suggestedDomains: ["health"],
  },
  {
    type: "screen-time",
    label: "Screen Time",
    icon: "📱",
    description: "Device usage limits, app time",
    suggestedDomains: ["health", "creative", "relationships"],
  },
  {
    type: "calendar",
    label: "Calendar",
    icon: "📅",
    description: "Attendance, meetings, events",
    suggestedDomains: ["work", "relationships"],
  },
];

export function SensorConnect({
  promise,
  onConnect,
  onDisconnect,
  onClose,
}: SensorConnectProps) {
  const [selectedSensor, setSelectedSensor] = useState<SensorType | null>(
    promise.sensor?.type ?? null
  );
  const [step, setStep] = useState<"select" | "threshold">(
    promise.sensor ? "threshold" : "select"
  );

  const isConnected = !!promise.sensor;

  const handleSelectSensor = useCallback((type: SensorType) => {
    setSelectedSensor(type);
    setStep("threshold");
  }, []);

  const handleDisconnect = useCallback(() => {
    onDisconnect();
    onClose();
  }, [onDisconnect, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Connect sensor"
        className="relative z-10 bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-lg font-semibold text-gray-900">
                {isConnected ? "Sensor Connected" : "Connect a Sensor"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {isConnected
                  ? "Automatic verification is active"
                  : "Let your devices verify this promise automatically"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Connected state */}
          {isConnected && promise.sensor && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {SENSORS.find((s) => s.type === promise.sensor!.type)?.icon ?? "📊"}
                </span>
                <span className="text-sm font-medium text-blue-800">
                  {SENSORS.find((s) => s.type === promise.sensor!.type)?.label ?? promise.sensor.type}
                </span>
              </div>
              <p className="text-xs text-blue-600">
                Threshold: {promise.sensor.threshold.metric}{" "}
                {promise.sensor.threshold.operator} {promise.sensor.threshold.value}{" "}
                {promise.sensor.threshold.unit} / {promise.sensor.threshold.period}
              </p>
              {promise.sensor.lastReadAt && (
                <p className="text-xs text-blue-500 mt-1">
                  Last reading: {new Date(promise.sensor.lastReadAt).toLocaleString()}
                </p>
              )}
              <button
                onClick={handleDisconnect}
                className="mt-3 text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Disconnect sensor
              </button>
            </div>
          )}

          {/* Sensor selection (step 1) */}
          {step === "select" && !isConnected && (
            <div className="space-y-2">
              {SENSORS.map((sensor) => {
                const suggested = sensor.suggestedDomains.includes(
                  promise.domain as PersonalDomain
                );
                return (
                  <button
                    key={sensor.type}
                    onClick={() => handleSelectSensor(sensor.type)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors hover:bg-gray-50 ${
                      suggested
                        ? "border-green-200 bg-green-50/30"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{sensor.icon}</span>
                      <div>
                        <span className="text-sm font-medium text-gray-800">
                          {sensor.label}
                        </span>
                        {suggested && (
                          <span className="ml-2 text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                            Suggested
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-7">
                      {sensor.description}
                    </p>
                  </button>
                );
              })}

              <p className="text-xs text-gray-400 mt-2">
                Sensor data is read locally on device. Raw data never leaves your device.
                Only the resulting status change is stored.
              </p>
            </div>
          )}

          {/* Threshold setting (step 2) */}
          {step === "threshold" && selectedSensor && !isConnected && (
            <SensorThresholdForm
              sensorType={selectedSensor}
              promiseBody={promise.body}
              onSubmit={(threshold) => {
                onConnect(selectedSensor, threshold);
                onClose();
              }}
              onBack={() => setStep("select")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Threshold Form ──────────────────────────────────────────────────────────

interface SensorThresholdFormProps {
  sensorType: SensorType;
  promiseBody: string;
  onSubmit: (threshold: SensorThreshold) => void;
  onBack: () => void;
}

const METRIC_SUGGESTIONS: Record<SensorType, { metric: string; unit: string; defaultValue: number; operator: SensorThreshold["operator"] }[]> = {
  "apple-health": [
    { metric: "workout_sessions", unit: "sessions", defaultValue: 3, operator: ">=" },
    { metric: "sleep_hours", unit: "hours", defaultValue: 7, operator: ">=" },
    { metric: "steps", unit: "steps", defaultValue: 8000, operator: ">=" },
    { metric: "bedtime", unit: "hour (24h)", defaultValue: 23, operator: "<=" },
  ],
  "google-fit": [
    { metric: "workout_sessions", unit: "sessions", defaultValue: 3, operator: ">=" },
    { metric: "sleep_hours", unit: "hours", defaultValue: 7, operator: ">=" },
    { metric: "steps", unit: "steps", defaultValue: 8000, operator: ">=" },
  ],
  "screen-time": [
    { metric: "total_screen_time", unit: "hours", defaultValue: 2, operator: "<=" },
    { metric: "screen_time_after", unit: "minutes", defaultValue: 0, operator: "<=" },
    { metric: "app_opens", unit: "opens", defaultValue: 10, operator: "<=" },
  ],
  "calendar": [
    { metric: "events_attended", unit: "events", defaultValue: 3, operator: ">=" },
    { metric: "meetings_this_week", unit: "meetings", defaultValue: 5, operator: "<=" },
  ],
};

function SensorThresholdForm({
  sensorType,
  promiseBody,
  onSubmit,
  onBack,
}: SensorThresholdFormProps) {
  const suggestions = METRIC_SUGGESTIONS[sensorType] ?? [];
  const [metric, setMetric] = useState(suggestions[0]?.metric ?? "");
  const [operator, setOperator] = useState<SensorThreshold["operator"]>(
    suggestions[0]?.operator ?? ">="
  );
  const [value, setValue] = useState(suggestions[0]?.defaultValue ?? 0);
  const [unit, setUnit] = useState(suggestions[0]?.unit ?? "");
  const [period, setPeriod] = useState<SensorThreshold["period"]>("weekly");

  const handleSuggestion = useCallback(
    (s: (typeof suggestions)[0]) => {
      setMetric(s.metric);
      setOperator(s.operator);
      setValue(s.defaultValue);
      setUnit(s.unit);
    },
    []
  );

  const canSubmit = metric.trim().length > 0 && value > 0;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M8 2L3 6l5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      <p className="text-sm text-gray-600">
        Set the success criteria for &ldquo;{promiseBody}&rdquo;
      </p>

      {/* Quick suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s.metric}
              type="button"
              onClick={() => handleSuggestion(s)}
              className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                metric === s.metric
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s.metric.replace(/_/g, " ")} {s.operator} {s.defaultValue} {s.unit}
            </button>
          ))}
        </div>
      )}

      {/* Custom threshold */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Metric</label>
          <input
            type="text"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Comparison</label>
          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value as SensorThreshold["operator"])}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <option value=">=">at least (≥)</option>
            <option value="<=">at most (≤)</option>
            <option value="==">exactly (=)</option>
            <option value=">">more than (&gt;)</option>
            <option value="<">less than (&lt;)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Value</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            min={0}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Period</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as SensorThreshold["period"])}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      <button
        onClick={() =>
          canSubmit && onSubmit({ metric, operator, value, unit, period })
        }
        disabled={!canSubmit}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
          canSubmit
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        Connect Sensor
      </button>

      <p className="text-[10px] text-gray-400 text-center">
        Raw sensor data stays on your device. Only status changes are stored.
      </p>
    </div>
  );
}
