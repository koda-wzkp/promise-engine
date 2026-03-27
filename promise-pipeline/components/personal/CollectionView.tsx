"use client";

/**
 * CollectionView
 *
 * Artifact gallery for completed and fossilized promises.
 * Grid of artifacts organized by domain.
 * Tap to inspect: see stats, original promise body, and reflection.
 *
 * Accessibility:
 *  - Grid is keyboard navigable (Tab between artifacts)
 *  - Each artifact has a descriptive aria-label
 *  - Inspect view uses role="dialog"
 *  - Reduced motion: no animations
 */

import { useState, useEffect, useCallback } from "react";
import type { GardenPromise, Artifact } from "@/lib/types/personal";
import { CollectionArtifact } from "./CollectionArtifact";

interface CollectionViewProps {
  artifacts: GardenPromise[];
  fossils: GardenPromise[];
}

export function CollectionView({ artifacts, fossils }: CollectionViewProps) {
  const [inspecting, setInspecting] = useState<GardenPromise | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && inspecting) {
        setInspecting(null);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [inspecting]);

  if (artifacts.length === 0 && fossils.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <p className="text-gray-500 text-sm">
          No artifacts yet. Complete a promise to add it to your collection.
        </p>
      </div>
    );
  }

  // Group artifacts by domain
  const byDomain: Record<string, GardenPromise[]> = {};
  for (const p of artifacts) {
    const d = p.domain;
    if (!byDomain[d]) byDomain[d] = [];
    byDomain[d].push(p);
  }

  return (
    <div className="space-y-8">
      {/* Artifacts by domain */}
      {Object.entries(byDomain).map(([domain, promises]) => (
        <section key={domain}>
          <h3 className="font-serif font-semibold text-gray-900 capitalize mb-3">
            {domain}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {promises.map((p) => (
              <CollectionArtifact
                key={p.id}
                promise={p}
                onClick={() => setInspecting(p)}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Fossils section */}
      {fossils.length > 0 && (
        <section>
          <h3 className="font-serif font-semibold text-gray-500 mb-3">
            Closed chapters
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {fossils.map((p) => (
              <CollectionArtifact
                key={p.id}
                promise={p}
                isFossil
                onClick={() => setInspecting(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Inspect overlay */}
      {inspecting && (
        <InspectOverlay
          promise={inspecting}
          onClose={() => setInspecting(null)}
        />
      )}
    </div>
  );
}

function InspectOverlay({
  promise,
  onClose,
}: {
  promise: GardenPromise;
  onClose: () => void;
}) {
  const artifact = promise.artifact;
  const dwellTime = promise.completedAt
    ? Math.round(
        (new Date(promise.completedAt).getTime() -
          new Date(promise.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Artifact: ${promise.body}`}
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-4"
      >
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          {/* Artifact visual */}
          <div className="text-center">
            <div
              className="inline-block text-5xl mb-2"
              aria-hidden="true"
            >
              {promise.fossilized ? "🪨" : "💎"}
            </div>
          </div>

          {/* Promise body */}
          <div>
            <p className="font-serif font-semibold text-gray-900">
              {promise.body}
            </p>
            <p className="text-xs text-gray-400 mt-1 capitalize">
              {promise.domain}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 text-center text-sm">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="font-semibold text-gray-900">{dwellTime}d</p>
              <p className="text-xs text-gray-400">Dwell time</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="font-semibold text-gray-900 capitalize">
                {promise.kRegime}
              </p>
              <p className="text-xs text-gray-400">k regime</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="font-semibold text-gray-900">
                {promise.verification.method}
              </p>
              <p className="text-xs text-gray-400">Verification</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="font-semibold text-gray-900">
                {promise.graftHistory.length}
              </p>
              <p className="text-xs text-gray-400">Renegotiations</p>
            </div>
          </div>

          {/* Reflection */}
          {promise.reflection && (
            <div className="border-l-2 border-gray-200 pl-3">
              <p className="text-xs text-gray-400 mb-0.5">Reflection</p>
              <p className="text-sm text-gray-600 italic">
                {promise.reflection}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-sm text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
