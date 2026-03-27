"use client";

import type { Prediction } from "@/lib/types/phase3";

interface PredictionBadgeProps {
  predictions: Prediction[];
  domain?: string;
}

/**
 * Shows fulfillment predictions for a given domain (or all domains).
 * Only visible to contributors who have received prediction data.
 */
export function PredictionBadge({ predictions, domain }: PredictionBadgeProps) {
  const relevant = domain
    ? predictions.filter((p) => p.domain === domain)
    : predictions;

  if (relevant.length === 0) return null;

  // Use the most relevant prediction (highest sample size)
  const best = relevant.reduce((a, b) => (a.sampleSize > b.sampleSize ? a : b));

  const ratePercent = Math.round(best.fulfillmentRate * 100);

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-violet-50 border border-violet-200 rounded-lg">
      <span className="text-[10px] text-violet-600 font-medium">
        {ratePercent}% predicted
      </span>
      <span className="text-[10px] text-violet-400">
        ({best.verificationMethod}, n={best.sampleSize})
      </span>
    </div>
  );
}
