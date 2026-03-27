"use client";

import type { ContributionState } from "@/lib/types/phase3";

interface ContributionPlantProps {
  contribution: ContributionState;
  onClick: () => void;
}

/**
 * Visual indicator of contribution status in the garden.
 * A small "community plant" that grows with each batch sent.
 */
export function ContributionPlant({ contribution, onClick }: ContributionPlantProps) {
  if (!contribution.enabled) return null;

  const growth = Math.min(contribution.batchesSent, 12);
  const height = 20 + growth * 4; // 20px base, grows with batches

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center"
      aria-label={`Contribution: Level ${contribution.level}, ${contribution.batchesSent} batches sent`}
    >
      {/* Tiny plant visualization */}
      <div
        className="relative transition-all duration-500"
        style={{ height: `${height}px`, width: "24px" }}
      >
        {/* Stem */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-emerald-400 rounded-full transition-all"
          style={{ height: `${height - 8}px` }}
        />
        {/* Canopy/top */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 rounded-full transition-all ${
            contribution.level === "A" ? "bg-blue-400" : "bg-emerald-400"
          }`}
          style={{
            width: `${8 + growth}px`,
            height: `${8 + growth}px`,
          }}
        />
      </div>

      {/* Label */}
      <span className="text-[10px] text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Level {contribution.level} · {contribution.batchesSent} sent
      </span>
    </button>
  );
}
