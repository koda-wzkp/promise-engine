"use client";

import { useState, useCallback } from "react";

interface SeasonalTimelapseProps {
  startDate: string; // ISO date
  endDate: string; // ISO date
  currentDate: string;
  onDateChange: (date: string) => void;
  onPlay?: () => void;
  onPause?: () => void;
  isPlaying?: boolean;
}

export default function SeasonalTimelapse({
  startDate,
  endDate,
  currentDate,
  onDateChange,
  onPlay,
  onPause,
  isPlaying = false,
}: SeasonalTimelapseProps) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const current = new Date(currentDate).getTime();
  const total = end - start;
  const progress = total > 0 ? ((current - start) / total) * 100 : 0;

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const pct = Number(e.target.value) / 100;
    const timestamp = start + pct * total;
    const date = new Date(timestamp).toISOString().slice(0, 10);
    onDateChange(date);
  }

  const formatLabel = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en", { month: "short", day: "numeric" });
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-3 safe-bottom">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-garden-green text-white text-sm"
            aria-label={isPlaying ? "Pause time-lapse" : "Play time-lapse"}
          >
            {isPlaying ? "||" : "\u25B6"}
          </button>

          <span className="text-xs text-[var(--text-muted)] w-12">
            {formatLabel(startDate)}
          </span>

          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={handleSliderChange}
            className="flex-1 h-1 rounded-full accent-garden-green"
            aria-label="Time-lapse scrubber"
          />

          <span className="text-xs text-[var(--text-muted)] w-12 text-right">
            {formatLabel(endDate)}
          </span>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-1">
          {formatLabel(currentDate)}
        </p>
      </div>
    </div>
  );
}
