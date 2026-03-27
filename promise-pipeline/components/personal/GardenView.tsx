"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { GardenPromise } from "@/lib/types/personal";
import type { PromiseStatus } from "@/lib/types/promise";
import ProceduralPlant from "./ProceduralPlant";
import {
  computeWeather,
  getWeatherVisuals,
  type WeatherState,
} from "@/lib/garden/weatherComputation";

interface GardenViewProps {
  promises: GardenPromise[];
  onSelectPromise: (id: string) => void;
  selectedId: string | null;
  /**
   * When true, renders the garden canvas even when there are no promises.
   */
  forceRender?: boolean;
  /**
   * Override the sky gradient (used during onboarding).
   */
  skyGradientOverride?: string;
  /**
   * Override the aria-label on the garden scene element.
   */
  gardenAriaLabel?: string;
  /**
   * Override the minimum height of the garden scene div.
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

export function GardenView({
  promises,
  onSelectPromise,
  selectedId,
  forceRender = false,
  skyGradientOverride,
  gardenAriaLabel,
  minHeight = "320px",
}: GardenViewProps) {
  const [time, setTime] = useState(0);
  const animRef = useRef<number>(0);
  const reducedMotion = useRef(false);

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

  // Compute weather from promises
  const weather = computeWeather(promises);
  const weatherVisuals = getWeatherVisuals(weather);
  const skyGradient = skyGradientOverride ?? weatherVisuals.skyGradient;

  // Group by domain
  const byDomain: Record<string, GardenPromise[]> = {};
  for (const p of promises) {
    if (p.fossilized) continue; // Don't show fossilized in garden
    const domain = p.domain.toLowerCase();
    if (!byDomain[domain]) byDomain[domain] = [];
    byDomain[domain].push(p);
  }

  // Screen reader summary
  const srSummary = Object.entries(byDomain)
    .map(([domain, ps]) => {
      const descriptions = ps
        .map((p) => `${p.body}: ${p.status}`)
        .join(". ");
      return `${domain} garden: ${ps.length} promise${ps.length === 1 ? "" : "s"}. ${descriptions}.`;
    })
    .join(" ");

  const defaultAriaLabel =
    promises.length === 0
      ? "An empty garden clearing, ready to plant."
      : `Promise garden with ${promises.length} promise${promises.length === 1 ? "" : "s"}. Weather: ${weather}. ${srSummary}`;
  const resolvedAriaLabel = gardenAriaLabel ?? defaultAriaLabel;

  return (
    <div className="space-y-0">
      {/* Screen reader summary */}
      <div className="sr-only" role="status" aria-live="polite">
        {srSummary}
      </div>

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
        {/* Weather indicator */}
        <div
          className="absolute top-2 right-3 text-xs font-medium opacity-70 z-10 capitalize"
          style={{
            color:
              weather === "sunny" || weather === "partly"
                ? "#1a5f4a"
                : "#9ca3af",
          }}
          aria-label={`Weather: ${weather}`}
        >
          {weather === "sunny" && "☀️"}
          {weather === "partly" && "⛅"}
          {weather === "overcast" && "☁️"}
          {weather === "frozen" && "❄️"}
          {weather === "dormant" && "🌙"}
        </div>

        {/* Particle layer */}
        {weatherVisuals.particles !== "none" && !reducedMotion.current && (
          <WeatherParticles type={weatherVisuals.particles} />
        )}

        {/* Plant area */}
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
              <div
                className="flex items-end flex-wrap gap-2"
                role="list"
                aria-label={`${domain} promises`}
              >
                {domainPromises.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col items-center"
                    style={{ minWidth: 80 }}
                    role="listitem"
                  >
                    <ProceduralPlantV2
                      promise={p}
                      time={time}
                      selected={selectedId === p.id}
                      onClick={() =>
                        onSelectPromise(selectedId === p.id ? "" : p.id)
                      }
                      frost={weatherVisuals.frost}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Ground section */}
        <div
          className="relative"
          style={{
            height: "70px",
            background:
              "linear-gradient(180deg, #5D4037 0%, #4E342E 40%, #3E2723 100%)",
          }}
          aria-hidden="true"
        >
          <div
            className="absolute top-0 left-0 right-0"
            style={{ height: 3, background: "#33691E" }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── ProceduralPlantV2: wrapper that maps GardenPromise to existing renderer ───

function ProceduralPlantV2({
  promise,
  time,
  selected,
  onClick,
  frost,
}: {
  promise: GardenPromise;
  time: number;
  selected: boolean;
  onClick: () => void;
  frost: boolean;
}) {
  // Map GardenPromise to the PersonalPromise interface expected by ProceduralPlant
  const legacyPromise: import("@/lib/types/personal").PersonalPromise = {
    id: promise.id,
    isPersonal: true,
    promiser: promise.promiser,
    promisee: promise.promisee,
    body: promise.body,
    domain: promise.domain,
    status: promise.status,
    note: promise.note,
    verification: promise.verification,
    depends_on: promise.depends_on,
    polarity: promise.polarity,
    origin: "voluntary",
    createdAt: promise.createdAt,
    progress: promise.progress,
  };

  return (
    <div style={frost ? { filter: "brightness(0.8) saturate(0.4)" } : undefined}>
      <ProceduralPlant
        promise={legacyPromise}
        time={time}
        selected={selected}
        onClick={onClick}
      />
      {/* Status label for check-in awareness */}
      <p
        className="text-center text-xs mt-1 line-clamp-1"
        style={{
          color:
            promise.status === "violated"
              ? "#9CA3AF"
              : promise.status === "degraded"
              ? "#D97706"
              : promise.status === "verified"
              ? "#059669"
              : "#6B7280",
          maxWidth: 80,
        }}
      >
        {promise.body}
      </p>
      {/* Graft indicator */}
      {promise.graftHistory.length > 0 && (
        <div
          className="text-center text-xs text-gray-400"
          aria-label={`Renegotiated ${promise.graftHistory.length} time${promise.graftHistory.length === 1 ? "" : "s"}`}
        >
          {"~".repeat(Math.min(promise.graftHistory.length, 3))}
        </div>
      )}
    </div>
  );
}

// ─── Weather particles ───

function WeatherParticles({ type }: { type: "pollen" | "mist" }) {
  return (
    <>
      <style>{`
        @keyframes pg-particle-drift {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          20%  { opacity: ${type === "pollen" ? "0.6" : "0.3"}; }
          80%  { opacity: ${type === "pollen" ? "0.4" : "0.15"}; }
          100% { transform: translateY(${type === "pollen" ? "40px" : "-20px"}) translateX(${type === "pollen" ? "20px" : "30px"}); opacity: 0; }
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {Array.from({ length: type === "pollen" ? 8 : 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: type === "pollen" ? 2 : 4,
              height: type === "pollen" ? 2 : 4,
              background:
                type === "pollen"
                  ? "rgba(255, 248, 225, 0.7)"
                  : "rgba(255, 255, 255, 0.15)",
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `pg-particle-drift ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
