"use client";

import { useState, useEffect, useMemo, useCallback, useRef, useReducer } from "react";
import { PersonalPromise, PersonalStats } from "@/lib/types/personal";
import { PromiseStatus } from "@/lib/types/promise";
import type { GardenPromise, GardenState, CameraState, SensorThreshold, SensorType, PartnerVisibility } from "@/lib/types/garden-phase2";
import { toGardenPromise } from "@/lib/types/garden-phase2";
import { PromiseCreator } from "@/components/personal/PromiseCreator";
import { GardenView } from "@/components/personal/GardenView";
import { PromiseTimeline } from "@/components/personal/PromiseTimeline";
import { ReliabilityScore } from "@/components/personal/ReliabilityScore";
import { DomainBreakdown } from "@/components/personal/DomainBreakdown";
import { ClearcutOverlay } from "@/components/personal/ClearcutOverlay";
import { GardenTimeLapse } from "@/components/personal/GardenTimeLapse";
import { PromiseCreationSheet } from "@/components/personal/PromiseCreationSheet";
import { SeedTray } from "@/components/personal/SeedTray";
import { NotificationPrompt } from "@/components/personal/NotificationPrompt";
import { AccountPrompt } from "@/components/personal/AccountPrompt";
import { DependencyTooltip } from "@/components/personal/DependencyTooltip";
import { SubPromiseCreator } from "@/components/personal/SubPromiseCreator";
import { DependencyEditor } from "@/components/personal/DependencyEditor";
import { PartnerSetup } from "@/components/personal/PartnerSetup";
import { SensorConnect } from "@/components/personal/SensorConnect";
import { SharedGardenPlot } from "@/components/personal/SharedGardenPlot";
import { useGardenOnboarding } from "@/lib/hooks/useGardenOnboarding";
import { gardenReducer, DEFAULT_CAMERA } from "@/lib/garden/gardenReducer";
import { getSkyGradientByCount } from "@/lib/garden/renderer/skyGradient";
import { NestedPLogo } from "@/components/brand/NestedPLogo";

type View = "garden" | "timeline" | "create" | "stats";

/** Phase 2 modal/overlay types */
type Phase2Modal =
  | { type: "break-down"; promiseId: string }
  | { type: "dependency-editor" }
  | { type: "partner-setup"; promiseId: string }
  | { type: "sensor-connect"; promiseId: string }
  | null;

const STORAGE_KEY = "promise-garden-data";

