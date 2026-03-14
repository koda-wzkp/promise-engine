"use client";

import { useState, useCallback, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PromiseForm from "@/components/network/PromiseForm";
import PromiseCard from "@/components/network/PromiseCard";
import NetworkHealth from "@/components/network/NetworkHealth";
import DataExportImport from "@/components/network/DataExportImport";
import { usePromiseNetwork } from "@/lib/hooks/usePromiseNetwork";
import { PromiseStatus } from "@/lib/types/promise";
import { NetworkPromise, StatusChangeContext, PromiseCreateInput } from "@/lib/types/network";
import TemplatePicker from "@/components/personal/TemplatePicker";
import { PromiseQualityEvaluation } from "@/lib/types/quality";

const PERSONAL_NETWORK_ID = "net-personal-default";

type TabId = "active" | "timeline" | "insights" | "settings";

export default function PersonalPage() {
  const {
    network,
    isLoaded,
    createPromise,
    updateStatus,
    renegotiatePromise,
    deletePromise,
    networkHealth,
    agentStats,
    domainHealth,
    updateConfig,
    exportNetwork,
    importNetwork,
  } = usePromiseNetwork(PERSONAL_NETWORK_ID, "personal");

  const [activeTab, setActiveTab] = useState<TabId>("active");
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PromiseStatus | "all">("all");
  const [domainFilter, setDomainFilter] = useState<string>("all");

  const myAgent = network.agents[0];
  const myStats = myAgent ? agentStats.get(myAgent.id) : null;

  // Filtered promises
  const filteredPromises = useMemo(() => {
    let result = network.promises;
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (domainFilter !== "all") {
      result = result.filter((p) => p.domain === domainFilter);
    }
    // Sort: active first, then by creation date
    return [...result].sort((a, b) => {
      const activeStatuses = ["declared", "degraded"];
      const aActive = activeStatuses.includes(a.status) ? 0 : 1;
      const bActive = activeStatuses.includes(b.status) ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [network.promises, statusFilter, domainFilter]);

  const activeCount = network.promises.filter((p) => p.status === "declared" || p.status === "degraded").length;

  // Compute personal stats from network data
  const personalStats = useMemo(() => {
    const promises = network.promises;
    const completed = promises.filter((p) => p.status === "verified" || p.status === "violated");
    const kept = completed.filter((p) => p.status === "verified");
    const keptRate = completed.length > 0 ? (kept.length / completed.length) * 100 : 0;

    const byDomain: Record<string, { total: number; kept: number; broken: number; active: number }> = {};
    for (const p of promises) {
      const domainName = network.domains.find((d) => d.id === p.domain)?.name ?? p.domain;
      if (!byDomain[domainName]) byDomain[domainName] = { total: 0, kept: 0, broken: 0, active: 0 };
      byDomain[domainName].total++;
      if (p.status === "verified") byDomain[domainName].kept++;
      if (p.status === "violated") byDomain[domainName].broken++;
      if (p.status === "declared" || p.status === "degraded") byDomain[domainName].active++;
    }

    return { total: promises.length, active: activeCount, keptRate, byDomain, streak: myStats?.currentStreak ?? 0 };
  }, [network.promises, network.domains, activeCount, myStats]);

  const handleStatusChange = useCallback((id: string) => (newStatus: PromiseStatus, context?: StatusChangeContext) => {
    updateStatus(id, newStatus, context);
  }, [updateStatus]);

  const handleRenegotiate = useCallback((id: string) => (newBody: string, newTarget?: string) => {
    renegotiatePromise(id, newBody, newTarget);
  }, [renegotiatePromise]);

  const handleAddTemplates = useCallback((templates: Array<{ body: string; domain: string; quality_evaluation: PromiseQualityEvaluation }>) => {
    for (const t of templates) {
      const domainObj = network.domains.find((d) => d.name.toLowerCase() === t.domain.toLowerCase());
      const input: PromiseCreateInput = {
        body: t.body,
        promiser: myAgent?.id ?? "",
        promisee: "self",
        domain: domainObj?.id ?? network.domains[0]?.id ?? "",
        quality_evaluation: t.quality_evaluation,
      };
      createPromise(input);
    }
  }, [createPromise, network.domains, myAgent]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#faf9f6]">
        <Navbar />
        <main id="main-content" className="mx-auto max-w-3xl px-4 py-6">
          <p className="text-center text-gray-400 py-12">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "active", label: `Active (${activeCount})` },
    { id: "timeline", label: "All Promises" },
    { id: "insights", label: "Insights" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Navbar />

      <main id="main-content" className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-5 sm:mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">{network.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your commitments. Build reliability over time.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3 mb-5 sm:mb-6">
          <div className="md:col-span-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Your Momentum
            </h3>
            {(() => {
              const momentum = getMomentum(personalStats.keptRate, personalStats.total, personalStats.streak);
              return (
                <>
                  <div className="flex items-end gap-3">
                    <span className={`font-serif text-2xl font-bold ${momentum.color}`}>
                      {momentum.label}
                    </span>
                    {personalStats.total > 0 && (
                      <span className="mb-0.5 text-sm text-gray-400">
                        {Math.round(personalStats.keptRate)}% kept
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{momentum.message}</p>
                </>
              );
            })()}
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-semibold text-gray-900">{personalStats.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-green-700">{personalStats.active}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{personalStats.streak > 0 ? personalStats.streak : "\u2014"}</p>
                <p className="text-xs text-gray-500">Streak</p>
              </div>
            </div>
          </div>

          {/* Domain breakdown */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              By Domain
            </h3>
            <div className="space-y-3">
              {Object.entries(personalStats.byDomain).sort((a, b) => b[1].total - a[1].total).map(([domain, data]) => (
                <div key={domain}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{domain}</span>
                    <span className="text-xs text-gray-500">
                      {data.kept}/{data.total} kept
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-green-600 transition-all"
                      style={{ width: `${data.total > 0 ? (data.kept / data.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
              {Object.keys(personalStats.byDomain).length === 0 && (
                <p className="text-xs text-gray-400">No promises yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Tab navigation — sticky on scroll */}
        <div
          className="sticky top-[57px] z-30 -mx-4 mb-4 border-b border-gray-200 bg-[#faf9f6]/95 backdrop-blur-sm px-4"
          role="tablist"
          aria-label="Personal promise views"
        >
          <div className="flex gap-1 sm:gap-4 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 px-2 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div role="tabpanel" id={`tabpanel-${activeTab}`}>
          {(activeTab === "active" || activeTab === "timeline") && (
            <div>
              {/* Template picker */}
              <TemplatePicker onAddTemplates={handleAddTemplates} />

              {/* Create button / form */}
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="mb-4 w-full rounded-xl border-2 border-dashed border-gray-300 px-4 py-5 text-sm font-medium text-gray-500 hover:border-gray-400 hover:bg-white/60 hover:text-gray-700 active:bg-white transition-colors"
                >
                  + Make a new promise
                </button>
              ) : (
                <div className="mb-4">
                  <PromiseForm
                    mode="create"
                    complexity="simple"
                    agents={network.agents}
                    domains={network.domains}
                    existingPromises={network.promises}
                    config={network.config}
                    onSubmit={(input) => {
                      createPromise(input);
                      setShowForm(false);
                    }}
                    onCancel={() => setShowForm(false)}
                    initialValues={{
                      promiser: myAgent?.id,
                      promisee: "self",
                    }}
                  />
                </div>
              )}

              {/* Filters */}
              {activeTab === "timeline" && network.promises.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as PromiseStatus | "all")}
                    className="rounded border border-gray-200 px-2 py-1 text-xs"
                    aria-label="Filter by status"
                  >
                    <option value="all">All statuses</option>
                    {Object.entries(network.config.statusLabels).map(([status, label]) => (
                      <option key={status} value={status}>{label}</option>
                    ))}
                  </select>
                  <select
                    value={domainFilter}
                    onChange={(e) => setDomainFilter(e.target.value)}
                    className="rounded border border-gray-200 px-2 py-1 text-xs"
                    aria-label="Filter by domain"
                  >
                    <option value="all">All domains</option>
                    {network.domains.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Promise list */}
              <div className="space-y-3 sm:space-y-4" aria-live="polite">
                {(activeTab === "active"
                  ? filteredPromises.filter((p) => p.status === "declared" || p.status === "degraded")
                  : filteredPromises
                ).map((p) => (
                  <PromiseCard
                    key={p.id}
                    promise={p}
                    agents={network.agents}
                    domains={network.domains}
                    config={network.config}
                    variant="timeline"
                    onStatusChange={handleStatusChange(p.id)}
                    onRenegotiate={handleRenegotiate(p.id)}
                    onDelete={() => deletePromise(p.id)}
                    showDependencies
                    showActions
                  />
                ))}
                {filteredPromises.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-base text-gray-400">
                      {activeTab === "active" ? "No active promises yet" : "No promises match your filters"}
                    </p>
                    {activeTab === "active" && (
                      <p className="mt-1 text-sm text-gray-400">
                        Tap the button above to make your first commitment.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "insights" && (
            <div className="space-y-4">
              <NetworkHealth
                health={networkHealth}
                config={network.config}
                variant="full"
              />

              {/* Trend placeholder */}
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Trends</h3>
                <p className="text-xs text-gray-500">
                  Trend analysis will appear here as you build a history of promises.
                </p>
                {myStats && (
                  <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {Math.round(myStats.keptRate * 100)}%
                      </p>
                      <p className="text-xs text-gray-500">Kept Rate</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{myStats.currentStreak}</p>
                      <p className="text-xs text-gray-500">Streak</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold capitalize text-gray-900">{myStats.trend}</p>
                      <p className="text-xs text-gray-500">Trend</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-4">
              {/* Domain management */}
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Domains</h3>
                <div className="space-y-2">
                  {network.domains.map((d) => (
                    <div key={d.id} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-sm text-gray-700">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data contribution toggle */}
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Help improve Promise Pipeline</h3>
                <p className="text-xs text-gray-500 mb-3">
                  Share anonymized promise patterns from this network. Your promise content is never shared — only the structure (domain, timing, outcome, dependencies). You can withdraw at any time.
                </p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={network.config.dataContribution.enabled}
                    onChange={(e) => updateConfig({
                      dataContribution: { ...network.config.dataContribution, enabled: e.target.checked },
                    })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Enable anonymous data sharing</span>
                </label>
              </div>

              {/* Export/Import */}
              <DataExportImport
                networkName={network.name}
                onExport={exportNetwork}
                onImport={importNetwork}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function getMomentum(
  keptRate: number,
  totalPromises: number,
  streak: number,
): { label: string; message: string; color: string } {
  // No promises yet — welcome them
  if (totalPromises === 0) {
    return {
      label: "Ready to begin",
      message: "Your first promise is waiting. Start small.",
      color: "text-gray-700",
    };
  }

  // Too few completed to judge — celebrate showing up
  const completed = totalPromises - (streak > 0 ? streak : 0); // rough proxy
  if (totalPromises <= 2) {
    return {
      label: "Planting seeds",
      message: "Early days. Every commitment counts.",
      color: "text-sky-accent",
    };
  }

  // Streak bonus: if they're on a roll, lead with that
  if (streak >= 5) {
    return {
      label: "On fire",
      message: `${streak} in a row. You're building something real.`,
      color: "text-green-700",
    };
  }

  if (keptRate >= 85) {
    return {
      label: "Thriving",
      message: "Strong follow-through. Your word means something.",
      color: "text-green-700",
    };
  }

  if (keptRate >= 65) {
    return {
      label: "Building steady",
      message: "Consistent progress. Keep showing up.",
      color: "text-blue-700",
    };
  }

  if (keptRate >= 40) {
    return {
      label: "Finding your rhythm",
      message: "Some promises land, some teach you. Both matter.",
      color: "text-amber-700",
    };
  }

  // Low rate — but they're still here
  return {
    label: "Still here",
    message: "Showing up is the hardest part. Try smaller promises.",
    color: "text-gray-700",
  };
}
