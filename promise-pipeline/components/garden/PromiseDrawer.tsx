"use client";

import { useEffect, useState } from "react";
import type { GardenPromise } from "@/lib/types/personal";
import { isDue } from "@/lib/garden/adaptiveCheckin";
import { ContributionPlant } from "@/components/personal/ContributionPlant";
import type { GardenAction } from "@/lib/garden/gardenState";

// Type pulled from ContributionPlant's props so we don't need to re-import ContributionState
type ContributionProp = React.ComponentProps<typeof ContributionPlant>["contribution"];

const STATUS_LABELS: Record<string, string> = {
  declared:     "Declared",
  verified:     "On track",
  degraded:     "Slipping",
  violated:     "Dormant",
  unverifiable: "Unverifiable",
};

const STATUS_COLORS: Record<string, string> = {
  declared:     "bg-blue-50 text-blue-700",
  verified:     "bg-green-50 text-green-700",
  degraded:     "bg-amber-50 text-amber-700",
  violated:     "bg-gray-100 text-gray-500",
  unverifiable: "bg-gray-50 text-gray-400",
};

interface PromiseDrawerProps {
  activePromises: GardenPromise[];
  dormantPromises: GardenPromise[];
  cascadeStress: Set<string>;
  contribution: ContributionProp;
  dispatch: React.Dispatch<GardenAction>;
  /** Called with the promise ID when a promise row is tapped — opens PlantBottomSheet */
  onSelectPromise: (id: string) => void;
  onNewPromise: () => void;
  onClose: () => void;
}

export function PromiseDrawer({
  activePromises,
  dormantPromises,
  cascadeStress,
  contribution,
  dispatch,
  onSelectPromise,
  onNewPromise,
  onClose,
}: PromiseDrawerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  function close() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  function act(fn: () => void) {
    close();
    setTimeout(fn, 300);
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      {/* Scrim — click to close */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[3px] transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        aria-hidden="true"
        onClick={close}
      />

      {/* Sheet */}
      <div
        className="relative bg-white/96 backdrop-blur-md rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out flex flex-col"
        style={{
          transform: visible ? "translateY(0)" : "translateY(100%)",
          maxHeight: "80vh",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Promise list"
      >
        {/* Handle — tap to close */}
        <button
          className="flex justify-center pt-3 pb-2 w-full flex-shrink-0"
          onClick={close}
          aria-label="Close promise list"
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full" aria-hidden="true" />
        </button>

        {/* Header row */}
        <div className="flex items-center justify-between px-5 pb-3 flex-shrink-0">
          <h2 className="font-serif text-base font-bold text-gray-900">
            {activePromises.length === 0
              ? "No active promises"
              : `${activePromises.length} promise${activePromises.length !== 1 ? "s" : ""}`}
          </h2>
          <button
            onClick={() => act(onNewPromise)}
            className="px-3 py-1.5 text-xs text-green-700 border border-green-300 rounded-lg hover:bg-green-50 transition-colors focus-visible:outline-2 focus-visible:outline-green-600"
          >
            + New
          </button>
        </div>

        {/* Scrollable list */}
        <div
          id="promise-list"
          className="overflow-y-auto px-5 pb-6 space-y-2 flex-1"
          role="list"
          aria-label="Active promises"
        >
          {activePromises.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">No promises yet. Plant something.</p>
            </div>
          )}

          {activePromises.map((p) => {
            const due = isDue(p);
            const stressed = cascadeStress.has(p.id);
            return (
              <button
                key={p.id}
                role="listitem"
                onClick={() => act(() => onSelectPromise(p.id))}
                className={`w-full text-left rounded-xl border px-4 py-3 transition-all hover:shadow-sm active:scale-[0.99] ${
                  stressed
                    ? "border-amber-200 bg-amber-50/40"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900 leading-snug flex-1 min-w-0">
                    {p.body}
                  </p>
                  <div className="flex-shrink-0 flex flex-wrap gap-1 justify-end">
                    <span className={`px-1.5 py-0.5 text-xs rounded ${STATUS_COLORS[p.status] ?? "bg-gray-50 text-gray-400"}`}>
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                    {due && (
                      <span className="px-1.5 py-0.5 text-xs rounded bg-amber-100 text-amber-700">
                        due
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">{p.domain}</p>
              </button>
            );
          })}

          {dormantPromises.length > 0 && (
            <details className="mt-2">
              <summary className="text-xs text-gray-400 cursor-pointer select-none py-2 hover:text-gray-600">
                Dormant ({dormantPromises.length}) — roots still here
              </summary>
              <div className="mt-2 space-y-2">
                {dormantPromises.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => act(() => onSelectPromise(p.id))}
                    className="w-full text-left rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 opacity-60 hover:opacity-90 transition-opacity"
                  >
                    <p className="text-sm text-gray-600 leading-snug">{p.body}</p>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{p.domain}</p>
                  </button>
                ))}
              </div>
            </details>
          )}

          {/* Contribution plant at the bottom of the list */}
          <div className="pt-2">
            <ContributionPlant contribution={contribution} dispatch={dispatch} />
          </div>
        </div>
      </div>
    </div>
  );
}
