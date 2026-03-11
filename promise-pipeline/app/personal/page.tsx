"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PromiseCreator from "@/components/personal/PromiseCreator";
import PromiseTimeline from "@/components/personal/PromiseTimeline";
import ReliabilityScore from "@/components/personal/ReliabilityScore";
import DomainBreakdown from "@/components/personal/DomainBreakdown";
import { PersonalPromise, PersonalStats } from "@/lib/types/personal";
import { PromiseStatus } from "@/lib/types/promise";
import { loadFromStorage, saveToStorage } from "@/lib/utils/storage";

const STORAGE_KEY = "promise-pipeline-personal";

function computeStats(promises: PersonalPromise[]): PersonalStats {
  const completed = promises.filter((p) => p.status === "verified" || p.status === "violated");
  const kept = completed.filter((p) => p.status === "verified");
  const active = promises.filter((p) => p.status === "declared" || p.status === "degraded");

  const byDomain: PersonalStats["byDomain"] = {};
  for (const p of promises) {
    if (!byDomain[p.domain]) {
      byDomain[p.domain] = { total: 0, kept: 0, broken: 0, active: 0, keptRate: 0 };
    }
    byDomain[p.domain].total++;
    if (p.status === "verified") byDomain[p.domain].kept++;
    if (p.status === "violated") byDomain[p.domain].broken++;
    if (p.status === "declared" || p.status === "degraded") byDomain[p.domain].active++;
  }
  for (const d of Object.values(byDomain)) {
    const domainCompleted = d.kept + d.broken;
    d.keptRate = domainCompleted > 0 ? (d.kept / domainCompleted) * 100 : 0;
  }

  return {
    totalPromises: promises.length,
    activePromises: active.length,
    keptRate: completed.length > 0 ? (kept.length / completed.length) * 100 : 0,
    averageDaysToComplete: 0,
    byDomain,
    trend: [],
  };
}

export default function PersonalPage() {
  const [promises, setPromises] = useState<PersonalPromise[]>([]);

  useEffect(() => {
    setPromises(loadFromStorage<PersonalPromise[]>(STORAGE_KEY, []));
  }, []);

  const persist = useCallback((updated: PersonalPromise[]) => {
    setPromises(updated);
    saveToStorage(STORAGE_KEY, updated);
  }, []);

  const handleAdd = useCallback(
    (p: PersonalPromise) => persist([p, ...promises]),
    [promises, persist]
  );

  const handleUpdateStatus = useCallback(
    (id: string, status: PromiseStatus) => {
      persist(
        promises.map((p) =>
          p.id === id
            ? {
                ...p,
                status,
                completedAt:
                  status === "verified" || status === "violated"
                    ? new Date().toISOString()
                    : p.completedAt,
              }
            : p
        )
      );
    },
    [promises, persist]
  );

  const handleReflect = useCallback(
    (id: string, reflection: string) => {
      persist(promises.map((p) => (p.id === id ? { ...p, reflection } : p)));
    },
    [promises, persist]
  );

  const stats = useMemo(() => computeStats(promises), [promises]);

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-gray-900">Personal Promises</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your commitments. Build reliability over time.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="md:col-span-2">
            <ReliabilityScore stats={stats} />
          </div>
          <DomainBreakdown stats={stats} />
        </div>

        <div className="mb-4">
          <PromiseCreator onAdd={handleAdd} />
        </div>

        <PromiseTimeline
          promises={promises}
          onUpdateStatus={handleUpdateStatus}
          onReflect={handleReflect}
        />
      </main>

      <Footer />
    </div>
  );
}
