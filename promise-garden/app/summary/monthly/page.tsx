"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/supabase/auth";
import { getActivePromises, getCheckIns } from "@/lib/supabase/queries";
import type { PersonalPromise, PersonalDomain } from "@/lib/types/personal";
import type { CheckIn } from "@/lib/types/check-in";
import { daysAgo } from "@/lib/utils/formatting";
import {
  calculateDomainReliability,
  calculateOverallReliability,
  calculateTrend,
} from "@/lib/simulation/scoring";
import MonthlySummary from "@/components/summary/MonthlySummary";

export default function MonthlySummaryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [promises, setPromises] = useState<PersonalPromise[]>([]);
  const [currentMonth, setCurrentMonth] = useState<CheckIn[]>([]);
  const [previousMonth, setPreviousMonth] = useState<CheckIn[]>([]);

  useEffect(() => {
    async function init() {
      const session = await getSession();
      if (!session) { router.push("/auth/login"); return; }
      const uid = session.user.id;

      const [proms, curMonth, prevMonth] = await Promise.all([
        getActivePromises(uid),
        getCheckIns(uid, undefined, daysAgo(30), daysAgo(0)),
        getCheckIns(uid, undefined, daysAgo(60), daysAgo(30)),
      ]);

      setPromises(proms);
      setCurrentMonth(curMonth);
      setPreviousMonth(prevMonth);
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

  const domains: PersonalDomain[] = ["health", "work", "relationships", "creative", "financial"];
  const reliabilityByDomain = calculateDomainReliability(promises, currentMonth);
  const prevReliability = calculateDomainReliability(promises, previousMonth);
  const trendsVsLastMonth = Object.fromEntries(
    domains.map((d) => [d, (reliabilityByDomain[d] ?? 0) - (prevReliability[d] ?? 0)])
  ) as Record<PersonalDomain, number>;
  const overallReliability = calculateOverallReliability(currentMonth);

  return (
    <div className="min-h-screen bg-[var(--bg)] py-8">
      <MonthlySummary
        reliabilityByDomain={reliabilityByDomain}
        trendsVsLastMonth={trendsVsLastMonth}
        overallReliability={overallReliability}
        wildlifeGained={[]}
        wildlifeLost={[]}
        landscapeChanges={[]}
        dependencyInsights={[]}
        onAddPromise={() => router.push("/create")}
        onRenegotiate={() => router.push("/")}
        onAbandon={() => router.push("/")}
        onReclaim={() => router.push("/create")}
        onDismiss={() => router.push("/")}
      />
    </div>
  );
}
