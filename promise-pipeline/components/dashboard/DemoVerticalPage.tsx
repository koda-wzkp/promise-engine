"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DashboardData } from "@/lib/types/promise";
import { calculateNetworkHealth } from "@/lib/simulation/scoring";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SummaryTab from "@/components/dashboard/SummaryTab";
import PromiseList from "@/components/promise/PromiseList";
import InsightsTab from "@/components/dashboard/InsightsTab";
import TrajectoryTab from "@/components/dashboard/TrajectoryTab";

interface DemoVerticalPageProps {
  data: DashboardData;
  accentColor?: string;
  bgColor?: string;
}

const ALL_TABS = ["Summary", "Trajectory", "Promises", "Insights"] as const;
type Tab = (typeof ALL_TABS)[number];

export default function DemoVerticalPage({ data, accentColor, bgColor }: DemoVerticalPageProps) {
  const TABS: Tab[] = data.trajectories.length > 0
    ? ["Summary", "Trajectory", "Promises", "Insights"]
    : ["Summary", "Promises", "Insights"];
  const [activeTab, setActiveTab] = useState<Tab>("Summary");
  const health = useMemo(() => calculateNetworkHealth(data.promises), [data.promises]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor ?? "#faf9f6" }}>
      <Navbar />

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-2 rounded-lg bg-blue-50 px-4 py-2 text-xs text-blue-700">
          <strong>Beta</strong> — Data is illustrative and may contain inaccuracies. Cascade simulation is not yet live.{" "}
          <Link href="/" className="underline decoration-blue-300 hover:text-blue-900">Learn more</Link>
        </div>

        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-gray-900">{data.title}</h1>
          <p className="mt-1 text-sm text-gray-500">{data.subtitle}</p>
          <p className="mt-1 text-xs text-gray-400">
            {data.promises.length} promises · {data.agents.length} agents · {data.domains.length} domains
          </p>
        </div>

        <div role="tablist" aria-label="Dashboard sections" className="mb-6 flex gap-1 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              id={`demo-tab-${tab.toLowerCase()}`}
              aria-selected={activeTab === tab}
              aria-controls={`demo-tabpanel-${tab.toLowerCase()}`}
              tabIndex={activeTab === tab ? 0 : -1}
              onClick={() => setActiveTab(tab)}
              onKeyDown={(e) => {
                const idx = TABS.indexOf(tab);
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  const next = TABS[(idx + 1) % TABS.length];
                  setActiveTab(next);
                  document.getElementById(`demo-tab-${next.toLowerCase()}`)?.focus();
                } else if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  const prev = TABS[(idx - 1 + TABS.length) % TABS.length];
                  setActiveTab(prev);
                  document.getElementById(`demo-tab-${prev.toLowerCase()}`)?.focus();
                }
              }}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                activeTab === tab
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`demo-tabpanel-${activeTab.toLowerCase()}`} aria-labelledby={`demo-tab-${activeTab.toLowerCase()}`}>
        {activeTab === "Summary" && <SummaryTab data={data} health={health} />}
        {activeTab === "Trajectory" && <TrajectoryTab trajectories={data.trajectories} />}
        {activeTab === "Promises" && (
          <PromiseList promises={data.promises} agents={data.agents} domains={data.domains} />
        )}
        {activeTab === "Insights" && (
          <InsightsTab insights={data.insights} promises={data.promises} />
        )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
