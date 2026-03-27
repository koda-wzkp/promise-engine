"use client";

/**
 * Promise Garden v2 — Phase 1: Personal Garden MVP
 *
 * Route: /personal
 *
 * Single flat garden view with:
 * - Procedurally generated plants based on k regime + domain
 * - Adaptive check-in system with Zeno detection
 * - Weather system based on g_obs / g_dec ratio
 * - Collection for kept promises (artifacts)
 * - Fossilization for broken promises
 * - Full localStorage persistence, no server calls, no auth
 *
 * Neurodivergent design:
 * - No streak counters or consecutive-day tracking
 * - No red/urgent/overdue indicators
 * - No shame language
 * - Dormant plants are grey and waiting, not angry
 * - Returning after a gap gets a warm welcome
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import type { GardenPromise } from "@/lib/types/personal";
import { createGardenPromise } from "@/lib/types/personal";
import type { PromiseStatus } from "@/lib/types/promise";
import { useGardenState } from "@/lib/garden/gardenState";
import { isCheckInDue } from "@/lib/garden/adaptiveCheckin";
import { GardenView } from "@/components/personal/GardenView";
import { OnboardingFlow } from "@/components/personal/OnboardingFlow";
import { GardenTour } from "@/components/personal/GardenTour";
import { CheckInCard } from "@/components/personal/CheckInCard";
import { RenegotiateModal } from "@/components/personal/RenegotiateModal";
import { CompletionFlow } from "@/components/personal/CompletionFlow";
import { CollectionView } from "@/components/personal/CollectionView";
import { GardenStats } from "@/components/personal/GardenStats";
import { FrequencySettings } from "@/components/personal/FrequencySettings";
import { PromiseCreator } from "@/components/personal/PromiseCreator";
import { NestedPLogo } from "@/components/brand/NestedPLogo";

type View = "garden" | "collection" | "stats" | "create";

export default function PersonalPage() {
  const { state, dispatch, promiseList, activePromises, dueCheckIns, artifacts, fossils } =
    useGardenState();

  const [view, setView] = useState<View>("garden");
  const [loaded, setLoaded] = useState(false);

  // Modal states
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checkInPromise, setCheckInPromise] = useState<GardenPromise | null>(null);
  const [renegotiatePromise, setRenegotiatePromise] = useState<GardenPromise | null>(null);
  const [completePromise, setCompletePromise] = useState<GardenPromise | null>(null);
  const [frequencyPromise, setFrequencyPromise] = useState<GardenPromise | null>(null);
  const [showTour, setShowTour] = useState(false);

  const promises = useMemo(() => promiseList(), [promiseList]);
  const activeList = useMemo(() => activePromises(), [activePromises]);
  const dueList = useMemo(() => dueCheckIns(), [dueCheckIns]);
  const artifactList = useMemo(() => artifacts(), [artifacts]);
  const fossilList = useMemo(() => fossils(), [fossils]);

  // Mark loaded after first render cycle
  useEffect(() => {
    setLoaded(true);
  }, []);

  // Show tour after onboarding completes and 3+ promises exist
  useEffect(() => {
    if (
      state.onboardingComplete &&
      !state.tourComplete &&
      promises.length >= 3 &&
      !showTour
    ) {
      setShowTour(true);
    }
  }, [state.onboardingComplete, state.tourComplete, promises.length, showTour]);

  // Auto-show check-in for first due promise when opening the app
  useEffect(() => {
    if (loaded && dueList.length > 0 && !checkInPromise && state.onboardingComplete) {
      setCheckInPromise(dueList[0]);
    }
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Handlers ───

  const handleOnboardingComplete = useCallback(
    (newPromises: GardenPromise[], domain: string) => {
      for (const p of newPromises) {
        dispatch({ type: "CREATE_PROMISE", promise: p });
      }
      dispatch({ type: "COMPLETE_ONBOARDING" });
    },
    [dispatch]
  );

  const handleTourComplete = useCallback(() => {
    dispatch({ type: "COMPLETE_TOUR" });
    setShowTour(false);
  }, [dispatch]);

  const handleCheckIn = useCallback(
    (promiseId: string, newStatus: PromiseStatus, note?: string) => {
      dispatch({ type: "CHECK_IN", promiseId, newStatus, note });
      setCheckInPromise(null);
    },
    [dispatch]
  );

  const handleLetGo = useCallback(
    (promiseId: string) => {
      dispatch({ type: "CHECK_IN", promiseId, newStatus: "violated" });
      setCheckInPromise(null);
    },
    [dispatch]
  );

  const handleRenegotiate = useCallback(
    (promiseId: string, newBody: string, reason?: string) => {
      dispatch({ type: "RENEGOTIATE", promiseId, newBody, reason });
      setRenegotiatePromise(null);
    },
    [dispatch]
  );

  const handleComplete = useCallback(
    (promiseId: string, reflection?: string) => {
      dispatch({ type: "COMPLETE", promiseId, reflection });
      setCompletePromise(null);
    },
    [dispatch]
  );

  const handleFossilize = useCallback(
    (promiseId: string) => {
      dispatch({ type: "FOSSILIZE", promiseId });
    },
    [dispatch]
  );

  const handleRevive = useCallback(
    (promiseId: string) => {
      dispatch({ type: "REVIVE", promiseId });
    },
    [dispatch]
  );

  const handleUpdateFrequency = useCallback(
    (promiseId: string, min: number, max: number) => {
      dispatch({ type: "UPDATE_FREQUENCY", promiseId, min, max });
      setFrequencyPromise(null);
    },
    [dispatch]
  );

  const handleCreatePromise = useCallback(
    (promise: GardenPromise) => {
      dispatch({ type: "CREATE_PROMISE", promise });
      setView("garden");
    },
    [dispatch]
  );

  const handleSelectPromise = useCallback(
    (id: string) => {
      if (!id) {
        setSelectedId(null);
        return;
      }
      setSelectedId(id);
    },
    []
  );

  // Get the selected promise object
  const selectedPromise = selectedId ? state.promises[selectedId] : null;

  // ─── Loading gate ───
  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-lightest to-white">
        <p className="text-gray-500">Loading your garden...</p>
      </div>
    );
  }

  // ─── Onboarding (no promises yet, onboarding not complete) ───
  if (!state.onboardingComplete && promises.length === 0) {
    return (
      <main id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-white focus:text-gray-900 focus:rounded focus:shadow"
        >
          Skip to main content
        </a>
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </main>
    );
  }

  // ─── Return after gap message ───
  const hasGapReturn =
    activeList.length === 0 &&
    promises.some((p) => p.status === "violated" || p.fossilized);

  // ─── Main garden layout ───
  const views: { id: View; label: string }[] = [
    { id: "garden", label: "Garden" },
    { id: "collection", label: "Collection" },
    { id: "stats", label: "Stats" },
    { id: "create", label: "+ New" },
  ];

  return (
    <main
      id="main-content"
      className="min-h-screen bg-gradient-to-b from-green-50 via-sky-lightest to-white"
    >
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-white focus:text-gray-900 focus:rounded focus:shadow"
      >
        Skip to main content
      </a>

      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <NestedPLogo mode="grow" size={48} />
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Promise Garden
          </h1>
        </div>
        <p className="text-gray-600 text-sm mt-1">
          Your personal promise tracker. Every promise plants a seed.
        </p>
      </div>

      {/* View tabs */}
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 mb-6" aria-label="Garden views">
        <div className="flex gap-2" role="tablist">
          {views.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={view === v.id}
              aria-controls={`panel-${v.id}`}
              onClick={() => setView(v.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                view === v.id
                  ? "bg-green-700 text-white"
                  : v.id === "create"
                  ? "bg-green-50 text-green-700 hover:bg-green-100"
                  : "bg-white text-gray-700 hover:bg-gray-50 border"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Return after gap */}
      {hasGapReturn && view === "garden" && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-4">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
            Your garden is here. Some plants are dormant. Want to wake one up?
          </div>
        </div>
      )}

      {/* Due check-ins banner */}
      {dueList.length > 0 && view === "garden" && !checkInPromise && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-4">
          <button
            type="button"
            onClick={() => setCheckInPromise(dueList[0])}
            className="w-full bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700 text-left hover:bg-blue-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            {dueList.length === 1
              ? `1 promise is ready for a check-in`
              : `${dueList.length} promises are ready for a check-in`}
          </button>
        </div>
      )}

      {/* Content panels */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        {view === "garden" && (
          <div id="panel-garden" role="tabpanel">
            <GardenView
              promises={promises}
              onSelectPromise={handleSelectPromise}
              selectedId={selectedId}
            />

            {/* Selected promise actions */}
            {selectedPromise && (
              <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 max-w-md mx-auto">
                <p className="font-serif font-semibold text-gray-900 mb-1">
                  {selectedPromise.body}
                </p>
                <p className="text-xs text-gray-400 capitalize mb-3">
                  {selectedPromise.domain} &middot; {selectedPromise.kRegime} &middot;{" "}
                  {selectedPromise.status}
                </p>

                <div className="flex flex-wrap gap-2">
                  {/* Check-in */}
                  {!selectedPromise.fossilized &&
                    selectedPromise.status !== "violated" &&
                    selectedPromise.completedAt === null && (
                      <>
                        <button
                          type="button"
                          onClick={() => setCheckInPromise(selectedPromise)}
                          className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-50 text-green-700 hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
                        >
                          Check in
                        </button>
                        <button
                          type="button"
                          onClick={() => setFrequencyPromise(selectedPromise)}
                          className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
                        >
                          Frequency
                        </button>
                      </>
                    )}

                  {/* Complete (only for verified promises) */}
                  {selectedPromise.status === "verified" &&
                    selectedPromise.completedAt === null && (
                      <button
                        type="button"
                        onClick={() => setCompletePromise(selectedPromise)}
                        className="px-3 py-1.5 text-xs font-medium rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
                      >
                        Mark as kept
                      </button>
                    )}

                  {/* Fossilize (violated promises) */}
                  {selectedPromise.status === "violated" &&
                    !selectedPromise.fossilized && (
                      <button
                        type="button"
                        onClick={() => handleFossilize(selectedPromise.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
                      >
                        Fossilize
                      </button>
                    )}

                  {/* Revive (violated but not fossilized) */}
                  {selectedPromise.status === "violated" &&
                    !selectedPromise.fossilized && (
                      <button
                        type="button"
                        onClick={() => handleRevive(selectedPromise.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
                      >
                        Revive
                      </button>
                    )}

                  {/* Deselect */}
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md"
                  >
                    Close
                  </button>
                </div>

                {/* Check-in history */}
                {selectedPromise.checkInHistory.length > 0 && (
                  <div className="mt-3 border-t pt-2">
                    <p className="text-xs text-gray-400 mb-1">
                      Recent check-ins
                    </p>
                    {selectedPromise.checkInHistory.slice(-3).map((event, i) => (
                      <p key={i} className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleDateString()} —{" "}
                        {event.statusAfter}
                        {event.note && `: ${event.note}`}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {view === "collection" && (
          <div id="panel-collection" role="tabpanel">
            <CollectionView artifacts={artifactList} fossils={fossilList} />
          </div>
        )}

        {view === "stats" && (
          <div id="panel-stats" role="tabpanel">
            <GardenStats stats={state.stats} />
          </div>
        )}

        {view === "create" && (
          <div id="panel-create" role="tabpanel">
            <NewPromiseForm
              domains={state.domains}
              onCreate={handleCreatePromise}
            />
          </div>
        )}
      </div>

      {/* ─── Modals ─── */}

      {/* Check-in modal */}
      {checkInPromise && (
        <ModalOverlay onClose={() => setCheckInPromise(null)}>
          <CheckInCard
            promise={checkInPromise}
            onCheckIn={handleCheckIn}
            onRenegotiate={(id) => {
              setCheckInPromise(null);
              setRenegotiatePromise(state.promises[id]);
            }}
            onLetGo={handleLetGo}
            onDismiss={() => setCheckInPromise(null)}
          />
        </ModalOverlay>
      )}

      {/* Renegotiate modal */}
      {renegotiatePromise && (
        <RenegotiateModal
          promise={renegotiatePromise}
          onRenegotiate={handleRenegotiate}
          onClose={() => setRenegotiatePromise(null)}
        />
      )}

      {/* Completion modal */}
      {completePromise && (
        <CompletionFlow
          promise={completePromise}
          onComplete={handleComplete}
          onClose={() => setCompletePromise(null)}
        />
      )}

      {/* Frequency settings */}
      {frequencyPromise && (
        <ModalOverlay onClose={() => setFrequencyPromise(null)}>
          <FrequencySettings
            promise={frequencyPromise}
            onUpdate={handleUpdateFrequency}
            onClose={() => setFrequencyPromise(null)}
          />
        </ModalOverlay>
      )}

      {/* Tour */}
      {showTour && <GardenTour onComplete={handleTourComplete} />}
    </main>
  );
}

// ─── Utility: modal wrapper ───

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md">{children}</div>
      </div>
    </>
  );
}

// ─── New promise creation form (inline in tab) ───

function NewPromiseForm({
  domains,
  onCreate,
}: {
  domains: string[];
  onCreate: (promise: GardenPromise) => void;
}) {
  const [body, setBody] = useState("");
  const [domain, setDomain] = useState(domains[0] ?? "health");
  const [customDomain, setCustomDomain] = useState("");
  const [verification, setVerification] = useState<"self-report" | "none">(
    "self-report"
  );

  const defaultDomains = ["health", "work", "relationships", "creative", "financial"];
  const allDomains = Array.from(new Set([...defaultDomains, ...domains]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (body.trim().length < 3) return;

    const finalDomain = domain === "custom" ? customDomain.trim().toLowerCase() : domain;
    if (!finalDomain) return;

    const promise = createGardenPromise({
      body: body.trim(),
      domain: finalDomain,
      verificationMethod: verification,
    });

    onCreate(promise);
    setBody("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border p-6 max-w-lg mx-auto"
    >
      <h3 className="font-serif text-lg font-semibold text-gray-900 mb-4">
        Plant a New Promise
      </h3>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="new-promise-body"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            What are you promising?
          </label>
          <textarea
            id="new-promise-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent"
            rows={3}
            placeholder="e.g., Exercise three times a week"
            maxLength={200}
            required
          />
        </div>

        <div>
          <label
            htmlFor="new-promise-domain"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Domain
          </label>
          <select
            id="new-promise-domain"
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value);
              if (e.target.value !== "custom") setCustomDomain("");
            }}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {allDomains.map((d) => (
              <option key={d} value={d}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </option>
            ))}
            <option value="custom">Custom...</option>
          </select>
          {domain === "custom" && (
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm mt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              placeholder="Enter custom domain"
              required
            />
          )}
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-gray-700 mb-1.5">
            How will you track this?
          </legend>
          <div className="flex gap-2">
            <button
              type="button"
              aria-pressed={verification === "self-report"}
              onClick={() => setVerification("self-report")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 ${
                verification === "self-report"
                  ? "bg-[#1a5f4a] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Self check-in
            </button>
            <button
              type="button"
              aria-pressed={verification === "none"}
              onClick={() => setVerification("none")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 ${
                verification === "none"
                  ? "bg-[#1a5f4a] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Decide later
            </button>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={body.trim().length < 3}
          className={[
            "w-full py-2.5 text-sm font-medium rounded-lg transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
            body.trim().length >= 3
              ? "bg-green-700 text-white hover:bg-green-800"
              : "bg-gray-100 text-gray-400 cursor-not-allowed",
          ].join(" ")}
        >
          Plant This Promise
        </button>
      </div>
    </form>
  );
}
