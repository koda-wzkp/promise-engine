"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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
import { PlantBottomSheet } from "@/components/garden/PlantBottomSheet";
import { PromiseDrawer } from "@/components/garden/PromiseDrawer";
import { SubPromiseCreator } from "@/components/personal/SubPromiseCreator";
import { DependencyEditor } from "@/components/personal/DependencyEditor";
import { PartnerSetup } from "@/components/personal/PartnerSetup";
import { SharedGardenPlot } from "@/components/personal/SharedGardenPlot";
import { SensorConnect } from "@/components/personal/SensorConnect";
import { SensorThreshold } from "@/components/personal/SensorThreshold";

// Phase 3 components
import { ContributionOptIn } from "@/components/personal/ContributionOptIn";
import { ContributionPlant } from "@/components/personal/ContributionPlant";
import { BenchmarkCard } from "@/components/personal/BenchmarkCard";
import { shouldPromptOptIn } from "@/lib/contribution/compute";
import { TeamGarden } from "@/components/team/TeamGarden";
import { GardenTeamDashboard } from "@/components/team/GardenTeamDashboard";
import { TeamPromiseCreator } from "@/components/team/TeamPromiseCreator";
import { CreateTeamFlow } from "@/components/team/CreateTeamFlow";
import { JoinTeamFlow } from "@/components/team/JoinTeamFlow";
import { useTeamState } from "@/lib/garden/teamSync";

// Phase 4 components
import { OrgGarden } from "@/components/org/OrgGarden";
import { OrgDashboard } from "@/components/org/OrgDashboard";
import { CreateOrgFlow } from "@/components/org/settings/CreateOrgFlow";
import { CivicLinkSetup } from "@/components/org/settings/CivicLinkSetup";
import { OrgApiKeys } from "@/components/org/settings/OrgApiKeys";
import { WebhookConfig } from "@/components/org/settings/WebhookConfig";
import { OrgBilling } from "@/components/org/settings/OrgBilling";
import { useOrgState } from "@/lib/garden/orgSync";

