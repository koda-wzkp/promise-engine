"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/supabase/auth";
import {
  getActivePromises,
  getDeadPromises,
  createPromise,
  getGardenState,
  saveGardenState,
} from "@/lib/supabase/queries";
import type { PersonalPromise } from "@/lib/types/personal";
import type { GardenState } from "@/lib/types/garden";
import { createPlantState } from "@/lib/garden/lifecycle";
import { computePlantPosition } from "@/lib/garden/layout";
import PromiseForm from "@/components/creation/PromiseForm";

export default function CreatePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [activePromises, setActivePromises] = useState<PersonalPromise[]>([]);
  const [deadStumps, setDeadStumps] = useState<PersonalPromise[]>([]);
  const [gardenState, setGardenState] = useState<GardenState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const session = await getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }

      const uid = session.user.id;
      setUserId(uid);

      const [active, dead, gs] = await Promise.all([
        getActivePromises(uid),
        getDeadPromises(uid),
        getGardenState(uid),
      ]);

      setActivePromises(active);
      setDeadStumps(dead);
      setGardenState(gs);
      setLoading(false);
    }

    init();
  }, [router]);

  async function handleSubmit(data: Parameters<typeof createPromise>[1]) {
    if (!userId) return;

    const promise = await createPromise(userId, data);

    // Add plant to garden state
    if (gardenState) {
      const position = computePlantPosition(
        promise.id,
        data.domain,
        gardenState.plants
      );
      const plant = createPlantState(
        promise.id,
        data.domain,
        data.durationTier as "short" | "medium" | "long",
        data.stakesTier as "low" | "medium" | "high",
        position,
        data.reclaims
      );

      const newState: GardenState = {
        ...gardenState,
        plants: [...gardenState.plants, plant],
        lastComputedAt: new Date().toISOString(),
      };
      await saveGardenState(newState);
    }

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
    <div className="min-h-screen bg-[var(--bg)] py-8">
      <PromiseForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/")}
        activePromises={activePromises}
        deadStumps={deadStumps}
      />
    </div>
  );
}
