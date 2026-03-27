"use client";

import { useState, useCallback, useMemo } from "react";
import { useGardenState } from "@/lib/garden/gardenState";
import type { GardenPromise, AccountabilityPartner, SensorConnection } from "@/lib/types/personal";
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

// Phase 2 components
import { ZoomController, type ZoomLevel } from "@/components/garden/ZoomController";
import { RootSystem } from "@/components/garden/RootSystem";
import { DependencyEdge } from "@/components/garden/DependencyEdge";
import { CascadeAnimation } from "@/components/garden/CascadeAnimation";
import { SubPromiseCreator } from "@/components/personal/SubPromiseCreator";
import { DependencyEditor } from "@/components/personal/DependencyEditor";
import { PartnerSetup } from "@/components/personal/PartnerSetup";
import { SharedGardenPlot } from "@/components/personal/SharedGardenPlot";
import { SensorConnect } from "@/components/personal/SensorConnect";
import { SensorThreshold } from "@/components/personal/SensorThreshold";

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

// ─── CASCADE STRESS COMPUTATION ──────────────────────────────────────────────

/** Returns a set of promise IDs that are under cascade stress. */
function computeCascadeStress(promises: Record<string, GardenPromise>): Set<string> {
  const stressed = new Set<string>();
  for (const [id, p] of Object.entries(promises)) {
    if (p.status === "degraded" || p.status === "violated") {
      for (const other of Object.values(promises)) {
        if (other.depends_on.includes(id)) {
          stressed.add(other.id);
        }
      }
    }
  }
  return stressed;
}

/** Returns the source promise that is causing stress for a given promise. */
function stressSource(
  promise: GardenPromise,
  promises: Record<string, GardenPromise>
): GardenPromise | null {
  for (const depId of promise.depends_on) {
    const dep = promises[depId];
    if (dep && (dep.status === "degraded" || dep.status === "violated")) return dep;
  }
  return null;
}

// ─── PLANT ITEM ──────────────────────────────────────────────────────────────

