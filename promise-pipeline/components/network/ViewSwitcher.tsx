"use client";

import { useCallback, useRef } from "react";
import { Waves, TreePine, Layers } from "lucide-react";

export type GraphView = "watershed" | "canopy" | "strata";

interface ViewSwitcherProps {
  active: GraphView;
  onChange: (view: GraphView) => void;
}

const VIEWS: { key: GraphView; label: string; Icon: typeof Waves }[] = [
  { key: "watershed", label: "Watershed view", Icon: Waves },
  { key: "canopy", label: "Canopy view", Icon: TreePine },
  { key: "strata", label: "Strata view", Icon: Layers },
];

export default function ViewSwitcher({ active, onChange }: ViewSwitcherProps) {
  const groupRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = VIEWS.findIndex((v) => v.key === active);
      let next = idx;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        next = (idx + 1) % VIEWS.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        next = (idx - 1 + VIEWS.length) % VIEWS.length;
      } else {
        return;
      }
      onChange(VIEWS[next].key);
      // Focus the newly active button
      const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>("[role=radio]");
      buttons?.[next]?.focus();
    },
    [active, onChange],
  );

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Visualization style"
      className="inline-flex items-center gap-0.5 rounded-full border border-gray-200 bg-white/80 p-1 shadow-sm backdrop-blur-sm"
      onKeyDown={handleKeyDown}
    >
      {VIEWS.map((v) => {
        const isActive = active === v.key;
        return (
          <button
            key={v.key}
            role="radio"
            aria-checked={isActive}
            aria-label={v.label}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(v.key)}
            className={`rounded-full p-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
              isActive
                ? "bg-[#1a1a2e] text-white"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <v.Icon size={16} strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
}
