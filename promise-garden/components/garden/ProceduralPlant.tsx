"use client";

/**
 * ProceduralPlant — a single plant canvas component.
 *
 * Renders a 32×32 pixel art plant from PlantConfig data, then scales it up
 * with CSS `image-rendering: pixelated` to maintain the crisp pixel aesthetic.
 *
 * Display size:
 *   - short duration: 64px base (×0.8 low stakes, ×1.2 high stakes)
 *   - medium duration: 96px base
 *   - long duration: 128px base
 *
 * Each plant is an individual <canvas> element for DOM-level accessibility
 * and click handling. The pixel rendering is memoized — the canvas only
 * redraws when config or time changes.
 */

import { useRef, useEffect, useCallback } from "react";
import type { PlantState } from "@/lib/types/garden";
import type { PersonalPromise } from "@/lib/types/personal";
import { generatePlantPixels } from "@/lib/garden/renderer/plantGenerator";
import { generateGroundCover } from "@/lib/garden/renderer/groundCover";
import type { PlantConfig } from "@/lib/garden/renderer/plantGenerator";

interface ProceduralPlantProps {
  plant: PlantState;
  promise: PersonalPromise;
  time: number;
  onClick: () => void;
  selected: boolean;
}

const PIXEL_SIZE = 32; // Native canvas resolution

/** Display size in CSS pixels for each duration tier. */
const BASE_DISPLAY_SIZE: Record<string, number> = {
  short: 64,
  medium: 96,
  long: 128,
};

/** Stakes size multiplier. */
const STAKES_MOD: Record<string, number> = {
  low: 0.8,
  medium: 1.0,
  high: 1.2,
};

/** Convert a PlantState + PersonalPromise into a PlantConfig for the renderer. */
function toPlantConfig(
  plant: PlantState,
  promise: PersonalPromise,
  stumpConfig?: PlantConfig
): PlantConfig {
  return {
    ...plant,
    body: promise.body,
    stumpConfig,
  };
}

export default function ProceduralPlant({
  plant,
  promise,
  time,
  onClick,
  selected,
}: ProceduralPlantProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compute display size
  const baseSize = BASE_DISPLAY_SIZE[plant.durationTier] ?? 96;
  const mod = STAKES_MOD[plant.stakesTier] ?? 1.0;
  const displaySize = Math.round(baseSize * mod);

  // Determine which generator to use
  const isGroundCover =
    plant.stakesTier === "low" && plant.durationTier === "short";

  // Draw to canvas whenever config or time changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ensure native resolution
    canvas.width = PIXEL_SIZE;
    canvas.height = PIXEL_SIZE;

    const config = toPlantConfig(plant, promise);
    let imageData: ImageData;

    if (isGroundCover) {
      imageData = generateGroundCover(config, time, PIXEL_SIZE);
    } else {
      // generatePlantPixels handles all stages including "reclaimed"
      // via domain-specific rendering. generateReclaimedPlant (nurse-log visual)
      // requires both configs which must be wired via parent when available.
      imageData = generatePlantPixels(config, time, PIXEL_SIZE);
    }

    ctx.putImageData(imageData, 0, 0);
  }, [plant, promise, time, isGroundCover]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  // Descriptive label for accessibility
  const stageLabel =
    plant.growthStage.charAt(0).toUpperCase() + plant.growthStage.slice(1);
  const progressPct = Math.round(plant.growthProgress * 100);
  const streakText =
    plant.consecutiveKept >= 3 ? ` ${plant.consecutiveKept}-day streak.` : "";
  const stressText =
    plant.stressLevel > 0.1
      ? ` Stress: ${Math.round(plant.stressLevel * 100)}%.`
      : "";
  const ariaLabel = `${plant.domain} promise: ${promise.body}. Stage: ${stageLabel}. ${progressPct}% grown.${stressText}${streakText}`;

  return (
    <canvas
      ref={canvasRef}
      width={PIXEL_SIZE}
      height={PIXEL_SIZE}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-pressed={selected}
      style={{
        width: displaySize,
        height: displaySize,
        imageRendering: "pixelated",
        cursor: "pointer",
        outline: selected ? "2px solid #faf9f6" : "none",
        outlineOffset: 2,
        transition: "transform 0.2s ease",
        transform: selected ? "scale(1.1)" : "scale(1)",
        flexShrink: 0,
      }}
      className="focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-sm"
    />
  );
}
