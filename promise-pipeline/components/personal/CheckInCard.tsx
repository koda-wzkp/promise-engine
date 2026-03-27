"use client";

import { useState, useEffect, useRef } from "react";
import type { GardenPromise } from "@/lib/types/personal";
import type { PromiseStatus } from "@/lib/types/promise";
import { isDue } from "@/lib/garden/adaptiveCheckin";

interface CheckInCardProps {
  promise: GardenPromise;
  onCheckIn: (promiseId: string, newStatus: PromiseStatus, note?: string) => void;
  onRenegotiate: (promiseId: string) => void;
  onComplete: (promiseId: string) => void;
  onFossilize: (promiseId: string) => void;
  onRevive: (promiseId: string) => void;
  onClose: () => void;
}

const K_LABELS: Record<string, string> = {
  composting: "Composting",
  ecological: "Ecological",
  physics:    "Physics",
};

const K_COLORS: Record<string, string> = {
  composting: "#d97706",
  ecological: "#059669",
  physics:    "#2563eb",
};

export function CheckInCard({
  promise,
  onCheckIn,
  onRenegotiate,
  onComplete,
  onFossilize,
  onRevive,
  onClose,
}: CheckInCardProps) {
  const [note, setNote] = useState("");
  const [letGoConfirm, setLetGoConfirm] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const due = isDue(promise);

  // Trap focus
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit(newStatus: PromiseStatus) {
    onCheckIn(promise.id, newStatus, note || undefined);
    onClose();
  }

  const isDormant = promise.status === "violated" || promise.fossilized;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.3)" }}
      aria-modal="true"
      role="dialog"
      aria-label={`Check in: ${promise.body}`}
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl outline-none overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-400 capitalize mb-0.5">{promise.domain}</p>
              <p className="font-serif font-semibold text-gray-900 leading-snug">
                {promise.body}
              </p>
              {promise.graftHistory.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Renegotiated {promise.graftHistory.length}×
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-gray-400 hover:text-gray-600 mt-0.5 focus-visible:outline-2 focus-visible:outline-gray-400"
            >
              ✕
            </button>
          </div>

          {/* K-regime badge */}
          <div className="mt-3 flex items-center gap-2">
            <span
              className="px-2 py-0.5 text-xs font-medium rounded"
              style={{
                background: K_COLORS[promise.kRegime] + "18",
                color: K_COLORS[promise.kRegime],
              }}
            >
              {K_LABELS[promise.kRegime]} regime
            </span>
            {due && !isDormant && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                Check-in due
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {isDormant ? (
            // Dormant plant — offer revival or fossilize
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                {promise.fossilized
                  ? "This promise is fossilized — a closed chapter."
                  : "This promise is dormant. The roots are still here."}
              </p>
              {!promise.fossilized && (
                <button
                  onClick={() => { onRevive(promise.id); onClose(); }}
                  className="w-full py-2.5 text-sm font-semibold bg-green-700 text-white rounded-xl hover:bg-green-800 transition-colors focus-visible:outline-2 focus-visible:outline-green-600"
                >
                  Wake it up
                </button>
              )}
              {!promise.fossilized && (
                <button
                  onClick={() => { onFossilize(promise.id); onClose(); }}
                  className="w-full py-2.5 text-sm text-gray-600 border rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-gray-400"
                >
                  Fossilize it — keep as a closed chapter
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 mb-3">How&apos;s it going?</p>

              {/* Primary check-in options */}
              <button
                onClick={() => submit("verified")}
                className="w-full py-3 text-sm font-semibold bg-green-700 text-white rounded-xl hover:bg-green-800 transition-colors focus-visible:outline-2 focus-visible:outline-green-600"
              >
                On track ✓
              </button>
              <button
                onClick={() => submit("degraded")}
                className="w-full py-3 text-sm font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors focus-visible:outline-2 focus-visible:outline-amber-400"
              >
                Slipping a bit
              </button>

              {/* Let go — shows confirmation */}
              {!letGoConfirm ? (
                <button
                  onClick={() => setLetGoConfirm(true)}
                  className="w-full py-3 text-sm text-gray-500 border rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-gray-400"
                >
                  Let this one go
                </button>
              ) : (
                <div className="rounded-xl border border-gray-200 p-3 space-y-2">
                  <p className="text-xs text-gray-500">
                    The plant goes dormant — roots stay. You can come back to it.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { submit("violated"); }}
                      className="flex-1 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-gray-400"
                    >
                      Go dormant
                    </button>
                    <button
                      onClick={() => { onFossilize(promise.id); onClose(); }}
                      className="flex-1 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-gray-400"
                    >
                      Fossilize it
                    </button>
                    <button
                      onClick={() => setLetGoConfirm(false)}
                      className="py-2 px-3 text-sm text-gray-400 focus-visible:outline-2 focus-visible:outline-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Renegotiate */}
              <button
                onClick={() => { onRenegotiate(promise.id); onClose(); }}
                className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-gray-400"
              >
                Renegotiate this promise
              </button>

              {/* Mark as fully kept */}
              {promise.status === "verified" && (
                <button
                  onClick={() => { onComplete(promise.id); onClose(); }}
                  className="w-full py-2 text-sm text-green-700 hover:text-green-900 focus-visible:outline-2 focus-visible:outline-green-600"
                >
                  Mark as kept — add to Collection ✨
                </button>
              )}

              {/* Optional note */}
              <div>
                <label htmlFor="checkin-note" className="sr-only">Add a note (optional)</label>
                <textarea
                  id="checkin-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note… (optional)"
                  rows={2}
                  className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
