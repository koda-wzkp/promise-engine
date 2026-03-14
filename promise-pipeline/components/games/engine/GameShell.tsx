"use client";

import { useReducer } from "react";
import { ScenarioConfig, GameState, GameAction } from "../../../lib/games/types";
import {
  createInitialState,
  resolveRound,
  advanceToNextRound,
} from "../../../lib/games/engine";
import BriefingScreen from "./BriefingScreen";
import RoundConsole from "./RoundConsole";
import RoundClose from "./RoundClose";
import VerdictScreen from "./VerdictScreen";
import CTAScreen from "./CTAScreen";

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME": {
      const nextEvents = (state as unknown as { config: ScenarioConfig }).config?.events.filter(
        (e) => e.round === 1
      ) ?? [];
      return {
        ...state,
        phase: "round",
        currentRound: 1,
        currentEvents: nextEvents,
        firedEvents: nextEvents.map((e) => e.id),
      };
    }
    case "SET_ALLOCATION": {
      return {
        ...state,
        allocations: {
          ...state.allocations,
          [action.promiseId]: Math.max(0, action.amount),
        },
      };
    }
    case "CONFIRM_ALLOCATIONS":
    case "DISMISS_TEACHING_MOMENT":
    case "ADVANCE_TO_ROUND":
    case "VIEW_CTA":
    case "RESTART":
      // Handled by the hook below
      return state;
    default:
      return state;
  }
}

export default function GameShell({ config }: { config: ScenarioConfig }) {
  const [state, dispatch] = useReducer(
    (state: GameState, action: GameAction): GameState => {
      switch (action.type) {
        case "START_GAME": {
          const round1Events = config.events.filter((e) => e.round === 1);
          return {
            ...state,
            phase: "round",
            currentRound: 1,
            currentEvents: round1Events,
            firedEvents: round1Events.map((e) => e.id),
          };
        }
        case "SET_ALLOCATION": {
          return {
            ...state,
            allocations: {
              ...state.allocations,
              [action.promiseId]: Math.max(0, action.amount),
            },
          };
        }
        case "CONFIRM_ALLOCATIONS": {
          const { newState } = resolveRound(state, config);
          return newState;
        }
        case "DISMISS_TEACHING_MOMENT": {
          return {
            ...state,
            pendingTeachingMoments: [],
          };
        }
        case "ADVANCE_TO_ROUND": {
          if (state.gameOver || state.currentRound >= config.totalRounds) {
            return { ...state, phase: "verdict" };
          }
          return advanceToNextRound(state, config);
        }
        case "VIEW_CTA": {
          return { ...state, phase: "cta" };
        }
        case "RESTART": {
          return createInitialState(config);
        }
        default:
          return state;
      }
    },
    config,
    createInitialState
  );

  switch (state.phase) {
    case "briefing":
      return (
        <BriefingScreen
          config={config}
          state={state}
          onStart={() => dispatch({ type: "START_GAME" })}
        />
      );
    case "round":
      return (
        <RoundConsole config={config} state={state} dispatch={dispatch} />
      );
    case "round-close":
      return (
        <RoundClose config={config} state={state} dispatch={dispatch} />
      );
    case "verdict":
      return (
        <VerdictScreen config={config} state={state} dispatch={dispatch} />
      );
    case "cta":
      return (
        <CTAScreen config={config} state={state} dispatch={dispatch} />
      );
    default:
      return null;
  }
}
