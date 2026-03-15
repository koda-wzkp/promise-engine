"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSession, getUser } from "@/lib/supabase/auth";
import {
  getActivePromises,
  getCheckIns,
  getGardenState,
  saveGardenState,
  updatePromise,
} from "@/lib/supabase/queries";
import type { PersonalPromise } from "@/lib/types/personal";
import type { CheckIn } from "@/lib/types/check-in";
import type { GardenState, PlantState } from "@/lib/types/garden";
import { computeLandscape } from "@/lib/garden/landscape";
import { computeWildlife } from "@/lib/garden/wildlife";
import {
  calculateDomainReliability,
  calculateOverallReliability,
  calculateTrend,
} from "@/lib/simulation/scoring";
import { isPromiseDueToday, todayISO, daysAgo } from "@/lib/utils/formatting";
import GardenCanvas from "@/components/garden/GardenCanvas";
import PlantInfoCard from "@/components/garden/PlantInfoCard";
import GardenOverlay from "@/components/garden/GardenOverlay";
import AccessibleGardenDOM from "@/components/shared/AccessibleGardenDOM";
import type { PersonalDomain } from "@/lib/types/personal";

const EMPTY_GARDEN: GardenState = {
  userId: "",
  plants: [],
  wildlife: [],
  landscape: {
    currentMilestones: ["clearing"],
    overallReliability: 0,
    skyState: "stormy",
    hasStream: false,
    streamFlow: 0,
  },
  lastComputedAt: new Date().toISOString(),
};

