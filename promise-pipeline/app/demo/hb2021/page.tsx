"use client";

import { useState, useMemo, useCallback } from "react";
import { Promise as PromiseType, PromiseStatus, Domain } from "@/lib/types/promise";
import { WhatIfQuery, CascadeResult } from "@/lib/types/simulation";
import { createHB2021Network, insights, trajectories, dashboard, rawAgents } from "@/lib/data/hb2021-network";
import { usePromiseNetwork } from "@/lib/hooks/usePromiseNetwork";
import { applySimulation } from "@/lib/simulation/cascade";
import { calculateNetworkHealth } from "@/lib/simulation/scoring";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SummaryTab from "@/components/dashboard/SummaryTab";
import TrajectoryTab from "@/components/dashboard/TrajectoryTab";
import InsightsTab from "@/components/dashboard/InsightsTab";
import AboutTab from "@/components/dashboard/AboutTab";
import PromiseList from "@/components/promise/PromiseList";
import NetworkGraphPanel from "@/components/network/NetworkGraphPanel";
import WhatIfPanel from "@/components/simulation/WhatIfPanel";
import CascadeResults from "@/components/simulation/CascadeResults";
import PromiseDetailPanel from "@/components/promise/PromiseDetailPanel";
import InlineServiceCTA from "@/components/cta/InlineServiceCTA";

// ─── NETWORK DATA (civic scope — loaded from typed file, not localStorage) ───
const hb2021Network = createHB2021Network();

// ─── COMPARE MODE ───
interface CompareScenario {
  label: string;
  query: WhatIfQuery;
  result: CascadeResult;
}

const TABS = ["Summary", "Network", "Trajectory", "Promises", "Insights", "About"] as const;
type Tab = (typeof TABS)[number];

