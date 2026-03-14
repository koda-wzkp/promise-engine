"use client";

import { ScenarioConfig, GameState, GameAction } from "../../../lib/games/types";
import DualAccountability from "./DualAccountability";

interface VerdictScreenProps {
  config: ScenarioConfig;
  state: GameState;
  dispatch: (action: GameAction) => void;
}

function getBoardRecommendation(
  scores: { overall: number; groupA: number },
  config: ScenarioConfig
) {
  const { recommendations } = config.verdict.groupAAssessment;
  if (
    scores.overall >= recommendations.retain.minOverall &&
    scores.groupA >= recommendations.retain.minGroupScore
  ) {
    return { label: recommendations.retain.label, color: "terminal" as const };
  }
  if (
    scores.overall >= recommendations.probation.minOverall &&
    scores.groupA >= recommendations.probation.minGroupScore
  ) {
    return { label: recommendations.probation.label, color: "degraded" as const };
  }
  return { label: recommendations.terminate.label, color: "danger" as const };
}

function getGroupBAssessment(scores: { groupB: number }, config: ScenarioConfig) {
  const { groupBAssessment } = config.verdict;
  if (scores.groupB >= groupBAssessment.retainThreshold) {
    return { label: groupBAssessment.retainLabel, positive: true };
  }
  return { label: groupBAssessment.recallLabel, positive: false };
}

function getPostMortem(state: GameState, config: ScenarioConfig): string {
  if (state.cascadeLog.length >= 3) return config.verdict.postMortemTemplates.cascadeFired;
  if (state.conflictResults.some((c) => c.triggered))
    return config.verdict.postMortemTemplates.structuralConflict;
  if (state.scores.overall >= 65) return config.verdict.postMortemTemplates.survived;
  return config.verdict.postMortemTemplates.verificationGap;
}

export default function VerdictScreen({ config, state, dispatch }: VerdictScreenProps) {
  const { theme } = config;
  const board = getBoardRecommendation(state.scores, config);
  const groupB = getGroupBAssessment(state.scores, config);
  const postMortem = getPostMortem(state, config);

  const boardColor =
    board.color === "terminal"
      ? theme.terminal
      : board.color === "degraded"
      ? theme.statusColors.degraded
      : theme.danger;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Title */}
        <div className="text-center space-y-1">
          <div
            className="font-mono text-[10px] uppercase tracking-[0.4em]"
            style={{ color: theme.textMuted }}
          >
            {config.roundLabel} {config.totalRounds} — Final Assessment
          </div>
          <h1
            className="font-mono text-2xl font-bold"
            style={{ color: theme.textBright }}
          >
            {config.title}
          </h1>
          <div className="font-mono text-sm" style={{ color: theme.textMuted }}>
            {config.setting.role} — {config.setting.organization}
          </div>
        </div>

        {/* Score summary */}
        <DualAccountability
          scores={state.scores}
          config={config.accountability}
          theme={theme}
        />

        {/* Board verdict */}
        <div
          className="rounded border-2 p-5 space-y-2"
          style={{ borderColor: boardColor, backgroundColor: theme.bgCard }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-wider"
            style={{ color: theme.textMuted }}
          >
            {config.verdict.groupAAssessment.header}
          </div>
          <div className="font-mono text-base font-bold" style={{ color: boardColor }}>
            {board.label}
          </div>
        </div>

        {/* Group B verdict */}
        <div
          className="rounded border p-4 space-y-1"
          style={{
            borderColor: groupB.positive ? theme.terminal : theme.danger,
            backgroundColor: theme.bgCard,
          }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-wider"
            style={{ color: theme.textMuted }}
          >
            {config.verdict.groupBAssessment.header}
          </div>
          <div
            className="font-mono text-sm font-bold"
            style={{ color: groupB.positive ? theme.terminal : theme.danger }}
          >
            {groupB.label}
          </div>
        </div>

        {/* Post-mortem */}
        <div
          className="rounded border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.bgCard }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-wider mb-2"
            style={{ color: theme.textMuted }}
          >
            Post-Mortem Analysis
          </div>
          <p className="font-mono text-sm leading-relaxed" style={{ color: theme.text }}>
            {postMortem}
          </p>
        </div>

        {/* Promise final status */}
        <div
          className="rounded border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.bgCard }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-wider mb-3"
            style={{ color: theme.textMuted }}
          >
            Final Promise Status
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {state.promises.map((p) => {
              const statusColor = theme.statusColors[p.currentStatus] ?? theme.textMuted;
              return (
                <div
                  key={p.id}
                  className="rounded border p-2 text-center"
                  style={{ borderColor: statusColor, backgroundColor: `${statusColor}15` }}
                >
                  <div className="font-mono text-xs font-bold" style={{ color: theme.textBright }}>
                    {p.id}
                  </div>
                  <div className="font-mono text-[10px]" style={{ color: statusColor }}>
                    {p.currentStatus.toUpperCase()}
                  </div>
                  <div className="font-mono text-[10px]" style={{ color: theme.textMuted }}>
                    {Math.round(p.currentProgress)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => dispatch({ type: "VIEW_CTA" })}
            className="flex-1 rounded border-2 py-3 font-mono text-sm font-bold uppercase tracking-widest transition-all hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              borderColor: theme.accent,
              color: theme.bg,
              backgroundColor: theme.accent,
            }}
          >
            What This Means →
          </button>
          <button
            onClick={() => dispatch({ type: "RESTART" })}
            className="flex-1 rounded border py-3 font-mono text-sm font-bold uppercase tracking-widest transition-all hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ borderColor: theme.border, color: theme.textMuted }}
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
