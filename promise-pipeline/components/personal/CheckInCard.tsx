"use client";

/**
 * CheckInCard
 *
 * Check-in interaction for a single promise.
 * Options: On track / Slipping / Let go / Renegotiate
 * Takes < 10 seconds for the common case.
 *
 * Neurodivergent design:
 *  - No shame language
 *  - No red/urgent/overdue indicators
 *  - Dormant = grey and waiting, not red and angry
 *
 * Accessibility:
 *  - All buttons labeled
 *  - Keyboard navigable
 *  - focus-visible ring on all interactive elements
 */

import { useState, useCallback } from "react";
import type { GardenPromise } from "@/lib/types/personal";
import type { PromiseStatus } from "@/lib/types/promise";
import { getZenoMessage } from "@/lib/garden/adaptiveCheckin";

interface CheckInCardProps {
  promise: GardenPromise;
  onCheckIn: (promiseId: string, newStatus: PromiseStatus, note?: string) => void;
  onRenegotiate: (promiseId: string) => void;
  onLetGo: (promiseId: string) => void;
  onDismiss: () => void;
}

export function CheckInCard({
  promise,
  onCheckIn,
  onRenegotiate,
  onLetGo,
  onDismiss,
}: CheckInCardProps) {
  const [note, setNote] = useState("");
  const [showLetGoConfirm, setShowLetGoConfirm] = useState(false);

  const zenoMessage = getZenoMessage(promise);

  const handleOnTrack = useCallback(() => {
    const newStatus: PromiseStatus =
      promise.status === "declared" ? "verified" : promise.status;
    onCheckIn(promise.id, newStatus === "degraded" ? "verified" : "verified", note || undefined);
  }, [promise, note, onCheckIn]);

  const handleSlipping = useCallback(() => {
    onCheckIn(promise.id, "degraded", note || undefined);
  }, [promise.id, note, onCheckIn]);

  const handleLetGo = useCallback(() => {
    if (!showLetGoConfirm) {
      setShowLetGoConfirm(true);
      return;
    }
    onLetGo(promise.id);
  }, [promise.id, showLetGoConfirm, onLetGo]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 max-w-md mx-auto">
      {/* Promise body */}
      <div>
        <p className="font-serif font-semibold text-gray-900">{promise.body}</p>
        <p className="text-xs text-gray-400 mt-1 capitalize">{promise.domain}</p>
      </div>

      {/* Zeno message */}
      {zenoMessage && (
        <p className="text-xs text-blue-700 bg-blue-50 rounded-md px-3 py-2">
          {zenoMessage}
        </p>
      )}

      {/* Question */}
      <p className="text-sm text-gray-600">How&apos;s it going?</p>

      {/* Actions */}
      {!showLetGoConfirm ? (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleOnTrack}
            className="py-2.5 text-sm font-medium rounded-lg bg-green-50 text-green-800 hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            On track
          </button>
          <button
            type="button"
            onClick={handleSlipping}
            className="py-2.5 text-sm font-medium rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Slipping
          </button>
          <button
            type="button"
            onClick={handleLetGo}
            className="py-2.5 text-sm font-medium rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Let go
          </button>
          <button
            type="button"
            onClick={() => onRenegotiate(promise.id)}
            className="py-2.5 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Renegotiate
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            This plant will go dormant. The roots stay — you can always come
            back.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleLetGo}
              className="flex-1 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Let go
            </button>
            <button
              type="button"
              onClick={() => setShowLetGoConfirm(false)}
              className="flex-1 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Keep going
            </button>
          </div>
        </div>
      )}

      {/* Optional note */}
      {!showLetGoConfirm && (
        <div>
          <label htmlFor={`checkin-note-${promise.id}`} className="sr-only">
            Add a note (optional)
          </label>
          <input
            id={`checkin-note-${promise.id}`}
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            maxLength={200}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent"
          />
        </div>
      )}

      {/* Dismiss */}
      <button
        type="button"
        onClick={onDismiss}
        className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
      >
        Skip for now
      </button>
    </div>
  );
}
