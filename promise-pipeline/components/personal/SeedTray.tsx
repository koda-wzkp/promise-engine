"use client";

/**
 * SeedTray
 *
 * A floating pill at the bottom of the garden that nudges the user to plant
 * their 2nd and 3rd optional promises after their first one is planted.
 *
 * Renders when:
 *   phase === "garden-live" && promisesPlanted < 3 && !seedTrayDismissed
 *
 * Dismisses permanently on "Maybe later". Auto-hides once promisesPlanted >= 3.
 *
 * Accessibility:
 *  - role="complementary" with aria-label
 *  - Each seed button has a descriptive aria-label
 *  - "Maybe later" is a <button> (not an anchor)
 *  - Slides in with a brief animation (disabled for prefers-reduced-motion)
 */

import { useEffect, useState } from "react";

interface SeedTrayProps {
  /** Current number of planted promises (used to show 1 or 2 seeds) */
  promisesPlanted: number;
  /** Open the creation sheet for an additional promise */
  onPlantAnother: () => void;
  /** Permanently dismiss the tray */
  onDismiss: () => void;
}

export function SeedTray({
  promisesPlanted,
  onPlantAnother,
  onDismiss,
}: SeedTrayProps) {
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const seedsRemaining = Math.max(0, 3 - promisesPlanted);

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    const id = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(id);
  }, []);

  if (seedsRemaining <= 0) return null;

  return (
    <>
      <style>{`
        @keyframes pg-tray-in {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      <div
        role="complementary"
        aria-label="Plant more promises"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible
            ? "translateX(-50%) translateY(0)"
            : "translateX(-50%) translateY(12px)",
          transition: reducedMotion
            ? "none"
            : "opacity 0.2s ease, transform 0.2s ease",
        }}
      >
        <div
          className="flex items-center gap-3 px-4 py-2 rounded-full shadow-sm border border-gray-200 max-w-sm"
          style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)" }}
        >
          {/* Seed buttons — one per remaining promise slot */}
          {Array.from({ length: seedsRemaining }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={onPlantAnother}
              aria-label="Plant another promise"
              className="text-xl leading-none hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-full p-0.5"
            >
              🌱
            </button>
          ))}

          <span className="font-sans text-sm text-gray-600 whitespace-nowrap">
            Plant another?
          </span>

          <button
            type="button"
            onClick={onDismiss}
            className="font-sans text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 rounded"
          >
            Maybe later
          </button>
        </div>
      </div>
    </>
  );
}
