"use client";

import { useState, useEffect } from "react";
import { MarsGameState, MarsGameAction, CascadeEvent } from "../../../lib/types/mars-game";
import CascadeAlert from "./CascadeAlert";
import { computeStatus } from "../../../lib/games/mars-engine";

interface QuarterCloseProps {
  state: MarsGameState;
  dispatch: (action: MarsGameAction) => void;
}

const STATUS_COLORS: Record<string, string> = {
  verified: "#00ff88",
  declared: "#60a5fa",
  degraded: "#f59e0b",
  violated: "#ef4444",
  unverifiable: "#a78bfa",
};

export default function QuarterClose({ state, dispatch }: QuarterCloseProps) {
  const [visibleCascades, setVisibleCascades] = useState(0);
  const [showCascadeAlert, setShowCascadeAlert] = useState(false);
  const [showConflictAlert, setShowConflictAlert] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [alertsShown, setAlertsShown] = useState<Set<string>>(new Set());

  const currentSummary = state.quarterHistory[state.quarterHistory.length - 1];
  const prevSummary =
    state.quarterHistory.length > 1
      ? state.quarterHistory[state.quarterHistory.length - 2]
      : null;

  // Animate cascades in sequentially
  useEffect(() => {
    if (visibleCascades < state.cascadeLog.length) {
      const timer = setTimeout(() => {
        setVisibleCascades((v) => v + 1);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [visibleCascades, state.cascadeLog.length]);

  // Check for teaching moment triggers after cascades animate
  useEffect(() => {
    if (visibleCascades < state.cascadeLog.length) return;

    const p3 = state.promises.find((p) => p.id === "P3");
    if (
      p3 &&
      p3.progress < 50 &&
      !alertsShown.has("cascade") &&
      !state.teachingMomentsSeen.has("cascade")
    ) {
      setShowCascadeAlert(true);
      setAlertsShown((s) => new Set(s).add("cascade"));
      return;
    }

    if (
      state.structuralConflictTriggered &&
      !alertsShown.has("conflict") &&
      !state.teachingMomentsSeen.has("structural-conflict")
    ) {
      setShowConflictAlert(true);
      setAlertsShown((s) => new Set(s).add("conflict"));
      return;
    }

    const hasFlareEvent = state.currentEvents.some((e) => e.id === "E6");
    if (
      hasFlareEvent &&
      !alertsShown.has("verification") &&
      !state.teachingMomentsSeen.has("verification-gap")
    ) {
      setShowVerificationAlert(true);
      setAlertsShown((s) => new Set(s).add("verification"));
    }
  }, [visibleCascades, state, alertsShown]);

  const p7 = state.promises.find((p) => p.id === "P7");
  const p4Allocation = currentSummary?.allocations["P4"] ?? 0;

  return (
    <>
      {showCascadeAlert && (
        <CascadeAlert
          type="cascade"
          data={{ p3Progress: state.promises.find((p) => p.id === "P3")?.progress }}
          onDismiss={() => setShowCascadeAlert(false)}
        />
      )}
      {showConflictAlert && (
        <CascadeAlert
          type="structural-conflict"
          data={{
            p4Allocation,
            p1Penalty: Math.floor((p4Allocation - 2.0) * 8),
            conflictExplanation: state.structuralConflictExplanation,
          }}
          onDismiss={() => setShowConflictAlert(false)}
        />
      )}
      {showVerificationAlert && (
        <CascadeAlert
          type="verification-gap"
          data={{ p7Progress: p7?.progress ?? 0 }}
          onDismiss={() => setShowVerificationAlert(false)}
        />
      )}

      <main
        id="main-content"
        className="min-h-screen bg-[#0a0e1a] py-8 px-4"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 4px)",
        }}
      >
        <section
          className="mx-auto max-w-3xl"
          aria-labelledby="quarter-close-title"
          aria-live="polite"
        >
          {/* Header */}
          <div className="border border-[#2d3748] rounded p-4 mb-6 font-mono">
            <div className="text-[10px] text-[#9ca3af] uppercase tracking-wider mb-1">
              Transmission delay: 26m 14s — Earth received
            </div>
            <h1
              id="quarter-close-title"
              className="text-sm font-bold text-[#f9fafb]"
            >
              ARES STATION — Q{state.quarter} SUMMARY TRANSMISSION
            </h1>
          </div>

          {/* Budget */}
          {currentSummary && (
            <div className="border border-[#2d3748] rounded p-4 mb-4 font-mono text-sm">
              <h2 className="text-[10px] font-bold text-[#f5a623] uppercase tracking-wider mb-3">
                Budget
              </h2>
              <div className="space-y-1 text-[#9ca3af]">
                <div className="flex justify-between">
                  <span>Starting:</span>
                  <span className="text-[#e5e7eb]">
                    ${currentSummary.budgetStart.toFixed(1)}B
                  </span>
                </div>
                {currentSummary.events.length > 0 && (
                  <div className="flex justify-between">
                    <span>Events:</span>
                    <span
                      className={
                        currentSummary.events.reduce(
                          (sum, e) => sum + e.budgetImpact,
                          0
                        ) >= 0
                          ? "text-[#00ff88]"
                          : "text-[#ef4444]"
                      }
                    >
                      {currentSummary.events.reduce(
                        (sum, e) => sum + e.budgetImpact,
                        0
                      ) >= 0
                        ? "+"
                        : ""}
                      $
                      {currentSummary.events
                        .reduce((sum, e) => sum + e.budgetImpact, 0)
                        .toFixed(1)}
                      B
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Allocated:</span>
                  <span className="text-[#f5a623]">
                    -$
                    {Object.values(currentSummary.allocations)
                      .reduce((s, v) => s + v, 0)
                      .toFixed(1)}
                    B
                  </span>
                </div>
                {currentSummary.miningRevenue > 0 && (
                  <div className="flex justify-between">
                    <span>Mining revenue:</span>
                    <span className="text-[#00ff88]">
                      +${currentSummary.miningRevenue.toFixed(1)}B
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#2d3748] pt-1 mt-1">
                  <span>Remaining:</span>
                  <span className="text-[#e5e7eb] font-bold">
                    ${currentSummary.budgetEnd.toFixed(1)}B
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Promise status changes */}
          <div className="border border-[#2d3748] rounded p-4 mb-4 font-mono">
            <h2 className="text-[10px] font-bold text-[#f5a623] uppercase tracking-wider mb-3">
              Promise Status Changes
            </h2>
            <div className="space-y-2">
              {state.promises.map((promise) => {
                const prevSnapshot = prevSummary?.promiseSnapshots.find(
                  (s) => s.id === promise.id
                );
                const currentStatus = computeStatus(promise);
                const prevStatus = prevSnapshot?.status ?? "declared";
                const statusChanged = currentStatus !== prevStatus;

                return (
                  <div key={promise.id} className="flex items-center gap-2 text-xs">
                    <span className="text-[#9ca3af] w-4 shrink-0">
                      {promise.id}
                    </span>
                    <span className="text-[#e5e7eb] flex-1 truncate">
                      {promise.body.slice(0, 40)}…
                    </span>
                    {statusChanged ? (
                      <span className="shrink-0 flex items-center gap-1">
                        <span style={{ color: STATUS_COLORS[prevStatus] ?? "#9ca3af" }}>
                          {prevStatus}
                        </span>
                        <span className="text-[#9ca3af]">→</span>
                        <span style={{ color: STATUS_COLORS[currentStatus] ?? "#9ca3af" }}>
                          {currentStatus}
                        </span>
                      </span>
                    ) : (
                      <span
                        className="shrink-0 text-[10px]"
                        style={{ color: STATUS_COLORS[currentStatus] ?? "#9ca3af" }}
                      >
                        {currentStatus}
                      </span>
                    )}
                    <span className="text-[#9ca3af] shrink-0 w-10 text-right">
                      {Math.round(promise.progress)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cascades */}
          {state.cascadeLog.length > 0 && (
            <div
              className="border border-[#ef444466] rounded p-4 mb-4 font-mono"
              aria-live="polite"
              aria-label={`${state.cascadeLog.length} cascade events`}
            >
              <h2 className="text-[10px] font-bold text-[#ef4444] uppercase tracking-wider mb-3">
                Cascade Events ({state.cascadeLog.length})
              </h2>
              <div className="space-y-2">
                {state.cascadeLog
                  .slice(0, visibleCascades)
                  .map((cascade, i) => (
                    <CascadeEntry key={i} cascade={cascade} />
                  ))}
              </div>
            </div>
          )}

          {/* Structural conflict */}
          {state.structuralConflictTriggered && (
            <div className="border border-[#ef4444] rounded p-4 mb-4 font-mono text-xs">
              <h2 className="text-[10px] font-bold text-[#ef4444] uppercase tracking-wider mb-2">
                Structural Conflict Triggered
              </h2>
              <p className="text-[#e5e7eb] leading-relaxed">
                {state.structuralConflictExplanation}
              </p>
            </div>
          )}

          {/* Scores */}
          <div className="border border-[#2d3748] rounded p-4 mb-6 font-mono">
            <h2 className="text-[10px] font-bold text-[#f5a623] uppercase tracking-wider mb-3">
              Scores
            </h2>
            <ScoreLine
              label="Colony Integrity"
              current={state.colonyIntegrity}
              prev={prevSummary?.colonyIntegrity}
            />
            <ScoreLine
              label="Colonist Trust"
              current={state.colonistTrust}
              prev={prevSummary?.colonistTrust}
            />
            <ScoreLine
              label="Shareholder Confidence"
              current={state.shareholderConfidence}
              prev={prevSummary?.shareholderConfidence}
            />
          </div>

          {/* Game over message */}
          {state.gameOver && (
            <div
              className="border border-[#ef4444] rounded p-4 mb-6 font-mono text-[#ef4444]"
              role="alert"
            >
              <div className="font-bold text-sm mb-2">
                {state.gameOverReason === "mutiny"
                  ? "COLONY MUTINY — GOVERNANCE TERMINATED"
                  : "HELIOS CORP DEFUNDS COLONY — GOVERNANCE TERMINATED"}
              </div>
              <p className="text-xs text-[#e5e7eb]">
                {state.gameOverReason === "mutiny"
                  ? "Colonist Trust reached critical failure. The colony has voted to eject you from the station."
                  : "Shareholder Confidence reached critical failure. Helios Corp has recalled all funding and initiated evacuation."}
              </p>
            </div>
          )}

          <button
            onClick={() => dispatch({ type: "ADVANCE_TO_QUARTER" })}
            className="w-full font-mono text-sm font-bold text-[#0a0e1a] bg-[#f5a623] py-3 rounded hover:bg-[#c4841a] focus-visible:ring-2 focus-visible:ring-[#f5a623] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a] transition-colors"
          >
            {state.gameOver || state.quarter === 4
              ? "VIEW ASSESSMENT →"
              : `CONTINUE TO Q${(state.quarter + 1) as number} →`}
          </button>
        </section>
      </main>
    </>
  );
}

function CascadeEntry({ cascade }: { cascade: CascadeEvent }) {
  return (
    <div className="text-xs border-l-2 border-[#ef4444] pl-2">
      <div className="flex items-center gap-1 text-[#ef4444]">
        <span>{cascade.sourcePromiseId}</span>
        <span>→</span>
        <span>{cascade.affectedPromiseId}</span>
        <span className="text-[#9ca3af]">(depth {cascade.depth})</span>
      </div>
      <p className="text-[#9ca3af] mt-0.5">{cascade.explanation}</p>
    </div>
  );
}

function ScoreLine({
  label,
  current,
  prev,
}: {
  label: string;
  current: number;
  prev?: number;
}) {
  const color =
    current >= 60 ? "#00ff88" : current >= 30 ? "#f59e0b" : "#ef4444";
  const delta = prev !== undefined ? current - prev : null;

  return (
    <div className="flex items-center justify-between text-xs mb-2">
      <span className="text-[#9ca3af]">{label}:</span>
      <div className="flex items-center gap-2">
        {delta !== null && (
          <span
            className={delta >= 0 ? "text-[#00ff88]" : "text-[#ef4444]"}
          >
            {delta >= 0 ? "↑" : "↓"} {Math.abs(Math.round(delta))}
          </span>
        )}
        <span className="font-bold tabular-nums" style={{ color }}>
          {Math.round(current)}
        </span>
      </div>
    </div>
  );
}
