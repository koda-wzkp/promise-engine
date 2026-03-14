"use client";

import { Fragment } from "react";
import { ScenarioConfig, GameState, GameAction } from "../../../lib/games/types";
import BudgetAllocator from "./BudgetAllocator";
import DualAccountability from "./DualAccountability";
import PromiseGraph from "./PromiseGraph";
import PromiseCard from "./PromiseCard";

interface RoundConsoleProps {
  config: ScenarioConfig;
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export default function RoundConsole({ config, state, dispatch }: RoundConsoleProps) {
  const { theme } = config;
  const totalAllocated = Object.values(state.allocations).reduce((s, v) => s + v, 0);
  const canConfirm = totalAllocated <= state.budget;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 border-b px-4 py-2 flex items-center justify-between"
        style={{ borderColor: theme.border, backgroundColor: theme.bg }}
      >
        <div className="font-mono text-xs uppercase tracking-widest" style={{ color: theme.textMuted }}>
          {config.roundLabel} {state.currentRound} of {config.totalRounds}
        </div>
        <div className="font-mono text-xs" style={{ color: theme.accent }}>
          {config.setting.unitLabel}{state.budget.toFixed(1)}{config.setting.unitScale} available
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: allocations */}
        <div className="lg:col-span-2 space-y-4">
          <div
            className="rounded border p-4"
            style={{ borderColor: theme.border, backgroundColor: theme.bgLight }}
          >
            <div
              className="font-mono text-xs uppercase tracking-wider mb-3"
              style={{ color: theme.textMuted }}
            >
              Budget Allocation — {config.roundLabel} {state.currentRound}
            </div>
            <BudgetAllocator
              promises={state.promises}
              allocations={state.allocations}
              totalBudget={state.budget}
              config={config}
              onAllocate={(id, amt) =>
                dispatch({ type: "SET_ALLOCATION", promiseId: id, amount: amt })
              }
            />
          </div>

          {/* Promise graph */}
          {config.dependencies.length > 0 && (
            <div
              className="rounded border p-4"
              style={{ borderColor: theme.border, backgroundColor: theme.bgLight }}
            >
              <div
                className="font-mono text-xs uppercase tracking-wider mb-3"
                style={{ color: theme.textMuted }}
              >
                Dependency Network
              </div>
              <PromiseGraph
                promises={state.promises}
                dependencies={config.dependencies}
                theme={theme}
              />
            </div>
          )}

          {/* Confirm */}
          <button
            onClick={() => dispatch({ type: "CONFIRM_ALLOCATIONS" })}
            disabled={!canConfirm}
            className="w-full rounded border-2 py-3 font-mono text-sm font-bold uppercase tracking-widest transition-all hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              borderColor: canConfirm ? theme.accent : theme.border,
              color: canConfirm ? theme.bg : theme.textMuted,
              backgroundColor: canConfirm ? theme.accent : "transparent",
            }}
          >
            Commit Allocations → End {config.roundLabel}
          </button>
        </div>

        {/* Right: scores + promise status */}
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
              <Fragment key={p.id}>
                <PromiseCard
                  promise={p}
                  allPromises={state.promises}
                  theme={theme}
                  compact
                />
              </Fragment>
            ))}
          </div>

          {/* Revenue */}
          {Object.entries(state.revenueActive).some(([, v]) => v) && (
            <div
              className="rounded border p-3 space-y-1"
              style={{ borderColor: theme.terminal, backgroundColor: `${theme.terminal}10` }}
            >
              <div
                className="font-mono text-[10px] uppercase tracking-wider"
                style={{ color: theme.terminal }}
              >
                Active Revenue
              </div>
              {config.revenueTriggers.map((rt) =>
                state.revenueActive[rt.sourcePromiseId] ? (
                  <div
                    key={rt.sourcePromiseId}
                    className="font-mono text-[11px]"
                    style={{ color: theme.text }}
                  >
                    +{config.setting.unitLabel}{rt.revenuePerRound}{config.setting.unitScale}/round — {rt.label}
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
