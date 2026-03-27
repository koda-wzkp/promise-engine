"use client";

import { useState, useEffect, useRef } from "react";
import type { GardenPromise } from "@/lib/types/personal";

interface CompletionFlowProps {
  promise: GardenPromise;
  onConfirm: (promiseId: string, reflection?: string) => void;
  onClose: () => void;
}

export function CompletionFlow({ promise, onConfirm, onClose }: CompletionFlowProps) {
  const [reflection, setReflection] = useState("");
  const [phase, setPhase] = useState<"reflect" | "crystallize">("reflect");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleConfirm() {
    setPhase("crystallize");
    // Small delay for the crystallize animation beat
    setTimeout(() => {
      onConfirm(promise.id, reflection || undefined);
      onClose();
    }, 1200);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      aria-modal="true"
      role="dialog"
      aria-label="Mark promise as kept"
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden outline-none"
      >
        {phase === "reflect" ? (
          <>
            <div className="px-5 pt-6 pb-4 text-center border-b">
              <p className="text-4xl mb-3" aria-hidden="true">✨</p>
              <h2 className="font-serif text-xl font-bold text-gray-900 mb-1">
                You kept this one.
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                &ldquo;{promise.body}&rdquo;
              </p>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div>
                <label htmlFor="reflection" className="text-sm text-gray-600 mb-2 block">
                  Any thoughts on this one? (optional)
                </label>
                <textarea
                  id="reflection"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="What made it work? What surprised you?"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <p className="text-xs text-gray-400">
                This promise will become an artifact in your Collection — a permanent record.
              </p>
            </div>

            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 text-sm text-gray-500 border rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-gray-400"
              >
                Not yet
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 text-sm font-semibold bg-green-700 text-white rounded-xl hover:bg-green-800 transition-colors focus-visible:outline-2 focus-visible:outline-green-600"
              >
                Add to Collection
              </button>
            </div>
          </>
        ) : (
          <div className="px-5 py-12 text-center">
            <p
              className="text-5xl mb-4 animate-bounce"
              aria-hidden="true"
              style={{ animationDuration: "0.6s", animationIterationCount: 2 }}
            >
              💎
            </p>
            <p className="font-serif text-lg font-bold text-gray-900">
              Crystallizing…
            </p>
            <p className="text-sm text-gray-500 mt-1">Adding to your Collection</p>
          </div>
        )}
      </div>
    </div>
  );
}
