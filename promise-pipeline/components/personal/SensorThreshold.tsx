"use client";

/**
 * SensorThreshold — Display and edit success criteria for sensor-connected promises.
 *
 * Shows the current threshold, last sync time, and allows threshold adjustment.
 */

import type { SensorConfig, SensorThreshold as SensorThresholdType } from "@/lib/types/garden-phase2";

interface SensorThresholdProps {
  sensor: SensorConfig;
  onUpdateThreshold?: (threshold: SensorThresholdType) => void;
}

const OPERATOR_LABELS: Record<string, string> = {
  ">=": "at least",
  "<=": "at most",
  "==": "exactly",
  ">": "more than",
  "<": "less than",
};

const SENSOR_LABELS: Record<string, string> = {
  "apple-health": "Apple Health",
  "google-fit": "Google Fit",
  "screen-time": "Screen Time",
  calendar: "Calendar",
};

export function SensorThreshold({ sensor, onUpdateThreshold }: SensorThresholdProps) {
  const { type, metric, threshold, lastSync, connected } = sensor;

  const criteriaText = `${OPERATOR_LABELS[threshold.operator] || threshold.operator} ${threshold.value} ${metric.replace(/_/g, " ")}${threshold.period ? ` per ${threshold.period}` : ""}`;

  return (
    <div className="bg-gray-50 rounded-lg p-3 text-xs">
      {/* Connection status */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-2 h-2 rounded-full ${
            connected ? "bg-green-500 animate-pulse" : "bg-gray-400"
          }`}
        />
        <span className="font-medium text-gray-700">
          {SENSOR_LABELS[type] || type}
        </span>
        {!connected && (
          <span className="text-red-500 text-xs">(disconnected)</span>
        )}
      </div>

      {/* Threshold criteria */}
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-gray-500">Success:</span>
        <span className="font-medium text-gray-800">{criteriaText}</span>
      </div>

      {/* Last sync */}
      {lastSync && (
        <div className="text-gray-400">
          Last synced:{" "}
          {new Date(lastSync).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}

      {/* Privacy note */}
      <div className="mt-2 text-gray-400 italic">
        Raw sensor data stays on your device. Only status changes are stored.
      </div>
    </div>
  );
}
