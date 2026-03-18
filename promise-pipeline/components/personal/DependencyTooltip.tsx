"use client";

/**
 * DependencyTooltip
 *
 * One-time educational tooltip that appears after the user's 3rd promise is
 * planted. Explains that promises can depend on each other.
 *
 * Renders when: promisesPlanted >= 3 && !dependencyTutorialSeen
 *
 * Dismisses on tap/click anywhere. Sets dependencyTutorialSeen: true.
 *
 * Accessibility:
 *  - role="tooltip" with aria-live="polite" so screen readers announce it
 *  - Dismiss button for keyboard users
 */

import { useEffect, useState } from "react";

interface DependencyTooltipProps {
  onDismiss: () => void;
}

export function DependencyTooltip({ onDismiss }: DependencyTooltipProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(id);
  }, []);

  // Dismiss on any click outside the tooltip
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      const el = document.getElementById("pg-dep-tooltip");
      if (el && !el.contains(e.target as Node)) {
        onDismiss();
      }
    }
    document.addEventListener("click", handleOutside, { capture: true });
    return () => document.removeEventListener("click", handleOutside, { capture: true });
  }, [onDismiss]);

  // Dismiss on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onDismiss();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onDismiss]);

  return (
    <div
      id="pg-dep-tooltip"
      role="tooltip"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 w-full max-w-xs px-4 pointer-events-auto"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translateX(-50%) translateY(${visible ? 0 : 6}px)`,
        transition: "opacity 0.25s ease, transform 0.25s ease",
      }}
    >
      <div className="bg-gray-900 text-white rounded-lg px-4 py-3 shadow-lg flex items-start gap-3">
        {/* Pointer icon */}
        <span className="text-base mt-0.5 shrink-0" aria-hidden="true">
          🔗
        </span>
        <p className="font-sans text-sm leading-snug flex-1">
          Your promises can depend on each other. Tap a plant to connect it to others.
        </p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss tip"
          className="text-gray-400 hover:text-white shrink-0 mt-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M1 1l10 10M11 1L1 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Tiny arrow pointing up toward the plants */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1.5 w-3 h-1.5 overflow-hidden"
        aria-hidden="true"
      >
        <div className="w-3 h-3 bg-gray-900 rotate-45 translate-y-1 mx-auto" />
      </div>
    </div>
  );
}
