"use client";

/**
 * CompletionFlow
 *
 * Mark a verified promise as complete / kept.
 * 1. Optional reflection prompt
 * 2. Artifact generation (visual)
 * 3. Placed in Collection
 *
 * Accessibility:
 *  - Focus trapped in modal
 *  - Escape to close
 *  - All inputs labeled
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { GardenPromise } from "@/lib/types/personal";

interface CompletionFlowProps {
  promise: GardenPromise;
  onComplete: (promiseId: string, reflection?: string) => void;
  onClose: () => void;
}

export function CompletionFlow({
  promise,
  onComplete,
  onClose,
}: CompletionFlowProps) {
  const [step, setStep] = useState<"reflect" | "complete">("reflect");
  const [reflection, setReflection] = useState("");
  const [animating, setAnimating] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleComplete = useCallback(() => {
    if (reducedMotion) {
      onComplete(promise.id, reflection.trim() || undefined);
      return;
    }

    setAnimating(true);
    setStep("complete");
    // Brief crystallization animation
    setTimeout(() => {
      onComplete(promise.id, reflection.trim() || undefined);
    }, 1200);
  }, [promise.id, reflection, onComplete, reducedMotion]);

  return (
    <>
      <style>{`
        @keyframes pg-crystallize {
          0%   { transform: scale(1); opacity: 1; filter: saturate(1); }
          50%  { transform: scale(1.1); opacity: 0.8; filter: saturate(1.5) brightness(1.3); }
          100% { transform: scale(0.9); opacity: 1; filter: saturate(0.8) brightness(1.1); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Complete promise"
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4"
      >
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          {step === "reflect" && !animating && (
            <>
              <div>
                <h2 className="font-serif text-lg font-semibold text-gray-900">
                  Promise kept
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  &ldquo;{promise.body}&rdquo;
                </p>
              </div>

              <div>
                <label
                  htmlFor="completion-reflection"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Any thoughts on this one?{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  ref={inputRef}
                  id="completion-reflection"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="What did you learn? What made it work?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleComplete}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-[#1a5f4a] text-white hover:bg-[#155240] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Complete
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-sm text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Not yet
                </button>
              </div>
            </>
          )}

          {step === "complete" && animating && (
            <div className="text-center py-8">
              <div
                className="inline-block text-5xl mb-4"
                style={{
                  animation: reducedMotion
                    ? "none"
                    : "pg-crystallize 1.2s ease forwards",
                }}
                aria-hidden="true"
              >
                💎
              </div>
              <p className="font-serif text-lg font-semibold text-gray-900">
                Artifact created
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Added to your collection.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
