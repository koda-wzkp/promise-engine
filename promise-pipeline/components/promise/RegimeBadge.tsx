"use client";

import { DynamicalRegime } from "@/lib/types/bayesian";

interface RegimeBadgeProps {
  regime: DynamicalRegime;
  k: number;
}

const REGIME_STYLES: Record<DynamicalRegime, {
  bg: string;
  text: string;
  border: string;
  dotColor: string;
  explanation: string;
}> = {
  computing: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dotColor: "#059669",
    explanation: "Outcomes are physics-like and predictable. Hazard rate is constant.",
  },
  composting: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dotColor: "#d97706",
    explanation: "Ecological regime — barriers grow over time. Hazard rate decreases. Conditions stagnate without verification.",
  },
  transitional: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    dotColor: "#2563eb",
    explanation: "Fragile regime — between composting and computing. Verification could push this toward predictability.",
  },
};

const REGIME_LABELS: Record<DynamicalRegime, string> = {
  computing: "Computing",
  composting: "Composting",
  transitional: "Transitional",
};

export function RegimeBadge({ regime, k }: RegimeBadgeProps) {
  const styles = REGIME_STYLES[regime];
  const label = REGIME_LABELS[regime];

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded border ${styles.bg} ${styles.text} ${styles.border}`}
      title={`Weibull k = ${k.toFixed(2)}. ${styles.explanation}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: styles.dotColor }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
