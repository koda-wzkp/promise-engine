"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/supabase/auth";
import {
  getActivePromises,
  getCheckIns,
  upsertCheckIn,
  getGardenState,
  saveGardenState,
} from "@/lib/supabase/queries";
import type { PersonalPromise } from "@/lib/types/personal";
import type { CheckIn, CheckInResponse } from "@/lib/types/check-in";
import type { GardenState } from "@/lib/types/garden";
import { processCheckIn } from "@/lib/garden/lifecycle";
import { computeLandscape } from "@/lib/garden/landscape";
import { computeWildlife } from "@/lib/garden/wildlife";
import {
  calculateDomainReliability,
  calculateOverallReliability,
} from "@/lib/simulation/scoring";
import { isPromiseDueToday, todayISO } from "@/lib/utils/formatting";
import CheckInPrompt from "@/components/check-in/CheckInPrompt";

export default function CheckInPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [duePromises, setDuePromises] = useState<PersonalPromise[]>([]);
  const [allPromises, setAllPromises] = useState<PersonalPromise[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [gardenState, setGardenState] = useState<GardenState | null>(null);

  useEffect(() => {
    async function init() {
      const session = await getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }

      const uid = session.user.id;
      setUserId(uid);

      const today = todayISO();
      const [proms, cis, gs] = await Promise.all([
        getActivePromises(uid),
        getCheckIns(uid, undefined, today, today),
        getGardenState(uid),
      ]);

      setAllPromises(proms);
      setCheckIns(cis);
      setGardenState(gs);

      // Filter to promises due today that haven't been checked in yet
      const todayCheckedIds = new Set(cis.map((ci) => ci.promiseId));
      const due = proms.filter(
        (p) =>
          isPromiseDueToday(p.checkInFrequency, today) &&
          !todayCheckedIds.has(p.id) &&
          !p.completedAt &&
          !p.abandonedAt
      );
      setDuePromises(due);
      setLoading(false);
    }

    init();
  }, [router]);

  async function handleCheckIn(
    promiseId: string,
    response: CheckInResponse,
    reflection?: string
  ) {
    if (!userId) return;

    const today = todayISO();

    // Save to database
    const ci = await upsertCheckIn(userId, promiseId, today, response, reflection);
    setCheckIns((prev) => [...prev, ci]);

    // Update garden state
    if (gardenState) {
      const plantIndex = gardenState.plants.findIndex(
        (p) => p.promiseId === promiseId
      );
      if (plantIndex >= 0) {
        const updatedPlant = processCheckIn(
          gardenState.plants[plantIndex],
          response
        );
        const updatedPlants = [...gardenState.plants];
        updatedPlants[plantIndex] = updatedPlant;

        // Recompute reliability for wildlife/landscape
        const allCheckIns = [...checkIns, ci];
        const domainReliability = calculateDomainReliability(allPromises, allCheckIns);
        const overallReliability = calculateOverallReliability(allCheckIns);

        const wildlife = computeWildlife(
          domainReliability as Record<string, number> as Record<import("@/lib/types/personal").PersonalDomain, number>,
          gardenState.wildlife
        );
        const landscape = computeLandscape(
          overallReliability,
          updatedPlants,
          gardenState.landscape
        );

        const newState: GardenState = {
          ...gardenState,
          plants: updatedPlants,
          wildlife,
          landscape,
          lastComputedAt: new Date().toISOString(),
        };

        setGardenState(newState);
        await saveGardenState(newState);
      }
    }
  }

  function handleComplete() {
    router.push("/");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-garden-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <CheckInPrompt
        promises={duePromises}
        onCheckIn={handleCheckIn}
        onComplete={handleComplete}
      />
    </div>
  );
}
