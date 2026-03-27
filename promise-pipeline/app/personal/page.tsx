"use client";

import { useState, useCallback, useMemo } from "react";
import { useGardenState } from "@/lib/garden/gardenState";
import type { GardenPromise } from "@/lib/types/personal";
import type { PromiseStatus } from "@/lib/types/promise";
import { computeWeather, weatherToGradient, weatherLabel } from "@/lib/garden/weatherComputation";
import { isDue } from "@/lib/garden/adaptiveCheckin";

// Existing v1 canvas renderer — GardenPromise satisfies PersonalPromise structurally
import { GardenView } from "@/components/personal/GardenView";
import type { PersonalPromise } from "@/lib/types/personal";

// v2 components
import { OnboardingFlow } from "@/components/personal/OnboardingFlow";
import { GardenTour } from "@/components/personal/GardenTour";
import { CheckInCard } from "@/components/personal/CheckInCard";
import { RenegotiateModal } from "@/components/personal/RenegotiateModal";
import { CompletionFlow } from "@/components/personal/CompletionFlow";
import { CollectionView } from "@/components/personal/CollectionView";
import { GardenStats } from "@/components/personal/GardenStats";
import { FrequencySettings } from "@/components/personal/FrequencySettings";

type Tab = "garden" | "collection" | "stats";

// ─── STATUS DISPLAY HELPERS ──────────────────────────────────────────────────

const STATUS_LABELS: Record<PromiseStatus, string> = {
  declared:     "Declared",
  verified:     "On track",
  degraded:     "Slipping",
  violated:     "Dormant",
  unverifiable: "Unverifiable",
};

const STATUS_COLORS: Record<PromiseStatus, string> = {
  declared:     "bg-blue-50 text-blue-700",
  verified:     "bg-green-50 text-green-700",
  degraded:     "bg-amber-50 text-amber-700",
  violated:     "bg-gray-100 text-gray-500",
  unverifiable: "bg-gray-50 text-gray-400",
};

const K_COLORS: Record<string, string> = {
  composting: "#d97706",
  ecological: "#059669",
  physics:    "#2563eb",
};

// ─── PLANT ITEM ──────────────────────────────────────────────────────────────

