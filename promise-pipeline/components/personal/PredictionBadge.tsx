"use client";

/**
 * PredictionBadge — shown on promise cards for contribution-enabled users.
 * Displays the estimated fulfillment rate for promises similar to this one.
 *
 * Non-contributors never see this component.
 */

import { getPrediction } from "@/lib/contribution/compute";
import type { GardenPromise } from "@/lib/types/personal";

interface PredictionBadgeProps {
  promise: GardenPromise;
  /** Only renders when true — gate on contribution.enabled */
  visible: boolean;
}

export function PredictionBadge({ promise, visible }: PredictionBadgeProps) {
  if (!visible) return null;

  const prediction = getPrediction(promise.domain, promise.verification.method);
  if (!prediction) return null;

  const pct = Math.round(prediction.rate * 100);
  const isHigher = prediction.rate >= 0.65;
  const isLower = prediction.rate < 0.45;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isHigher
          ? "bg-green-50 text-green-700 border border-green-200"
          : isLower
          ? "bg-amber-50 text-amber-700 border border-amber-200"
          : "bg-blue-50 text-blue-700 border border-blue-200"
      }`}
      title={`Promises like yours (${promise.domain}, ${promise.verification.method}) have a ${pct}% fulfillment rate`}
      aria-label={`Similar promises: ${pct}% fulfillment rate`}
    >
      <span aria-hidden="true">
        {isHigher ? "📈" : isLower ? "📉" : "📊"}
      </span>
      <span>{pct}% similar fulfillment</span>
    </div>
  );
}
