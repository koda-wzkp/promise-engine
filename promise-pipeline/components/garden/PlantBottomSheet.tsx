"use client";

import { useEffect, useState } from "react";
import type { GardenPromise } from "@/lib/types/personal";
import { isDue } from "@/lib/garden/adaptiveCheckin";

const STATUS_LABELS: Record<string, string> = {
  declared:     "Declared",
  verified:     "On track",
  degraded:     "Slipping",
  violated:     "Dormant",
  unverifiable: "Unverifiable",
};

const STATUS_COLORS: Record<string, string> = {
  declared:     "bg-blue-100 text-blue-700",
  verified:     "bg-green-100 text-green-700",
  degraded:     "bg-amber-100 text-amber-700",
  violated:     "bg-gray-100 text-gray-500",
  unverifiable: "bg-gray-50 text-gray-400",
};

const K_COLORS: Record<string, string> = {
  composting: "#d97706",
  ecological: "#059669",
  physics:    "#2563eb",
};

interface PlantBottomSheetProps {
  promise: GardenPromise;
  isStressed?: boolean;
  onCheckIn: () => void;
  onSubPromise: () => void;
  onDependency: () => void;
  onPartner: () => void;
  onSensor: () => void;
  onClose: () => void;
}

export function PlantBottomSheet({
  promise,
  isStressed,
  onCheckIn,
  onSubPromise,
  onDependency,
  onPartner,
  onSensor,
  onClose,
}: PlantBottomSheetProps) {
  const [visible, setVisible] = useState(false);
  const due = isDue(promise);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  function close() {
    setVisible(false);
    setTimeout(onClose, 280);
  }

  // Fire action after sheet close animation
  function act(fn: () => void) {
    close();
    setTimeout(fn, 280);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col justify-end"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-black/25 transition-opacity duration-[280ms]"
        style={{ opacity: visible ? 1 : 0 }}
        aria-hidden="true"
        onClick={close}
      />

      {/* Sheet */}
      <div
        className="relative bg-white rounded-t-2xl shadow-2xl transition-transform duration-[280ms] ease-out"
        style={{ transform: visible ? "translateY(0)" : "translateY(100%)" }}
        role="dialog"
        aria-modal="true"
        aria-label={`Promise details: ${promise.body}`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" aria-hidden="true" />
        </div>

        <div className="px-5 pb-8 pt-2 space-y-4">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-base font-medium text-gray-900 leading-snug flex-1">
                {promise.body}
              </p>
              <button
                onClick={close}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0 mt-0.5"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[promise.status] ?? "bg-gray-50 text-gray-400"}`}>
                {STATUS_LABELS[promise.status] ?? promise.status}
              </span>
              <span
                className="px-2 py-0.5 text-xs rounded-full"
                style={{
                  background: (K_COLORS[promise.kRegime] ?? "#9ca3af") + "22",
                  color:      K_COLORS[promise.kRegime] ?? "#9ca3af",
                }}
              >
                {promise.kRegime}
              </span>
              {due && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">
                  due now
                </span>
              )}
              {isStressed && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-600">
                  dependency struggling
                </span>
              )}
              {promise.partner && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-purple-50 text-purple-700">
                  {promise.partner.inviteStatus === "accepted" ? "partnered" : "invite sent"}
                </span>
              )}
              {promise.children.length > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-50 text-gray-500">
                  {promise.children.length} sub
                </span>
              )}
            </div>

            {promise.lastCheckIn && (
              <p className="text-xs text-gray-400 mt-1.5">
                Last check-in: {new Date(promise.lastCheckIn).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => act(onCheckIn)}
            className="w-full py-3.5 bg-green-700 text-white rounded-xl font-semibold text-sm hover:bg-green-800 active:bg-green-900 transition-colors focus-visible:outline-2 focus-visible:outline-green-600"
          >
            Check in
          </button>

          {/* Secondary actions */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => act(onSubPromise)}
              className="py-3 text-xs font-medium rounded-xl bg-gray-50 text-green-700 hover:bg-green-50 transition-colors"
            >
              {promise.children.length > 0 ? `Break (${promise.children.length})` : "Break down"}
            </button>
            <button
              onClick={() => act(onDependency)}
              className="py-3 text-xs font-medium rounded-xl bg-gray-50 text-blue-700 hover:bg-blue-50 transition-colors"
            >
              {promise.depends_on.length > 0 ? `Depends (${promise.depends_on.length})` : "Depends"}
            </button>
            <button
              onClick={() => act(onPartner)}
              className="py-3 text-xs font-medium rounded-xl bg-gray-50 text-purple-700 hover:bg-purple-50 transition-colors"
            >
              {promise.partner ? "Partner ✓" : "Partner"}
            </button>
            <button
              onClick={() => act(onSensor)}
              className="py-3 text-xs font-medium rounded-xl bg-gray-50 text-blue-700 hover:bg-blue-50 transition-colors"
            >
              {promise.sensor ? "Sensor ✓" : "Sensor"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
