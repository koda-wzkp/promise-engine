"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/supabase/auth";
import {
  getActivePromises,
  getCheckIns,
  getGardenState,
} from "@/lib/supabase/queries";
import type { PersonalPromise, PersonalDomain } from "@/lib/types/personal";
import type { CheckIn } from "@/lib/types/check-in";
import type { GardenState } from "@/lib/types/garden";
import {
  calculateDomainReliability,
  calculateOverallReliability,
  calculateTrend,
  getTrendArrow,
} from "@/lib/simulation/scoring";
import { domainColors } from "@/lib/utils/colors";
import { domainMeta } from "@/lib/types/personal";
import { formatPercent, daysAgo, todayISO } from "@/lib/utils/formatting";
import GardenCanvas from "@/components/garden/GardenCanvas";
import GardenOverlay from "@/components/garden/GardenOverlay";
import SeasonalTimelapse from "@/components/garden/SeasonalTimelapse";

export default function AnalyticsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [promises, setPromises] = useState<PersonalPromise[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [gardenState, setGardenState] = useState<GardenState | null>(null);
  const [timelapseDate, setTimelapseDate] = useState(todayISO());
  const [isPlaying, setIsPlaying] = useState(false);
  const playInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function init() {
      const session = await getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }
      const uid = session.user.id;
      setUserId(uid);

      const [proms, cis, gs] = await Promise.all([
        getActivePromises(uid),
        getCheckIns(uid),
        getGardenState(uid),
      ]);

      setPromises(proms);
      setCheckIns(cis);
      setGardenState(gs);
      setLoading(false);
    }

    init();
  }, [router]);

  // Timelapse playback
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    const startDate = promises.length > 0
      ? promises.reduce((min, p) => p.createdAt < min ? p.createdAt : min, promises[0].createdAt).slice(0, 10)
      : daysAgo(30);

    playInterval.current = setInterval(() => {
      setTimelapseDate((prev) => {
        const d = new Date(prev);
        d.setDate(d.getDate() + 7); // 1 week per second
        const next = d.toISOString().slice(0, 10);
        if (next > todayISO()) {
          setIsPlaying(false);
          if (playInterval.current) clearInterval(playInterval.current);
          return todayISO();
        }
        return next;
      });
    }, 1000);
  }, [promises]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    if (playInterval.current) clearInterval(playInterval.current);
  }, []);

  useEffect(() => {
    return () => {
      if (playInterval.current) clearInterval(playInterval.current);
    };
  }, []);

  // Stats computation
  const last30 = checkIns.filter((ci) => ci.date >= daysAgo(30));
  const prev30 = checkIns.filter(
    (ci) => ci.date >= daysAgo(60) && ci.date < daysAgo(30)
  );
  const domainReliability = calculateDomainReliability(promises, last30);
  const overallReliability = calculateOverallReliability(last30);

  const domains: PersonalDomain[] = ["health", "work", "relationships", "creative", "financial"];
  const domainTrends = Object.fromEntries(
    domains.map((d) => [
      d,
      calculateTrend(
        last30.filter((c) => promises.find((p) => p.id === c.promiseId)?.domain === d),
        prev30.filter((c) => promises.find((p) => p.id === c.promiseId)?.domain === d)
      ),
    ])
  ) as Record<PersonalDomain, number>;

  const domainCounts = Object.fromEntries(
    domains.map((d) => {
      const active = promises.filter((p) => p.domain === d).length;
      const kept = last30.filter(
        (ci) =>
          ci.response === "kept" &&
          promises.find((p) => p.id === ci.promiseId)?.domain === d
      ).length;
      return [d, { active, kept }];
    })
  ) as Record<PersonalDomain, { active: number; kept: number }>;

  if (loading || !gardenState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-garden-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const startDate = promises.length > 0
    ? promises.reduce((min, p) => p.createdAt < min ? p.createdAt : min, promises[0].createdAt).slice(0, 10)
    : daysAgo(30);

  return (
    <div className="relative h-screen overflow-hidden bg-[var(--garden-bg)]">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-40">
        <button
          onClick={() => router.push("/")}
          className="w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-sm"
          aria-label="Back to garden"
        >
          &#8592;
        </button>
      </div>

      {/* Overlay stats (always visible in analytics) */}
      <GardenOverlay
        domainReliability={domainReliability}
        domainTrends={domainTrends}
        domainCounts={domainCounts}
        overallReliability={overallReliability}
      />

      {/* Garden canvas */}
      <GardenCanvas gardenState={gardenState} />

      {/* Time-lapse scrubber */}
      <SeasonalTimelapse
        startDate={startDate}
        endDate={todayISO()}
        currentDate={timelapseDate}
        onDateChange={setTimelapseDate}
        onPlay={handlePlay}
        onPause={handlePause}
        isPlaying={isPlaying}
      />
    </div>
  );
}
