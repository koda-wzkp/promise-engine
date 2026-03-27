"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PersonalPromise } from "@/lib/types/personal";
import { PromiseStatus } from "@/lib/types/promise";
import { StatusBadge } from "@/components/promise/StatusBadge";
import ProceduralPlant from "./ProceduralPlant";
import { getSkyGradient } from "@/lib/garden/renderer/skyGradient";
import { RootSystem } from "@/components/garden/RootSystem";
import { ZoomController, useZoomOpacity } from "@/components/garden/ZoomController";
import type { GardenPromise, CameraState } from "@/lib/types/garden";
import { DEFAULT_CAMERA, getZoomLevel } from "@/lib/types/garden";

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

  // ── Phase 2 props ──────────────────────────────────────────────────────
  /** Camera state for zoom control */
  camera?: CameraState;
  /** Camera change handler */
  onCameraChange?: (camera: Partial<CameraState>) => void;
  /** Phase 2 action handlers */
  onBreakDown?: (promiseId: string) => void;
  onEditDependencies?: (promiseId: string) => void;
  onAddPartner?: (promiseId: string) => void;
  onConnectSensor?: (promiseId: string) => void;
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

/** Check if a promise is a GardenPromise with Phase 2 fields */
function isGardenPromise(p: PersonalPromise): p is GardenPromise {
  return "children" in p && "parent" in p;
}

