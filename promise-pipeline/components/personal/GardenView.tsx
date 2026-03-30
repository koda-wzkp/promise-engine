"use client";

import { useState, useEffect, useRef } from "react";
import { PersonalPromise, GardenPromise } from "@/lib/types/personal";
import { PromiseStatus } from "@/lib/types/promise";
import { StatusBadge } from "@/components/promise/StatusBadge";
import ProceduralPlant from "./ProceduralPlant";
import { getSkyGradient } from "@/lib/garden/renderer/skyGradient";
import { RootSystem } from "@/components/garden/RootSystem";
import type { ZoomLevel } from "@/components/garden/ZoomController";

interface GardenViewProps {
  promises: PersonalPromise[];
  onUpdateStatus: (id: string, status: PromiseStatus, reflection?: string) => void;
  /**
   * When true, renders the garden canvas (sky + ground) even when there are
   * no promises — used for the clearcut onboarding state.
   */
  forceRender?: boolean;
  /**
   * Override the computed sky gradient. Passed from the parent during
   * onboarding so the count-based sky progression drives the sky colour.
   */
  skyGradientOverride?: string;
  /**
   * Override the aria-label on the garden scene element.
   * Defaults to a description derived from the promise count.
   */
  gardenAriaLabel?: string;
  /**
   * Override the minimum height of the garden scene div (default "320px").
   */
  minHeight?: string;
  /**
   * When provided, clicking a plant calls this instead of the local detail cards.
   * Used by the fullscreen garden to open the PlantBottomSheet.
   */
  onPlantSelect?: (id: string) => void;
  /**
   * Set false to hide the plant detail card grid below the scene.
   * Default true (keeps the existing behaviour).
   */
  showPlantCards?: boolean;
  /**
   * Current zoom level from ZoomController. When >= 3 the root system
   * renders below each plant.
   */
  zoomLevel?: ZoomLevel;
  /**
   * Full promise map keyed by ID — used to resolve children for root
   * rendering. Only needed when zoomLevel is provided.
   */
  gardenPromiseMap?: Record<string, GardenPromise>;
}

const DOMAIN_LABELS: Record<string, string> = {
  health: "Health Meadow",
  work: "Work Grove",
  relationships: "Relationships Garden",
  creative: "Creative Thicket",
  financial: "Financial Timberland",
};

/** Compute a simple reliability score from promises (0–1). */
function computeReliability(promises: PersonalPromise[]): number {
  const completed = promises.filter(
    (p) => p.status === "verified" || p.status === "violated"
  );
  if (completed.length === 0) return 0.5; // Neutral for new gardens
  const kept = completed.filter((p) => p.status === "verified").length;
  return kept / completed.length;
}

