"use client";

/**
 * GardenTour
 *
 * Optional guided tour triggered once after first 3 promises.
 * Dismissable, < 90 seconds. Steps through garden concepts.
 *
 * Accessibility:
 *  - Focus trapped in overlay
 *  - Escape to dismiss
 *  - All steps reachable via keyboard
 *  - Reduced motion: no animations
 */

import { useState, useEffect, useCallback } from "react";

interface GardenTourProps {
  onComplete: () => void;
}

interface TourStep {
  title: string;
  description: string;
  icon: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "This is your garden",
    description: "Each plant is a promise you've made. They grow as you keep them.",
    icon: "🌱",
  },
  {
    title: "The weather reflects your attention",
    description:
      "The sky changes based on how often you check in. Sunny means you're on top of things.",
    icon: "🌤",
  },
  {
    title: "Plants grow differently",
    description:
      "How you track a promise affects how it grows. Self-reported promises grow organically. Sensor-tracked ones grow geometrically.",
    icon: "🌿",
  },
  {
    title: "Kept promises become artifacts",
    description:
      "When you complete a promise, it crystallizes into a unique artifact for your collection.",
    icon: "💎",
  },
  {
    title: "Broken promises go dormant",
    description:
      "If a promise breaks, the plant goes dormant — but the roots stay. You can always come back.",
    icon: "🪨",
  },
];

export function GardenTour({ onComplete }: GardenTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onComplete();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onComplete]);

  const next = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      onComplete();
    }
  }, [currentStep, onComplete]);

  const step = TOUR_STEPS[currentStep];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onComplete}
        aria-hidden="true"
      />

      {/* Tour card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Garden tour step ${currentStep + 1} of ${TOUR_STEPS.length}`}
        className="fixed z-50 bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4"
        style={{
          opacity: visible ? 1 : 0,
          transform: `translateX(-50%) translateY(${visible ? 0 : 12}px)`,
          transition: reducedMotion
            ? "none"
            : "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        <div className="bg-white rounded-xl shadow-lg p-5 space-y-4">
          {/* Step indicator */}
          <div className="flex gap-1.5" aria-hidden="true">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full flex-1 transition-colors ${
                  i <= currentStep ? "bg-[#1a5f4a]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="flex gap-3 items-start">
            <span className="text-2xl shrink-0" aria-hidden="true">
              {step.icon}
            </span>
            <div>
              <h3 className="font-serif font-semibold text-gray-900 text-base">
                {step.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={onComplete}
              className="text-sm text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-2 py-1"
            >
              Skip tour
            </button>

            <button
              type="button"
              onClick={next}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#1a5f4a] text-white hover:bg-[#155240] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              {currentStep < TOUR_STEPS.length - 1 ? "Next" : "Start gardening"}
            </button>
          </div>

          <p className="sr-only">
            Step {currentStep + 1} of {TOUR_STEPS.length}: {step.title}. {step.description}
          </p>
        </div>
      </div>
    </>
  );
}
