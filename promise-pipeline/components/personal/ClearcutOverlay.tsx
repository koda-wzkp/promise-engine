"use client";

/**
 * ClearcutOverlay
 *
 * First impression of the Promise Garden. Renders absolutely over the empty
 * garden canvas and contains:
 *   - The ambient intro text ("Every forest starts somewhere.")
 *   - The floating seed button that opens the first-promise creation sheet
 *   - Decorative pixel-art stumps suggesting the "before" state
 *   - A subtle sky parallax drift (disabled for prefers-reduced-motion)
 *
 * Mounts only when phase === "clearcut" or phase === "first-plant".
 */

import { useEffect, useRef, useState } from "react";

interface ClearcutOverlayProps {
  /** Called when the floating seed is clicked */
  onSeedClick: () => void;
  /** Ref forwarded to the seed button so focus can return after sheet close */
  seedRef?: React.RefObject<HTMLButtonElement | null>;
}

// ─── Pixel-art stump ─────────────────────────────────────────────────────────

function Stump({
  width = 28,
  height = 22,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 28 22"
      fill="none"
      aria-hidden="true"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Stump body */}
      <rect x="5" y="8" width="18" height="12" rx="1" fill="#6D4C41" />
      {/* Bark shading */}
      <rect x="5" y="10" width="18" height="2" fill="#5D4037" opacity="0.4" />
      <rect x="5" y="14" width="18" height="2" fill="#5D4037" opacity="0.3" />
      {/* Top surface */}
      <ellipse cx="14" cy="8" rx="9" ry="3.5" fill="#8D6E63" />
      {/* Growth rings */}
      <ellipse
        cx="14"
        cy="8"
        rx="5"
        ry="2"
        stroke="#795548"
        strokeWidth="0.8"
        fill="none"
        opacity="0.6"
      />
      <ellipse
        cx="14"
        cy="8"
        rx="7.5"
        ry="3"
        stroke="#795548"
        strokeWidth="0.8"
        fill="none"
        opacity="0.4"
      />
      {/* Stub branches */}
      <rect x="3" y="11" width="4" height="2" rx="1" fill="#795548" />
      <rect x="21" y="13" width="4" height="2" rx="1" fill="#795548" />
    </svg>
  );
}

// ─── Seed sprite (pixel-art, 32×32 logical, rendered at 2x) ──────────────────

function SeedSprite() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Seed body */}
      <ellipse cx="8" cy="10" rx="4" ry="5" fill="#795548" />
      {/* Highlight */}
      <ellipse cx="7" cy="8.5" rx="1.5" ry="2" fill="#A1887F" opacity="0.55" />
      {/* Sprout tip */}
      <rect x="7" y="4" width="2" height="2" fill="#4CAF50" />
      <rect x="7" y="2" width="2" height="2" fill="#388E3C" />
      {/* Tiny leaves */}
      <rect x="5" y="3" width="2" height="1" fill="#66BB6A" />
      <rect x="9" y="3" width="2" height="1" fill="#66BB6A" />
    </svg>
  );
}

// ─── ClearcutOverlay ─────────────────────────────────────────────────────────

export function ClearcutOverlay({ onSeedClick, seedRef }: ClearcutOverlayProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(false);
  const internalSeedRef = useRef<HTMLButtonElement>(null);
  const resolvedSeedRef = seedRef ?? internalSeedRef;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    // Fade in after a tick (allows the garden canvas to paint first)
    const id = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      {/* Keyframe definitions */}
      <style>{`
        @keyframes pg-seed-bob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-3px); }
        }
        @keyframes pg-seed-glow {
          0%, 100% { transform: scale(1);   opacity: 0.10; }
          50%       { transform: scale(1.9); opacity: 0.04; }
        }
        @keyframes pg-sky-drift {
          0%   { background-position: 0%   50%; }
          100% { background-position: 100% 50%; }
        }
        @keyframes pg-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Full-coverage overlay — sits on top of the empty garden canvas */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{
          opacity: visible ? 1 : 0,
          transition: reducedMotion ? "none" : "opacity 0.6s ease",
        }}
        aria-hidden="true"
      >
        {/* Subtle sky parallax drift layer */}
        {!reducedMotion && (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.025) 40%, rgba(255,255,255,0.025) 60%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "pg-sky-drift 40s linear infinite",
            }}
          />
        )}

        {/* Domain zone soil hints — very subtle colour bands across the ground strip */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: 70 }}
        >
          <div className="flex h-full">
            {[
              "rgba(16,185,129,0.06)",   // health — green tint
              "rgba(37,99,235,0.06)",    // work — blue tint
              "rgba(219,39,119,0.06)",   // relationships — pink tint
              "rgba(124,58,237,0.06)",   // creative — purple tint
              "rgba(8,145,178,0.06)",    // financial — cyan tint
            ].map((color, i) => (
              <div key={i} className="flex-1" style={{ background: color }} />
            ))}
          </div>
        </div>

        {/* Decorative stumps near the ground */}
        <div className="absolute bottom-16 left-0 right-0">
          <div className="absolute" style={{ left: "14%", bottom: 0 }}>
            <Stump />
          </div>
          <div className="absolute" style={{ left: "58%", bottom: 2 }}>
            <Stump width={22} height={18} />
          </div>
          <div className="absolute" style={{ left: "38%", bottom: 1 }}>
            <Stump width={24} height={20} />
          </div>
        </div>
      </div>

      {/* Centred content — pointer-events enabled only on the seed button */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-6"
        style={{ paddingBottom: "10%" }}
      >
        {/* Intro text */}
        <p
          className="font-serif italic text-lg select-none"
          style={{
            color: "#4b5563",
            opacity: visible ? 1 : 0,
            transition: reducedMotion ? "none" : "opacity 0.6s ease 0.1s",
          }}
        >
          Every forest starts somewhere.
        </p>

        {/* Floating seed button */}
        <div className="flex flex-col items-center gap-2">
          <button
            ref={resolvedSeedRef as React.RefObject<HTMLButtonElement>}
            onClick={onSeedClick}
            aria-label="Plant your first promise"
            className="relative flex items-center justify-center rounded-full p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            style={{ pointerEvents: "auto" }}
          >
            {/* Glow pulse */}
            <span
              className="absolute inset-0 rounded-full"
              aria-hidden="true"
              style={{
                background: "rgba(26,95,74,0.10)",
                animation: reducedMotion ? "none" : "pg-seed-glow 2.5s ease-in-out infinite",
              }}
            />
            {/* Seed sprite */}
            <span
              style={{
                display: "block",
                animation: reducedMotion ? "none" : "pg-seed-bob 2.5s ease-in-out infinite",
              }}
            >
              <SeedSprite />
            </span>
          </button>

          <p
            className="font-sans text-sm select-none"
            style={{ color: "#4b5563" }}
          >
            Tap to plant your first promise
          </p>
        </div>
      </div>
    </>
  );
}
