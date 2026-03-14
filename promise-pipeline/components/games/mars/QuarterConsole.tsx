"use client";

import { useState } from "react";
import { MarsGameState, MarsGameAction } from "../../../lib/types/mars-game";
import BudgetAllocator from "./BudgetAllocator";
import ColonyIntegrityScore from "./ColonyIntegrityScore";
import EventAlert from "./EventAlert";
import MarsPromiseGraph from "./MarsPromiseGraph";
import CascadeAlert from "./CascadeAlert";

interface QuarterConsoleProps {
  state: MarsGameState;
  dispatch: (action: MarsGameAction) => void;
}

const QUARTER_LABELS: Record<number, string> = {
  1: "Sol 412–521",
  2: "Sol 522–631",
  3: "Sol 632–741",
  4: "Sol 742–851",
};

export default function QuarterConsole({
  state,
  dispatch,
}: QuarterConsoleProps) {
  const [showNetworkHealthTip, setShowNetworkHealthTip] = useState(
    state.quarter === 1 && !state.teachingMomentsSeen.has("network-health")
  );

  const totalAllocated = Object.values(state.allocations).reduce(
    (sum, v) => sum + v,
    0
  );
  const canConfirm = totalAllocated >= 0.1;

  const handleAllocate = (promiseId: string, amount: number) => {
    dispatch({ type: "SET_ALLOCATION", promiseId, amount });
  };

  const handleConfirm = () => {
    dispatch({ type: "CONFIRM_ALLOCATIONS" });
  };

  // Check structural conflict in real time
  const p4Allocation = state.allocations["P4"] ?? 0;
  const showConflictWarning = p4Allocation > 2.0;

  return (
    <>
      {showNetworkHealthTip && (
        <CascadeAlert
          type="network-health"
          onDismiss={() => setShowNetworkHealthTip(false)}
        />
      )}

      <main
        id="main-content"
        className="min-h-screen bg-[#0a0e1a] py-4 px-4"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 4px)",
        }}
      >
        <section
          className="mx-auto max-w-6xl"
          aria-labelledby="quarter-console-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 font-mono border-b border-[#2d3748] pb-3">
            <div>
              <h1
                id="quarter-console-title"
                className="text-sm font-bold text-[#f9fafb]"
              >
                ARES STATION — Q{state.quarter} OPERATIONS CONSOLE
              </h1>
              <div className="text-[10px] text-[#9ca3af]">
                {QUARTER_LABELS[state.quarter] ?? ""}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-[#f5a623]">
                ${state.budget.toFixed(1)}B
              </div>
              <div className="text-[10px] text-[#9ca3af]">Budget Available</div>
            </div>
          </div>

          {/* Events */}
          {state.currentEvents.length > 0 && (
            <div className="mb-4">
              <EventAlert events={state.currentEvents} />
            </div>
          )}

          {/* Main layout: sidebar + allocator */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left sidebar */}
            <div className="space-y-4">
              <ColonyIntegrityScore
                colonyIntegrity={state.colonyIntegrity}
                colonistTrust={state.colonistTrust}
                shareholderConfidence={state.shareholderConfidence}
              />
              <MarsPromiseGraph promises={state.promises} />
              <div className="font-mono text-[10px] text-[#9ca3af] border border-[#2d3748] rounded p-2 space-y-1">
                <div className="text-[#f5a623] uppercase tracking-wider mb-1">
                  Q{state.quarter} Status
                </div>
                <div>Quarter: {state.quarter} of 4</div>
                <div>
                  Mining revenue:{" "}
                  <span
                    className={
                      state.miningRevenueActive
                        ? "text-[#00ff88]"
                        : "text-[#9ca3af]"
                    }
                  >
                    {state.miningRevenueActive
                      ? "+$1.5B/quarter"
                      : "Not active (P4 < 60%)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Allocation panel */}
            <div className="lg:col-span-2 space-y-4">
              <div className="border border-[#2d3748] rounded bg-[#111827] p-4">
                <h2 className="font-mono text-xs font-bold text-[#f5a623] uppercase tracking-wider mb-4">
                  Budget Allocation — Q{state.quarter}
                </h2>

                {showConflictWarning && (
                  <div
                    className="mb-4 border border-[#ef4444] rounded p-3 font-mono text-xs text-[#ef4444]"
                    role="alert"
                  >
                    ⚠ STRUCTURAL CONFLICT: P4 at ${p4Allocation.toFixed(1)}B
                    exceeds $2.0B threshold — drawing from life support power
                    reserves. P1 will take a penalty on confirmation.
                  </div>
                )}

                <BudgetAllocator
                  promises={state.promises}
                  allocations={state.allocations}
                  totalBudget={state.budget}
                  onAllocate={handleAllocate}
                />
              </div>

              <button
                onClick={handleConfirm}
                disabled={!canConfirm}
                className="w-full font-mono text-sm font-bold text-[#0a0e1a] bg-[#f5a623] py-3 rounded hover:bg-[#c4841a] disabled:bg-[#2d3748] disabled:text-[#9ca3af] disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#f5a623] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a] transition-colors"
                aria-disabled={!canConfirm}
                aria-label={
                  canConfirm
                    ? `Confirm allocations: $${totalAllocated.toFixed(1)}B allocated`
                    : "Confirm allocations — allocate at least $0.1B to continue"
                }
              >
                {canConfirm
                  ? `CONFIRM ALLOCATIONS — $${totalAllocated.toFixed(1)}B →`
                  : "ALLOCATE FUNDS TO CONTINUE"}
              </button>

              <p className="font-mono text-[10px] text-[#64748b] text-center">
                Unallocated budget carries to the next quarter.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
