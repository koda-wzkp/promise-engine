"use client";

import { ScenarioTheme } from "../../../lib/games/types";

interface IntegrityScoreProps {
  score: number;
  label: string;
  theme: ScenarioTheme;
  size?: "sm" | "lg";
}

function getScoreColor(score: number, theme: ScenarioTheme): string {
  if (score >= 70) return theme.terminal;
  if (score >= 45) return theme.statusColors.degraded;
  return theme.danger;
}

export default function IntegrityScore({
  score,
  label,
  theme,
  size = "lg",
}: IntegrityScoreProps) {
  const color = getScoreColor(score, theme);
  const digits = Math.round(score).toString().padStart(3, "0");

  if (size === "sm") {
    return (
      <div className="flex items-center gap-2">
        <span
          className="font-mono text-sm font-bold"
          style={{ color }}
          aria-label={`${label}: ${Math.round(score)}%`}
        >
          {digits}
        </span>
        <span
          className="font-mono text-[10px]"
          style={{ color: theme.textMuted }}
        >
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded border p-4 text-center"
      style={{ borderColor: theme.border, backgroundColor: theme.bgCard }}
      role="status"
      aria-label={`${label}: ${Math.round(score)}%`}
    >
      <div
        className="font-mono text-4xl font-bold tracking-widest"
        style={{ color }}
      >
        {digits}
        <span className="text-xl">%</span>
      </div>
      <div
        className="mt-1 font-mono text-xs uppercase tracking-widest"
        style={{ color: theme.textMuted }}
      >
        {label}
      </div>
      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.bg }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
