"use client";

import { useState, useReducer, useMemo, useCallback } from "react";
import { greshamData } from "@/lib/data/gresham";
import { InlineServiceCTA } from "@/components/cta/InlineServiceCTA";
import { PromiseStatus } from "@/lib/types/promise";
import { CascadeResult, WhatIfQuery } from "@/lib/types/simulation";
import { simulateCascade } from "@/lib/simulation/cascade";
import { SummaryTab } from "@/components/dashboard/SummaryTab";
import { NetworkTab } from "@/components/dashboard/NetworkTab";
import { PromisesTab } from "@/components/dashboard/PromisesTab";
import { InsightsTab } from "@/components/dashboard/InsightsTab";

type Tab = "summary" | "network" | "trajectory" | "promises" | "insights" | "about";

type SimulationState = {
  mode: "actual" | "simulating";
  activeQuery: WhatIfQuery | null;
  cascadeResult: CascadeResult | null;
  selectedPromise: string | null;
};

type SimulationAction =
  | { type: "SELECT_PROMISE"; promiseId: string }
  | { type: "RUN_SIMULATION"; query: WhatIfQuery }
  | { type: "CLEAR_SIMULATION" }
  | { type: "RESET" };

function simulationReducer(
  state: SimulationState,
  action: SimulationAction
): SimulationState {
  switch (action.type) {
    case "SELECT_PROMISE":
      return {
        ...state,
        selectedPromise: action.promiseId,
        cascadeResult: null,
      };
    case "RUN_SIMULATION":
      const result = simulateCascade(
        greshamData.promises,
        action.query,
        greshamData.threats
      );
      return {
        mode: "simulating",
        activeQuery: action.query,
        cascadeResult: result,
        selectedPromise: action.query.promiseId,
      };
    case "CLEAR_SIMULATION":
      return {
        mode: "actual",
        activeQuery: null,
        cascadeResult: null,
        selectedPromise: null,
      };
    case "RESET":
      return {
        mode: "actual",
        activeQuery: null,
        cascadeResult: null,
        selectedPromise: null,
      };
    default:
      return state;
  }
}

const tabs: { id: Tab; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "network", label: "Network" },
  { id: "trajectory", label: "Trajectory" },
  { id: "promises", label: "Promises" },
  { id: "insights", label: "Insights" },
  { id: "about", label: "About" },
];

