"use client";

import { DynamicalRegime } from "@/lib/types/bayesian";

interface ProbabilityBarProps {
  pKept: number;        // 0 to 1
  k: number;            // Weibull shape parameter
  showLabel?: boolean;  // Show percentage text (default true)
  compact?: boolean;    // Compact mode for small cards (default false)
}

function getFillColor(pKept: number): string {
  if (pKept > 0.85) return "#1a5f4a";  // verified green
  if (pKept >= 0.50) return "#1e40af"; // declared blue
  if (pKept >= 0.30) return "#78350f"; // degraded amber
  return "#991b1b";                    // violated red
}

function getRegimeLabel(k: number): DynamicalRegime {
  if (k >= 0.70) return "computing";
  if (k < 0.40) return "composting";
  return "transitional";
}

export function ProbabilityBar({
  pKept,
  k,
  showLabel = true,
  compact = false,
}: ProbabilityBarProps) {
  const fillColor = getFillColor(pKept);
  const regime = getRegimeLabel(k);
  const percent = Math.round(pKept * 100);
  const width = compact ? "100%" : "200px";
  const height = compact ? 6 : 10;

  return (
    <div
      style={{ width }}
      className="flex items-center gap-2"
    >
      <div
        role="meter"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Fulfillment probability: ${percent} percent`}
        title={`Fulfillment probability: ${pKept.toFixed(2)}. Regime: ${regime} (k=${k.toFixed(2)})`}
        className="flex-1 rounded-full overflow-hidden"
        style={{ height, backgroundColor: "#e5e7eb" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${percent}%`,
            backgroundColor: fillColor,
            // prefers-reduced-motion: no transition
            transition: "none",
          }}
        />
      </div>
      {showLabel && (
        <span
          className="text-xs font-mono shrink-0"
          style={{ color: fillColor, minWidth: "2.5rem", textAlign: "right" }}
        >
          {percent}%
        </span>
      )}
    </div>
  );
}
