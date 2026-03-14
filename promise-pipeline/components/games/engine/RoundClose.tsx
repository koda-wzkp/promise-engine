"use client";

import { useEffect, useState } from "react";
import {
  ScenarioConfig,
  GameState,
  GameAction,
  CascadeEvent,
} from "../../../lib/games/types";
import EventAlert from "./EventAlert";
import CascadeAlert from "./CascadeAlert";
import DualAccountability from "./DualAccountability";
import PromiseCard from "./PromiseCard";

interface RoundCloseProps {
  config: ScenarioConfig;
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export default function RoundClose({ config, state, dispatch }: RoundCloseProps) {
  const { theme } = config;
  const [visibleCascades, setVisibleCascades] = useState<CascadeEvent[]>([]);
  const [teachingIdx, setTeachingIdx] = useState(0);
  const [showTeaching, setShowTeaching] = useState(false);

  const pendingMoment =
    state.pendingTeachingMoments.length > 0
      ? state.pendingTeachingMoments[teachingIdx] ?? null
      : null;

  useEffect(() => {
    if (state.cascadeLog.length > 0) {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setVisibleCascades(state.cascadeLog.slice(0, i));
        if (i >= state.cascadeLog.length) {
          clearInterval(interval);
          if (state.pendingTeachingMoments.length > 0) {
            setTimeout(() => setShowTeaching(true), 400);
          }
        }
      }, 350);
      return () => clearInterval(interval);
    } else if (state.pendingTeachingMoments.length > 0) {
      setShowTeaching(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleDismissTeaching() {
    if (teachingIdx + 1 < state.pendingTeachingMoments.length) {
      setTeachingIdx((i) => i + 1);
    } else {
      setShowTeaching(false);
      dispatch({ type: "DISMISS_TEACHING_MOMENT" });
    }
  }

  const lastHistory = state.roundHistory[state.roundHistory.length - 1];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      {/* Teaching moment overlay */}
      {showTeaching && pendingMoment && (
        <CascadeAlert
          cascades={[]}
          teachingMoment={pendingMoment}
          theme={theme}
          onDismiss={handleDismissTeaching}
        />
      )}

      {/* Header */}
      <div
        className="border-b px-4 py-3 flex items-center justify-between"
        style={{ borderColor: theme.border }}
      >
        <div className="font-mono text-xs uppercase tracking-widest" style={{ color: theme.textMuted }}>
          {config.roundLabel} {state.currentRound - 1} — Results
        </div>
        <div className="font-mono text-xs" style={{ color: theme.accent }}>
          {config.title}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: events + cascades */}
        <div className="lg:col-span-2 space-y-4">
          {/* Events */}
          {state.currentEvents.length > 0 && (
            <div
              className="rounded border p-4"
              style={{ borderColor: theme.border, backgroundColor: theme.bgLight }}
            >
              <div
                className="font-mono text-[10px] uppercase tracking-wider mb-3"
                style={{ color: theme.textMuted }}
              >
                Events This Round
              </div>
              <EventAlert events={state.currentEvents} theme={theme} />
            </div>
          )}

          {/* Cascades */}
          {visibleCascades.length > 0 && (
            <div
              className="rounded border p-4"
              style={{ borderColor: theme.danger, backgroundColor: theme.bgLight }}
            >
              <div
                className="font-mono text-[10px] uppercase tracking-wider mb-3"
                style={{ color: theme.danger }}
              >
                Cascade Failures
              </div>
              <div className="space-y-1.5">
                {visibleCascades.map((c, i) => (
                  <div
                    key={i}
                    className="font-mono text-xs flex items-center gap-2"
                    style={{ color: theme.text }}
                  >
                    <span style={{ paddingLeft: `${(c.depth - 1) * 12}px`, color: theme.textMuted }}>
                      depth {c.depth}
                    </span>
                    <span>{c.sourcePromiseId}</span>
                    <span style={{ color: theme.danger }}>→</span>
                    <span>{c.affectedPromiseId}</span>
                    <span className="ml-auto" style={{ color: theme.danger }}>
                      -{c.penalty.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="font-mono text-[10px] mt-3" style={{ color: theme.textMuted }}>
                {visibleCascades[0]?.explanation}
              </p>
            </div>
          )}

          {/* Budget delta */}
          {lastHistory && (
            <div
              className="rounded border p-4"
              style={{ borderColor: theme.border, backgroundColor: theme.bgLight }}
            >
              <div
                className="font-mono text-[10px] uppercase tracking-wider mb-2"
                style={{ color: theme.textMuted }}
              >
                Budget Summary
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-sm">
                {[
                  ["Start", lastHistory.budgetStart.toFixed(1)],
                  ["Spent", (lastHistory.budgetStart - lastHistory.budgetEnd).toFixed(1)],
                  ["End", lastHistory.budgetEnd.toFixed(1)],
                ].map(([label, val]) => (
                  <div key={label} className="text-center">
                    <div style={{ color: theme.textMuted }} className="text-[10px]">
                      {label}
                    </div>
                    <div style={{ color: theme.accent }} className="font-bold">
                      {config.setting.unitLabel}{val}{config.setting.unitScale}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game over */}
          {state.gameOver && (
            <div
              className="rounded border-2 p-4 text-center"
              style={{ borderColor: theme.danger, backgroundColor: `${theme.danger}15` }}
              role="alert"
            >
              <div className="font-mono text-lg font-bold" style={{ color: theme.danger }}>
                GAME OVER
              </div>
              <p className="font-mono text-sm mt-1" style={{ color: theme.text }}>
                {state.gameOverReason}
              </p>
            </div>
          )}

          {/* Next round button */}
          <button
            onClick={() => dispatch({ type: "ADVANCE_TO_ROUND" })}
            className="w-full rounded border-2 py-3 font-mono text-sm font-bold uppercase tracking-widest transition-all hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              borderColor: theme.accent,
              color: state.gameOver || state.currentRound > config.totalRounds ? theme.bg : theme.bg,
              backgroundColor: theme.accent,
            }}
          >
            {state.gameOver || state.currentRound > config.totalRounds
              ? "View Final Verdict →"
              : `Begin ${config.roundLabel} ${state.currentRound} →`}
          </button>
        </div>

        {/* Right: scores + promises */}
        <div className="space-y-4">
          <DualAccountability
            scores={state.scores}
            config={config.accountability}
            theme={theme}
          />
          <div
            className="rounded border p-3 space-y-2"
            style={{ borderColor: theme.border, backgroundColor: theme.bgLight }}
          >
            <div
              className="font-mono text-[10px] uppercase tracking-wider"
              style={{ color: theme.textMuted }}
            >
              Promise Status
            </div>
            {state.promises.map((p) => (
              <PromiseCard
                key={p.id}
                promise={p}
                allPromises={state.promises}
                theme={theme}
                compact
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