export default function GreshamPage() {
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [simState, dispatch] = useReducer(simulationReducer, {
    mode: "actual",
    activeQuery: null,
    cascadeResult: null,
    selectedPromise: null,
  });

  const affectedIds = useMemo(() => {
    if (!simState.cascadeResult) return new Set<string>();
    return new Set(simState.cascadeResult.affectedPromises.map((a) => a.promiseId));
  }, [simState.cascadeResult]);

  const affectedMap = useMemo(() => {
    if (!simState.cascadeResult) return new Map<string, number>();
    const map = new Map<string, number>();
    simState.cascadeResult.affectedPromises.forEach((a) => {
      map.set(a.promiseId, a.cascadeDepth);
    });
    return map;
  }, [simState.cascadeResult]);

  const handleWhatIf = useCallback(
    (promiseId: string) => {
      dispatch({ type: "SELECT_PROMISE", promiseId });
      setActiveTab("network");
    },
    []
  );

  const handleSimulate = useCallback(
    (promiseId: string, newStatus: PromiseStatus) => {
      dispatch({
        type: "RUN_SIMULATION",
        query: { promiseId, newStatus },
      });
    },
    []
  );

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f6" }}>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-serif text-2xl font-bold text-gray-900">
              {greshamData.title}
            </h1>
            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
              Live Demo
            </span>
          </div>
          <p className="text-gray-600">{greshamData.subtitle}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 -mb-px overflow-x-auto" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-green-700 text-green-800"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                {tab.id === "network" && simState.mode === "simulating" && (
                  <span className="ml-1.5 w-2 h-2 inline-block rounded-full bg-amber-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "summary" && <SummaryTab data={greshamData} logoMode="morph" />}
        {activeTab === "network" && (
          <NetworkTab
            promises={greshamData.promises}
            agents={greshamData.agents}
            threats={greshamData.threats}
            domains={greshamData.domains}
            selectedPromiseId={simState.selectedPromise}
            cascadeResult={simState.cascadeResult}
            affectedIds={affectedIds}
            onNodeClick={(id) =>
              dispatch({ type: "SELECT_PROMISE", promiseId: id })
            }
            onSimulate={handleSimulate}
            onReset={handleReset}
          />
        )}
        {activeTab === "trajectory" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">
                Trajectory Data Not Yet Available
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Emissions trajectory data will be available after the City&apos;s first annual
                progress report (expected FY2025&ndash;26).
              </p>
              <div className="bg-gray-50 rounded-lg border p-4 text-left text-sm text-gray-700 leading-relaxed">
                <p className="font-medium text-gray-900 mb-2">Lindblad Model Projection</p>
                <p>
                  Based on the current network structure (42 declared promises, 50% unverified),
                  the Lindblad model predicts <strong>2.4&ndash;5.1 promises reaching Met status
                  by 2029</strong>, depending on verification regime:
                </p>
                <ul className="mt-3 space-y-1.5 list-disc pl-5">
                  <li>
                    <strong>Current regime</strong> (50% unverified): ~2.4 promises met by 2029 &mdash;
                    composting dynamics dominate, most promises stagnate without observation
                  </li>
                  <li>
                    <strong>Filing upgrade</strong> (all 21 unverified → basic filing): ~5.1 promises
                    met by 2029 &mdash; network crosses the computing threshold (k &gt; 0.7)
                  </li>
                </ul>
                <p className="mt-3 text-gray-500 text-xs">
                  ICO-01 (solar installation) and ICO-03 (wastewater energy) have the strongest
                  prior probability of early verification given existing implementation progress.
                </p>
              </div>
            </div>
          </div>
        )}
        {activeTab === "promises" && (
          <PromisesTab
            promises={greshamData.promises}
            agents={greshamData.agents}
            onWhatIf={handleWhatIf}
            affectedIds={affectedIds}
            affectedMap={affectedMap}
          />
        )}
        {activeTab === "insights" && (
          <InsightsTab
            insights={greshamData.insights}
            promises={greshamData.promises}
            onPromiseClick={handleWhatIf}
          />
        )}
        {activeTab === "about" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">
                About the Gresham Climate Action Plan
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                The Gresham Climate Action Plan (CAP) was approved by Gresham City Council
                on April 16, 2024. It establishes 42 strategies across 6 domains to reduce
                community greenhouse gas emissions and build climate resilience by 2029.
                The plan was developed with significant community engagement, particularly from
                frontline communities in East Multnomah County disproportionately affected by
                air quality, heat, and flooding.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                The CAP is a public City Council document. Source:{" "}
                <span className="font-medium text-gray-900">
                  greshamoregon.gov/globalassets/government/climate-action-plan/climate-action-plan.pdf
                </span>
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                Promise Pipeline models the CAP as 42 autonomous commitments from Gresham&apos;s
                Solid Waste &amp; Sustainability department to the Gresham community, each with
                a verification mechanism (or the documented absence of one), dependency edges,
                and a cascade simulation that shows what breaks when upstream promises fail.
              </p>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">
                Relationship to Oregon HB 2021
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Gresham is downstream of Oregon HB 2021 through Portland General Electric.
                The CAP&apos;s highest-impact strategy &mdash; the Green Tariff program (BE-01)
                &mdash; depends on PGE willingness and OPUC regulatory approval. This means
                the success of Gresham&apos;s most important climate promise is contingent on
                PGE fulfilling its own HB 2021 obligations and the PUC approving a tariff
                structure the City cannot mandate.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                In Promise Theory terms: Gresham&apos;s BE-01 is a promise that requires a
                counter-promise from an external autonomous agent (PGE) to function. If PGE&apos;s
                HB 2021 clean energy plan (P002 in the HB 2021 network) degrades, BE-01 loses
                its foundation. The two networks are structurally coupled without explicit
                cross-network dependency tracking.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                This dashboard uses the same Promise Theory schema, cascade simulation engine,
                and Benthos analysis framework as the HB 2021 dashboard &mdash; enabling
                direct structural comparison across governance levels. Both networks exhibit
                the same equity verification gap: equity promises to vulnerable communities
                are the least verified in both cases.
              </p>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">
                Methodology
              </h3>
              <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
                <li>Promise data sourced from the Gresham CAP (approved April 16, 2024)</li>
                <li>All 42 promises classified as &quot;declared&quot; &mdash; the plan is new; no compliance data exists yet</li>
                <li>Dependencies inferred from the CAP&apos;s strategic structure, domain logic, and cross-domain notes</li>
                <li>Verification methods extracted from the CAP where specified; &quot;none&quot; where no mechanism is described</li>
                <li>Network health calculated as a weighted average of promise statuses: Verified=100, Declared=60, Degraded=30, Violated=0, Unverifiable=20</li>
                <li>Cascade simulation traces how failure propagates through the dependency graph, with diminishing impact at each depth level</li>
                <li>Grade (C) reflects structural verification risk, not implementation failure &mdash; the plan has barely begun</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-xl border p-6 text-center">
              <p className="text-sm text-gray-600">
                Promise Pipeline is open source under the AGPL-3.0 license.
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <InlineServiceCTA variant="demo" />
      </div>
    </div>
  );
}