export default function HB2021Dashboard() {
  // ─── HOOK: all data flows through usePromiseNetwork ───
  const network = usePromiseNetwork("net-hb2021", "civic", hb2021Network);

  const [activeTab, setActiveTab] = useState<Tab>("Summary");
  const [selectedPromise, setSelectedPromise] = useState<string | null>(null);

  // Detail panel state — independent from the What If panel
  const [detailPromiseId, setDetailPromiseId] = useState<string | null>(null);

  // Compare mode: stored scenarios
  const [compareScenarios, setCompareScenarios] = useState<CompareScenario[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  // Domain filter from summary tab
  const [pendingDomainFilter, setPendingDomainFilter] = useState<string | null>(null);

  // ─── CONVERT NETWORK TYPES TO BASE TYPES FOR COMPONENTS ───
  // Components use base Promise/Agent/Domain types. The hook stores NetworkPromise/NetworkAgent/NetworkDomain.
  // This conversion bridges the two type systems without changing either.

  const basePromises: PromiseType[] = useMemo(
    () =>
      network.network.promises.map((p) => ({
        id: p.id,
        ref: p.ref,
        promiser: p.promiser,
        promisee: p.promisee,
        body: p.body,
        domain: p.domain,
        status: p.status,
        target: p.target,
        progress: p.progress,
        required: p.required,
        note: p.note ?? "",
        verification: p.verification,
        depends_on: p.depends_on,
      })),
    [network.network.promises],
  );

  // Build Domain[] with promiseCount and healthScore from hook's computed data
  const baseDomains: Domain[] = useMemo(
    () =>
      network.network.domains.map((d) => ({
        name: d.name,
        color: d.color,
        promiseCount: network.network.promises.filter((p) => p.domain === d.name).length,
        healthScore: network.domainHealth.get(d.id) ?? 0,
      })),
    [network.network.domains, network.network.promises, network.domainHealth],
  );

  // Agents: raw base agents for component compatibility (same data, base Agent type)
  const baseAgents = rawAgents;

  // ─── SIMULATION: use hook's cascade simulation ───
  const hookSim = network.simulationState;

  // Compute promises (actual or simulated) for display
  const displayPromises: PromiseType[] = useMemo(() => {
    if (hookSim.active && hookSim.query && hookSim.result) {
      return applySimulation(basePromises, hookSim.query, hookSim.result);
    }
    return basePromises;
  }, [hookSim, basePromises]);

  // Use hook's networkHealth when not simulating, recompute for simulated view
  const health = useMemo(() => {
    if (hookSim.active && hookSim.result) {
      return calculateNetworkHealth(displayPromises);
    }
    return network.networkHealth;
  }, [hookSim, displayPromises, network.networkHealth]);

  // Set of simulated promise IDs for visual highlighting
  const simulatedIds = useMemo(() => {
    if (!hookSim.result) return new Set<string>();
    const ids = new Set(hookSim.result.affectedPromises.map((a) => a.promiseId));
    if (hookSim.query) ids.add(hookSim.query.promiseId);
    return ids;
  }, [hookSim]);

  // ─── HANDLERS ───

  function handleSelectPromise(id: string) {
    setSelectedPromise(id);
  }

  function handleSimulate(promiseId: string, newStatus: PromiseStatus) {
    const query: WhatIfQuery = { promiseId, newStatus };
    network.runCascadeSimulation(query);
  }

  function handleWhatIf(promiseId: string) {
    setSelectedPromise(promiseId);
    setActiveTab("Network");
  }

  function handleReset() {
    network.clearSimulation();
    setSelectedPromise(null);
  }

  // Open promise detail panel from anywhere
  const handleOpenDetail = useCallback((promiseId: string) => {
    setDetailPromiseId(promiseId);
  }, []);

  // From detail panel → simulate cascade
  const handleDetailSimulate = useCallback((promiseId: string) => {
    setDetailPromiseId(null);
    setSelectedPromise(promiseId);
    setActiveTab("Network");
  }, []);

  // Navigate detail panel to a different promise
  const handleDetailNavigate = useCallback((promiseId: string) => {
    setDetailPromiseId(promiseId);
  }, []);

  // Domain click from summary → filter Promises tab
  const handleDomainClick = useCallback((domain: string) => {
    setPendingDomainFilter(domain);
    setActiveTab("Promises");
  }, []);

  // Save current scenario for comparison
  function handleSaveScenario() {
    if (!hookSim.query || !hookSim.result) return;
    const source = basePromises.find((p) => p.id === hookSim.query!.promiseId);
    const label = source
      ? `${source.id} → ${hookSim.query.newStatus}`
      : `${hookSim.query.promiseId} → ${hookSim.query.newStatus}`;

    setCompareScenarios((prev) => {
      // Max 2 scenarios
      const next = [...prev, { label, query: hookSim.query!, result: hookSim.result! }];
      return next.slice(-2);
    });
  }

  const selectedPromiseData = selectedPromise
    ? basePromises.find((p) => p.id === selectedPromise)
    : null;

  const detailPromiseData = detailPromiseId
    ? displayPromises.find((p) => p.id === detailPromiseId)
    : null;

  if (!network.isLoaded) {
    return (
      <div className="min-h-screen bg-[#faf9f6]">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-12 text-center">
          <p className="text-gray-400">Loading network data...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Navbar />

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-2 rounded-lg bg-blue-50 px-4 py-2 text-xs text-blue-700">
          <strong>Beta</strong> — Data is illustrative and may contain inaccuracies. Cascade simulation is experimental.
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-gray-900">
            {dashboard.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{dashboard.subtitle}</p>
          <p className="mt-1 font-mono text-xs text-gray-400">
            {network.network.promises.length} promises · {network.network.agents.length} agents · {network.network.domains.length} domains
          </p>
        </div>

        {/* Simulation banner */}
        {hookSim.active && (
          <div className="mb-4 flex items-center justify-between rounded-lg border-2 border-yellow-300 bg-yellow-50 px-4 py-2">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Simulating:</span> Showing cascade effects.
              Data below reflects hypothetical state changes.
            </p>
            <div className="flex gap-2">
              {hookSim.result && compareScenarios.length < 2 && (
                <button
                  onClick={handleSaveScenario}
                  className="rounded bg-yellow-200 px-3 py-1 text-xs font-medium text-yellow-800 hover:bg-yellow-300"
                >
                  Save Scenario
                </button>
              )}
              <button
                onClick={handleReset}
                className="rounded bg-yellow-200 px-3 py-1 text-xs font-medium text-yellow-800 hover:bg-yellow-300"
              >
                Reset to Actual
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div role="tablist" aria-label="Dashboard sections" className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              id={`tab-${tab.toLowerCase()}`}
              aria-selected={activeTab === tab}
              aria-controls={`tabpanel-${tab.toLowerCase()}`}
              tabIndex={activeTab === tab ? 0 : -1}
              onClick={() => {
                setActiveTab(tab);
                if (tab !== "Promises") setPendingDomainFilter(null);
              }}
              onKeyDown={(e) => {
                const idx = TABS.indexOf(tab);
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  const next = TABS[(idx + 1) % TABS.length];
                  setActiveTab(next);
                  document.getElementById(`tab-${next.toLowerCase()}`)?.focus();
                } else if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  const prev = TABS[(idx - 1 + TABS.length) % TABS.length];
                  setActiveTab(prev);
                  document.getElementById(`tab-${prev.toLowerCase()}`)?.focus();
                }
              }}
              className={`tab-transition whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                activeTab === tab
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content with transition wrapper */}
        <div className="tab-content-fade" role="tabpanel" id={`tabpanel-${activeTab.toLowerCase()}`} aria-labelledby={`tab-${activeTab.toLowerCase()}`}>
          {activeTab === "Summary" && (
            <SummaryTab
              data={{ ...dashboard, promises: displayPromises, domains: baseDomains }}
              health={health}
              onDomainClick={handleDomainClick}
              onPromiseClick={handleOpenDetail}
            />
          )}

          {activeTab === "Network" && (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <NetworkGraphPanel
                  promises={displayPromises}
                  agents={baseAgents}
                  domains={baseDomains}
                  cascadeResult={hookSim.result ?? null}
                  selectedPromise={selectedPromise}
                  onSelectPromise={(id) => {
                    handleSelectPromise(id);
                    handleOpenDetail(id);
                  }}
                />
                <p className="mt-2 text-xs text-gray-400">
                  Click any promise node to view details. Use the view switcher (top-right) to explore Watershed, Canopy, or Strata visualizations.
                </p>
              </div>
              <div className="space-y-4">
                {selectedPromiseData && !hookSim.result && (
                  <WhatIfPanel
                    promise={selectedPromiseData}
                    agents={baseAgents}
                    onSimulate={handleSimulate}
                    onClose={() => setSelectedPromise(null)}
                  />
                )}
                {hookSim.result && (
                  <CascadeResults
                    result={hookSim.result}
                    promises={basePromises}
                    onReset={handleReset}
                    onPromiseClick={handleOpenDetail}
                  />
                )}
                {!selectedPromiseData && !hookSim.result && (
                  <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
                    <p className="text-sm text-gray-500">
                      Click a promise node in the graph to simulate cascade effects.
                    </p>
                  </div>
                )}

                {/* Compare mode */}
                {compareScenarios.length > 0 && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase text-gray-400">Saved Scenarios</h4>
                      <button
                        onClick={() => setShowCompare(!showCompare)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        {showCompare ? "Hide" : "Compare"}
                      </button>
                    </div>
                    {showCompare && (
                      <div className="mt-3 space-y-3">
                        {compareScenarios.map((scenario, i) => (
                          <div key={i} className="rounded bg-gray-50 p-3">
                            <p className="font-mono text-xs font-semibold text-gray-700">{scenario.label}</p>
                            <div className="mt-2 flex items-center gap-3 text-sm">
                              <span className="text-gray-400">{scenario.result.originalNetworkHealth}</span>
                              <span className="text-gray-300">→</span>
                              <span className={`font-bold ${
                                scenario.result.newNetworkHealth < scenario.result.originalNetworkHealth
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}>
                                {scenario.result.newNetworkHealth}
                              </span>
                              <span className="ml-auto text-xs text-gray-400">
                                {scenario.result.affectedPromises.length} affected
                              </span>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => setCompareScenarios([])}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          Clear scenarios
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "Trajectory" && (
            <TrajectoryTab trajectories={trajectories} />
          )}

          {activeTab === "Promises" && (
            <PromiseList
              promises={displayPromises}
              agents={baseAgents}
              domains={baseDomains}
              onWhatIf={handleWhatIf}
              simulatedIds={simulatedIds}
              onPromiseClick={handleOpenDetail}
              initialDomainFilter={pendingDomainFilter}
            />
          )}

          {activeTab === "Insights" && (
            <InsightsTab
              insights={insights}
              promises={displayPromises}
              onPromiseClick={handleOpenDetail}
            />
          )}

          {activeTab === "About" && <AboutTab />}
        </div>

        <InlineServiceCTA variant="analysis" />
      </main>

      <Footer />

      {/* Promise Detail Panel — slides in from right */}
      {detailPromiseData && (
        <PromiseDetailPanel
          promise={detailPromiseData}
          agents={baseAgents}
          allPromises={displayPromises}
          onClose={() => setDetailPromiseId(null)}
          onSimulateCascade={handleDetailSimulate}
          onSelectPromise={handleDetailNavigate}
        />
      )}
    </div>
  );
}
