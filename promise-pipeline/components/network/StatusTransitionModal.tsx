"use client";

import { useState } from "react";
import { NetworkPromise, NetworkConfig, StatusChangeContext } from "@/lib/types/network";
import { PromiseStatus } from "@/lib/types/promise";
import StatusBadge from "@/components/promise/StatusBadge";

interface StatusTransitionModalProps {
  promise: NetworkPromise;
  targetStatus: PromiseStatus;
  config: NetworkConfig;
  onConfirm: (status: PromiseStatus, context: StatusChangeContext) => void;
  onCancel: () => void;
}

export default function StatusTransitionModal({
  promise,
  targetStatus,
  config,
  onConfirm,
  onCancel,
}: StatusTransitionModalProps) {
  const [reason, setReason] = useState("");
  const [reflection, setReflection] = useState("");

  const isCompletion = targetStatus === "verified" || targetStatus === "violated";
  const label = config.statusLabels[targetStatus] ?? targetStatus;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      role="dialog"
      aria-modal="true"
      aria-label={`Change status to ${label}`}
    >
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Change Status
        </h3>

        <div className="mb-4 flex items-center gap-2 text-sm">
          <StatusBadge status={promise.status} labels={config.statusLabels} size="sm" />
          <span className="text-gray-400" aria-hidden="true">&rarr;</span>
          <StatusBadge status={targetStatus} labels={config.statusLabels} size="sm" />
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{promise.body}</p>

        <div className="space-y-3">
          <div>
            <label htmlFor="transition-reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason (optional)
            </label>
            <input
              id="transition-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
              placeholder="Why is this changing?"
              autoFocus
            />
          </div>

          {isCompletion && (
            <div>
              <label htmlFor="transition-reflection" className="block text-sm font-medium text-gray-700 mb-1">
                Reflection (optional)
              </label>
              <textarea
                id="transition-reflection"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                placeholder="What did you learn?"
                rows={3}
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(targetStatus, {
              reason: reason.trim() || undefined,
              reflection: reflection.trim() || undefined,
            })}
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
