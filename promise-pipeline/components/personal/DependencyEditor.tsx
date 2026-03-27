"use client";

import { useState } from "react";
import type { GardenPromise } from "@/lib/types/personal";

const STATUS_DOT: Record<string, string> = {
  verified:     "bg-green-500",
  declared:     "bg-gray-400",
  degraded:     "bg-amber-500",
  violated:     "bg-gray-300",
  unverifiable: "bg-gray-200",
};

interface DependencyEditorProps {
  promise: GardenPromise;
  allPromises: GardenPromise[];
  onAdd: (fromId: string, toId: string) => void;
  onRemove: (fromId: string, toId: string) => void;
  onClose: () => void;
}

export function DependencyEditor({
  promise,
  allPromises,
  onAdd,
  onRemove,
  onClose,
}: DependencyEditorProps) {
  // Exclude self and existing children/parent from the list
  const candidates = allPromises.filter(
    (p) => p.id !== promise.id && p.parent !== promise.id && promise.parent !== p.id
  );

  const [localDeps, setLocalDeps] = useState<Set<string>>(
    new Set(promise.depends_on)
  );

  function toggle(targetId: string) {
    setLocalDeps((prev) => {
      const next = new Set(prev);
      if (next.has(targetId)) {
        next.delete(targetId);
        onRemove(promise.id, targetId);
      } else {
        next.add(targetId);
        onAdd(promise.id, targetId);
      }
      return next;
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.3)" }}
      aria-modal="true"
      role="dialog"
      aria-label="Edit dependencies"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-serif font-semibold text-gray-900">Dependencies</h2>
            <p className="text-xs text-gray-500 mt-0.5">Which promises does this depend on?</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-gray-400">✕</button>
        </div>

        <div className="px-5 py-4 max-h-72 overflow-y-auto space-y-1">
          {candidates.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              No other promises in your garden yet.
            </p>
          )}
          {candidates.map((candidate) => {
            const checked = localDeps.has(candidate.id);
            return (
              <label
                key={candidate.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                  checked ? "bg-green-50" : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(candidate.id)}
                  className="accent-green-700 w-4 h-4 flex-shrink-0"
                />
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[candidate.status] ?? "bg-gray-300"}`} aria-hidden="true" />
                <span className="text-sm text-gray-700 flex-1 leading-snug">{candidate.body}</span>
                <span className="text-xs text-gray-400 capitalize">{candidate.domain}</span>
              </label>
            );
          })}
        </div>

        {localDeps.size > 0 && (
          <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
            <p className="text-xs text-amber-700">
              If any selected promise struggles, this one may show stress.
            </p>
          </div>
        )}

        <div className="px-5 pb-5 pt-3">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-semibold bg-green-700 text-white rounded-xl hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-green-600"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
