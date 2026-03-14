"use client";

import { useEffect, useState } from "react";
import { ScenarioConfig } from "../../../lib/games/types";
import Link from "next/link";

interface TelevisionProps {
  selected: ScenarioConfig | null;
  isBooting: boolean;
}

type TvState = "static" | "boot" | "preview";

export default function Television({ selected, isBooting }: TelevisionProps) {
  const [tvState, setTvState] = useState<TvState>("static");
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!selected) {
      setTvState("static");
      return;
    }
    if (isBooting) {
      setTvState("boot");
      const timeout = setTimeout(() => setTvState("preview"), 1200);
      return () => clearTimeout(timeout);
    }
    setTvState("preview");
  }, [selected, isBooting]);

  useEffect(() => {
    if (tvState !== "boot") return;
    const interval = setInterval(() => {
      setDots((d: string) => (d.length >= 3 ? "" : d + "."));
    }, 300);
    return () => clearInterval(interval);
  }, [tvState]);

  const theme = selected?.theme;

  return (
    <div className="flex flex-col items-center">
      {/* TV outer shell */}
      <div
        className="relative"
        style={{
          width: 320,
          background: "#2d2d2d",
          borderRadius: "12px 12px 8px 8px",
          padding: "12px 12px 20px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Screen bezel */}
        <div
          style={{
            background: "#1a1a1a",
            borderRadius: 6,
            padding: 6,
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.8)",
          }}
        >
          {/* Screen */}
          <div
            style={{
              width: "100%",
              aspectRatio: "4/3",
              background: tvState === "static" ? "#111" : (theme?.bg ?? "#0a0e1a"),
              borderRadius: 4,
              overflow: "hidden",
              position: "relative",
            }}
            aria-live="polite"
            aria-label={
              tvState === "static"
                ? "TV screen showing static — select a cartridge"
                : tvState === "boot"
                ? `Loading ${selected?.title}`
                : `Preview: ${selected?.title}`
            }
          >
            {tvState === "static" && <StaticScreen />}
            {tvState === "boot" && <BootScreen dots={dots} theme={theme} />}
            {tvState === "preview" && selected && (
              <PreviewScreen config={selected} />
            )}

            {/* Scanline overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
              }}
            />
          </div>
        </div>

        {/* TV controls */}
        <div className="flex items-center justify-between mt-2 px-2">
          <div className="font-mono text-[8px] text-gray-500 tracking-widest uppercase">
            Promi-64
          </div>
          <div className="flex gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-600" />
            <div className="w-2 h-4 rounded-sm bg-gray-600" />
          </div>
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: tvState === "static" ? "#4b5563" : "#22c55e",
              boxShadow: tvState !== "static" ? "0 0 6px #22c55e" : undefined,
            }}
          />
        </div>
      </div>

      {/* TV stand */}
      <div
        style={{
          width: 60,
          height: 12,
          background: "#3a3a3a",
          borderRadius: "0 0 4px 4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
        }}
      />
      <div
        style={{
          width: 100,
          height: 6,
          background: "#2a2a2a",
          borderRadius: 4,
          boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
        }}
      />
    </div>
  );
}

function StaticScreen() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
      {/* Noise pattern using CSS */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(45deg, #111 0%, #222 1%, #111 2%)",
          opacity: 0.8,
        }}
      />
      <div className="relative z-10 text-center space-y-1">
        <div className="font-mono text-xs text-gray-500">NO SIGNAL</div>
        <div className="font-mono text-[10px] text-gray-600">
          Insert cartridge to play
        </div>
      </div>
    </div>
  );
}

function BootScreen({
  dots,
  theme,
}: {
  dots: string;
  theme?: ScenarioConfig["theme"];
}) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-2 p-4"
      style={{ backgroundColor: theme?.bg ?? "#0a0e1a" }}
    >
      <div
        className="font-mono text-xs"
        style={{ color: theme?.terminal ?? "#00ff88" }}
      >
        PROMISE ENGINE v2.0
      </div>
      <div
        className="font-mono text-[10px]"
        style={{ color: theme?.textMuted ?? "#6b7280" }}
      >
        Loading{dots}
      </div>
      <div
        className="w-24 h-0.5 rounded-full overflow-hidden"
        style={{ backgroundColor: theme?.border ?? "#2d3748" }}
      >
        <div
          className="h-full rounded-full animate-pulse"
          style={{ width: "60%", backgroundColor: theme?.accent ?? "#f5a623" }}
        />
      </div>
    </div>
  );
}

function PreviewScreen({ config }: { config: ScenarioConfig }) {
  const { theme } = config;

  return (
    <div
      className="w-full h-full flex flex-col p-3 gap-2"
      style={{ backgroundColor: theme.bg }}
    >
      <div
        className="font-mono text-[9px] uppercase tracking-widest"
        style={{ color: theme.textMuted }}
      >
        {config.setting.location}
      </div>
      <div
        className="font-mono text-sm font-bold leading-tight"
        style={{ color: theme.accent }}
      >
        {config.title.replace("Promise Governor: ", "")}
      </div>
      <div
        className="font-mono text-[9px] leading-relaxed"
        style={{ color: theme.textMuted }}
      >
        {config.tagline}
      </div>
      <div className="flex gap-1 flex-wrap mt-auto">
        {[
          config.difficulty.toUpperCase(),
          config.primaryLesson.toUpperCase(),
          `~${config.estimatedMinutes}M`,
        ].map((tag) => (
          <span
            key={tag}
            className="font-mono text-[8px] px-1 rounded"
            style={{
              color: theme.accent,
              border: `1px solid ${theme.accent}44`,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
      <Link
        href={`/games/${config.id}`}
        className="mt-1 text-center font-mono text-[10px] font-bold uppercase tracking-wider rounded py-1 transition-opacity hover:opacity-80"
        style={{ backgroundColor: theme.accent, color: theme.bg }}
      >
        PLAY →
      </Link>
    </div>
  );
}
