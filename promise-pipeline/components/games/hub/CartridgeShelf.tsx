"use client";

import { ScenarioConfig } from "../../../lib/games/types";
import Cartridge from "./Cartridge";

interface CartridgeShelfProps {
  scenarios: ScenarioConfig[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function CartridgeShelf({
  scenarios,
  selectedId,
  onSelect,
}: CartridgeShelfProps) {
  return (
    <div className="w-full">
      {/* Shelf plank */}
      <div
        className="relative flex items-end justify-center gap-6 pt-4 pb-1 px-6"
        role="listbox"
        aria-label="Game scenarios"
      >
        {scenarios.map((config) => (
          <div key={config.id} role="option" aria-selected={selectedId === config.id}>
            <Cartridge
              config={config}
              isSelected={selectedId === config.id}
              onClick={() => onSelect(config.id)}
            />
          </div>
        ))}
      </div>
      {/* Shelf wood */}
      <div
        className="h-3 rounded-sm mx-2"
        style={{
          background: "linear-gradient(to bottom, #92400e, #78350f)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
        }}
      />
      <div
        className="h-1 rounded-sm mx-4"
        style={{ backgroundColor: "#6b2d00", opacity: 0.6 }}
      />
    </div>
  );
}