export function GardenView({
  promises,
  onUpdateStatus,
  forceRender = false,
  skyGradientOverride,
  gardenAriaLabel,
  minHeight = "320px",
  onPlantSelect,
  showPlantCards = true,
  zoomLevel,
  gardenPromiseMap,
}: GardenViewProps) {
  const [time, setTime] = useState(0);
  const animRef = useRef<number>(0);
  const reducedMotion = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Detect reduced motion preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      reducedMotion.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }
  }, []);

  // Animation loop for plant sway
  useEffect(() => {
    if (reducedMotion.current) return;

    let running = true;
    function animate(t: number) {
      if (!running) return;
      setTime(t);
      animRef.current = requestAnimationFrame(animate);
    }
    animRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  if (promises.length === 0 && !forceRender) return null;

  // Group by domain
  const byDomain: Record<string, PersonalPromise[]> = {};
  for (const p of promises) {
    const domain = p.domain.toLowerCase();
    if (!byDomain[domain]) byDomain[domain] = [];
    byDomain[domain].push(p);
  }

  const reliabilityScore = computeReliability(promises);
  const skyGradient = skyGradientOverride ?? getSkyGradient(reliabilityScore);

  const defaultAriaLabel =
    promises.length === 0
      ? "An empty garden clearing with bare earth and a few old stumps. Ready to plant."
      : `Promise garden with ${promises.length} promise${promises.length === 1 ? "" : "s"}. Overall reliability: ${Math.round(reliabilityScore * 100)}%.`;
  const resolvedAriaLabel = gardenAriaLabel ?? defaultAriaLabel;
  const showRoots = (zoomLevel ?? 0) >= 3;

  return (
    <div>
      {/* ── Garden scene ── */}
      <div
        className={`relative ${showRoots ? "" : "overflow-hidden"}`}
        role="img"
        aria-label={resolvedAriaLabel}
        style={{
          background: skyGradient,
          transition: "background 2s ease",
          minHeight,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Reliability indicator — subtle overlay */}
        <div
          className="absolute top-2 right-3 text-xs font-medium z-10 select-none pointer-events-none"
          style={{ color: "rgba(255,255,255,0.55)" }}
          aria-label={`Garden reliability: ${Math.round(reliabilityScore * 100)}%`}
        >
          {Math.round(reliabilityScore * 100)}%
        </div>

        {/* Sky + plant area — flex-1 so ground anchors to bottom */}
        <div className="flex-1 relative px-6 pt-6 pb-0 flex items-end">
          <div className="w-full flex flex-wrap items-end gap-x-8 gap-y-0">
            {Object.entries(byDomain).map(([domain, domainPromises]) => (
              <div key={domain} className="flex flex-col items-start mb-0">
                {/* Faded domain label floats in sky above the plants */}
                <span
                  className="text-xs tracking-wide mb-2 select-none"
                  style={{ color: "rgba(255,255,255,0.35)", fontVariant: "small-caps" }}
                >
                  {DOMAIN_LABELS[domain] || `${domain}`}
                </span>
                <div className="flex items-end gap-4">
                  {domainPromises.map((p) => {
                    const gp = gardenPromiseMap?.[p.id];
                    const children = gp?.children
                      ?.map((id) => gardenPromiseMap?.[id])
                      .filter(Boolean) as GardenPromise[] | undefined;

                    return (
                      <div
                        key={p.id}
                        style={{
                          position: "relative",
                          zIndex: 1,
                          // Scale plants up relative to their natural size.
                          // transform doesn't affect layout so we add matching margin.
                          transform: "scale(1.5)",
                          transformOrigin: "bottom center",
                          marginLeft: "10px",
                          marginRight: "10px",
                        }}
                      >
                        <ProceduralPlant
                          promise={p}
                          time={time}
                          selected={selectedId === p.id}
                          onClick={() => {
                            const next = selectedId === p.id ? null : p.id;
                            setSelectedId(next);
                            if (next && onPlantSelect) onPlantSelect(next);
                          }}
                        />
                        {/* Root system — rendered below plant, visible at zoom level 3 */}
                        {gp && (
                          <div
                            aria-live={showRoots ? "polite" : "off"}
                            aria-label={showRoots ? `Root system for ${p.body}` : undefined}
                          >
                            <RootSystem
                              parent={gp}
                              children={children ?? []}
                              visible={showRoots}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ground — bottom 38%, plants visually emerge from here */}
        <div
          aria-hidden="true"
          style={{
            flexShrink: 0,
            height: "38%",
            minHeight: 80,
            position: "relative",
            background: "linear-gradient(180deg, #5D4037 0%, #4E342E 35%, #3E2723 100%)",
          }}
        >
          {/* Grass line with slight depth gradient */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#558B2F" }} />
          <div style={{ position: "absolute", top: 4, left: 0, right: 0, height: 10, background: "linear-gradient(180deg, rgba(85,139,47,0.35) 0%, transparent 100%)" }} />
          {/* Subtle soil texture hints */}
          <div style={{ position: "absolute", top: 18, left: "8%",  width: 32, height: 3, background: "rgba(0,0,0,0.12)", borderRadius: 2 }} />
          <div style={{ position: "absolute", top: 26, left: "28%", width: 24, height: 3, background: "rgba(0,0,0,0.10)", borderRadius: 2 }} />
          <div style={{ position: "absolute", top: 22, left: "55%", width: 40, height: 3, background: "rgba(0,0,0,0.09)", borderRadius: 2 }} />
          <div style={{ position: "absolute", top: 32, left: "72%", width: 20, height: 3, background: "rgba(0,0,0,0.11)", borderRadius: 2 }} />
        </div>
      </div>

      {/* Plant detail cards — hidden when onPlantSelect is provided (bottom sheet handles interaction) */}
      {showPlantCards && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {promises.map((p) => (
            <GardenPlantCard
              key={p.id}
              promise={p}
              onUpdateStatus={onUpdateStatus}
              selected={selectedId === p.id}
              onSelect={() => setSelectedId(selectedId === p.id ? null : p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GardenPlantCard({
  promise,
  onUpdateStatus,
  selected,
  onSelect,
}: {
  promise: PersonalPromise;
  onUpdateStatus: (id: string, status: PromiseStatus, reflection?: string) => void;
  selected: boolean;
  onSelect: () => void;
}) {
  const isActive =
    promise.status === "declared" || promise.status === "degraded";

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border p-3 text-center transition-all hover:shadow-sm cursor-pointer ${
        selected
          ? "ring-2 ring-green-600 ring-offset-1 border-green-300 bg-green-50/50"
          : promise.status === "verified"
          ? "border-green-200 bg-green-50/50"
          : promise.status === "violated"
          ? "border-red-200 bg-red-50/30 opacity-70"
          : "border-gray-200 bg-white"
      }`}
    >
      <p className="text-xs text-gray-700 line-clamp-2 mb-2">{promise.body}</p>
      <StatusBadge status={promise.status} size="xs" />

      {isActive && (
        <div className="mt-3 flex gap-1 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStatus(promise.id, "verified");
            }}
            className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100"
          >
            Kept
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStatus(promise.id, "violated");
            }}
            className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100"
          >
            Broken
          </button>
        </div>
      )}

      {promise.target && (
        <p className="text-xs text-gray-400 mt-1">
          By {new Date(promise.target).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