export function GardenView({
  promises,
  onUpdateStatus,
  forceRender = false,
  skyGradientOverride,
  gardenAriaLabel,
  minHeight = "320px",
  camera,
  onCameraChange,
  onBreakDown,
  onEditDependencies,
  onAddPartner,
  onConnectSensor,
}: GardenViewProps) {
  const [time, setTime] = useState(0);
  const animRef = useRef<number>(0);
  const reducedMotion = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeCamera = camera ?? DEFAULT_CAMERA;
  const zoomOpacity = useZoomOpacity(activeCamera.zoom);

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

  const handleCameraChange = useCallback(
    (updates: Partial<CameraState>) => {
      onCameraChange?.(updates);
    },
    [onCameraChange]
  );

  if (promises.length === 0 && !forceRender) return null;

  // Only show top-level promises in the garden view (sub-promises show as roots)
  const topLevelPromises = promises.filter((p) => {
    if (isGardenPromise(p)) return p.parent === null;
    return true;
  });

  // Group by domain
  const byDomain: Record<string, PersonalPromise[]> = {};
  for (const p of topLevelPromises) {
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

  // Get children for a promise (Phase 2)
  const getChildren = (parentId: string): GardenPromise[] => {
    return promises.filter(
      (p) => isGardenPromise(p) && p.parent === parentId
    ) as GardenPromise[];
  };

  const gardenContent = (
    <div className="space-y-0">
      {/* Garden scene */}
      <div
        className="relative rounded-xl overflow-hidden"
        role="img"
        aria-label={resolvedAriaLabel}
        style={{
          background: skyGradient,
          transition: "background 2s ease",
          minHeight,
        }}
      >
        {/* Reliability indicator */}
        <div
          className="absolute top-2 right-3 text-xs font-medium opacity-70 z-10"
          style={{ color: reliabilityScore > 0.5 ? "#1a5f4a" : "#78350f" }}
          aria-label={`Overall garden reliability: ${Math.round(reliabilityScore * 100)}%`}
        >
          {Math.round(reliabilityScore * 100)}%
        </div>

        {/* Domain labels — visible at landscape/domain zoom */}
        {zoomOpacity.landscape > 0 && Object.keys(byDomain).length > 1 && (
          <div
            className="absolute top-2 left-3 text-[10px] text-white/50 z-10"
            style={{ opacity: zoomOpacity.landscape }}
          >
            {Object.keys(byDomain).length} domains
          </div>
        )}

        {/* Plant area — sits above ground */}
        <div
          className="relative px-4 pt-8 pb-0"
          style={{ minHeight: "220px" }}
        >
          {Object.entries(byDomain).map(([domain, domainPromises]) => (
            <div key={domain} className="mb-4">
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                {DOMAIN_LABELS[domain] || `${domain} Grove`}
              </h3>
              <div className="flex items-end flex-wrap gap-2">
                {domainPromises.map((p) => {
                  const children = getChildren(p.id);
                  const hasRoots = children.length > 0;

                  return (
                    <div
                      key={p.id}
                      className="flex flex-col items-center"
                      style={{ minWidth: 80 }}
                    >
                      <ProceduralPlant
                        promise={p}
                        time={time}
                        selected={selectedId === p.id}
                        onClick={() =>
                          setSelectedId(selectedId === p.id ? null : p.id)
                        }
                      />

                      {/* Phase 2: Root system (sub-promises) */}
                      {hasRoots && (
                        <RootSystem
                          parent={p as GardenPromise}
                          children={children}
                          opacity={zoomOpacity.roots}
                          time={time}
                          onSelectChild={(childId) => setSelectedId(childId)}
                        />
                      )}

                      {/* Sub-promise count badge */}
                      {hasRoots && zoomOpacity.roots < 0.3 && (
                        <span className="text-[9px] text-white/60 bg-black/20 px-1 rounded-full mt-0.5">
                          {children.length} root{children.length !== 1 ? "s" : ""}
                        </span>
                      )}

                      {/* Dependency indicator */}
                      {p.depends_on.length > 0 && (
                        <span className="text-[9px] text-amber-200/60 mt-0.5">
                          {p.depends_on.length} dep{p.depends_on.length !== 1 ? "s" : ""}
                        </span>
                      )}

                      {/* Sensor indicator */}
                      {isGardenPromise(p) && p.sensor && (
                        <span className="text-[9px] text-blue-200/60 mt-0.5">
                          📊 sensor
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Ground section (soil + grass line) */}
        <div
          className="relative"
          style={{
            height: "70px",
            background:
              "linear-gradient(180deg, #5D4037 0%, #4E342E 40%, #3E2723 100%)",
          }}
          aria-hidden="true"
        >
          {/* Grass ground line */}
          <div
            className="absolute top-0 left-0 right-0"
            style={{ height: 3, background: "#33691E" }}
          />
        </div>
      </div>

      {/* Plant detail cards (below the garden scene) */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {topLevelPromises.map((p) => (
          <GardenPlantCard
            key={p.id}
            promise={p}
            childCount={getChildren(p.id).length}
            onUpdateStatus={onUpdateStatus}
            selected={selectedId === p.id}
            onSelect={() =>
              setSelectedId(selectedId === p.id ? null : p.id)
            }
            onBreakDown={onBreakDown}
            onEditDependencies={onEditDependencies}
            onAddPartner={onAddPartner}
            onConnectSensor={onConnectSensor}
          />
        ))}
      </div>
    </div>
  );

  // Wrap in ZoomController if camera management is active
  if (onCameraChange) {
    return (
      <ZoomController
        camera={activeCamera}
        onCameraChange={handleCameraChange}
        reducedMotion={reducedMotion.current}
      >
        {gardenContent}
      </ZoomController>
    );
  }

  return gardenContent;
}

function GardenPlantCard({
  promise,
  childCount,
  onUpdateStatus,
  selected,
  onSelect,
  onBreakDown,
  onEditDependencies,
  onAddPartner,
  onConnectSensor,
}: {
  promise: PersonalPromise;
  childCount: number;
  onUpdateStatus: (id: string, status: PromiseStatus, reflection?: string) => void;
  selected: boolean;
  onSelect: () => void;
  onBreakDown?: (promiseId: string) => void;
  onEditDependencies?: (promiseId: string) => void;
  onAddPartner?: (promiseId: string) => void;
  onConnectSensor?: (promiseId: string) => void;
}) {
  const isActive =
    promise.status === "declared" || promise.status === "degraded";

  const hasPartner = isGardenPromise(promise) && !!promise.partner;
  const hasSensor = isGardenPromise(promise) && !!promise.sensor;

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

      {/* Phase 2 badges */}
      <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
        {childCount > 0 && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {childCount} sub
          </span>
        )}
        {promise.depends_on.length > 0 && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {promise.depends_on.length} dep
          </span>
        )}
        {hasPartner && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            partner
          </span>
        )}
        {hasSensor && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
            sensor
          </span>
        )}
      </div>

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

      {/* Phase 2 action buttons — visible when selected */}
      {selected && (
        <div className="mt-2 flex flex-wrap gap-1 justify-center">
          {onBreakDown && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBreakDown(promise.id);
              }}
              className="px-1.5 py-0.5 text-[10px] bg-amber-50 text-amber-700 rounded hover:bg-amber-100 border border-amber-200"
            >
              Break down
            </button>
          )}
          {onEditDependencies && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditDependencies(promise.id);
              }}
              className="px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-700 rounded hover:bg-blue-100 border border-blue-200"
            >
              Dependencies
            </button>
          )}
          {onAddPartner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddPartner(promise.id);
              }}
              className="px-1.5 py-0.5 text-[10px] bg-purple-50 text-purple-700 rounded hover:bg-purple-100 border border-purple-200"
            >
              Partner
            </button>
          )}
          {onConnectSensor && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConnectSensor(promise.id);
              }}
              className="px-1.5 py-0.5 text-[10px] bg-cyan-50 text-cyan-700 rounded hover:bg-cyan-100 border border-cyan-200"
            >
              Sensor
            </button>
          )}
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
