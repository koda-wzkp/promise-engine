"use client";

import { useState, useEffect, useRef } from "react";
import { PersonalPromise } from "@/lib/types/personal";
import { PromiseStatus } from "@/lib/types/promise";
import { StatusBadge } from "@/components/promise/StatusBadge";
import ProceduralPlant from "./ProceduralPlant";
import { getSkyGradient } from "@/lib/garden/renderer/skyGradient";

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

  return (
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
                {domainPromises.map((p) => (
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
                  </div>
                ))}
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
        {promises.map((p) => (
          <GardenPlantCard
            key={p.id}
            promise={p}
            onUpdateStatus={onUpdateStatus}
            selected={selectedId === p.id}
            onSelect={() =>
              setSelectedId(selectedId === p.id ? null : p.id)
            }
          />
        ))}
      </div>
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
