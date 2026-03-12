"use client";

import { useState, useMemo, useReducer, useCallback } from "react";
import { PromiseStatus } from "@/lib/types/promise";
import { WhatIfQuery, CascadeResult } from "@/lib/types/simulation";
import {
  ACA_DASHBOARD,
  ACA_PROMISES,
  ACA_AGENTS,
  ACA_DOMAINS,
  ACA_INSIGHTS,
  ACA_TRAJECTORIES,
} from "@/lib/data/aca";
import { simulateCascade, applySimulation } from "@/lib/simulation/cascade";
import { calculateNetworkHealth } from "@/lib/simulation/scoring";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SummaryTab from "@/components/dashboard/SummaryTab";
import TrajectoryTab from "@/components/dashboard/TrajectoryTab";
import InsightsTab from "@/components/dashboard/InsightsTab";
import AboutTab from "@/components/dashboard/AboutTab";
import PromiseList from "@/components/promise/PromiseList";
import PromiseGraph from "@/components/network/PromiseGraph";
import WhatIfPanel from "@/components/simulation/WhatIfPanel";
import CascadeResults from "@/components/simulation/CascadeResults";
import PromiseDetailPanel from "@/components/promise/PromiseDetailPanel";
import InlineServiceCTA from "@/components/cta/InlineServiceCTA";

// ─── SIMULATION STATE ───
type SimState = {
  mode: "actual" | "simulating";
  activeQuery: WhatIfQuery | null;
  cascadeResult: CascadeResult | null;
  selectedPromise: string | null;
};

type SimAction =
  | { type: "SELECT_PROMISE"; promiseId: string }
  | { type: "RUN_SIMULATION"; query: WhatIfQuery; result: CascadeResult }
  | { type: "CLEAR_SIMULATION" }
  | { type: "RESET" };

function simReducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case "SELECT_PROMISE":
      return { ...state, selectedPromise: action.promiseId };
    case "RUN_SIMULATION":
      return {
        mode: "simulating",
        activeQuery: action.query,
        cascadeResult: action.result,
        selectedPromise: state.selectedPromise,
      };
    case "CLEAR_SIMULATION":
      return { mode: "actual", activeQuery: null, cascadeResult: null, selectedPromise: null };
    case "RESET":
      return { mode: "actual", activeQuery: null, cascadeResult: null, selectedPromise: null };
  }
}

// ─── COMPARE MODE ───
interface CompareScenario {
  label: string;
  query: WhatIfQuery;
  result: CascadeResult;
}

// ─── ACA-specific status list for What-If ───
const ACA_STATUSES: PromiseStatus[] = [
  "kept", "broken", "partial", "delayed", "modified", "legally_challenged", "repealed",
];

const TABS = ["Summary", "Network", "Trajectory", "Promises", "Insights", "About"] as const;
type Tab = (typeof TABS)[number];

