"use client";

import { useState, useEffect, useMemo, useCallback, useRef, useReducer } from "react";
import { PersonalPromise, PersonalStats } from "@/lib/types/personal";
import { PromiseStatus } from "@/lib/types/promise";
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
import { useGardenOnboarding } from "@/lib/hooks/useGardenOnboarding";
import { getSkyGradientByCount } from "@/lib/garden/renderer/skyGradient";
import { NestedPLogo } from "@/components/brand/NestedPLogo";

// Phase 2 imports
import {
  GardenPromise,
  GardenAction,
  CameraState,
  toGardenPromise,
  DEFAULT_CAMERA,
} from "@/lib/types/garden";
import type { SensorType, SensorThreshold, PartnerVisibility } from "@/lib/types/garden";
import {
  gardenReducer,
  loadGardenState,
  saveGardenState,
} from "@/lib/garden/gardenReducer";
import { SubPromiseCreator } from "@/components/personal/SubPromiseCreator";
import { DependencyEditor } from "@/components/personal/DependencyEditor";
import { PartnerSetup } from "@/components/personal/PartnerSetup";
import { SensorConnect } from "@/components/personal/SensorConnect";
import { SharedGardenPlot } from "@/components/personal/SharedGardenPlot";
import { WateringAction } from "@/components/personal/WateringAction";

// Phase 3 imports
import type { ContributionLevel, GiftOptions } from "@/lib/types/phase3";
import { DEFAULT_CONTRIBUTION_STATE } from "@/lib/types/phase3";
import { ContributionPlant } from "@/components/contribution/ContributionPlant";
import { ContributionOptIn } from "@/components/contribution/ContributionOptIn";
import { ContributionSettings } from "@/components/contribution/ContributionSettings";
import { PredictionBadge } from "@/components/contribution/PredictionBadge";
import { BenchmarkCard } from "@/components/contribution/BenchmarkCard";
import { GiftButton } from "@/components/gifting/GiftButton";
import { GiftOptionsModal } from "@/components/gifting/GiftOptionsModal";
import { ReceivedGifts } from "@/components/gifting/ReceivedGifts";
import { GiftBadge } from "@/components/gifting/GiftBadge";
import { computeAggregate, computeSchemaContribution, canContribute } from "@/lib/contribution/compute";

type View = "garden" | "timeline" | "create" | "stats";

