"use client";

import { ScenarioConfig, GameState } from "../../../lib/games/types";

interface BriefingScreenProps {
  config: ScenarioConfig;
  state: GameState;
  onStart: () => void;
}

export default function BriefingScreen({ config, state: _state, onStart }: BriefingScreenProps) {
  const { briefing, setting, budget, theme } = config;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div
          className="border-2 rounded p-6 text-center space-y-1"
          style={{ borderColor: theme.accent }}
        >
          <div
            className="font-mono text-xs uppercase tracking-[0.3em]"
            style={{ color: theme.textMuted }}
          >
            {briefing.headerLine1}
          </div>
          <h1
            className="font-mono text-2xl font-bold uppercase tracking-widest"
            style={{ color: theme.accent }}
          >
            {briefing.headerLine2}
          </h1>
          <div
            className="font-mono text-xs uppercase tracking-[0.3em]"
            style={{ color: theme.textMuted }}
          >
            {briefing.headerLine3}
          </div>
        </div>

        {/* Setting */}
        <div
          className="rounded border p-4 space-y-1"
          style={{ borderColor: theme.border, backgroundColor: theme.bgCard }}
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
            {[
              ["Location", setting.location],
              ["Role", setting.role],
              ["Organization", setting.organization],
              ["Time Context", setting.timeContext],
              [setting.populationLabel, setting.populationCount.toString()],
              ["Duration", `${config.totalRounds} ${config.roundLabel}s`],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <span style={{ color: theme.textMuted }}>{label}:</span>
                <span style={{ color: theme.textBright }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Flavor intro */}
        <div
          className="font-mono text-sm leading-relaxed"
          style={{ color: theme.text }}
        >
          {setting.flavorIntro}
        </div>

        {/* Appointment */}
        <div
          className="rounded border-l-4 pl-4 py-2"
          style={{ borderLeftColor: theme.accent }}
        >
          <p className="font-mono text-sm leading-relaxed" style={{ color: theme.text }}>
            {briefing.appointmentText}
          </p>
        </div>

        {/* Budget */}
        <div
          className="rounded border p-4 space-y-2"
          style={{ borderColor: theme.border, backgroundColor: theme.bgCard }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-wider"
            style={{ color: theme.textMuted }}
          >
            Budget Situation
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            {[
              ["Starting Capital", `${budget.startingCapital}${setting.unitScale}`],
              ["Per Round", `+${budget.allocationPerRound}${setting.unitScale}`],
              ["Total Available", `${budget.totalAvailableNoRevenue}${setting.unitScale}`],
              ["Full Funding Cost", `${budget.totalCostFullFunding}${setting.unitScale}`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span style={{ color: theme.textMuted }}>{label}</span>
                <span style={{ color: theme.accent }}>{value}</span>
              </div>
            ))}
          </div>
          <p className="font-mono text-[11px] leading-relaxed" style={{ color: theme.textMuted }}>
            {briefing.budgetExplanation}
          </p>
        </div>

        {/* Difficulty + lesson */}
        <div className="flex items-center justify-between font-mono text-xs">
          <span style={{ color: theme.textMuted }}>
            Difficulty:{" "}
            <span
              style={{
                color:
                  config.difficulty === "brutal"
                    ? theme.danger
                    : config.difficulty === "hard"
                    ? theme.statusColors.degraded
                    : theme.terminal,
              }}
            >
              {config.difficulty.toUpperCase()}
            </span>
          </span>
          <span style={{ color: theme.textMuted }}>
            Lesson:{" "}
            <span style={{ color: theme.accent }}>
              {config.primaryLesson.toUpperCase()}
            </span>
          </span>
          <span style={{ color: theme.textMuted }}>
            ~{config.estimatedMinutes} min
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          className="w-full rounded border-2 py-3 font-mono text-base font-bold uppercase tracking-widest transition-all hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            borderColor: theme.accent,
            color: theme.bg,
            backgroundColor: theme.accent,
          }}
        >
          {briefing.startButtonLabel}
        </button>
      </div>
    </div>
  );
}
