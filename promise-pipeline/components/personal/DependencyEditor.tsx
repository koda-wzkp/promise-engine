"use client";

/**
 * DependencyEditor — Phase 2 Tap-to-Connect Interface
 *
 * Lets users create dependency edges between promises.
 * "Does this depend on any other promise?"
 *
 * Flow:
 * 1. Select source promise (the one that depends)
 * 2. Tap another promise to create the dependency
 * 3. Direction matters: A depends_on B means B's failure affects A
 */

import { useState, useCallback } from "react";
import { GardenPromise } from "@/lib/types/garden";
import { StatusBadge } from "@/components/promise/StatusBadge";

interface DependencyEditorProps {
  promises: GardenPromise[];
  /** The promise we're editing dependencies for */
  targetPromise: GardenPromise;
  onAddDependency: (fromId: string, toId: string) => void;
  onRemoveDependency: (fromId: string, toId: string) => void;
  onClose: () => void;
}

export function DependencyEditor({
  promises,
  targetPromise,
  onAddDependency,
  onRemoveDependency,
  onClose,
}: DependencyEditorProps) {
  const [search, setSearch] = useState("");

  // Available promises to depend on (exclude self and children)
  const available = promises.filter(
    (p) =>
      p.id !== targetPromise.id &&
      p.parent !== targetPromise.id &&
      targetPromise.parent !== p.id
  );

  const currentDeps = new Set(targetPromise.depends_on);

  const filtered = search.trim()
    ? available.filter(
        (p) =>
          p.body.toLowerCase().includes(search.toLowerCase()) ||
          p.domain.toLowerCase().includes(search.toLowerCase())
      )
    : available;

  const handleToggle = useCallback(
    (promiseId: string) => {
      if (currentDeps.has(promiseId)) {
        onRemoveDependency(targetPromise.id, promiseId);
      } else {
        // Prevent circular dependencies
        if (wouldCreateCycle(targetPromise.id, promiseId, promises)) {
          return; // Silently prevent
        }
        onAddDependency(targetPromise.id, promiseId);
      }
    },
    [targetPromise.id, currentDeps, promises, onAddDependency, onRemoveDependency]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit dependencies"
        className="relative z-10 bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-lg font-semibold text-gray-900">
                Dependencies
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                What does &ldquo;{targetPromise.body}&rdquo; depend on?
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search promises..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />

          {/* Current dependencies */}
          {targetPromise.depends_on.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Current dependencies
              </h3>
              <div className="space-y-1">
                {targetPromise.depends_on.map((depId) => {
                  const dep = promises.find((p) => p.id === depId);
                  if (!dep) return null;
                  return (
                    <div
                      key={depId}
                      className="flex items-center justify-between p-2 rounded-lg bg-green-50 border border-green-200"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <StatusBadge status={dep.status} size="xs" />
                        <span className="text-sm text-gray-700 truncate">
                          {dep.body}
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggle(depId)}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available promises */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {search.trim() ? "Results" : "Available promises"}
            </h3>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {filtered
                .filter((p) => !currentDeps.has(p.id))
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleToggle(p.id)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 text-left transition-colors"
                  >
                    <StatusBadge status={p.status} size="xs" />
                    <span className="text-sm text-gray-700 truncate flex-1">
                      {p.body}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase shrink-0">
                      {p.domain}
                    </span>
                  </button>
                ))}
              {filtered.filter((p) => !currentDeps.has(p.id)).length === 0 && (
                <p className="text-sm text-gray-400 py-4 text-center">
                  {search.trim()
                    ? "No matching promises"
                    : "No other promises available"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Check if adding fromId → toId would create a cycle. */
function wouldCreateCycle(
  fromId: string,
  toId: string,
  promises: GardenPromise[]
): boolean {
  // BFS from toId to see if we can reach fromId
  const visited = new Set<string>();
  const queue = [toId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === fromId) return true;
    if (visited.has(current)) continue;
    visited.add(current);

    const promise = promises.find((p) => p.id === current);
    if (promise) {
      for (const dep of promise.depends_on) {
        if (!visited.has(dep)) queue.push(dep);
      }
    }
  }

  return false;
}
