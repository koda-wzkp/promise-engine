"use client";

import { useState, useEffect, useRef } from "react";
import type { GardenPromise } from "@/lib/types/personal";

interface RenegotiateModalProps {
  promise: GardenPromise;
  onConfirm: (promiseId: string, newBody: string, reason: string) => void;
  onClose: () => void;
}

export function RenegotiateModal({ promise, onConfirm, onClose }: RenegotiateModalProps) {
  const [newBody, setNewBody] = useState(promise.body);
  const [reason, setReason] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canConfirm = newBody.trim().length >= 3 && newBody.trim() !== promise.body.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
      aria-modal="true"
      role="dialog"
      aria-label="Renegotiate promise"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-semibold text-gray-900">
              Renegotiate
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-gray-400"
            >
              ✕
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            The graft will be recorded — your original promise stays in the history.
          </p>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Previous body for reference */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Previous promise</p>
            <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-dashed">
              {promise.body}
            </p>
          </div>

          {/* New body */}
          <div>
            <label htmlFor="new-body" className="text-xs font-medium text-gray-600 mb-1 block">
              New promise
            </label>
            <textarea
              id="new-body"
              ref={inputRef}
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Reason (optional) */}
          <div>
            <label htmlFor="graft-reason" className="text-xs text-gray-500 mb-1 block">
              Why are you changing it? (optional)
            </label>
            <input
              id="graft-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Too ambitious for right now"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm text-gray-600 border rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (canConfirm) onConfirm(promise.id, newBody.trim(), reason.trim());
            }}
            disabled={!canConfirm}
            className="flex-1 py-2.5 text-sm font-semibold bg-green-700 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-800 transition-colors focus-visible:outline-2 focus-visible:outline-green-600"
          >
            Graft it
          </button>
        </div>
      </div>
    </div>
  );
}
