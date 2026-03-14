"use client";

import { DualAccountabilityConfig, ScenarioTheme } from "../../../lib/games/types";
import IntegrityScore from "./IntegrityScore";

interface DualAccountabilityProps {
  scores: { overall: number; groupA: number; groupB: number };
  config: DualAccountabilityConfig;
  theme: ScenarioTheme;
}

export default function DualAccountability({
  scores,
  config,
  theme,
}: DualAccountabilityProps) {
  return (
    <div className="space-y-3">
      <IntegrityScore
        score={scores.overall}
        label={config.overallLabel}
        theme={theme}
        size="lg"
      />
      <div className="grid grid-cols-2 gap-2">
        <div
          className="rounded border p-3"
          style={{ borderColor: theme.border, backgroundColor: theme.bgCard }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-wider mb-1"
            style={{ color: theme.textMuted }}
          >
            {config.groupA.label}
          </div>
          <IntegrityScore
            score={scores.groupA}
            label=""
            theme={theme}
            size="sm"
          />
        </div>
        <div
          className="rounded border p-3"
          style={{ borderColor: theme.border, backgroundColor: theme.bgCard }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-wider mb-1"
            style={{ color: theme.textMuted }}
          >
            {config.groupB.label}
          </div>
          <IntegrityScore
            score={scores.groupB}
            label=""
            theme={theme}
            size="sm"
          />
        </div>
      </div>
      {scores.overall < config.gameOverThreshold + 15 && (
        <div
          className="rounded border px-3 py-2 font-mono text-[10px]"
          style={{
            borderColor: theme.danger,
            color: theme.danger,
            backgroundColor: `${theme.danger}15`,
          }}
          role="alert"
        >
          ⚠ Score approaching game-over threshold ({config.gameOverThreshold}%)
        </div>
      )}
    </div>
  );
}