function loadPromises(): PersonalPromise[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePromises(promises: PersonalPromise[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(promises));
}

function calculateStats(promises: PersonalPromise[]): PersonalStats {
  const completed = promises.filter(
    (p) => p.status === "verified" || p.status === "violated"
  );
  const kept = completed.filter((p) => p.status === "verified");
  const active = promises.filter(
    (p) => p.status === "declared" || p.status === "degraded"
  );

  const keptRate = completed.length > 0 ? kept.length / completed.length : 0;

  const keptWithDates = kept.filter((p) => p.createdAt && p.completedAt);
  const mtkp =
    keptWithDates.length > 0
      ? keptWithDates.reduce((sum, p) => {
          const days =
            (new Date(p.completedAt!).getTime() - new Date(p.createdAt).getTime()) /
            (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / keptWithDates.length
      : 0;

  const byDomain: PersonalStats["byDomain"] = {};
  const mtkpByDomain: Record<string, number> = {};
  const allDomains = Array.from(new Set(promises.map((p) => p.domain)));

  for (const domain of allDomains) {
    const dp = promises.filter((p) => p.domain === domain);
    const dCompleted = dp.filter(
      (p) => p.status === "verified" || p.status === "violated"
    );
    const dKept = dp.filter((p) => p.status === "verified");
    const dBroken = dp.filter((p) => p.status === "violated");
    const dActive = dp.filter(
      (p) => p.status === "declared" || p.status === "degraded"
    );

    const dKeptWithDates = dKept.filter((p) => p.createdAt && p.completedAt);
    const dMtkp =
      dKeptWithDates.length > 0
        ? dKeptWithDates.reduce((sum, p) => {
            const days =
              (new Date(p.completedAt!).getTime() - new Date(p.createdAt).getTime()) /
              (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / dKeptWithDates.length
        : 0;

    byDomain[domain] = {
      total: dp.length,
      kept: dKept.length,
      broken: dBroken.length,
      active: dActive.length,
      keptRate: dCompleted.length > 0 ? dKept.length / dCompleted.length : 0,
      mtkp: dMtkp,
    };
    mtkpByDomain[domain] = dMtkp;
  }

  const trend: PersonalStats["trend"] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = month.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthCompleted = completed.filter((p) => {
      if (!p.completedAt) return false;
      const d = new Date(p.completedAt);
      return d <= monthEnd;
    });
    const monthKept = monthCompleted.filter((p) => p.status === "verified");
    trend.push({
      month: monthStr,
      keptRate: monthCompleted.length > 0 ? monthKept.length / monthCompleted.length : 0,
    });
  }

  return {
    totalPromises: promises.length,
    activePromises: active.length,
    keptRate,
    mtkp,
    mtkpByDomain,
    byDomain,
    trend,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PersonalPage() {
  const [promises, setPromises] = useState<PersonalPromise[]>([]);
  const [view, setView] = useState<View>("garden");
  const [loaded, setLoaded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // True while the clearcut time-lapse is playing.
  // Flipped to false when the loop completes or the user taps the seed.
  const [timeLapseActive, setTimeLapseActive] = useState(true);

  // Phase 2: garden reducer for sub-promises, dependencies, partners, sensors
  const [gardenState, dispatch] = useReducer(gardenReducer, {
    promises: [],
    camera: DEFAULT_CAMERA,
    notifications: [],
    partnerInvites: [],
    sharedPlants: [],
  });
  const [phase2Modal, setPhase2Modal] = useState<Phase2Modal>(null);

  const seedRef = useRef<HTMLButtonElement>(null);

  const onboarding = useGardenOnboarding();
  const { state, showAccountPrompt } = onboarding;

  // Load persisted promises on mount
  useEffect(() => {
    setPromises(loadPromises());
    setLoaded(true);
  }, []);

  // Persist promises whenever they change
  useEffect(() => {
    if (loaded) savePromises(promises);
  }, [promises, loaded]);

  // If the user was in the middle of first-plant creation when they last left,
  // auto-open the sheet so they can resume.
  useEffect(() => {
    if (loaded && state.phase === "first-plant" && promises.length === 0) {
      setIsSheetOpen(true);
    }
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => calculateStats(promises), [promises]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  /** Called from both the ClearcutOverlay seed and the SeedTray seeds */
  const handleOpenSheet = useCallback(() => {
    // Stop the time-lapse immediately if it's still running
    setTimeLapseActive(false);
    if (state.phase === "clearcut") {
      onboarding.openSeedForFirstTime();
    }
    setIsSheetOpen(true);
  }, [state.phase, onboarding]);

  const handleSheetClose = useCallback(() => {
    setIsSheetOpen(false);
    // Focus returns to the seed button (clearcut) or garden (subsequent)
    setTimeout(() => seedRef.current?.focus(), 50);
  }, []);

  /**
   * Shared handler for all promise creation paths:
   * ClearcutOverlay → PromiseCreationSheet, SeedTray → PromiseCreationSheet,
   * and the existing "+ New Promise" tab → PromiseCreator.
   */
  const handleCreate = useCallback(
    (promise: PersonalPromise) => {
      setPromises((prev) => {
        const next = [...prev, promise];
        // Sync onboarding count with the real promise array
        onboarding.plantPromise(next.length);
        return next;
      });
      setIsSheetOpen(false);
      setView("garden");
    },
    [onboarding]
  );

  const handleUpdateStatus = useCallback(
    (id: string, status: PromiseStatus, reflection?: string) => {
      setPromises((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          const updated = {
            ...p,
            status,
            reflection: reflection || p.reflection,
            completedAt:
              status === "verified" || status === "violated"
                ? new Date().toISOString()
                : p.completedAt,
          };
          return updated;
        })
      );

      // First check-in: trigger notification prompt
      if (
        (status === "verified" || status === "violated") &&
        !state.firstCheckInComplete
      ) {
        onboarding.completeFirstCheckIn();
      }
    },
    [state.firstCheckInComplete, onboarding]
  );

  // ── Phase 2 Handlers ─────────────────────────────────────────────────────

  const handleBreakDown = useCallback((promiseId: string) => {
    setPhase2Modal({ type: "break-down", promiseId });
  }, []);

  const handleCreateSubPromises = useCallback(
    (subPromises: GardenPromise[]) => {
      if (!phase2Modal || phase2Modal.type !== "break-down") return;
      for (const sub of subPromises) {
        dispatch({
          type: "CREATE_SUB_PROMISE",
          parentId: phase2Modal.promiseId,
          promise: sub,
        });
        // Also add to flat promises array for Phase 1 compat
        setPromises((prev) => [...prev, sub as PersonalPromise]);
      }
      setPhase2Modal(null);
    },
    [phase2Modal]
  );

  const handleAddDependency = useCallback(
    (fromId: string, toId: string) => {
      dispatch({ type: "ADD_DEPENDENCY", fromId, toId });
      // Sync to flat array
      setPromises((prev) =>
        prev.map((p) =>
          p.id === fromId && !p.depends_on.includes(toId)
            ? { ...p, depends_on: [...p.depends_on, toId] }
            : p
        )
      );
    },
    []
  );

  const handleRemoveDependency = useCallback(
    (fromId: string, toId: string) => {
      dispatch({ type: "REMOVE_DEPENDENCY", fromId, toId });
      setPromises((prev) =>
        prev.map((p) =>
          p.id === fromId
            ? { ...p, depends_on: p.depends_on.filter((d) => d !== toId) }
            : p
        )
      );
    },
    []
  );

  const handleSetPartner = useCallback(
    (promiseId: string, partnerEmail: string, visibility: PartnerVisibility) => {
      dispatch({
        type: "SET_PARTNER",
        promiseId,
        partnerId: partnerEmail,
        visibility,
      });
      setPhase2Modal(null);
    },
    []
  );

  const handleConnectSensor = useCallback(
    (
      promiseId: string,
      sensorType: SensorType,
      threshold: SensorThreshold,
      metric: string
    ) => {
      dispatch({ type: "CONNECT_SENSOR", promiseId, sensorType, threshold, metric });
      setPhase2Modal(null);
    },
    []
  );

  const handleDisconnectSensor = useCallback((promiseId: string) => {
    dispatch({ type: "DISCONNECT_SENSOR", promiseId });
    setPhase2Modal(null);
  }, []);

  const handleZoomChange = useCallback((camera: Partial<CameraState>) => {
    dispatch({ type: "SET_ZOOM", camera });
  }, []);

  // Sync gardenState.promises back to reducer when flat array changes
  useEffect(() => {
    if (loaded && promises.length > 0) {
      // We don't fully replace — the reducer is the source of truth for Phase 2 fields
    }
  }, [promises, loaded]);

  // ── Sky gradient (count-based for the new progression) ────────────────────
  const skyGradient = getSkyGradientByCount(promises.length);

  // ── Loading gate ──────────────────────────────────────────────────────────
  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-lightest to-white">
        <p className="text-gray-500">Loading your garden…</p>
      </div>
    );
  }

  // ── Clearcut / First-plant layout ─────────────────────────────────────────
  // Shown when the user hasn't planted any promise yet.
  const isClearcut = promises.length === 0;

  if (isClearcut) {
    return (
      <main id="main-content" className="min-h-screen flex flex-col">
        {/* Skip link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-white focus:text-gray-900 focus:rounded focus:shadow"
        >
          Skip to main content
        </a>

        {/* Full-height garden container */}
        <div className="relative flex-1" style={{ minHeight: "100svh" }}>
          {/*
           * Canvas layer — time-lapse while active, static clearcut after.
           * GardenTimeLapse unmounts when timeLapseActive becomes false, which
           * cancels its RAF loop. The static GardenView it was rendering
           * handshakes with the ClearcutOverlay that's always on top.
           */}
          {timeLapseActive ? (
            <GardenTimeLapse
              onComplete={() => setTimeLapseActive(false)}
              minHeight="100svh"
            />
          ) : (
            <GardenView
              promises={[]}
              onUpdateStatus={() => {}}
              forceRender
              skyGradientOverride={getSkyGradientByCount(0)}
              minHeight="100svh"
            />
          )}

          {/* Clearcut overlay: text + floating seed + stumps — always on top */}
          <ClearcutOverlay onSeedClick={handleOpenSheet} seedRef={seedRef} />
        </div>

        {/* Inline creation sheet (appears on seed tap) */}
        {isSheetOpen && (
          <PromiseCreationSheet
            onSuccess={handleCreate}
            onClose={handleSheetClose}
            returnFocusRef={seedRef}
          />
        )}
      </main>
    );
  }

  // ── Garden-live layout ────────────────────────────────────────────────────
  // Standard layout once at least one promise exists.

  const views: { id: View; label: string }[] = [
    { id: "garden",   label: "Garden" },
    { id: "timeline", label: "Timeline" },
    { id: "stats",    label: "Stats" },
    { id: "create",   label: "+ New Promise" },
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
          Your personal promise tracker. Every promise plants a seed. Keeping them grows the garden.
        </p>
      </div>

      {/* View tabs */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex gap-2">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
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
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        {view === "garden" && (
          <div className="relative">
            <GardenView
              promises={promises}
              onUpdateStatus={handleUpdateStatus}
              skyGradientOverride={skyGradient}
              camera={gardenState.camera}
              onZoomChange={handleZoomChange}
              onBreakDown={handleBreakDown}
              onAddPartner={(id) => setPhase2Modal({ type: "partner-setup", promiseId: id })}
              onConnectSensor={(id) => setPhase2Modal({ type: "sensor-connect", promiseId: id })}
              onLinkDependencies={() => setPhase2Modal({ type: "dependency-editor" })}
            />

            {/* Dependency tooltip — after 3rd promise, one-time */}
            {state.promisesPlanted >= 3 && !state.dependencyTutorialSeen && (
              <DependencyTooltip onDismiss={onboarding.dismissDependencyTooltip} />
            )}

            {/* Phase 2: Shared garden plot (accountability partners) */}
            {gardenState.sharedPlants.length > 0 && (
              <div className="mt-6">
                <SharedGardenPlot
                  plants={gardenState.sharedPlants}
                  onWater={(id) => dispatch({ type: "PARTNER_WATER", promiseId: id })}
                  onEncourage={(id) =>
                    dispatch({
                      type: "ADD_NOTIFICATION",
                      notification: {
                        id: `notif-${Date.now()}`,
                        type: "partner-encouragement",
                        promiseId: id,
                        message: "You sent encouragement!",
                        timestamp: new Date().toISOString(),
                        read: false,
                        channel: "push",
                      },
                    })
                  }
                />
              </div>
            )}

            {/* Phase 2: Link dependencies button */}
            {promises.length >= 2 && (
              <button
                onClick={() => setPhase2Modal({ type: "dependency-editor" })}
                className="mt-3 px-3 py-1.5 text-xs text-gray-600 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Link dependencies
              </button>
            )}
          </div>
        )}

        {view === "timeline" && (
          <PromiseTimeline
            promises={promises}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {view === "stats" && (
          <div className="space-y-6">
            <ReliabilityScore stats={stats} />
            <DomainBreakdown stats={stats} />
          </div>
        )}

        {view === "create" && <PromiseCreator onCreate={handleCreate} />}
      </div>

      {/* Seed tray — optional 2nd/3rd promise nudge */}
      {view === "garden" &&
        promises.length < 3 &&
        !state.seedTrayDismissed && (
          <SeedTray
            promisesPlanted={promises.length}
            onPlantAnother={handleOpenSheet}
            onDismiss={onboarding.dismissSeedTray}
          />
        )}

      {/* Notification prompt — after first check-in */}
      {state.firstCheckInComplete && !state.notificationTimeSet && (
        <NotificationPrompt
          onSet={onboarding.setNotificationTime}
          onDismiss={() => onboarding.setNotificationTime(null)}
        />
      )}

      {/* Account creation prompt — after N days */}
      {showAccountPrompt && (
        <AccountPrompt
          onSave={onboarding.saveGarden}
          onDismiss={onboarding.dismissAccountPrompt}
        />
      )}

      {/* Inline creation sheet (from seed tray or future entry points) */}
      {isSheetOpen && (
        <PromiseCreationSheet
          onSuccess={handleCreate}
          onClose={handleSheetClose}
          returnFocusRef={seedRef}
        />
      )}

      {/* Phase 2 Modals */}
      {phase2Modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setPhase2Modal(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg mx-4">
            {phase2Modal.type === "break-down" && (() => {
              const parent = promises.find((p) => p.id === phase2Modal.promiseId);
              if (!parent) return null;
              return (
                <SubPromiseCreator
                  parent={toGardenPromise(parent)}
                  onCreateSubPromises={handleCreateSubPromises}
                  onCancel={() => setPhase2Modal(null)}
                />
              );
            })()}

            {phase2Modal.type === "dependency-editor" && (
              <DependencyEditor
                promises={promises.map(toGardenPromise)}
                onAddDependency={handleAddDependency}
                onRemoveDependency={handleRemoveDependency}
                onClose={() => setPhase2Modal(null)}
              />
            )}

            {phase2Modal.type === "partner-setup" && (() => {
              const target = promises.find((p) => p.id === phase2Modal.promiseId);
              if (!target) return null;
              return (
                <PartnerSetup
                  promise={toGardenPromise(target)}
                  onSetPartner={handleSetPartner}
                  onCancel={() => setPhase2Modal(null)}
                  isAuthenticated={state.accountCreated}
                  onRequestAuth={onboarding.saveGarden}
                />
              );
            })()}

            {phase2Modal.type === "sensor-connect" && (() => {
              const target = promises.find((p) => p.id === phase2Modal.promiseId);
              if (!target) return null;
              return (
                <SensorConnect
                  promiseId={target.id}
                  promiseBody={target.body}
                  domain={target.domain}
                  onConnect={handleConnectSensor}
                  onDisconnect={handleDisconnectSensor}
                  onCancel={() => setPhase2Modal(null)}
                  isConnected={!!(target as any).sensor}
                />
              );
            })()}
          </div>
        </div>
      )}
    </main>
  );
}
