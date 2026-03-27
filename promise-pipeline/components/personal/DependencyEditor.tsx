"use client";

/**
 * DependencyEditor — Tap-to-connect interface for creating dependencies.
 *
 * Shows all promises and lets the user draw a dependency edge from one
 * to another. Direction matters: A depends_on B means B's failure affects A.
 */

import { useState, useCallback } from "react";
import type { GardenPromise } from "@/lib/types/garden-phase2";
import { StatusBadge } from "@/components/promise/StatusBadge";

interface DependencyEditorProps {
  promises: GardenPromise[];
  onAddDependency: (fromId: string, toId: string) => void;
  onRemoveDependency: (fromId: string, toId: string) => void;
  onClose: () => void;
}

export function DependencyEditor({
  promises,
  onAddDependency,
  onRemoveDependency,
  onClose,
}: DependencyEditorProps) {
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null);

  const topLevel = promises.filter((p) => p.parent === null);

  const handleSelect = useCallback(
    (id: string) => {
      if (selectedFrom === null) {
        setSelectedFrom(id);
      } else if (selectedFrom === id) {
        setSelectedFrom(null);
      } else {
        // Create dependency: selectedFrom depends on id
        onAddDependency(selectedFrom, id);
        setSelectedFrom(null);
      }
    },
    [selectedFrom, onAddDependency]
  );

  // Existing dependencies
  const existingEdges: Array<{
    fromId: string;
    toId: string;
    fromBody: string;
    toBody: string;
  }> = [];
  const byId = new Map(promises.map((p) => [p.id, p]));
  for (const p of promises) {
    for (const depId of p.depends_on) {
      const dep = byId.get(depId);
      if (dep) {
        existingEdges.push({
          fromId: p.id,
          toId: depId,
          fromBody: p.body,
          toBody: dep.body,
        });
      }
    }
  }

  return (
    <div className="bg-white rounded-xl border p-5 max-w-lg mx-auto">
      <h3 className="font-serif text-lg font-semibold text-gray-900 mb-1">
        Link Dependencies
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        {selectedFrom
          ? "Now tap the promise this one depends on."
          : "Tap a promise to start linking. Then tap what it depends on."}
      </p>

      {/* Promise selection grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {topLevel.map((p) => {
          const isSelected = selectedFrom === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p.id)}
              className={`text-left p-3 rounded-lg border text-sm transition-all ${
                isSelected
                  ? "ring-2 ring-green-600 border-green-300 bg-green-50"
                  : selectedFrom
                  ? "border-blue-200 bg-blue-50/30 hover:bg-blue-50"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
              aria-pressed={isSelected}
              aria-label={`${p.body} (${p.status})`}
            >
              <p className="line-clamp-2 text-gray-800 text-xs font-medium">
                {p.body}
              </p>
              <div className="mt-1">
                <StatusBadge status={p.status} size="xs" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Existing dependencies */}
      {existingEdges.length > 0 && (
        <div className="border-t pt-3 mt-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Current Dependencies
          </h4>
          <div className="space-y-2">
            {existingEdges.map((edge) => (
              <div
                key={`${edge.fromId}-${edge.toId}`}
                className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded px-3 py-2"
              >
                <span className="truncate flex-1">{edge.fromBody}</span>
                <span className="text-gray-400 shrink-0">depends on</span>
                <span className="truncate flex-1">{edge.toBody}</span>
                <button
                  onClick={() => onRemoveDependency(edge.fromId, edge.toId)}
                  className="text-red-400 hover:text-red-600 shrink-0 ml-1"
                  aria-label={`Remove dependency: ${edge.fromBody} depends on ${edge.toBody}`}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onClose}
        className="w-full mt-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Done
      </button>
    </div>
  );
}
