"use client";

import { useState } from "react";
import { ScenarioConfig } from "../../../lib/games/types";
import Television from "./Television";
import CartridgeShelf from "./CartridgeShelf";
import Link from "next/link";

interface LivingRoomProps {
  scenarios: ScenarioConfig[];
}

export default function LivingRoom({ scenarios }: LivingRoomProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(false);

  const selected = scenarios.find((s) => s.id === selectedId) ?? null;

  function handleSelect(id: string) {
    if (id === selectedId) return;
    setSelectedId(id);
    setIsBooting(true);
    setTimeout(() => setIsBooting(false), 1400);
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(180deg, #1a0a00 0%, #0d0500 100%)",
        color: "#e5e7eb",
      }}
    >
      {/* Room header */}
      <div className="text-center pt-8 pb-4 px-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-amber-700/60 mb-1">
          PROMISE ENGINE
        </div>
        <h1 className="font-mono text-2xl font-bold text-amber-400 tracking-widest">
          PROMI-64
        </h1>
        <p className="font-mono text-xs text-gray-500 mt-1">
          Select a cartridge to begin
        </p>
      </div>

      {/* Main room layout */}
      <div className="flex-1 flex flex-col items-center gap-8 px-4 pb-8">

        {/* TV area */}
        <div className="flex justify-center">
          <Television selected={selected} isBooting={isBooting} />
        </div>

        {/* Shelf area */}
        <div className="w-full max-w-xl">
          <CartridgeShelf
            scenarios={scenarios}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>

        {/* Selected scenario info */}
        {selected && !isBooting && (
          <div className="w-full max-w-xl space-y-4">
            <div
              className="rounded border p-4 space-y-3"
              style={{
                borderColor: selected.theme.border,
                backgroundColor: `${selected.theme.bgCard}cc`,
              }}
            >
              <div>
                <div
                  className="font-mono text-[10px] uppercase tracking-wider mb-1"
                  style={{ color: selected.theme.textMuted }}
                >
                  {selected.setting.role} — {selected.setting.organization}
                </div>
                <h2
                  className="font-mono text-base font-bold"
                  style={{ color: selected.theme.textBright }}
                >
                  {selected.title}
                </h2>
                <p
                  className="font-mono text-xs leading-relaxed mt-1"
                  style={{ color: selected.theme.textMuted }}
                >
                  {selected.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                {[
                  ["Lesson", selected.primaryLesson],
                  ["Difficulty", selected.difficulty],
                  ["Duration", `~${selected.estimatedMinutes}m`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ color: selected.theme.textMuted }} className="text-[9px] uppercase">
                      {label}
                    </div>
                    <div style={{ color: selected.theme.accent }}>{value}</div>
                  </div>
                ))}
              </div>

              <Link
                href={`/games/${selected.id}`}
                className="block w-full text-center rounded border-2 py-2.5 font-mono text-sm font-bold uppercase tracking-widest transition-all hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  borderColor: selected.theme.accent,
                  color: selected.theme.bg,
                  backgroundColor: selected.theme.accent,
                }}
              >
                PLAY {selected.id.toUpperCase()} →
              </Link>
            </div>
          </div>
        )}

        {/* Fallback: plain list for accessibility / no-JS */}
        <noscript>
          <div className="w-full max-w-xl space-y-2">
            {scenarios.map((s) => (
              <Link
                key={s.id}
                href={`/games/${s.id}`}
                className="block rounded border p-3 font-mono text-sm hover:opacity-80"
                style={{ borderColor: s.theme.border, color: s.theme.text }}
              >
                {s.title} — {s.difficulty} — ~{s.estimatedMinutes}m
              </Link>
            ))}
          </div>
        </noscript>
      </div>

      {/* Floor */}
      <div
        className="h-3"
        style={{
          background: "linear-gradient(90deg, #1a0a00, #2d1500, #1a0a00)",
        }}
      />
    </div>
  );
}