export default function ACADashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("Summary");
  const [sim, dispatch] = useReducer(simReducer, {
    mode: "actual",
    activeQuery: null,
    cascadeResult: null,
    selectedPromise: null,
  });

  const [detailPromiseId, setDetailPromiseId] = useState<string | null>(null);
  const [compareScenarios, setCompareScenarios] = useState<CompareScenario[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [pendingDomainFilter, setPendingDomainFilter] = useState<string | null>(null);

  const displayPromises = useMemo(() => {
    if (sim.mode === "simulating" && sim.activeQuery && sim.cascadeResult) {
      return applySimulation(ACA_PROMISES, sim.activeQuery, sim.cascadeResult);
    }
    return ACA_PROMISES;
  }, [sim]);

  const health = useMemo(() => calculateNetworkHealth(displayPromises), [displayPromises]);

  const simulatedIds = useMemo(() => {
    if (!sim.cascadeResult) return new Set<string>();
    const ids = new Set(sim.cascadeResult.affectedPromises.map((a) => a.promiseId));
    if (sim.activeQuery) ids.add(sim.activeQuery.promiseId);
    return ids;
  }, [sim]);

  function handleSelectPromise(id: string) {
    dispatch({ type: "SELECT_PROMISE", promiseId: id });
  }

  function handleSimulate(promiseId: string, newStatus: PromiseStatus) {
    const query: WhatIfQuery = { promiseId, newStatus };
    const result = simulateCascade(ACA_PROMISES, query);
    dispatch({ type: "RUN_SIMULATION", query, result });
  }

  function handleWhatIf(promiseId: string) {
    dispatch({ type: "SELECT_PROMISE", promiseId });
    setActiveTab("Network");
  }

  function handleReset() {
    dispatch({ type: "RESET" });
  }

  const handleOpenDetail = useCallback((promiseId: string) => {
    setDetailPromiseId(promiseId);
  }, []);

  const handleDetailSimulate = useCallback((promiseId: string) => {
    setDetailPromiseId(null);
    dispatch({ type: "SELECT_PROMISE", promiseId });
    setActiveTab("Network");
  }, []);

  const handleDetailNavigate = useCallback((promiseId: string) => {
    setDetailPromiseId(promiseId);
  }, []);

  const handleDomainClick = useCallback((domain: string) => {
    setPendingDomainFilter(domain);
    setActiveTab("Promises");
  }, []);

  function handleSaveScenario() {
    if (!sim.activeQuery || !sim.cascadeResult) return;
    const source = ACA_PROMISES.find((p) => p.id === sim.activeQuery!.promiseId);
    const label = source
      ? `${source.id} → ${sim.activeQuery.newStatus}`
      : `${sim.activeQuery.promiseId} → ${sim.activeQuery.newStatus}`;

    setCompareScenarios((prev) => [...prev, { label, query: sim.activeQuery!, result: sim.cascadeResult! }].slice(-2));
  }

  const selectedPromiseData = sim.selectedPromise
    ? ACA_PROMISES.find((p) => p.id === sim.selectedPromise)
    : null;

  const detailPromiseData = detailPromiseId
    ? displayPromises.find((p) => p.id === detailPromiseId)
    : null;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-2 rounded-lg bg-blue-50 px-4 py-2 text-xs text-blue-700">
          <strong>Beta</strong> — Data is illustrative and may contain inaccuracies. Cascade simulation is experimental.
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-gray-900">
            {ACA_DASHBOARD.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{ACA_DASHBOARD.subtitle}</p>
          <p className="mt-1 font-mono text-xs text-gray-400">
            {ACA_PROMISES.length} promises · {ACA_AGENTS.length} agents · {ACA_DOMAINS.length} domains · POAD methodology
          </p>
        </div>

        {/* Simulation banner */}
        {sim.mode === "simulating" && (
          <div className="mb-4 flex items-center justify-between rounded-lg border-2 border-yellow-300 bg-yellow-50 px-4 py-2">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Simulating:</span> Showing cascade effects.
              Data below reflects hypothetical state changes.
            </p>
            <div className="flex gap-2">
              {sim.cascadeResult && compareScenarios.length < 2 && (
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
              id={`aca-tab-${tab.toLowerCase()}`}
              aria-selected={activeTab === tab}
              aria-controls={`aca-tabpanel-${tab.toLowerCase()}`}
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
                  document.getElementById(`aca-tab-${next.toLowerCase()}`)?.focus();
                } else if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  const prev = TABS[(idx - 1 + TABS.length) % TABS.length];
                  setActiveTab(prev);
                  document.getElementById(`aca-tab-${prev.toLowerCase()}`)?.focus();
                }
              }}
              className={`tab-transition whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                activeTab === tab
                  ? "border-blue-700 text-blue-900"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="tab-content-fade" role="tabpanel" id={`aca-tabpanel-${activeTab.toLowerCase()}`} aria-labelledby={`aca-tab-${activeTab.toLowerCase()}`}>
          {activeTab === "Summary" && (
            <SummaryTab
              data={{ ...ACA_DASHBOARD, promises: displayPromises }}
              health={health}
              onDomainClick={handleDomainClick}
              onPromiseClick={handleOpenDetail}
            />
          )}

          {activeTab === "Network" && (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <PromiseGraph
                  promises={displayPromises}
                  agents={ACA_AGENTS}
                  width={900}
                  height={700}
                  cascadeResult={sim.cascadeResult}
                  selectedPromise={sim.selectedPromise}
                  onSelectPromise={(id) => {
                    handleSelectPromise(id);
                    handleOpenDetail(id);
                  }}
                />
                <p className="mt-2 text-xs text-gray-400">
                  Click any promise node to view details. Scroll to zoom, drag to pan.
                  Diamond nodes (◆) are legal modifier nodes. Node size = downstream dependents.
                </p>
              </div>
              <div className="space-y-4">
                {selectedPromiseData && !sim.cascadeResult && (
                  <WhatIfPanel
                    promise={selectedPromiseData}
                    agents={ACA_AGENTS}
                    onSimulate={handleSimulate}
                    onClose={() => dispatch({ type: "SELECT_PROMISE", promiseId: "" })}
                    statusOptions={ACA_STATUSES}
                  />
                )}
                {sim.cascadeResult && (
                  <CascadeResults
                    result={sim.cascadeResult}
                    promises={ACA_PROMISES}
                    onReset={handleReset}
                    onPromiseClick={handleOpenDetail}
                  />
                )}
                {!selectedPromiseData && !sim.cascadeResult && (
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
            <TrajectoryTab trajectories={ACA_TRAJECTORIES} />
          )}

          {activeTab === "Promises" && (
            <PromiseList
              promises={displayPromises}
              agents={ACA_AGENTS}
              domains={ACA_DOMAINS}
              onWhatIf={handleWhatIf}
              simulatedIds={simulatedIds}
              onPromiseClick={handleOpenDetail}
              initialDomainFilter={pendingDomainFilter}
            />
          )}

          {activeTab === "Insights" && (
            <InsightsTab
              insights={ACA_INSIGHTS}
              promises={displayPromises}
              onPromiseClick={handleOpenDetail}
            />
          )}

          {activeTab === "About" && <AboutTab />}
        </div>

        <InlineServiceCTA variant="analysis" />
      </main>

      <Footer />

      {/* Promise Detail Panel */}
      {detailPromiseData && (
        <PromiseDetailPanel
          promise={detailPromiseData}
          agents={ACA_AGENTS}
          allPromises={displayPromises}
          onClose={() => setDetailPromiseId(null)}
          onSimulateCascade={handleDetailSimulate}
          onSelectPromise={handleDetailNavigate}
        />
      )}
    </div>
  );
}
