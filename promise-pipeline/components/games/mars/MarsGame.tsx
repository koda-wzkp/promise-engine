"use client";

import { useReducer, useEffect } from "react";
import { MarsGameState } from "../../../lib/types/mars-game";
import { marsGameReducer, createInitialState } from "../../../lib/games/mars-engine";
import BriefingScreen from "./BriefingScreen";
import QuarterConsole from "./QuarterConsole";
import QuarterClose from "./QuarterClose";
import VerdictScreen from "./VerdictScreen";
import CTAScreen from "./CTAScreen";

// Serialize/deserialize Set for reducer state (Sets aren't cloneable by default)
function cloneState(state: MarsGameState): MarsGameState {
  return {
    ...state,
    teachingMomentsSeen: new Set(state.teachingMomentsSeen),
  };
}

// Wrapper that handles teachingMomentsSeen updates
function wrappedReducer(
  state: MarsGameState,
  action: Parameters<typeof marsGameReducer>[1]
): MarsGameState {
  const next = marsGameReducer(cloneState(state), action);

  // Auto-mark teaching moments as seen when we advance phases
  if (action.type === "CONFIRM_ALLOCATIONS") {
    const p3 = next.promises.find((p) => p.id === "P3");
    if (p3 && p3.progress < 50) {
      next.teachingMomentsSeen.add("cascade");
    }
    if (next.structuralConflictTriggered) {
      next.teachingMomentsSeen.add("structural-conflict");
    }
    const hasFlare = next.currentEvents.some((e) => e.id === "E6");
    if (hasFlare) {
      next.teachingMomentsSeen.add("verification-gap");
    }
  }
  if (action.type === "START_GAME") {
    next.teachingMomentsSeen.add("network-health");
  }

  return next;
}

export default function MarsGame() {
  const [state, dispatch] = useReducer(wrappedReducer, undefined, createInitialState);

  // Focus management: announce phase changes to screen readers
  useEffect(() => {
    const announcer = document.getElementById("phase-announcer");
    if (announcer) {
      const phaseMessages: Record<string, string> = {
        briefing: "Briefing screen. Read your mandate before starting.",
        quarter: `Quarter ${state.quarter} console. Allocate your budget.`,
        "quarter-close": `Quarter ${state.quarter} complete. Review results.`,
        verdict: "Term complete. View your assessment.",
        cta: "Learn about the real-world promise network.",
      };
      announcer.textContent = phaseMessages[state.phase] ?? "";
    }
  }, [state.phase, state.quarter]);

  return (
    <>
      {/* Screen reader announcer for phase changes */}
      <div
        id="phase-announcer"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      {state.phase === "briefing" && (
        <BriefingScreen
          promises={state.promises}
          onStart={() => dispatch({ type: "START_GAME" })}
        />
      )}

      {state.phase === "quarter" && (
        <QuarterConsole state={state} dispatch={dispatch} />
      )}

      {state.phase === "quarter-close" && (
        <QuarterClose state={state} dispatch={dispatch} />
      )}

      {state.phase === "verdict" && (
        <VerdictScreen state={state} dispatch={dispatch} />
      )}

      {state.phase === "cta" && (
        <CTAScreen dispatch={dispatch} />
      )}
    </>
  );
}