type Tab = "garden" | "team" | "org" | "collection" | "stats";

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

      {/* Root system — visible at zoom level 3 (always render when zoomed, even with no sub-promises) */}
      {showRoots && (
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

  // Phase 3 overlay state
  const [showContributionOptIn, setShowContributionOptIn] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showJoinTeam, setShowJoinTeam] = useState(false);
  const [showTeamPromiseCreator, setShowTeamPromiseCreator] = useState(false);
  const [teamView, setTeamView] = useState<"garden" | "dashboard">("garden");

  // Phase 3 team state
  const CURRENT_USER = { id: "local-user", name: "You", email: "" };
  const { teamState, createTeam, addTeamPromise, updateTeamPromiseStatus } = useTeamState(CURRENT_USER.id);

  // Phase 4 org state
  const { orgState, createOrg, addOrgPromise, addExternalDependency, runCivicSync } = useOrgState(CURRENT_USER.id);
  const [orgView, setOrgView] = useState<"garden" | "dashboard" | "settings">("garden");
  const [orgSettingsTab, setOrgSettingsTab] = useState<"civic" | "api" | "webhooks" | "billing">("civic");
  const [showCreateOrg, setShowCreateOrg] = useState(false);

  // Garden UI state
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

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

  // ── Phase 3: contribution opt-in eligibility check ──────────────────────────

  // Runs once after gardenCreatedAt loads from localStorage (non-null after hydration)
  useEffect(() => {
    if (state.gardenCreatedAt === null) return;
    if (shouldPromptOptIn(state.contribution, state.gardenCreatedAt)) {
      setShowContributionOptIn(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.gardenCreatedAt]);

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
    { id: "team",       label: "Team" },
    { id: "org",        label: "Org" },
    { id: "collection", label: "Collection" },
    { id: "stats",      label: "Stats" },
  ];

  // Icon paths for the bottom tab bar
  const TAB_ICONS: Record<Tab, React.ReactNode> = {
    garden: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 22V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M12 12C12 12 8 9 8 6a4 4 0 0 1 8 0c0 3-4 6-4 6Z" fill="currentColor" opacity="0.8"/>
        <path d="M12 15C12 15 9 13.5 7.5 11a3.5 3.5 0 0 1 6.062-3.5C15 10 12 15 12 15Z" fill="currentColor" opacity="0.4"/>
        <path d="M5 22h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    team: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="17" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M3 19c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M17 14c1.657 0 3 1.343 3 3v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    org: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="9" width="18" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M8 22V15h8v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 9l9-7 9 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    collection: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
    stats: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3"  y="14" width="4" height="7" rx="1" fill="currentColor" opacity="0.7"/>
        <rect x="10" y="9"  width="4" height="12" rx="1" fill="currentColor" opacity="0.85"/>
        <rect x="17" y="4"  width="4" height="17" rx="1" fill="currentColor"/>
      </svg>
    ),
  };

  // Height of the fixed bottom nav bar (px)
  const NAV_H = 56;

  return (
    // h-screen + overflow-hidden gives us a locked viewport — no scroll on garden tab
    <div id="main-content" className="h-screen overflow-hidden flex flex-col" style={{ background: "#faf9f6" }}>
      {/* Skip link — always available for keyboard users */}
      <a
        href="#promise-list"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-white focus:text-gray-900 focus:rounded focus:shadow"
      >
        Skip to promise list
      </a>

      <GardenSRDescription promises={promises} />

      {/* ── GARDEN TAB — fullscreen canvas ── */}
      {activeTab === "garden" && (
        <div className="relative flex-1 overflow-hidden">

          {/* Garden name + weather — faint overlay in top-left */}
          <div className="absolute top-3 left-4 z-20 pointer-events-none select-none">
            <h1 className="font-serif text-sm font-semibold leading-none drop-shadow" style={{ color: "rgba(255,255,255,0.80)" }}>
              Promise Garden
            </h1>
            <p className="text-xs mt-0.5 drop-shadow" style={{ color: "rgba(255,255,255,0.55)" }}>
              {weatherLabel(weather)}
            </p>
          </div>

          {/* Due-count badge */}
          {dueCount > 0 && (
            <div className="absolute top-3 right-14 z-20 pointer-events-none">
              <span className="px-2 py-0.5 text-xs bg-amber-500/90 text-white rounded-full shadow">
                {dueCount} due
              </span>
            </div>
          )}

          {/* Full-viewport zoom+pan canvas */}
          <ZoomController
            onZoomChange={setZoomLevel}
            defaultLevel={1}
            className="absolute inset-0"
          >
            {(level) => (
              <GardenView
                promises={activePromises as unknown as PersonalPromise[]}
                onUpdateStatus={handleGardenStatus}
                onPlantSelect={(id) => {
                  setSelectedPlantId(id);
                  setShowDrawer(false);
                }}
                skyGradientOverride={skyGradient}
                gardenAriaLabel={`Promise garden. ${activePromises.length} active promise${activePromises.length !== 1 ? "s" : ""}. ${weatherLabel(weather)}. Zoom: ${level === 0 ? "landscape" : level === 1 ? "garden" : level === 2 ? "plant detail" : "roots"}.`}
                minHeight={`calc(100vh - ${NAV_H}px)`}
                showPlantCards={false}
              />
            )}
          </ZoomController>

          {/* Shared garden plot — shown as an overlay strip if present */}
          {sharedPromises.length > 0 && (
            <div className="absolute top-12 left-0 right-0 z-10 pointer-events-none flex justify-center">
              <div className="pointer-events-auto">
                <SharedGardenPlot
                  sharedPromises={sharedPromises}
                  onWater={(id) => handlePartnerWater(id)}
                  onCheckIn={(id) => setCheckInId(id)}
                />
              </div>
            </div>
          )}

          {/* Pull-up drawer handle — bottom centre */}
          <button
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 py-2 px-5 rounded-full focus-visible:outline-2 focus-visible:outline-white"
            style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(6px)" }}
            onClick={() => setShowDrawer(true)}
            aria-label={`Show ${activePromises.length} promise${activePromises.length !== 1 ? "s" : ""}`}
          >
            <div className="w-8 h-0.5 bg-white/50 rounded-full" aria-hidden="true" />
            <span className="text-xs text-white/75">
              {activePromises.length === 0
                ? "No promises yet"
                : `${activePromises.length} promise${activePromises.length !== 1 ? "s" : ""}`}
            </span>
          </button>
        </div>
      )}

      {/* ── NON-GARDEN TABS — scrollable content ── */}
      {activeTab !== "garden" && (
        <div className="flex-1 overflow-y-auto" style={{ background: "#faf9f6" }}>
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

          <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-4">

            {/* ── TEAM ── */}
            {activeTab === "team" && (
              <div className="space-y-4">
                {teamState.team ? (
                  <>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTeamView("garden")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${teamView === "garden" ? "bg-green-700 text-white" : "bg-white text-gray-700 border hover:bg-gray-50"}`}
                      >
                        Garden
                      </button>
                      <button
                        onClick={() => setTeamView("dashboard")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${teamView === "dashboard" ? "bg-green-700 text-white" : "bg-white text-gray-700 border hover:bg-gray-50"}`}
                      >
                        Dashboard
                      </button>
                      <div className="flex-1" />
                      <button
                        onClick={() => setShowTeamPromiseCreator(true)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border text-green-700 hover:bg-green-50 transition-colors"
                      >
                        + Promise
                      </button>
                    </div>
                    {teamView === "garden" && <TeamGarden team={teamState.team} currentUserId={CURRENT_USER.id} />}
                    {teamView === "dashboard" && <GardenTeamDashboard team={teamState.team} onUpdateStatus={updateTeamPromiseStatus} />}
                    {showTeamPromiseCreator && (
                      <TeamPromiseCreator
                        members={teamState.team.members}
                        currentUserId={CURRENT_USER.id}
                        onAdd={addTeamPromise}
                        dispatch={dispatch}
                        onClose={() => setShowTeamPromiseCreator(false)}
                      />
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-4xl mb-3" aria-hidden="true">🌿</p>
                      <p className="font-serif text-lg font-bold text-gray-800 mb-1">No team garden yet</p>
                      <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">Share promises with your team. Commitments visible together, personal plans private.</p>
                      <div className="flex gap-3 justify-center">
                        <button onClick={() => setShowCreateTeam(true)} className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800">Create a team</button>
                        <button onClick={() => setShowJoinTeam(true)} className="px-4 py-2 bg-white border text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Join a team</button>
                      </div>
                    </div>
                    {showCreateTeam && <div className="bg-white rounded-2xl border p-6"><CreateTeamFlow currentUser={CURRENT_USER} onCreateTeam={createTeam} onCancel={() => setShowCreateTeam(false)} /></div>}
                    {showJoinTeam && <div className="bg-white rounded-2xl border p-6"><JoinTeamFlow onJoin={async (_token) => null} onCancel={() => setShowJoinTeam(false)} /></div>}
                  </div>
                )}
              </div>
            )}

            {/* ── ORG ── */}
            {activeTab === "org" && (
              <div className="space-y-4">
                {orgState.loading ? (
                  <div className="text-center py-12 text-sm text-gray-400">Loading…</div>
                ) : orgState.org ? (
                  <>
                    <div className="flex gap-2 flex-wrap">
                      {(["garden", "dashboard", "settings"] as const).map((v) => (
                        <button key={v} onClick={() => setOrgView(v)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${orgView === v ? "bg-green-700 text-white" : "bg-white text-gray-700 border hover:bg-gray-50"}`}>
                          {v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                      ))}
                      <div className="flex-1" />
                      <button onClick={() => runCivicSync()} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border text-blue-700 hover:bg-blue-50 transition-colors">Sync civic</button>
                    </div>
                    {orgView === "garden" && <OrgGarden org={orgState.org} teams={teamState.team ? [teamState.team] : []} onZoomToTeam={() => setActiveTab("team")} />}
                    {orgView === "dashboard" && <OrgDashboard org={orgState.org} teamPromises={teamState.team?.promises ?? []} teamNames={teamState.team ? { [teamState.team.id]: teamState.team.name } : {}} />}
                    {orgView === "settings" && (
                      <div className="space-y-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {(["civic", "api", "webhooks", "billing"] as const).map((t) => (
                            <button key={t} onClick={() => setOrgSettingsTab(t)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${orgSettingsTab === t ? "bg-gray-900 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"}`}>
                              {t === "civic" && "Civic links"}{t === "api" && "API keys"}{t === "webhooks" && "Webhooks"}{t === "billing" && "Billing"}
                            </button>
                          ))}
                        </div>
                        <div className="bg-white rounded-2xl border p-5">
                          {orgSettingsTab === "civic" && <CivicLinkSetup orgPromises={orgState.org.orgPromises} onAddDependency={(promiseId, dep) => addExternalDependency(promiseId, { ...dep, id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2), lastSyncedAt: null })} />}
                          {orgSettingsTab === "api" && <OrgApiKeys orgId={orgState.org.id} existingKeys={[]} />}
                          {orgSettingsTab === "webhooks" && <WebhookConfig orgId={orgState.org.id} webhooks={[]} />}
                          {orgSettingsTab === "billing" && <OrgBilling org={orgState.org} memberCount={orgState.org.teams.length || 1} />}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-4xl mb-3" aria-hidden="true">🏔</p>
                      <p className="font-serif text-lg font-bold text-gray-800 mb-1">No org yet</p>
                      <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">Connect teams under one org. Link to civic commitments.</p>
                      <button onClick={() => setShowCreateOrg(true)} className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800">Create an org</button>
                    </div>
                    {showCreateOrg && (
                      <div className="bg-white rounded-2xl border p-6">
                        <CreateOrgFlow
                          currentUser={CURRENT_USER}
                          currentTeamId={teamState.team?.id}
                          onCreateOrg={async (input) => { const org = await createOrg(input); if (org) setShowCreateOrg(false); return org; }}
                          onCancel={() => setShowCreateOrg(false)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── COLLECTION ── */}
            {activeTab === "collection" && (
              <CollectionView promises={promises} dispatch={dispatch} receivedGifts={state.receivedGifts} />
            )}

            {/* ── STATS ── */}
            {activeTab === "stats" && (
              <div className="space-y-6">
                <GardenStats stats={state.stats} />
                <BenchmarkCard stats={state.stats} contribution={state.contribution} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FIXED BOTTOM ICON NAV ── */}
      <nav
        className="flex-none flex z-30 border-t border-gray-200"
        style={{ height: NAV_H, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)" }}
        role="tablist"
        aria-label="Main navigation"
      >
        {tabs.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(t.id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-green-600 focus-visible:outline-offset-[-2px]"
              style={{ color: active ? "#15803d" : "#9ca3af" }}
            >
              {TAB_ICONS[t.id]}
              <span className="text-[10px] font-medium leading-none">{t.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── GARDEN OVERLAYS (z-40+) ── */}

      {/* Promise drawer — pull-up list over the garden */}
      {showDrawer && (
        <PromiseDrawer
          activePromises={activePromises}
          dormantPromises={dormantPromises}
          cascadeStress={cascadeStress}
          contribution={state.contribution}
          dispatch={dispatch}
          onSelectPromise={(id) => {
            setSelectedPlantId(id);
            setShowDrawer(false);
          }}
          onNewPromise={() => dispatch({ type: "COMPLETE_ONBOARDING" })}
          onClose={() => setShowDrawer(false)}
        />
      )}

      {/* Plant bottom sheet — tap a plant in the garden */}
      {selectedPlantId && state.promises[selectedPlantId] && (
        <PlantBottomSheet
          promise={state.promises[selectedPlantId]}
          isStressed={cascadeStress.has(selectedPlantId)}
          onCheckIn={() => setCheckInId(selectedPlantId)}
          onSubPromise={() => setSubPromiseId(selectedPlantId)}
          onDependency={() => setDependencyId(selectedPlantId)}
          onPartner={() => setPartnerSetupId(selectedPlantId)}
          onSensor={() => setSensorConnectId(selectedPlantId)}
          onClose={() => setSelectedPlantId(null)}
        />
      )}

      {/* Phase 3: contribution opt-in */}
      {showContributionOptIn && (
        <ContributionOptIn dispatch={dispatch} onDismiss={() => setShowContributionOptIn(false)} />
      )}

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
      {renegotiatePromise && <RenegotiateModal promise={renegotiatePromise} onConfirm={handleRenegotiate} onClose={() => setRenegotiateId(null)} />}
      {completePromise && <CompletionFlow promise={completePromise} onConfirm={handleComplete} onClose={() => setCompleteId(null)} />}
      {frequencyPromise && <FrequencySettings promise={frequencyPromise} onSave={handleFrequency} onClose={() => setFrequencyId(null)} />}

      {/* Phase 2 modals */}
      {subPromiseTarget && (
        <SubPromiseCreator
          promise={subPromiseTarget}
          subPromises={subPromiseTarget.children.map((id) => state.promises[id]).filter(Boolean) as GardenPromise[]}
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

      {/* Cascade stress toast */}
      {firstCascadeAlert &&
        state.promises[firstCascadeAlert.affectedId] &&
        state.promises[firstCascadeAlert.sourceId] && (
          <CascadeAnimation
            affectedPromise={state.promises[firstCascadeAlert.affectedId]}
            sourcePromise={state.promises[firstCascadeAlert.sourceId]}
            onDismiss={() =>
              setCascadeAlerts((prev) =>
                prev.filter((a) => a.affectedId !== firstCascadeAlert.affectedId)
              )
            }
          />
        )}
    </div>
  );
}
