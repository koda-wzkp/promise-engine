"use client";

/**
 * GardenView — the full procedural pixel garden scene.
 *
 * Scene structure (vertical zones):
 *
 *   ┌─────────────────────────────────────────┐
 *   │             SKY (40%)                    │  ← gradient from reliability
 *   │  ✦                         ✦            │  ← ambient particles
 *   │                                          │
 *   │  🌲   🌿   🌸   🌳   🍄   🌲         │  ← plants on ground line
 *   ├─────────────────────────────────────────┤  ← GROUND LINE (grass strip)
 *   │           SOIL (30%)                     │
 *   │   ~~~~~~root~~~~~~~~~~~~~root~~~~~       │  ← root connections
 *   │        cascade particles travel here     │
 *   └─────────────────────────────────────────┘
 *
 * Architecture:
 *   - Individual <canvas> elements per plant (for accessible click handling)
 *   - Shared overlay <canvas> for roots + falling leaves + ambient particles
 *   - Sky background is CSS gradient (smooth CSS transition between scores)
 *   - Soil zone is a CSS div with gradient
 *   - Hidden DOM layer for screen readers
 */

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { PlantState, GardenState } from "@/lib/types/garden";
import type { PersonalPromise } from "@/lib/types/personal";
import type { CheckIn } from "@/lib/types/check-in";
import ProceduralPlant from "./ProceduralPlant";
import { getSkyGradient, updateAmbientParticles, spawnAmbientParticles } from "@/lib/garden/renderer/skyWeather";
import type { AmbientParticle } from "@/lib/garden/renderer/skyWeather";
import { drawRootSystem, spawnRootParticles, updateRootParticles } from "@/lib/garden/renderer/rootSystem";
import type { RootConnection, RootParticle } from "@/lib/garden/renderer/rootSystem";
import { spawnFallingLeaves, updateFallingLeaves } from "@/lib/garden/renderer/fallingLeaves";
import type { FallingLeaf } from "@/lib/garden/renderer/fallingLeaves";
import type { PlantConfig } from "@/lib/garden/renderer/plantGenerator";
import { domainMeta } from "@/lib/types/personal";

interface GardenViewProps {
  gardenState: GardenState;
  promises: PersonalPromise[];
  checkIns?: CheckIn[];
  onPlantSelect?: (plant: PlantState) => void;
  className?: string;
}

// ─── ROOT CONNECTION BUILDER ───

function buildRootConnections(
  plants: PlantState[],
  promises: PersonalPromise[],
  containerWidth: number,
  groundLineY: number
): RootConnection[] {
  const connections: RootConnection[] = [];
  const plantMap = new Map(plants.map((p) => [p.promiseId, p]));
  const promiseMap = new Map(promises.map((p) => [p.id, p]));

  for (const promise of promises) {
    if (!promise.depends_on?.length) continue;
    const fromPlant = plantMap.get(promise.id);
    if (!fromPlant) continue;

    for (const depId of promise.depends_on) {
      const toPlant = plantMap.get(depId);
      if (!toPlant) continue;

      const depPromise = promiseMap.get(depId);
      connections.push({
        fromPlantId: promise.id,
        toPlantId: depId,
        fromPosition: {
          x: getPlantScreenX(fromPlant, containerWidth),
          y: groundLineY,
        },
        toPosition: {
          x: getPlantScreenX(toPlant, containerWidth),
          y: groundLineY,
        },
        upstreamStatus: depPromise?.status ?? "declared",
      });
    }
  }

  return connections;
}

// Approximate screen X from isometric position — maps world X to screen
function getPlantScreenX(plant: PlantState, containerWidth: number): number {
  // Layout places plants across container width, roughly proportional to X position
  // This is a simplified mapping; a full impl would use worldToIso from layout.ts
  return containerWidth / 2 + plant.position.x * 1.5;
}

// ─── EMPTY STATE ───

