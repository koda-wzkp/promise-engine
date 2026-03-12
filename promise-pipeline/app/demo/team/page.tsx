"use client";

import { useState, useCallback, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TeamKanban from "@/components/team/TeamKanban";
import TeamHealthBar from "@/components/team/TeamHealthBar";
import MemberLoad from "@/components/team/MemberLoad";
import { TeamPromise, TeamMember } from "@/lib/types/team";
import { PromiseStatus } from "@/lib/types/promise";
import { calculateNetworkHealth } from "@/lib/simulation/scoring";
import { TEAM_DEMO_MEMBERS, TEAM_DEMO_PROMISES } from "@/lib/data/team-demo";

function computeMemberStats(members: TeamMember[], promises: TeamPromise[]): TeamMember[] {
  return members.map((m) => {
    const mine = promises.filter((p) => p.promiser === m.id);
    const active = mine.filter((p) => p.status === "declared" || p.status === "degraded");
    const completed = mine.filter((p) => p.status === "verified" || p.status === "violated");
    const kept = completed.filter((p) => p.status === "verified");
    return {
      ...m,
      activePromiseCount: active.length,
      keptRate: completed.length > 0 ? (kept.length / completed.length) * 100 : 100,
      loadScore: Math.min(100, active.length * 25),
    };
  });
}

export default function TeamDemoPage() {
  const [promises, setPromises] = useState<TeamPromise[]>(TEAM_DEMO_PROMISES);

  const handleUpdateStatus = useCallback(
    (id: string, status: PromiseStatus) => {
      setPromises((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    },
    []
  );

  const updatedMembers = useMemo(() => computeMemberStats(TEAM_DEMO_MEMBERS, promises), [promises]);
  const health = useMemo(() => calculateNetworkHealth(promises), [promises]);

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Navbar />

      <main id="main-content" className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl font-bold text-gray-900">Team Promises</h1>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
              Demo
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Shared commitments, mutual accountability.
          </p>
          <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
            This is a demo with a sample engineering team. Kanban cards are interactive — try
            verifying or degrading a promise to see health scores update.
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <TeamHealthBar health={health} />
          <MemberLoad members={updatedMembers} />
        </div>

        <TeamKanban promises={promises} onUpdateStatus={handleUpdateStatus} />
      </main>

      <Footer />
    </div>
  );
}
