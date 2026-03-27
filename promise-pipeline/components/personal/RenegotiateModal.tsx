"use client";

/**
 * RenegotiateModal
 *
 * Graft flow: user changes a promise's body.
 * Records a GraftPoint with the previous body and reason.
 *
 * Accessibility:
 *  - Focus trapped within modal
 *  - Escape to close
 *  - All inputs labeled
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type { GardenPromise } from "@/lib/types/personal";

interface RenegotiateModalProps {
  promise: GardenPromise;
  onRenegotiate: (promiseId: string, newBody: string, reason?: string) => void;
  onClose: () => void;
}

export function RenegotiateModal({
  promise,
  onRenegotiate,
  onClose,
}: RenegotiateModalProps) {
  const [newBody, setNewBody] = useState(promise.body);
  const [reason, setReason] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (newBody.trim().length < 3) return;
      if (newBody.trim() === promise.body) {
        onClose();
        return;
      }
      onRenegotiate(promise.id, newBody.trim(), reason.trim() || undefined);
    },
    [promise, newBody, reason, onRenegotiate, onClose]
  );

  return (
    <>
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
        aria-label="Renegotiate promise"
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4"
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-6 space-y-4"
        >
          <div>
            <h2 className="font-serif text-lg font-semibold text-gray-900">
              Renegotiate
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Promises can change. That&apos;s part of the process.
            </p>
          </div>

          {/* Previous body */}
          <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 border-l-2 border-gray-200">
            Previous: {promise.body}
          </div>

          {/* New body */}
          <div>
            <label
              htmlFor="renegotiate-body"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              What do you want to change it to?
            </label>
            <textarea
              ref={inputRef}
              id="renegotiate-body"
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              rows={2}
              maxLength={200}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent"
              required
            />
          </div>

          {/* Reason (optional) */}
          <div>
            <label
              htmlFor="renegotiate-reason"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Why? <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="renegotiate-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={200}
              placeholder="Circumstances changed..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent"
            />
          </div>

          {/* Graft history count */}
          {promise.graftHistory.length > 0 && (
            <p className="text-xs text-gray-400">
              This promise has been renegotiated{" "}
              {promise.graftHistory.length} time
              {promise.graftHistory.length === 1 ? "" : "s"} before.
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={newBody.trim().length < 3}
              className={[
                "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
                newBody.trim().length >= 3
                  ? "bg-[#1a5f4a] text-white hover:bg-[#155240]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed",
              ].join(" ")}
            >
              Renegotiate
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
