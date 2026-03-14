"use client";

import Link from "next/link";
import { ScenarioConfig, GameState, GameAction } from "../../../lib/games/types";

interface CTAScreenProps {
  config: ScenarioConfig;
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export default function CTAScreen({ config, state: _state, dispatch }: CTAScreenProps) {
  const { theme, cta } = config;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      <div className="w-full max-w-xl space-y-6">
        {/* Fictional close */}
        <div
          className="rounded border p-4 text-center"
          style={{ borderColor: theme.border, backgroundColor: theme.bgCard }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-widest mb-1"
            style={{ color: theme.textMuted }}
          >
            System Log
          </div>
          <p className="font-mono text-sm" style={{ color: theme.terminal }}>
            {cta.fictionalLine}
          </p>
        </div>

        {/* Real line */}
        <div className="text-center space-y-3">
          <h2
            className="font-mono text-xl font-bold"
            style={{ color: theme.textBright }}
          >
            {cta.realLine}
          </h2>
          <p
            className="font-mono text-sm leading-relaxed"
            style={{ color: theme.textMuted }}
          >
            {cta.bridgeText}
          </p>
        </div>

        {/* Primary CTA */}
        <Link
          href={cta.primaryCTA.href}
          className="block w-full rounded border-2 py-3 text-center font-mono text-sm font-bold uppercase tracking-widest transition-all hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            borderColor: theme.accent,
            color: theme.bg,
            backgroundColor: theme.accent,
          }}
        >
          {cta.primaryCTA.label}
        </Link>

        {/* Secondary CTAs */}
        {cta.secondaryCTAs.length > 0 && (
          <div className="space-y-2">
            <div
              className="font-mono text-[10px] uppercase tracking-wider text-center"
              style={{ color: theme.textMuted }}
            >
              More scenarios
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {cta.secondaryCTAs.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="rounded border px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ borderColor: theme.border, color: theme.textMuted }}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Play again */}
        <div className="text-center">
          <button
            onClick={() => dispatch({ type: "RESTART" })}
            className="font-mono text-xs underline transition-opacity hover:opacity-70"
            style={{ color: theme.textMuted }}
          >
            Play again
          </button>
        </div>
      </div>
    </div>
  );
}