// Phase 2 + Phase 3 modal types
type ActiveModal =
  | null
  | { type: "break-down"; promiseId: string }
  | { type: "dependencies"; promiseId: string }
  | { type: "partner"; promiseId: string }
  | { type: "sensor"; promiseId: string }
  | { type: "contribution-opt-in" }
  | { type: "contribution-settings" }
  | { type: "gift-options"; artifactId: string };

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
  // Phase 2: Use reducer instead of raw useState for promises
  const [gardenState, dispatch] = useReducer(gardenReducer, null, () => loadGardenState());
  const promises = gardenState.promises;

  const [view, setView] = useState<View>("garden");
  const [loaded, setLoaded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [timeLapseActive, setTimeLapseActive] = useState(true);

  // Phase 2: Modal state
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [wateringNotif, setWateringNotif] = useState<{ partner: string; domain: string } | null>(null);

  const seedRef = useRef<HTMLButtonElement>(null);

  const onboarding = useGardenOnboarding();
  const { state, showAccountPrompt } = onboarding;

  // Load persisted state on mount
  useEffect(() => {
    setLoaded(true);
  }, []);

  // Persist garden state whenever it changes
  useEffect(() => {
    if (loaded) saveGardenState(gardenState);
  }, [gardenState, loaded]);

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
    setTimeLapseActive(false);
    if (state.phase === "clearcut") {
      onboarding.openSeedForFirstTime();
    }
    setIsSheetOpen(true);
  }, [state.phase, onboarding]);

  const handleSheetClose = useCallback(() => {
    setIsSheetOpen(false);
    setTimeout(() => seedRef.current?.focus(), 50);
  }, []);

  const handleCreate = useCallback(
    (promise: PersonalPromise) => {
      const gardenPromise = toGardenPromise(promise);
      dispatch({ type: "CREATE_PROMISE", promise: gardenPromise });
      onboarding.plantPromise(promises.length + 1);
      setIsSheetOpen(false);
      setView("garden");
    },
    [onboarding, promises.length]
  );

  const handleUpdateStatus = useCallback(
    (id: string, status: PromiseStatus, reflection?: string) => {
      dispatch({ type: "UPDATE_STATUS", id, status, reflection });

      if (
        (status === "verified" || status === "violated") &&
        !state.firstCheckInComplete
      ) {
        onboarding.completeFirstCheckIn();
      }
    },
    [state.firstCheckInComplete, onboarding]
  );

  // Phase 2: Camera
  const handleCameraChange = useCallback((camera: Partial<CameraState>) => {
    dispatch({ type: "SET_CAMERA", camera });
  }, []);

  // Phase 2: Sub-promises
  const handleCreateSubPromise = useCallback(
    (subPromise: GardenPromise) => {
      if (!activeModal || activeModal.type !== "break-down") return;
      dispatch({
        type: "CREATE_SUB_PROMISE",
        parentId: activeModal.promiseId,
        promise: subPromise,
      });
    },
    [activeModal]
  );

  // Phase 2: Dependencies
  const handleAddDependency = useCallback((fromId: string, toId: string) => {
    dispatch({ type: "ADD_DEPENDENCY", fromId, toId });
  }, []);

  const handleRemoveDependency = useCallback((fromId: string, toId: string) => {
    dispatch({ type: "REMOVE_DEPENDENCY", fromId, toId });
  }, []);

  // Phase 2: Partner
  const handleSetPartner = useCallback(
    (partnerId: string, visibility: PartnerVisibility) => {
      if (!activeModal || activeModal.type !== "partner") return;
      dispatch({
        type: "SET_PARTNER",
        promiseId: activeModal.promiseId,
        partnerId,
        visibility,
      });
    },
    [activeModal]
  );

  const handleRemovePartner = useCallback(() => {
    if (!activeModal || activeModal.type !== "partner") return;
    dispatch({ type: "REMOVE_PARTNER", promiseId: activeModal.promiseId });
  }, [activeModal]);

  const handlePartnerWater = useCallback((promiseId: string) => {
    dispatch({ type: "PARTNER_WATER", promiseId });
  }, []);

  const handlePartnerEncourage = useCallback(
    (promiseId: string, message: string) => {
      dispatch({ type: "PARTNER_ENCOURAGE", promiseId, message });
    },
    []
  );

  // Phase 2: Sensor
  const handleConnectSensor = useCallback(
    (sensorType: SensorType, threshold: SensorThreshold) => {
      if (!activeModal || activeModal.type !== "sensor") return;
      dispatch({
        type: "CONNECT_SENSOR",
        promiseId: activeModal.promiseId,
        sensorType,
        threshold,
      });
    },
    [activeModal]
  );

  const handleDisconnectSensor = useCallback(() => {
    if (!activeModal || activeModal.type !== "sensor") return;
    dispatch({ type: "DISCONNECT_SENSOR", promiseId: activeModal.promiseId });
  }, [activeModal]);

  // Phase 3: Contribution
  const handleEnableContribution = useCallback((level: ContributionLevel) => {
    dispatch({ type: "ENABLE_CONTRIBUTION", level });
    setActiveModal(null);
  }, []);

  const handleDisableContribution = useCallback(() => {
    dispatch({ type: "DISABLE_CONTRIBUTION" });
    setActiveModal(null);
  }, []);

  const handleUpgradeContribution = useCallback((level: ContributionLevel) => {
    dispatch({ type: "UPGRADE_CONTRIBUTION_LEVEL", level });
  }, []);

  const handleSendContribution = useCallback(async () => {
    const contribution = gardenState.contribution ?? DEFAULT_CONTRIBUTION_STATE;
    if (!contribution.enabled) return;

    const level = contribution.level;
    const check = canContribute(promises, level);
    if (!check.ready) return;

    let payload: unknown;
    if (level === "C") {
      const month = new Date().toISOString().slice(0, 7);
      const aggregate = computeAggregate(promises, month);
      if (!aggregate) return;
      payload = aggregate;
    } else {
      const schema = computeSchemaContribution(promises);
      if (!schema) return;
      payload = schema;
    }

    try {
      const res = await fetch("/api/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          contributorId: gardenState.userId ?? "anon",
          data: payload,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        dispatch({ type: "CONTRIBUTION_SENT", batchId: result.batchId });
        if (result.predictions?.length > 0) {
          dispatch({ type: "SYNC_PREDICTIONS", predictions: result.predictions });
        }
        if (result.benchmarks?.length > 0) {
          dispatch({ type: "SYNC_BENCHMARKS", benchmarks: result.benchmarks });
        }
      }
    } catch {
      // Silently fail — contribution is best-effort
    }
  }, [gardenState.contribution, gardenState.userId, promises]);

  // Phase 3: Gifting
  const handleMintArtifact = useCallback((promiseId: string) => {
    dispatch({ type: "MINT_ARTIFACT", promiseId });
  }, []);

  const handleGiftArtifact = useCallback(
    (artifactId: string, toUserId: string, options: GiftOptions) => {
      dispatch({ type: "GIFT_ARTIFACT", artifactId, toUserId, options });
      setActiveModal(null);
    },
    []
  );

  // Collect accountability partners for gift recipient dropdown
  const giftablePartners = useMemo(() => {
    const partners: { id: string; name: string }[] = [];
    const seen = new Set<string>();
    for (const p of promises) {
      if (p.partner && !seen.has(p.partner.partnerId)) {
        seen.add(p.partner.partnerId);
        partners.push({
          id: p.partner.partnerId,
          name: p.partner.partnerName ?? p.partner.partnerId,
        });
      }
    }
    return partners;
  }, [promises]);

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
  const isClearcut = promises.length === 0;

  if (isClearcut) {
    return (
      <main id="main-content" className="min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-white focus:text-gray-900 focus:rounded focus:shadow"
        >
          Skip to main content
        </a>

        <div className="relative flex-1" style={{ minHeight: "100svh" }}>
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

          <ClearcutOverlay onSeedClick={handleOpenSheet} seedRef={seedRef} />
        </div>

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

  const views: { id: View; label: string }[] = [
    { id: "garden",   label: "Garden" },
    { id: "timeline", label: "Timeline" },
    { id: "stats",    label: "Stats" },
    { id: "create",   label: "+ New Promise" },
  ];

  // Find the promise for the active modal (Phase 2 modals have promiseId)
  const modalPromise = activeModal && "promiseId" in activeModal
    ? promises.find((p) => p.id === activeModal.promiseId) ?? null
    : null;

  return (
    <main
      id="main-content"
      className="min-h-screen bg-gradient-to-b from-green-50 via-sky-lightest to-white"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-white focus:text-gray-900 focus:rounded focus:shadow"
      >
        Skip to main content
      </a>

      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NestedPLogo mode="grow" size={48} />
            <h1 className="font-serif text-2xl font-bold text-gray-900">
              Promise Garden
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Phase 3: Contribution plant */}
            <ContributionPlant
              contribution={gardenState.contribution ?? DEFAULT_CONTRIBUTION_STATE}
              onClick={() =>
                setActiveModal(
                  (gardenState.contribution ?? DEFAULT_CONTRIBUTION_STATE).enabled
                    ? { type: "contribution-settings" }
                    : { type: "contribution-opt-in" }
                )
              }
            />
            {/* Phase 3: Artifact badge */}
            <GiftBadge artifacts={gardenState.artifacts ?? []} />
          </div>
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

      {/* Unread notifications badge */}
      {gardenState.notifications.filter((n) => !n.read).length > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800">
            {gardenState.notifications.filter((n) => !n.read).length} new notification
            {gardenState.notifications.filter((n) => !n.read).length !== 1 ? "s" : ""}
            {" — "}
            {gardenState.notifications.filter((n) => !n.read).slice(0, 2).map((n) => n.message).join("; ")}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        {view === "garden" && (
          <div className="relative">
            <GardenView
              promises={promises}
              onUpdateStatus={handleUpdateStatus}
              skyGradientOverride={skyGradient}
              camera={gardenState.camera}
              onCameraChange={handleCameraChange}
              onBreakDown={(id) => setActiveModal({ type: "break-down", promiseId: id })}
              onEditDependencies={(id) => setActiveModal({ type: "dependencies", promiseId: id })}
              onAddPartner={(id) => setActiveModal({ type: "partner", promiseId: id })}
              onConnectSensor={(id) => setActiveModal({ type: "sensor", promiseId: id })}
            />

            {/* Phase 2: Shared garden plot (for accountability partner plants) */}
            {gardenState.sharedWithMe.length > 0 && (
              <SharedGardenPlot
                plants={gardenState.sharedWithMe}
                onWater={handlePartnerWater}
                onEncourage={handlePartnerEncourage}
              />
            )}

            {/* Dependency tooltip — after 3rd promise, one-time */}
            {state.promisesPlanted >= 3 && !state.dependencyTutorialSeen && (
              <DependencyTooltip onDismiss={onboarding.dismissDependencyTooltip} />
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
            {/* Phase 3: Predictions (contributors only) */}
            {(gardenState.predictions ?? []).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Predictions</h3>
                <PredictionBadge predictions={gardenState.predictions ?? []} />
              </div>
            )}
            {/* Phase 3: Benchmarks (contributors only) */}
            {(gardenState.benchmarks ?? []).length > 0 && (
              <BenchmarkCard benchmarks={gardenState.benchmarks ?? []} />
            )}
            {/* Phase 3: Received gifts */}
            <ReceivedGifts gifts={gardenState.receivedGifts ?? []} />
            {/* Phase 3: Contribution opt-in nudge */}
            {!(gardenState.contribution ?? DEFAULT_CONTRIBUTION_STATE).enabled &&
              promises.length >= 5 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-1">
                    Help the community
                  </h3>
                  <p className="text-xs text-blue-700 mb-3">
                    Share anonymous, aggregate data to improve predictions for everyone.
                  </p>
                  <button
                    onClick={() => setActiveModal({ type: "contribution-opt-in" })}
                    className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Learn More
                  </button>
                </div>
              )}
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

      {/* ── Phase 2 Modals ──────────────────────────────────────────────── */}

      {/* Sub-promise creator ("Break this down") */}
      {activeModal?.type === "break-down" && modalPromise && (
        <SubPromiseCreator
          parent={modalPromise as GardenPromise}
          onCreateSubPromise={handleCreateSubPromise}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Dependency editor */}
      {activeModal?.type === "dependencies" && modalPromise && (
        <DependencyEditor
          promises={promises}
          targetPromise={modalPromise as GardenPromise}
          onAddDependency={handleAddDependency}
          onRemoveDependency={handleRemoveDependency}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Partner setup */}
      {activeModal?.type === "partner" && modalPromise && (
        <PartnerSetup
          promise={modalPromise as GardenPromise}
          isAuthenticated={!!gardenState.userId}
          onSetPartner={handleSetPartner}
          onRemovePartner={handleRemovePartner}
          onRequestAuth={() => {
            // Auth flow would go here — for now, simulate
            dispatch({ type: "SET_USER_ID", userId: `user-${Date.now()}` });
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Sensor connect */}
      {activeModal?.type === "sensor" && modalPromise && (
        <SensorConnect
          promise={modalPromise as GardenPromise}
          onConnect={handleConnectSensor}
          onDisconnect={handleDisconnectSensor}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Watering notification toast */}
      {wateringNotif && (
        <WateringAction
          partnerName={wateringNotif.partner}
          domain={wateringNotif.domain}
          onDismiss={() => setWateringNotif(null)}
        />
      )}

      {/* ── Phase 3 Modals ──────────────────────────────────────────────── */}

      {/* Contribution opt-in */}
      {activeModal?.type === "contribution-opt-in" && (
        <ContributionOptIn
          onEnable={handleEnableContribution}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Contribution settings */}
      {activeModal?.type === "contribution-settings" && (
        <ContributionSettings
          contribution={gardenState.contribution ?? DEFAULT_CONTRIBUTION_STATE}
          onUpgrade={handleUpgradeContribution}
          onDisable={handleDisableContribution}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Gift options */}
      {activeModal?.type === "gift-options" && (
        <GiftOptionsModal
          artifactId={activeModal.artifactId}
          partners={giftablePartners}
          onSend={handleGiftArtifact}
          onClose={() => setActiveModal(null)}
        />
      )}
    </main>
  );
}