function PlantItem({
  promise,
  onCheckIn,
  onFrequency,
}: {
  promise: GardenPromise;
  onCheckIn: () => void;
  onFrequency: () => void;
}) {
  const due = isDue(promise);

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 leading-snug">{promise.body}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className={`px-2 py-0.5 text-xs rounded ${STATUS_COLORS[promise.status]}`}>
              {STATUS_LABELS[promise.status]}
            </span>
            <span
              className="px-2 py-0.5 text-xs rounded"
              style={{
                background: K_COLORS[promise.kRegime] + "18",
                color: K_COLORS[promise.kRegime],
              }}
            >
              {promise.kRegime}
            </span>
            {promise.graftHistory.length > 0 && (
              <span className="text-xs text-gray-400">
                {promise.graftHistory.length}× renegotiated
              </span>
            )}
          </div>
          {promise.lastCheckIn && (
            <p className="text-xs text-gray-400 mt-1">
              Last:{" "}
              {new Date(promise.lastCheckIn).toLocaleDateString()}
              {due && (
                <span className="ml-1 text-amber-600">· due now</span>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <button
            onClick={onCheckIn}
            className="px-3 py-1.5 text-xs font-semibold bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors focus-visible:outline-2 focus-visible:outline-green-600"
            aria-label={`Check in on: ${promise.body}`}
          >
            Check in
          </button>
          <button
            onClick={onFrequency}
            className="text-xs text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-gray-400"
            aria-label={`Frequency settings for: ${promise.body}`}
          >
            ⚙ every {Math.round(promise.checkInFrequency.adaptive)}d
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN-READER DESCRIPTION ───────────────────────────────────────────────

function GardenSRDescription({ promises }: { promises: GardenPromise[] }) {
  const byDomain = useMemo(() => {
    const acc: Record<string, GardenPromise[]> = {};
    promises.forEach((p) => {
      (acc[p.domain] = acc[p.domain] ?? []).push(p);
    });
    return acc;
  }, [promises]);

  return (
    <div className="sr-only" aria-live="polite">
      {Object.entries(byDomain).map(([domain, ps]) => (
        <p key={domain}>
          {domain} garden: {ps.length} promise{ps.length !== 1 ? "s" : ""}.{" "}
          {ps.map((p) => `${p.body}: ${STATUS_LABELS[p.status]}`).join(". ")}.
        </p>
      ))}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function PersonalPage() {
  const { state, dispatch } = useGardenState();
  const [activeTab, setActiveTab] = useState<Tab>("garden");
  const [checkInId, setCheckInId] = useState<string | null>(null);
  const [renegotiateId, setRenegotiateId] = useState<string | null>(null);
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [frequencyId, setFrequencyId] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);

  const promises = useMemo(() => Object.values(state.promises), [state.promises]);

  const activePromises = useMemo(
    () => promises.filter((p) => !p.fossilized && p.status !== "violated" && p.artifact === null),
    [promises]
  );

  const dormantPromises = useMemo(
    () => promises.filter((p) => p.status === "violated" && !p.fossilized && p.artifact === null),
    [promises]
  );

  const dueCount = useMemo(
    () => activePromises.filter(isDue).length,
    [activePromises]
  );

  const weather = useMemo(() => computeWeather(promises), [promises]);
  const skyGradient = weatherToGradient(weather);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleCheckIn = useCallback(
    (promiseId: string, newStatus: PromiseStatus, note?: string) => {
      dispatch({ type: "CHECK_IN", promiseId, newStatus, note });
    },
    [dispatch]
  );

  const handleGardenStatus = useCallback(
    (id: string, status: PromiseStatus, note?: string) => {
      dispatch({ type: "CHECK_IN", promiseId: id, newStatus: status, note });
    },
    [dispatch]
  );

  const handleRenegotiate = useCallback(
    (promiseId: string, newBody: string, reason: string) => {
      dispatch({ type: "RENEGOTIATE", promiseId, newBody, reason });
      setRenegotiateId(null);
    },
    [dispatch]
  );

  const handleComplete = useCallback(
    (promiseId: string, reflection?: string) => {
      dispatch({ type: "COMPLETE", promiseId, reflection });
      setCompleteId(null);
    },
    [dispatch]
  );

  const handleFossilize = useCallback(
    (promiseId: string) => { dispatch({ type: "FOSSILIZE", promiseId }); },
    [dispatch]
  );

  const handleRevive = useCallback(
    (promiseId: string) => { dispatch({ type: "REVIVE", promiseId }); },
    [dispatch]
  );

  const handleFrequency = useCallback(
    (promiseId: string, min: number, max: number) => {
      dispatch({ type: "UPDATE_FREQUENCY", promiseId, min, max });
    },
    [dispatch]
  );

  // ── Onboarding gate ─────────────────────────────────────────────────────────

  if (!state.onboardingComplete) {
    return (
      <OnboardingFlow
        onComplete={(newPromises) => {
          newPromises.forEach((p) => dispatch({ type: "CREATE_PROMISE", promise: p }));
          dispatch({ type: "COMPLETE_ONBOARDING" });
          setShowTour(true);
        }}
      />
    );
  }

  // ── Modals ──────────────────────────────────────────────────────────────────

  const checkInPromise = checkInId ? state.promises[checkInId] : null;
  const renegotiatePromise = renegotiateId ? state.promises[renegotiateId] : null;
  const completePromise = completeId ? state.promises[completeId] : null;
  const frequencyPromise = frequencyId ? state.promises[frequencyId] : null;

  // ── Tab config ──────────────────────────────────────────────────────────────

  const tabs: { id: Tab; label: string }[] = [
    { id: "garden",     label: "Garden" },
    { id: "collection", label: "Collection" },
    { id: "stats",      label: "Stats" },
  ];

  return (
    <main id="main-content" className="min-h-screen" style={{ background: "#faf9f6" }}>
      {/* Skip link */}
      <a
        href="#promise-list"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-white focus:text-gray-900 focus:rounded focus:shadow"
      >
        Skip to promise list
      </a>

      <GardenSRDescription promises={promises} />

      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-3">
        <div className="flex items-baseline justify-between">
          <h1 className="font-serif text-2xl font-bold text-gray-900">Promise Garden</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{weatherLabel(weather)}</span>
            {dueCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                {dueCount} due
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 mb-4">
        <div className="flex gap-2" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-green-600 ${
                activeTab === t.id
                  ? "bg-green-700 text-white"
                  : "bg-white text-gray-700 border hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">

        {/* ── GARDEN ── */}
        {activeTab === "garden" && (
          <div className="space-y-4">
            {/* Canvas */}
            <div className="rounded-2xl overflow-hidden border">
              <GardenView
                promises={activePromises as unknown as PersonalPromise[]}
                onUpdateStatus={handleGardenStatus}
                skyGradientOverride={skyGradient}
                gardenAriaLabel={`Promise garden. ${activePromises.length} active promise${activePromises.length !== 1 ? "s" : ""}. ${weatherLabel(weather)}.`}
                minHeight="240px"
              />
            </div>

            {/* Active promise list */}
            <div
              id="promise-list"
              role="list"
              aria-label="Active promises"
              className="space-y-3"
            >
              {activePromises.map((p) => (
                <div key={p.id} role="listitem">
                  <PlantItem
                    promise={p}
                    onCheckIn={() => setCheckInId(p.id)}
                    onFrequency={() => setFrequencyId(p.id)}
                  />
                </div>
              ))}
            </div>

            {/* Dormant */}
            {dormantPromises.length > 0 && (
              <details className="bg-white rounded-xl border">
                <summary className="px-4 py-3 text-sm text-gray-500 cursor-pointer select-none">
                  Dormant ({dormantPromises.length}) — roots still here
                </summary>
                <div className="px-4 pb-4 space-y-2 border-t pt-3">
                  {dormantPromises.map((p) => (
                    <PlantItem
                      key={p.id}
                      promise={p}
                      onCheckIn={() => setCheckInId(p.id)}
                      onFrequency={() => setFrequencyId(p.id)}
                    />
                  ))}
                </div>
              </details>
            )}

            {/* Add new */}
            <button
              onClick={() => {
                // Re-open onboarding for additional promises by resetting the flag
                // (only for adding more — existing garden preserved via state.promises)
                dispatch({ type: "COMPLETE_ONBOARDING" });
              }}
              className="w-full py-3 text-sm text-green-700 border border-dashed border-green-300 rounded-xl hover:bg-green-50 transition-colors focus-visible:outline-2 focus-visible:outline-green-600"
            >
              + New promise
            </button>
          </div>
        )}

        {/* ── COLLECTION ── */}
        {activeTab === "collection" && (
          <CollectionView promises={promises} />
        )}

        {/* ── STATS ── */}
        {activeTab === "stats" && (
          <GardenStats stats={state.stats} />
        )}
      </div>

      {/* ── OVERLAYS ── */}

      {showTour && !state.tourComplete && (
        <GardenTour
          onComplete={() => { dispatch({ type: "COMPLETE_TOUR" }); setShowTour(false); }}
          onDismiss={() => { dispatch({ type: "COMPLETE_TOUR" }); setShowTour(false); }}
        />
      )}

      {checkInPromise && (
        <CheckInCard
          promise={checkInPromise}
          onCheckIn={(id, status, note) => { handleCheckIn(id, status, note); setCheckInId(null); }}
          onRenegotiate={(id) => { setCheckInId(null); setRenegotiateId(id); }}
          onComplete={(id) => { setCheckInId(null); setCompleteId(id); }}
          onFossilize={(id) => { handleFossilize(id); setCheckInId(null); }}
          onRevive={(id) => { handleRevive(id); setCheckInId(null); }}
          onClose={() => setCheckInId(null)}
        />
      )}

      {renegotiatePromise && (
        <RenegotiateModal
          promise={renegotiatePromise}
          onConfirm={handleRenegotiate}
          onClose={() => setRenegotiateId(null)}
        />
      )}

      {completePromise && (
        <CompletionFlow
          promise={completePromise}
          onConfirm={handleComplete}
          onClose={() => setCompleteId(null)}
        />
      )}

      {frequencyPromise && (
        <FrequencySettings
          promise={frequencyPromise}
          onSave={handleFrequency}
          onClose={() => setFrequencyId(null)}
        />
      )}
    </main>
  );
}
