"use client";

import { useMemo } from "react";
import { DashboardData } from "@/lib/types/promise";
import { calculateNetworkHealth } from "@/lib/simulation/scoring";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SummaryTab from "@/components/dashboard/SummaryTab";
import PromiseList from "@/components/promise/PromiseList";
import InsightsTab from "@/components/dashboard/InsightsTab";
import { useState } from "react";

interface DemoVerticalPageProps {
  data: DashboardData;
  accentColor?: string;
  bgColor?: string;
}

const TABS = ["Summary", "Promises", "Insights"] as const;

export default function DemoVerticalPage({ data, accentColor, bgColor }: DemoVerticalPageProps) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Summary");
  const health = useMemo(() => calculateNetworkHealth(data.promises), [data.promises]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor ?? "#faf9f6" }}>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-2 rounded-lg bg-blue-50 px-4 py-2 text-xs text-blue-700">
          Simulation coming soon — currently showing static accountability data.
        </div>

        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-gray-900">{data.title}</h1>
          <p className="mt-1 text-sm text-gray-500">{data.subtitle}</p>
          <p className="mt-1 text-xs text-gray-400">
            {data.promises.length} promises · {data.agents.length} agents · {data.domains.length} domains
          </p>
        </div>

        <div className="mb-6 flex gap-1 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Summary" && <SummaryTab data={data} health={health} />}
        {activeTab === "Promises" && (
          <PromiseList promises={data.promises} agents={data.agents} domains={data.domains} />
        )}
        {activeTab === "Insights" && (
          <InsightsTab insights={data.insights} promises={data.promises} />
        )}
      </main>

      <Footer />
    </div>
  );
}
