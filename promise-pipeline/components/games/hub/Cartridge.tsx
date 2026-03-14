"use client";

import { ScenarioConfig } from "../../../lib/games/types";

interface CartridgeProps {
  config: ScenarioConfig;
  isSelected: boolean;
  onClick: () => void;
}

const CARTRIDGE_COLORS: Record<string, { body: string; label: string }> = {
  "mars-colony": { body: "#c2410c", label: "#fed7aa" },
  "deep-sea": { body: "#0e7490", label: "#a5f3fc" },
  "supply-station": { body: "#374151", label: "#e5e7eb" },
};

export default function Cartridge({ config, isSelected, onClick }: CartridgeProps) {
  const colors = CARTRIDGE_COLORS[config.id] ?? { body: "#4b5563", label: "#f3f4f6" };
  const difficulty = config.difficulty;

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-400 rounded"
      aria-pressed={isSelected}
      aria-label={`${config.title}. ${config.difficulty} difficulty. ~${config.estimatedMinutes} minutes. Press to select.`}
    >
      {/* Cartridge body */}
      <div
        className="relative w-16 h-20 rounded-t-sm rounded-b-lg border-2 transition-transform duration-200 group-hover:-translate-y-2"
        style={{
          backgroundColor: colors.body,
          borderColor: isSelected ? "#f5a623" : "transparent",
          transform: isSelected ? "translateY(-8px)" : undefined,
        }}
      >
        {/* Top notch */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-2 rounded-b-sm"
          style={{ backgroundColor: "#1a1a1a" }}
        />
        {/* Label area */}
        <div
          className="absolute top-3 left-1 right-1 bottom-3 rounded-sm flex flex-col items-center justify-center p-1"
          style={{ backgroundColor: colors.label }}
        >
          <span
            className="font-mono text-[8px] font-bold uppercase text-center leading-tight"
            style={{ color: colors.body }}
          >
            {config.setting.location.split(",")[0]}
          </span>
          <div
            className="w-full h-px my-0.5"
            style={{ backgroundColor: `${colors.body}44` }}
          />
          <span
            className="font-mono text-[7px] uppercase text-center leading-tight"
            style={{ color: `${colors.body}bb` }}
          >
            {difficulty}
          </span>
        </div>
        {/* Bottom pins */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-evenly px-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-2 rounded-b-sm"
              style={{ backgroundColor: "#c0a060" }}
            />
          ))}
        </div>
      </div>

      {/* Label below */}
      <div className="text-center">
        <div
          className="font-mono text-[10px] font-bold"
          style={{
            color: isSelected ? "#f5a623" : "#9ca3af",
          }}
        >
          {config.id.toUpperCase()}
        </div>
        <div className="font-mono text-[9px]" style={{ color: "#6b7280" }}>
          ~{config.estimatedMinutes}m
        </div>
      </div>
    </button>
  );
}
