"use client";

/**
 * ProceduralPlant — renders a 32×32 pixel art plant on a canvas.
 *
 * Maps from promise-pipeline's PersonalPromise to the renderer's PlantConfig,
 * inferring growth stage and stress from promise status.
 */

import { useRef, useEffect, useCallback } from "react";
import { PersonalPromise } from "@/lib/types/personal";
import { PromiseStatus } from "@/lib/types/promise";
import { generatePlantPixels } from "@/lib/garden/renderer/plantGenerator";
import { generateGroundCover } from "@/lib/garden/renderer/groundCover";
import type { PlantConfig } from "@/lib/garden/renderer/plantGenerator";
import type {
  GrowthStage,
  DurationTier,
  StakesTier,
  PersonalDomain,
} from "@/lib/garden/types";

interface ProceduralPlantProps {
  promise: PersonalPromise;
  time: number;
  selected: boolean;
  onClick: () => void;
}

const PIXEL_SIZE = 32;

const BASE_DISPLAY_SIZE: Record<DurationTier, number> = {
  short: 64,
  medium: 96,
  long: 128,
};

const STAKES_MOD: Record<StakesTier, number> = {
  low: 0.8,
  medium: 1.0,
  high: 1.2,
};

const VALID_DOMAINS: Set<string> = new Set([
  "health",
  "work",
  "relationships",
  "creative",
  "financial",
]);

/** Map a promise status to a growth stage. */
function inferGrowthStage(status: PromiseStatus): GrowthStage {
  switch (status) {
    case "declared":
      return "growing";
    case "degraded":
      return "stressed";
    case "verified":
      return "mature";
    case "violated":
      return "dead";
    case "unverifiable":
      return "growing";
    default:
      return "seed";
  }
}

/** Map a promise status to a growth progress value (0–1). */
function inferGrowthProgress(status: PromiseStatus, progress?: number): number {
  if (progress != null) return progress / 100;
  switch (status) {
    case "declared":
      return 0.5;
    case "degraded":
      return 0.6;
    case "verified":
      return 1.0;
    case "violated":
      return 0.3;
    case "unverifiable":
      return 0.4;
    default:
      return 0.1;
  }
}

/** Map a promise status to a stress level (0–1). */
function inferStressLevel(status: PromiseStatus): number {
  switch (status) {
    case "degraded":
      return 0.5;
    case "violated":
      return 1.0;
    default:
      return 0;
  }
}

/** Build a PlantConfig from a PersonalPromise. */
function toPlantConfig(promise: PersonalPromise): PlantConfig {
  const domain: PersonalDomain = VALID_DOMAINS.has(promise.domain)
    ? (promise.domain as PersonalDomain)
    : "work";

  const durationTier: DurationTier = "medium";
  const stakesTier: StakesTier = "medium";
  const growthStage = inferGrowthStage(promise.status);
  const growthProgress = inferGrowthProgress(promise.status, promise.progress);
  const stressLevel = inferStressLevel(promise.status);

  return {
    promiseId: promise.id,
    domain,
    durationTier,
    stakesTier,
    growthStage,
    growthProgress,
    stressLevel,
    consecutiveKept: 0,
    consecutivePartials: 0,
    missedDays: 0,
    position: { x: 0, y: 0 },
    body: promise.body,
  };
}

export default function ProceduralPlant({
  promise,
  time,
  selected,
  onClick,
}: ProceduralPlantProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const config = toPlantConfig(promise);
  const durationTier = config.durationTier;
  const stakesTier = config.stakesTier;

  const baseSize = BASE_DISPLAY_SIZE[durationTier];
  const mod = STAKES_MOD[stakesTier];
  const displaySize = Math.round(baseSize * mod);

  const isGroundCover =
    stakesTier === "low" && durationTier === "short";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = PIXEL_SIZE;
    canvas.height = PIXEL_SIZE;

    const imageData = isGroundCover
      ? generateGroundCover(config, time, PIXEL_SIZE)
      : generatePlantPixels(config, time, PIXEL_SIZE);

    ctx.putImageData(imageData, 0, 0);
  }, [promise.id, promise.status, promise.progress, time, isGroundCover]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  const progressPct = Math.round(config.growthProgress * 100);
  const stageLabel =
    config.growthStage.charAt(0).toUpperCase() + config.growthStage.slice(1);
  const stressText =
    config.stressLevel > 0
      ? ` Stress: ${Math.round(config.stressLevel * 100)}%.`
      : "";
  const ariaLabel = `${config.domain} promise: ${promise.body}. Stage: ${stageLabel}. ${progressPct}% grown.${stressText}`;

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
        outline: selected ? "2px solid rgba(26, 95, 74, 0.8)" : "none",
        outlineOffset: 2,
        transition: "transform 0.2s ease",
        transform: selected ? "scale(1.1)" : "scale(1)",
      }}
      className="focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-sm"
    />
  );
}
