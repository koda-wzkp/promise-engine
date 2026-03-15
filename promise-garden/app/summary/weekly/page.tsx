"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/supabase/auth";
import { getActivePromises, getCheckIns } from "@/lib/supabase/queries";
import type { PersonalPromise } from "@/lib/types/personal";
import type { CheckIn } from "@/lib/types/check-in";
import { daysAgo } from "@/lib/utils/formatting";
import { calculateReliability } from "@/lib/simulation/scoring";
import WeeklySummary from "@/components/summary/WeeklySummary";

export default function WeeklySummaryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [promises, setPromises] = useState<PersonalPromise[]>([]);
  const [currentWeek, setCurrentWeek] = useState<CheckIn[]>([]);
  const [previousWeek, setPreviousWeek] = useState<CheckIn[]>([]);

  useEffect(() => {
    async function init() {
      const session = await getSession();
      if (!session) { router.push("/auth/login"); return; }
      const uid = session.user.id;

      const [proms, curWeek, prevWeek] = await Promise.all([
        getActivePromises(uid),
        getCheckIns(uid, undefined, daysAgo(7), daysAgo(0)),
        getCheckIns(uid, undefined, daysAgo(14), daysAgo(7)),
      ]);

      setPromises(proms);
      setCurrentWeek(curWeek);
      setPreviousWeek(prevWeek);
      setLoading(false);
    }
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-garden-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Generate narrative
  const reliability = calculateReliability(currentWeek);
  const keptCount = currentWeek.filter((c) => c.response === "kept").length;
  const missedCount = currentWeek.filter((c) => c.response === "missed").length;

  let narrative: string;
  if (reliability >= 0.8) {
    narrative = `Strong week. You kept ${keptCount} check-ins — your garden is thriving.`;
  } else if (missedCount > keptCount) {
    narrative = `Tough week. ${missedCount} check-ins missed. Your plants are under stress.`;
  } else {
    narrative = `Steady week. Your garden held its ground.`;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] py-8">
      <WeeklySummary
        promises={promises}
        currentWeekCheckIns={currentWeek}
        previousWeekCheckIns={previousWeek}
        narrative={narrative}
        onDismiss={() => router.push("/")}
        onReflect={(text) => {
          // Could save to summaries table
          console.log("Weekly reflection:", text);
        }}
      />
    </div>
  );
}
