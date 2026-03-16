"use client";

import { useMemo, useState } from "react";
import { Promise as PromiseType, Agent, PromiseStatus, Threat } from "@/lib/types/promise";
import { CascadeResult, CertaintyImpact } from "@/lib/types/simulation";
import { runDiagnostic, computeHeuristicCPTs, simulateProbabilisticCascade } from "@/lib/analysis";
import { PromiseGraphView } from "@/components/network/PromiseGraph";
import { ViewSwitcher, ViewMode } from "@/components/network/ViewSwitcher";
import { WhatIfPanel } from "@/components/simulation/WhatIfPanel";
import { CascadeResults } from "@/components/simulation/CascadeResults";

interface NetworkTabProps {
  promises: PromiseType[];
  agents: Agent[];
  threats?: Threat[];
  selectedPromiseId: string | null;
  cascadeResult: CascadeResult | null;
  affectedIds: Set<string>;
  onNodeClick: (promiseId: string) => void;
  onSimulate: (promiseId: string, newStatus: PromiseStatus) => void;
  onReset: () => void;
}

export function NetworkTab({
  promises,
  agents,
  threats = [],
  selectedPromiseId,
  cascadeResult,
  affectedIds,
  onNodeClick,
  onSimulate,
  onReset,
}: NetworkTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("watershed");
  const selectedPromise = promises.find((p) => p.id === selectedPromiseId);

  const certaintyAffectedIds = new Set(
    (cascadeResult?.certaintyImpacts || []).map((ci: CertaintyImpact) => ci.promiseId)
  );

  // Compute five-field diagnostic (memoized — runs once per promise set)
  const diagnostic = useMemo(
    () => runDiagnostic(promises),
    [promises]
  );

  // Compute heuristic CPTs for edge encoding
  const cpts = useMemo(
    () => computeHeuristicCPTs(promises),
    [promises]
  );

  // Compute probabilistic cascade when a simulation is active
  const probabilistic = useMemo(() => {
    if (!cascadeResult) return undefined;
    return simulateProbabilisticCascade(promises, cascadeResult.query);
  }, [promises, cascadeResult]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Graph */}
      <div className="lg:col-span-2 bg-white rounded-xl border p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-serif font-semibold text-gray-900">
            Promise Network
          </h3>
          <div className="flex items-center gap-3">
            <ViewSwitcher activeView={viewMode} onViewChange={setViewMode} />
            {cascadeResult && (
              <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                Simulating
              </span>
            )}
          </div>
        </div>
        <div className="border rounded-lg bg-gray-50 overflow-hidden">
          <PromiseGraphView
            promises={promises}
            agents={agents}
            threats={threats}
            width={700}
            height={500}
            selectedPromiseId={selectedPromiseId}
            affectedIds={affectedIds}
            certaintyAffectedIds={certaintyAffectedIds}
            onNodeClick={onNodeClick}
            showAgentNodes={true}
            diagnostic={diagnostic}
            cpts={cpts}
            probabilistic={probabilistic}
            cascadeActive={!!cascadeResult}
            cascadeSourceId={cascadeResult?.query.promiseId}
            viewMode={viewMode}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Click any promise node to open the What If panel. Node size encodes FMEA severity. Saturation encodes verification quality. Edge thickness encodes cascade probability.
        </p>
      </div>

      {/* Side panel */}
      <div className="lg:col-span-1 space-y-4">
        {selectedPromise && !cascadeResult && (
          <WhatIfPanel
            promise={selectedPromise}
            onSimulate={onSimulate}
            onClose={onReset}
          />
        )}

        {cascadeResult && (
          <CascadeResults
            result={cascadeResult}
            promises={promises}
            agents={agents}
            onReset={onReset}
            probabilistic={probabilistic}
          />
        )}

        {!selectedPromise && !cascadeResult && (
          <div className="bg-white rounded-xl border p-6 text-center">
            <div className="text-gray-400 mb-3">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <h4 className="font-serif font-semibold text-gray-700 mb-1">
              Select a Promise
            </h4>
            <p className="text-sm text-gray-500">
              Click any promise node in the graph to simulate a status change and see cascade effects.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
