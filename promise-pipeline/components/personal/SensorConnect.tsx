"use client";

/**
 * SensorConnect — Connect sensor flow.
 *
 * Per promise: "Connect a sensor" toggle.
 * When connected, verification.method → 'sensor', kRegime → 'physics',
 * plant material changes to crystalline/metallic, status auto-updates.
 */

import { useState, useCallback } from "react";
import type { SensorType, SensorThreshold } from "@/lib/types/garden-phase2";

interface SensorConnectProps {
  promiseId: string;
  promiseBody: string;
  domain: string;
  onConnect: (
    promiseId: string,
    sensorType: SensorType,
    threshold: SensorThreshold,
    metric: string
  ) => void;
  onDisconnect: (promiseId: string) => void;
  onCancel: () => void;
  /** Whether a sensor is currently connected */
  isConnected: boolean;
}

interface SensorOption {
  type: SensorType;
  label: string;
  icon: string;
  domains: string[];
  metrics: string[];
}

const SENSOR_OPTIONS: SensorOption[] = [
  {
    type: "apple-health",
    label: "Apple Health / Google Fit",
    icon: "❤️",
    domains: ["health"],
    metrics: ["workout_sessions", "sleep_hours", "steps", "active_minutes"],
  },
  {
    type: "screen-time",
    label: "Screen Time",
    icon: "📱",
    domains: ["health", "work", "creative"],
    metrics: ["total_screen_time", "app_usage", "pickups"],
  },
  {
    type: "calendar",
    label: "Calendar",
    icon: "📅",
    domains: ["work", "relationships"],
    metrics: ["events_attended", "meetings_held", "hours_blocked"],
  },
];

const METRIC_LABELS: Record<string, string> = {
  workout_sessions: "Workout sessions",
  sleep_hours: "Hours of sleep",
  steps: "Steps",
  active_minutes: "Active minutes",
  total_screen_time: "Screen time (minutes)",
  app_usage: "App usage (minutes)",
  pickups: "Phone pickups",
  events_attended: "Events attended",
  meetings_held: "Meetings held",
  hours_blocked: "Hours blocked",
};

const OPERATOR_LABELS: Record<string, string> = {
  ">=": "at least",
  "<=": "at most",
  "==": "exactly",
  ">": "more than",
  "<": "less than",
};

export function SensorConnect({
  promiseId,
  promiseBody,
  domain,
  onConnect,
  onDisconnect,
  onCancel,
  isConnected,
}: SensorConnectProps) {
  const [selectedSensor, setSelectedSensor] = useState<SensorType | null>(null);
  const [selectedMetric, setSelectedMetric] = useState("");
  const [operator, setOperator] = useState<SensorThreshold["operator"]>(">=");
  const [value, setValue] = useState("");
  const [period, setPeriod] = useState<SensorThreshold["period"]>("week");

  const availableSensors = SENSOR_OPTIONS.filter(
    (s) => s.domains.includes(domain.toLowerCase()) || s.domains.length === 0
  );

  const selectedSensorOption = SENSOR_OPTIONS.find(
    (s) => s.type === selectedSensor
  );

  const handleConnect = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedSensor || !selectedMetric || !value) return;

      const threshold: SensorThreshold = {
        operator,
        value: parseFloat(value),
        unit: selectedMetric,
        period,
      };

      onConnect(promiseId, selectedSensor, threshold, selectedMetric);
    },
    [promiseId, selectedSensor, selectedMetric, operator, value, period, onConnect]
  );

  if (isConnected) {
    return (
      <div className="bg-white rounded-xl border p-5 max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-green-700">
            Sensor Connected
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          This promise auto-updates from sensor data. Raw data stays on your
          device — only status changes are stored.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Done
          </button>
          <button
            onClick={() => onDisconnect(promiseId)}
            className="flex-1 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleConnect}
      className="bg-white rounded-xl border p-5 max-w-md mx-auto"
    >
      <h3 className="font-serif text-lg font-semibold text-gray-900 mb-1">
        Connect a Sensor
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Auto-verify &ldquo;{promiseBody}&rdquo; with real data. Sensor data
        stays local — only status changes are stored.
      </p>

      {/* Sensor selection */}
      <div className="space-y-2 mb-4">
        {availableSensors.length === 0 && (
          <p className="text-xs text-gray-400">
            No sensors available for the {domain} domain. Try Apple Health for health promises.
          </p>
        )}
        {(availableSensors.length > 0 ? availableSensors : SENSOR_OPTIONS).map(
          (sensor) => (
            <button
              key={sensor.type}
              type="button"
              onClick={() => {
                setSelectedSensor(sensor.type);
                setSelectedMetric(sensor.metrics[0] || "");
              }}
              className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                selectedSensor === sensor.type
                  ? "ring-2 ring-green-600 border-green-300 bg-green-50"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <span className="mr-2">{sensor.icon}</span>
              {sensor.label}
            </button>
          )
        )}
      </div>

      {/* Metric + threshold */}
      {selectedSensorOption && (
        <div className="space-y-3 border-t pt-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Metric</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm bg-white"
            >
              {selectedSensorOption.metrics.map((m) => (
                <option key={m} value={m}>
                  {METRIC_LABELS[m] || m}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Condition
              </label>
              <select
                value={operator}
                onChange={(e) =>
                  setOperator(e.target.value as SensorThreshold["operator"])
                }
                className="w-full border rounded px-2 py-1.5 text-sm bg-white"
              >
                {Object.entries(OPERATOR_LABELS).map(([op, label]) => (
                  <option key={op} value={op}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Value</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full border rounded px-2 py-1.5 text-sm"
                placeholder="3"
                required
                min={0}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Per</label>
              <select
                value={period}
                onChange={(e) =>
                  setPeriod(e.target.value as SensorThreshold["period"])
                }
                className="w-full border rounded px-2 py-1.5 text-sm bg-white"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-gray-400 italic">
            Example: {OPERATOR_LABELS[operator]} {value || "3"}{" "}
            {METRIC_LABELS[selectedMetric]?.toLowerCase() || selectedMetric} per{" "}
            {period}
          </p>
        </div>
      )}

      <div className="flex gap-2 mt-5">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!selectedSensor || !value}
          className="flex-1 py-2 text-sm text-white bg-green-700 rounded-lg hover:bg-green-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Connect
        </button>
      </div>
    </form>
  );
}
