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

// ─── ZOOM / CAMERA CONSTANTS ───

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_DEFAULT = 1;
const ZOOM_DAMPING = 0.35;          // Dampen raw gesture deltas
const WHEEL_ZOOM_SPEED = 0.0008;    // Wheel delta → zoom delta
const PINCH_ZOOM_SPEED = 0.003;     // Pinch distance delta → zoom delta
const KEYBOARD_ZOOM_STEP = 0.15;
const ROOT_FADE_ZOOM_START = 1.3;   // Roots begin fading in at this zoom
const ROOT_FADE_ZOOM_FULL = 1.8;    // Roots fully visible at this zoom
const DOUBLE_TAP_MS = 300;          // Max gap between taps for double-tap

interface Camera {
  x: number;
  y: number;
  zoom: number;
}

const DEFAULT_CAMERA: Camera = { x: 0, y: 0, zoom: ZOOM_DEFAULT };

function clampZoom(z: number): number {
  return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
}

function lerpCamera(from: Camera, to: Camera, t: number): Camera {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    zoom: from.zoom + (to.zoom - from.zoom) * t,
  };
}

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

  // ─── CAMERA STATE ───
  const [camera, setCamera] = useState<Camera>(DEFAULT_CAMERA);
  const cameraRef = useRef<Camera>(DEFAULT_CAMERA);
  // Keep ref in sync for use in animation loop
  useEffect(() => { cameraRef.current = camera; }, [camera]);

  // Smooth animation target for zoom reset
  const animTarget = useRef<Camera | null>(null);
  const animStart = useRef<Camera | null>(null);
  const animProgress = useRef(0);

  // Gesture tracking refs
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, camX: 0, camY: 0 });
  const lastPinchDist = useRef(0);
  const activeTouches = useRef(0);
  const lastTapTime = useRef(0);

  // Detect reduced motion preference
  const reducedMotion = useRef(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      reducedMotion.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }
  }, []);

  // ─── ZOOM RESET ───

  const resetCamera = useCallback(() => {
    if (reducedMotion.current) {
      setCamera(DEFAULT_CAMERA);
      return;
    }
    animStart.current = { ...cameraRef.current };
    animTarget.current = { ...DEFAULT_CAMERA };
    animProgress.current = 0;
  }, []);

  // Smooth reset animation (runs inside rAF loop)
  const tickResetAnimation = useCallback(() => {
    if (!animTarget.current || !animStart.current) return;
    animProgress.current = Math.min(1, animProgress.current + 0.06);
    // Ease-out cubic
    const t = 1 - Math.pow(1 - animProgress.current, 3);
    const next = lerpCamera(animStart.current, animTarget.current, t);
    setCamera(next);
    if (animProgress.current >= 1) {
      animTarget.current = null;
      animStart.current = null;
    }
  }, []);

  // ─── POINTER / TOUCH HANDLERS ───

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Don't start pan on 2-finger touch (that's pinch)
    if (e.pointerType === "touch") {
      activeTouches.current++;
      if (activeTouches.current > 1) return;
    }
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      camX: cameraRef.current.x,
      camY: cameraRef.current.y,
    };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    if (e.pointerType === "touch" && activeTouches.current > 1) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setCamera((c) => ({
      ...c,
      x: dragStart.current.camX - dx / c.zoom,
      y: dragStart.current.camY - dy / c.zoom,
    }));
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "touch") {
      activeTouches.current = Math.max(0, activeTouches.current - 1);
    }
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const wasDrag = Math.abs(dx) > 5 || Math.abs(dy) > 5;
    isDragging.current = false;

    if (!wasDrag && e.pointerType === "touch") {
      // Double-tap detection
      const now = Date.now();
      if (now - lastTapTime.current < DOUBLE_TAP_MS) {
        resetCamera();
        lastTapTime.current = 0;
        return;
      }
      lastTapTime.current = now;
    }
  }, [resetCamera]);

  const handlePointerCancel = useCallback((e: React.PointerEvent) => {
    isDragging.current = false;
    if (e.pointerType === "touch") {
      activeTouches.current = Math.max(0, activeTouches.current - 1);
    }
  }, []);

  // Wheel zoom (desktop)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = -e.deltaY * WHEEL_ZOOM_SPEED * ZOOM_DAMPING;
    setCamera((c) => ({ ...c, zoom: clampZoom(c.zoom + delta) }));
  }, []);

  // Pinch zoom (touch)
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (lastPinchDist.current > 0) {
        const rawDelta = dist - lastPinchDist.current;
        const delta = rawDelta * PINCH_ZOOM_SPEED * ZOOM_DAMPING;
        setCamera((c) => ({ ...c, zoom: clampZoom(c.zoom + delta) }));
      }
      lastPinchDist.current = dist;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastPinchDist.current = 0;
  }, []);

  // Keyboard zoom (+/-/0)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      setCamera((c) => ({ ...c, zoom: clampZoom(c.zoom + KEYBOARD_ZOOM_STEP) }));
    } else if (e.key === "-" || e.key === "_") {
      e.preventDefault();
      setCamera((c) => ({ ...c, zoom: clampZoom(c.zoom - KEYBOARD_ZOOM_STEP) }));
    } else if (e.key === "0") {
      e.preventDefault();
      resetCamera();
    }
  }, [resetCamera]);

  // Prevent default wheel scroll on the container (passive: false needed)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e: WheelEvent) => e.preventDefault();
    el.addEventListener("wheel", prevent, { passive: false });
    return () => el.removeEventListener("wheel", prevent);
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

      // Tick smooth camera reset animation
      tickResetAnimation();

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
          const currentZoom = cameraRef.current.zoom;

          // Compute root opacity based on zoom level
          // Roots fade in between ROOT_FADE_ZOOM_START and ROOT_FADE_ZOOM_FULL
          const rootOpacity =
            currentZoom <= ROOT_FADE_ZOOM_START
              ? 0
              : currentZoom >= ROOT_FADE_ZOOM_FULL
                ? 1
                : (currentZoom - ROOT_FADE_ZOOM_START) / (ROOT_FADE_ZOOM_FULL - ROOT_FADE_ZOOM_START);

          // Draw roots (only if visible at current zoom)
          if (rootOpacity > 0 && ps.rootConnections.length > 0) {
            ctx.save();
            ctx.globalAlpha = rootOpacity;
            drawRootSystem(
              ctx,
              ps.rootConnections,
              groundLineY,
              soilDepth,
              t,
              false
            );
            ctx.restore();

            // Update root cascade particles
            ctx.save();
            ctx.globalAlpha = rootOpacity;
            ps.rootParticles = updateRootParticles(
              ctx,
              ps.rootParticles,
              ps.rootConnections,
              groundLineY,
              soilDepth
            );
            ctx.restore();
          }

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
  }, [gardenState.landscape.overallReliability, gardenState.plants, tickResetAnimation]);

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

  // Compute CSS transform for the zoomable scene layer
  const sceneTransform = useMemo(() => {
    const { x, y, zoom } = camera;
    return {
      transform: `scale(${zoom}) translate(${-x}px, ${-y}px)`,
      transformOrigin: "center center",
    };
  }, [camera]);

  const isZoomed = camera.zoom !== ZOOM_DEFAULT || camera.x !== 0 || camera.y !== 0;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden w-full h-full ${className ?? ""}`}
      style={{
        background: getSkyGradient(reliabilityScore),
        transition: "background 2s ease",
        minHeight: "320px",
        touchAction: "none", // Prevent browser default pinch/pan
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onWheel={handleWheel}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Zoomable scene wrapper */}
      <div
        className="absolute inset-0"
        style={sceneTransform}
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
      </div>
      {/* End zoomable scene wrapper */}

      {/* Reset zoom button (outside zoomable wrapper so it stays fixed) */}
      {isZoomed && (
        <button
          onClick={resetCamera}
          className="absolute bottom-20 right-3 w-9 h-9 flex items-center justify-center bg-white/85 backdrop-blur-sm rounded-full shadow-md text-sm leading-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-garden-green"
          style={{ zIndex: 25 }}
          aria-label="Reset garden view"
          title="Reset zoom (or press 0)"
        >
          {/* Fit-to-view icon: a square with inward arrows */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="14" height="14" rx="2" stroke="#374151" strokeWidth="1.5" />
            <path d="M4 6V4h2M12 6V4h-2M4 10v2h2M12 10v2h-2" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
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