function PlantItem({
  promise,
  allPromises,
  zoomLevel,
  isStressed,
  onCheckIn,
  onFrequency,
  onSubPromise,
  onDependency,
  onPartner,
  onSensor,
  onChildCheckIn,
}: {
  promise: GardenPromise;
  allPromises: Record<string, GardenPromise>;
  zoomLevel: ZoomLevel;
  isStressed: boolean;
  onCheckIn: () => void;
  onFrequency: () => void;
  onSubPromise: () => void;
  onDependency: () => void;
  onPartner: () => void;
  onSensor: () => void;
  onChildCheckIn: (childId: string) => void;
}) {
  const due = isDue(promise);
  const children = promise.children
    .map((id) => allPromises[id])
    .filter(Boolean) as GardenPromise[];
  const showRoots = zoomLevel >= 3;

  return (
    <div
      className={`bg-white rounded-xl border p-4 transition-all ${
        isStressed ? "border-amber-300 shadow-amber-100 shadow-sm" : ""
      }`}
    >
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
            {promise.sensor && (
              <span className="px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-700">
                sensor
              </span>
            )}
            {promise.partner && (
              <span className="px-2 py-0.5 text-xs rounded bg-purple-50 text-purple-700">
                {promise.partner.inviteStatus === "accepted" ? "partnered" : "invite sent"}
              </span>
            )}
            {promise.children.length > 0 && (
              <span className="px-2 py-0.5 text-xs rounded bg-gray-50 text-gray-500">
                {promise.children.length} sub
              </span>
            )}
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

          {/* Dependency stress indicator */}
          {isStressed && (
            <p className="text-xs text-amber-600 mt-1">
              Dependency struggling
            </p>
          )}

          {/* Dependency edges */}
          <DependencyEdge promise={promise} allPromises={allPromises} />
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
            every {Math.round(promise.checkInFrequency.adaptive)}d
          </button>
        </div>
      </div>

      {/* Phase 2 action row */}
      <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-gray-50">
        <button
          onClick={onSubPromise}
          className="flex-1 py-1 text-xs text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-green-600"
          aria-label="Break this down into sub-promises"
          title="Break down"
        >
          Break down{promise.children.length > 0 ? ` (${promise.children.length})` : ""}
        </button>
        <button
          onClick={onDependency}
          className="flex-1 py-1 text-xs text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-blue-600"
          aria-label="Edit dependencies"
          title="Dependencies"
        >
          Depends{promise.depends_on.length > 0 ? ` (${promise.depends_on.length})` : ""}
        </button>
        <button
          onClick={onPartner}
          className="flex-1 py-1 text-xs text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-purple-600"
          aria-label="Accountability partner settings"
          title="Partner"
        >
          Partner{promise.partner ? " ✓" : ""}
        </button>
        <button
          onClick={onSensor}
          className="flex-1 py-1 text-xs text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-blue-600"
          aria-label="Connect a sensor"
          title="Sensor"
        >
          Sensor{promise.sensor ? " ✓" : ""}
        </button>
      </div>

      {/* Root system — visible at zoom level 3 */}
      {children.length > 0 && (
        <RootSystem
          parent={promise}
          children={children}
          visible={showRoots}
          onSelectChild={onChildCheckIn}
        />
      )}
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
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(1);

  // Phase 1 modal state
  const [checkInId, setCheckInId] = useState<string | null>(null);
  const [renegotiateId, setRenegotiateId] = useState<string | null>(null);
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [frequencyId, setFrequencyId] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);

  // Phase 2 modal state
  const [subPromiseId, setSubPromiseId] = useState<string | null>(null);
  const [dependencyId, setDependencyId] = useState<string | null>(null);
  const [partnerSetupId, setPartnerSetupId] = useState<string | null>(null);
  const [sensorConnectId, setSensorConnectId] = useState<string | null>(null);
  const [sensorThresholdId, setSensorThresholdId] = useState<string | null>(null);

  // Cascade alerts: { affectedId, sourceId }
  const [cascadeAlerts, setCascadeAlerts] = useState<{ affectedId: string; sourceId: string }[]>([]);

  const promises = useMemo(() => Object.values(state.promises), [state.promises]);

  const activePromises = useMemo(
    () => promises.filter((p) => !p.fossilized && p.status !== "violated" && p.artifact === null && !p.parent),
    [promises]
  );

  const dormantPromises = useMemo(
    () => promises.filter((p) => p.status === "violated" && !p.fossilized && p.artifact === null && !p.parent),
    [promises]
  );

  const sharedPromises = useMemo(
    () => promises.filter((p) => p.partner !== null),
    [promises]
  );

  const dueCount = useMemo(
    () => activePromises.filter(isDue).length,
    [activePromises]
  );

  const weather = useMemo(() => computeWeather(promises), [promises]);
  const skyGradient = weatherToGradient(weather);

  // Cascade stress — derived from promise states
  const cascadeStress = useMemo(
    () => computeCascadeStress(state.promises),
    [state.promises]
  );

  // ── Phase 1 handlers ────────────────────────────────────────────────────────

  const handleCheckIn = useCallback(
    (promiseId: string, newStatus: PromiseStatus, note?: string) => {
      const prev = state.promises[promiseId];
      dispatch({ type: "CHECK_IN", promiseId, newStatus, note });

      // After check-in, detect new cascade stress
      if (newStatus === "degraded" || newStatus === "violated") {
        for (const other of Object.values(state.promises)) {
          if (other.depends_on.includes(promiseId) && other.id !== promiseId) {
            setCascadeAlerts((prev) => [
              ...prev.filter((a) => a.affectedId !== other.id),
              { affectedId: other.id, sourceId: promiseId },
            ]);
          }
        }
      }

      // suppress unused variable warning
      void prev;
    },
    [dispatch, state.promises]
  );

  const handleGardenStatus = useCallback(
    (id: string, status: PromiseStatus, note?: string) => {
      handleCheckIn(id, status, note);
    },
    [handleCheckIn]
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

  // ── Phase 2 handlers ────────────────────────────────────────────────────────

  const handleAddSubPromise = useCallback(
    (parentId: string, sub: GardenPromise) => {
      dispatch({ type: "CREATE_SUB_PROMISE", parentId, promise: sub });
    },
    [dispatch]
  );

  const handleAddDependency = useCallback(
    (fromId: string, toId: string) => {
      dispatch({ type: "ADD_DEPENDENCY", fromId, toId });
    },
    [dispatch]
  );

  const handleRemoveDependency = useCallback(
    (fromId: string, toId: string) => {
      dispatch({ type: "REMOVE_DEPENDENCY", fromId, toId });
    },
    [dispatch]
  );

  const handleSetPartner = useCallback(
    (promiseId: string, partner: AccountabilityPartner) => {
      dispatch({ type: "SET_PARTNER", promiseId, partner });
    },
    [dispatch]
  );

  const handleRemovePartner = useCallback(
    (promiseId: string) => {
      dispatch({ type: "REMOVE_PARTNER", promiseId });
    },
    [dispatch]
  );

  const handlePartnerWater = useCallback(
    (promiseId: string) => {
      dispatch({ type: "PARTNER_WATER", promiseId });
    },
    [dispatch]
  );

  const handleConnectSensor = useCallback(
    (promiseId: string, sensor: SensorConnection) => {
      dispatch({ type: "CONNECT_SENSOR", promiseId, sensor });
    },
    [dispatch]
  );

  const handleDisconnectSensor = useCallback(
    (promiseId: string) => {
      dispatch({ type: "DISCONNECT_SENSOR", promiseId });
    },
    [dispatch]
  );

  const handleSensorUpdate = useCallback(
    (promiseId: string, newStatus: PromiseStatus) => {
      dispatch({ type: "SENSOR_UPDATE", promiseId, newStatus });
      setSensorThresholdId(null);
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

  // ── Derived modal targets ────────────────────────────────────────────────────

  const checkInPromise = checkInId ? state.promises[checkInId] : null;
  const renegotiatePromise = renegotiateId ? state.promises[renegotiateId] : null;
  const completePromise = completeId ? state.promises[completeId] : null;
  const frequencyPromise = frequencyId ? state.promises[frequencyId] : null;
  const subPromiseTarget = subPromiseId ? state.promises[subPromiseId] : null;
  const dependencyTarget = dependencyId ? state.promises[dependencyId] : null;
  const partnerSetupTarget = partnerSetupId ? state.promises[partnerSetupId] : null;
  const sensorConnectTarget = sensorConnectId ? state.promises[sensorConnectId] : null;
  const sensorThresholdTarget = sensorThresholdId ? state.promises[sensorThresholdId] : null;

  const firstCascadeAlert = cascadeAlerts[0] ?? null;

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
            {/* Canvas — wrapped in ZoomController */}
            <div className="rounded-2xl overflow-hidden border">
              <ZoomController onZoomChange={setZoomLevel} defaultLevel={1}>
                {(level) => (
                  <GardenView
                    promises={activePromises as unknown as PersonalPromise[]}
                    onUpdateStatus={handleGardenStatus}
                    skyGradientOverride={skyGradient}
                    gardenAriaLabel={`Promise garden. ${activePromises.length} active promise${activePromises.length !== 1 ? "s" : ""}. ${weatherLabel(weather)}. Zoom: ${level === 0 ? "landscape" : level === 1 ? "garden" : level === 2 ? "plant detail" : "roots"}.`}
                    minHeight="240px"
                  />
                )}
              </ZoomController>
            </div>

            {/* Shared garden plot */}
            {sharedPromises.length > 0 && (
              <SharedGardenPlot
                sharedPromises={sharedPromises}
                onWater={(id) => { handlePartnerWater(id); }}
                onCheckIn={(id) => setCheckInId(id)}
              />
            )}

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
                    allPromises={state.promises}
                    zoomLevel={zoomLevel}
                    isStressed={cascadeStress.has(p.id)}
                    onCheckIn={() => setCheckInId(p.id)}
                    onFrequency={() => {
                      if (p.sensor) {
                        setSensorThresholdId(p.id);
                      } else {
                        setFrequencyId(p.id);
                      }
                    }}
                    onSubPromise={() => setSubPromiseId(p.id)}
                    onDependency={() => setDependencyId(p.id)}
                    onPartner={() => setPartnerSetupId(p.id)}
                    onSensor={() => setSensorConnectId(p.id)}
                    onChildCheckIn={(childId) => setCheckInId(childId)}
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
                      allPromises={state.promises}
                      zoomLevel={zoomLevel}
                      isStressed={cascadeStress.has(p.id)}
                      onCheckIn={() => setCheckInId(p.id)}
                      onFrequency={() => setFrequencyId(p.id)}
                      onSubPromise={() => setSubPromiseId(p.id)}
                      onDependency={() => setDependencyId(p.id)}
                      onPartner={() => setPartnerSetupId(p.id)}
                      onSensor={() => setSensorConnectId(p.id)}
                      onChildCheckIn={(childId) => setCheckInId(childId)}
                    />
                  ))}
                </div>
              </details>
            )}

            {/* Add new */}
            <button
              onClick={() => {
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

      {/* Phase 1 modals */}
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

      {/* Phase 2 modals */}
      {subPromiseTarget && (
        <SubPromiseCreator
          promise={subPromiseTarget}
          subPromises={
            subPromiseTarget.children
              .map((id) => state.promises[id])
              .filter(Boolean) as GardenPromise[]
          }
          onAdd={handleAddSubPromise}
          onClose={() => setSubPromiseId(null)}
        />
      )}

      {dependencyTarget && (
        <DependencyEditor
          promise={dependencyTarget}
          allPromises={promises}
          onAdd={handleAddDependency}
          onRemove={handleRemoveDependency}
          onClose={() => setDependencyId(null)}
        />
      )}

      {partnerSetupTarget && (
        <PartnerSetup
          promise={partnerSetupTarget}
          onSave={handleSetPartner}
          onRemove={handleRemovePartner}
          onClose={() => setPartnerSetupId(null)}
        />
      )}

      {sensorConnectTarget && (
        <SensorConnect
          promise={sensorConnectTarget}
          onConnect={handleConnectSensor}
          onDisconnect={handleDisconnectSensor}
          onClose={() => setSensorConnectId(null)}
        />
      )}

      {sensorThresholdTarget && sensorThresholdTarget.sensor && (
        <SensorThreshold
          promise={sensorThresholdTarget}
          onSimulate={handleSensorUpdate}
          onClose={() => setSensorThresholdId(null)}
        />
      )}

      {/* Cascade stress notification — one at a time */}
      {firstCascadeAlert &&
        state.promises[firstCascadeAlert.affectedId] &&
        state.promises[firstCascadeAlert.sourceId] && (
          <CascadeAnimation
            affectedPromise={state.promises[firstCascadeAlert.affectedId]}
            sourcePromise={state.promises[firstCascadeAlert.sourceId]}
            onDismiss={() =>
              setCascadeAlerts((prev) =>
                prev.filter(
                  (a) => a.affectedId !== firstCascadeAlert.affectedId
                )
              )
            }
          />
        )}
    </main>
  );
}