function EmptyGarden() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="text-center space-y-3">
        {/* Planting stake icon */}
        <div className="text-4xl" aria-hidden="true">🌱</div>
        <p className="text-sm font-medium text-[var(--text-muted)]">Plant your first seed</p>
        <p className="text-xs text-[var(--text-muted)] max-w-48">
          Create a promise to see your garden grow
        </p>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───

export default function GardenView({
  gardenState,
  promises,
  checkIns,
  onPlantSelect,
  className,
}: GardenViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [time, setTime] = useState(0);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  // Detect reduced motion preference
  const reducedMotion = useRef(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      reducedMotion.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }
  }, []);

  // Particle state — persists across frames via ref (no re-render on update)
  const particleState = useRef<{
    fallingLeaves: FallingLeaf[];
    rootParticles: RootParticle[];
    ambientParticles: AmbientParticle[];
    previousStressLevels: Record<string, number>;
    previousReliabilityScore: number;
    rootConnections: RootConnection[];
  }>({
    fallingLeaves: [],
    rootParticles: [],
    ambientParticles: [],
    previousStressLevels: {},
    previousReliabilityScore: gardenState.landscape.overallReliability,
    rootConnections: [],
  });

  // Build root connections when garden state or promises change
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerWidth = container.offsetWidth;
    const groundLineY = container.offsetHeight * 0.7; // Ground line at 70%

    particleState.current.rootConnections = buildRootConnections(
      gardenState.plants,
      promises,
      containerWidth,
      groundLineY
    );
  }, [gardenState.plants, promises]);

  // Detect stress changes → spawn falling leaves
  useEffect(() => {
    if (reducedMotion.current) return;
    const container = containerRef.current;
    if (!container) return;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const groundLineY = containerHeight * 0.7;

    for (const plant of gardenState.plants) {
      const prev = particleState.current.previousStressLevels[plant.promiseId] ?? 0;
      if (plant.stressLevel > prev) {
        // Estimate plant screen position and canopy bounds
        const px = getPlantScreenX(plant, containerWidth);
        const py = groundLineY;
        // Canopy approximate bounds (generous estimate)
        const canopyH = 80;
        const canopyW = 60;
        const newLeaves = spawnFallingLeaves(
          { ...plant, body: "" } as PlantConfig,
          prev,
          plant.stressLevel,
          { x: px, y: py },
          { top: py - canopyH, left: px - canopyW / 2, width: canopyW, height: canopyH },
          groundLineY
        );
        particleState.current.fallingLeaves.push(...newLeaves);
      }
      particleState.current.previousStressLevels[plant.promiseId] = plant.stressLevel;
    }
  }, [gardenState.plants]);

  // Animation loop
  useEffect(() => {
    if (reducedMotion.current) return;

    let running = true;

    function animate(t: number) {
      if (!running) return;
      setTime(t);

      const overlay = overlayRef.current;
      if (overlay) {
        const ctx = overlay.getContext("2d");
        const container = containerRef.current;
        if (ctx && container) {
          const w = container.offsetWidth;
          const h = container.offsetHeight;
          overlay.width = w;
          overlay.height = h;
          ctx.clearRect(0, 0, w, h);

          const groundLineY = h * 0.7;
          const soilDepth = h * 0.3;
          const ps = particleState.current;

          // Draw roots
          drawRootSystem(
            ctx,
            ps.rootConnections,
            groundLineY,
            soilDepth,
            t,
            false
          );

          // Update root cascade particles
          ps.rootParticles = updateRootParticles(
            ctx,
            ps.rootParticles,
            ps.rootConnections,
            groundLineY,
            soilDepth
          );

          // Update falling leaves
          ps.fallingLeaves = updateFallingLeaves(ctx, ps.fallingLeaves, groundLineY);

          // Update ambient particles
          const plantConfigs = gardenState.plants.map((p) => ({
            ...p,
            body: "",
          })) as PlantConfig[];

          ps.ambientParticles = updateAmbientParticles(
            ctx,
            ps.ambientParticles,
            plantConfigs,
            gardenState.landscape.overallReliability,
            ps.previousReliabilityScore,
            { width: w, height: h, groundLineY },
            t
          );

          ps.previousReliabilityScore = gardenState.landscape.overallReliability;
        }
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [gardenState.landscape.overallReliability, gardenState.plants]);

  const handlePlantSelect = useCallback(
    (plant: PlantState) => {
      setSelectedPlantId(plant.promiseId);
      onPlantSelect?.(plant);
    },
    [onPlantSelect]
  );

  const { plants, landscape } = gardenState;
  const reliabilityScore = landscape.overallReliability;
  const isEmpty = plants.length === 0;

  // Domain display order: financial (back), work, health, relationships, creative (front)
  const sortedPlants = useMemo(
    () =>
      [...plants].sort((a, b) => {
        // Taller plants go behind (higher y in isometric = more forward)
        // Simple sort by position.y descending (back to front)
        return b.position.y - a.position.y;
      }),
    [plants]
  );

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden w-full h-full ${className ?? ""}`}
      style={{
        background: getSkyGradient(reliabilityScore),
        transition: "background 2s ease",
        minHeight: "320px",
      }}
    >
      {/* Empty state */}
      {isEmpty && <EmptyGarden />}

      {/* Soil cross-section (bottom 30%) */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "30%",
          background:
            "linear-gradient(180deg, #5D4037 0%, #4E342E 30%, #3E2723 100%)",
        }}
        aria-hidden="true"
      >
        {/* Grass ground line */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{ height: 3, background: "#33691E" }}
        />
      </div>

      {/* Shared overlay canvas for roots + particles */}
      <canvas
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
        aria-hidden="true"
      />

      {/* Plant canvases — sit on the ground line */}
      {!isEmpty && (
        <div
          className="absolute left-0 right-0 flex justify-center items-end flex-wrap gap-1 px-4"
          style={{ bottom: "30%", zIndex: 5 }}
          aria-hidden="true"
        >
          {sortedPlants.map((plant: PlantState) => {
            const promise = promises.find((p) => p.id === plant.promiseId);
            if (!promise) return null;
            return (
              <ProceduralPlant
                key={plant.promiseId}
                plant={plant}
                promise={promise}
                time={time as number}
                onClick={() => { handlePlantSelect(plant); }}
                selected={selectedPlantId === plant.promiseId}
              />
            );
          })}
        </div>
      )}

      {/* Accessible hidden DOM layer — screen readers see this */}
      <div className="sr-only" role="list" aria-label="Your promise garden">
        {plants.map((plant) => {
          const promise = promises.find((p) => p.id === plant.promiseId);
          const stageLabel =
            plant.growthStage.charAt(0).toUpperCase() + plant.growthStage.slice(1);
          const progressPct = Math.round(plant.growthProgress * 100);
          const stressText =
            plant.stressLevel > 0.1
              ? ` Stress: ${Math.round(plant.stressLevel * 100)}%.`
              : "";
          const streakText =
            plant.consecutiveKept >= 3
              ? ` ${plant.consecutiveKept}-day streak.`
              : "";
          const depsText =
            promise?.depends_on?.length
              ? ` Depends on ${promise.depends_on.length} other promise${promise.depends_on.length === 1 ? "" : "s"}.`
              : "";

          return (
            <div
              key={plant.promiseId}
              role="listitem"
              tabIndex={0}
              aria-label={`${domainMeta[plant.domain].label} promise: ${promise?.body ?? plant.promiseId}. Stage: ${stageLabel}. ${progressPct}% grown.${stressText}${streakText}${depsText}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handlePlantSelect(plant);
                }
              }}
              onClick={() => handlePlantSelect(plant)}
            />
          );
        })}
      </div>

      {/* Reliability indicator (text, for colorblind/screen reader users) */}
      <div
        className="absolute top-2 right-3 text-xs font-medium opacity-70"
        style={{ color: reliabilityScore > 0.5 ? "#1a5f4a" : "#78350f", zIndex: 20 }}
        aria-label={`Overall garden reliability: ${Math.round(reliabilityScore * 100)}%`}
      >
        {Math.round(reliabilityScore * 100)}%
      </div>
    </div>
  );
}
