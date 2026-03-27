"use client";

import { useState, useEffect, useRef } from "react";

interface GardenTourProps {
  onComplete: () => void;
  onDismiss: () => void;
}

const STEPS = [
  {
    title: "Your garden",
    body: "Each plant is a promise. They grow as you check in and tend to them.",
    icon: "🌱",
  },
  {
    title: "The weather",
    body: "The sky reflects how often you're checking in. Check in regularly and the sun comes out.",
    icon: "☀️",
  },
  {
    title: "Growth patterns",
    body: "Plants grow differently based on how you track them. Promises with sensors grow like crystals. Self-reported ones grow organically. Unverified ones are ghostly but still alive.",
    icon: "🌿",
  },
  {
    title: "The Collection",
    body: "When you keep a promise, it becomes a permanent artifact — a record of something real you did.",
    icon: "✨",
  },
  {
    title: "Dormancy, not death",
    body: "If a promise breaks, the plant goes grey and dormant — but the roots stay. You can always come back.",
    icon: "🌫️",
  },
];

export function GardenTour({ onComplete, onDismiss }: GardenTourProps) {
  const [step, setStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isLast = step === STEPS.length - 1;

  // Trap focus inside the tour
  useEffect(() => {
    containerRef.current?.focus();
  }, [step]);

  // Dismiss on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onDismiss();
      if (e.key === "ArrowRight" && !isLast) setStep((s) => s + 1);
      if (e.key === "ArrowLeft" && step > 0) setStep((s) => s - 1);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isLast, step, onDismiss]);

  const current = STEPS[step];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
      aria-modal="true"
      role="dialog"
      aria-label="Garden tour"
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 outline-none"
      >
        {/* Step indicator */}
        <div className="flex gap-1.5 mb-6" aria-hidden="true">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-green-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <p className="text-4xl text-center mb-4" aria-hidden="true">
          {current.icon}
        </p>

        <h2 className="font-serif text-xl font-bold text-gray-900 text-center mb-2">
          {current.title}
        </h2>
        <p className="text-sm text-gray-600 text-center leading-relaxed">
          {current.body}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 py-2.5 text-sm text-gray-500 border rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-gray-400"
          >
            Skip tour
          </button>
          <button
            onClick={() => {
              if (isLast) onComplete();
              else setStep((s) => s + 1);
            }}
            className="flex-1 py-2.5 text-sm font-semibold bg-green-700 text-white rounded-xl hover:bg-green-800 transition-colors focus-visible:outline-2 focus-visible:outline-green-600"
          >
            {isLast ? "Let's grow" : "Next →"}
          </button>
        </div>

        <p className="sr-only">
          Step {step + 1} of {STEPS.length}. Use arrow keys to navigate.
        </p>
      </div>
    </div>
  );
}