export default function GardenPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gardenState, setGardenState] = useState<GardenState>(EMPTY_GARDEN);
  const [promises, setPromises] = useState<PersonalPromise[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<PlantState | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  // Auth check
  useEffect(() => {
    async function init() {
      try {
        const session = await getSession();
        if (!session) {
          // Check if onboarding was completed locally
          if (typeof window !== "undefined" && !localStorage.getItem("pg_onboarded")) {
            router.push("/onboarding");
            return;
          }
          // No session — show empty garden (demo mode)
          setLoading(false);
          return;
        }
        setUserId(session.user.id);
      } catch {
        // Supabase not configured — show empty garden
        setLoading(false);
      }
    }
    init();
  }, [router]);

  // Load data
  useEffect(() => {
    if (!userId) return;

    async function load() {
      try {
        const [proms, cis, gs] = await Promise.all([
          getActivePromises(userId!),
          getCheckIns(userId!, undefined, daysAgo(90)),
          getGardenState(userId!),
        ]);

        setPromises(proms);
        setCheckIns(cis);
        setGardenState(gs ?? { ...EMPTY_GARDEN, userId: userId! });
      } catch (err) {
        console.error("Failed to load garden data:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId]);

  // Check if there are promises due today that haven't been checked in
  const today = todayISO();
  const dueTodayPromises = promises.filter((p) =>
    isPromiseDueToday(p.checkInFrequency, today) &&
    !p.completedAt &&
    !p.abandonedAt
  );
  const todayCheckIns = checkIns.filter((ci) => ci.date === today);
  const uncheckedToday = dueTodayPromises.filter(
    (p) => !todayCheckIns.some((ci) => ci.promiseId === p.id)
  );

  // Compute overlay stats
  const last30CheckIns = checkIns.filter((ci) => ci.date >= daysAgo(30));
  const prev30CheckIns = checkIns.filter(
    (ci) => ci.date >= daysAgo(60) && ci.date < daysAgo(30)
  );
  const domainReliability = calculateDomainReliability(promises, last30CheckIns);
  const domainTrends: Record<PersonalDomain, number> = {
    health: calculateTrend(
      last30CheckIns.filter((c) => promises.find((p) => p.id === c.promiseId)?.domain === "health"),
      prev30CheckIns.filter((c) => promises.find((p) => p.id === c.promiseId)?.domain === "health")
    ),
    work: calculateTrend(
      last30CheckIns.filter((c) => promises.find((p) => p.id === c.promiseId)?.domain === "work"),
      prev30CheckIns.filter((c) => promises.find((p) => p.id === c.promiseId)?.domain === "work")
    ),
    relationships: calculateTrend(
      last30CheckIns.filter((c) => promises.find((p) => p.id === c.promiseId)?.domain === "relationships"),
      prev30CheckIns.filter((c) => promises.find((p) => p.id === c.promiseId)?.domain === "relationships")
    ),
    creative: calculateTrend(
      last30CheckIns.filter((c) => promises.find((p) => p.id === c.promiseId)?.domain === "creative"),
      prev30CheckIns.filter((c) => promises.find((p) => p.id === c.promiseId)?.domain === "creative")
    ),
    financial: calculateTrend(
      last30CheckIns.filter((c) => promises.find((p) => p.id === c.promiseId)?.domain === "financial"),
      prev30CheckIns.filter((c) => promises.find((p) => p.id === c.promiseId)?.domain === "financial")
    ),
  };

  const domainCounts: Record<PersonalDomain, { active: number; kept: number }> = {
    health: { active: 0, kept: 0 },
    work: { active: 0, kept: 0 },
    relationships: { active: 0, kept: 0 },
    creative: { active: 0, kept: 0 },
    financial: { active: 0, kept: 0 },
  };
  for (const p of promises) {
    const d = p.domain as PersonalDomain;
    if (domainCounts[d]) {
      domainCounts[d].active++;
      const pKept = last30CheckIns.filter(
        (ci) => ci.promiseId === p.id && ci.response === "kept"
      ).length;
      domainCounts[d].kept += pKept;
    }
  }

  // Handlers
  const handleAbandon = useCallback(async (promiseId: string) => {
    await updatePromise(promiseId, {
      status: "violated",
      abandonedAt: new Date().toISOString(),
    });
    setPromises((prev) =>
      prev.map((p) =>
        p.id === promiseId
          ? { ...p, status: "violated" as const, abandonedAt: new Date().toISOString() }
          : p
      )
    );
    setSelectedPlant(null);
  }, []);

  const handleComplete = useCallback(async (promiseId: string) => {
    await updatePromise(promiseId, {
      status: "verified",
      completedAt: new Date().toISOString(),
    });
    setPromises((prev) =>
      prev.map((p) =>
        p.id === promiseId
          ? { ...p, status: "verified" as const, completedAt: new Date().toISOString() }
          : p
      )
    );
    setSelectedPlant(null);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-garden-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden bg-[var(--garden-bg)]">
      {/* Navigation bar */}
      <nav className="absolute top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3 safe-top">
        <h1 className="text-sm font-serif font-semibold text-white/90 drop-shadow-sm">
          Promise Garden
        </h1>
        <div className="flex items-center gap-2">
          {uncheckedToday.length > 0 && (
            <button
              onClick={() => router.push("/check-in")}
              className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-garden-green shadow-sm"
            >
              Check in ({uncheckedToday.length})
            </button>
          )}
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className="w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-xs"
            aria-label={showOverlay ? "Hide stats" : "Show stats"}
          >
            {showOverlay ? "\u2715" : "\u2261"}
          </button>
          <button
            onClick={() => router.push("/analytics")}
            className="w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-xs"
            aria-label="Analytics"
          >
            \u2197
          </button>
          <button
            onClick={() => router.push("/create")}
            className="w-8 h-8 flex items-center justify-center bg-garden-green text-white rounded-full shadow-sm text-lg leading-none"
            aria-label="New promise"
          >
            +
          </button>
        </div>
      </nav>

      {/* Stats overlay */}
      {showOverlay && (
        <GardenOverlay
          domainReliability={domainReliability}
          domainTrends={domainTrends}
          domainCounts={domainCounts}
          overallReliability={calculateOverallReliability(last30CheckIns)}
        />
      )}

      {/* Garden canvas */}
      <GardenCanvas
        gardenState={gardenState}
        onPlantTap={setSelectedPlant}
      />

      {/* Accessible DOM layer */}
      <AccessibleGardenDOM
        gardenState={gardenState}
        promises={promises}
        onPlantFocus={setSelectedPlant}
      />

      {/* Plant info card */}
      {selectedPlant && (
        <PlantInfoCard
          plant={selectedPlant}
          promise={promises.find((p) => p.id === selectedPlant.promiseId)!}
          checkIns={checkIns}
          allPromises={promises}
          onClose={() => setSelectedPlant(null)}
          onRenegotiate={(id) => router.push(`/create?renegotiate=${id}`)}
          onAbandon={handleAbandon}
          onComplete={handleComplete}
        />
      )}

      {/* Bottom navigation */}
      <div className="absolute bottom-0 inset-x-0 z-30 flex items-center justify-around px-4 py-3 bg-white/90 backdrop-blur-sm border-t border-gray-200 safe-bottom">
        <button
          className="flex flex-col items-center gap-0.5 text-garden-green"
          aria-label="Garden"
          aria-current="page"
        >
          <span className="text-lg">&#127793;</span>
          <span className="text-[10px] font-medium">Garden</span>
        </button>
        <button
          onClick={() => router.push("/check-in")}
          className="flex flex-col items-center gap-0.5 text-[var(--text-muted)]"
          aria-label="Check in"
        >
          <span className="text-lg">&#10003;</span>
          <span className="text-[10px] font-medium">Check in</span>
        </button>
        <button
          onClick={() => router.push("/create")}
          className="flex flex-col items-center gap-0.5 text-[var(--text-muted)]"
          aria-label="New promise"
        >
          <span className="text-lg">+</span>
          <span className="text-[10px] font-medium">New</span>
        </button>
        <button
          onClick={() => router.push("/analytics")}
          className="flex flex-col items-center gap-0.5 text-[var(--text-muted)]"
          aria-label="Insights"
        >
          <span className="text-lg">&#128200;</span>
          <span className="text-[10px] font-medium">Insights</span>
        </button>
        <button
          onClick={() => router.push("/settings")}
          className="flex flex-col items-center gap-0.5 text-[var(--text-muted)]"
          aria-label="Settings"
        >
          <span className="text-lg">&#9881;</span>
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
}
