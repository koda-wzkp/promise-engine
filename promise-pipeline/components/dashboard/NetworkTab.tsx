"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Promise as PromiseType, Agent, PromiseStatus, Threat, Domain } from "@/lib/types/promise";
import { CascadeResult, CertaintyImpact } from "@/lib/types/simulation";
import { AllocationResult } from "@/lib/simulation/softmax";
import { healthScore } from "@/lib/simulation/scoring";
import { runDiagnostic, computeHeuristicCPTs, simulateProbabilisticCascade } from "@/lib/analysis";
import { simulateBayesianCascade } from "@/lib/simulation/bayesianCascade";
import { ProceduralGraph } from "@/components/network/ProceduralGraph";
import { ViewSwitcher, ViewMode } from "@/components/network/ViewSwitcher";
import { WhatIfPanel } from "@/components/simulation/WhatIfPanel";
import { CascadeResults } from "@/components/simulation/CascadeResults";
import { AttentionPanel } from "@/components/simulation/AttentionPanel";

type NetworkMode = "whatif" | "attention";

interface NetworkTabProps {
  promises: PromiseType[];
  agents: Agent[];
  threats?: Threat[];
  domains?: Domain[];
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
  domains = [],
  selectedPromiseId,
  cascadeResult,
  affectedIds,
  onNodeClick,
  onSimulate,
  onReset,
}: NetworkTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("watershed");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [networkMode, setNetworkMode] = useState<NetworkMode>("whatif");
  const [attentionAllocation, setAttentionAllocation] =
    useState<AllocationResult | null>(null);
  const [attentionVulnerableIds, setAttentionVulnerableIds] = useState<
    Set<string>
  >(new Set());
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });

  const selectedPromise = promises.find((p) => p.id === selectedPromiseId);

  const certaintyAffectedIds = new Set(
    (cascadeResult?.certaintyImpacts || []).map((ci: CertaintyImpact) => ci.promiseId)
  );

  // Baseline network health for AttentionPanel display
  const baselineHealth = useMemo(() => healthScore(promises), [promises]);

  // Attention allocation keyed by promiseId for ProceduralGraph
  const attentionAllocationMap = useMemo<Record<string, number> | undefined>(() => {
    if (!attentionAllocation) return undefined;
    const m: Record<string, number> = {};
    for (const a of attentionAllocation.allocations) {
      m[a.promiseId] = a.kEffective;
    }
    return m;
  }, [attentionAllocation]);

  // Effective highlighted IDs: vulnerable nodes when in attention mode, cascade affected otherwise
  const effectiveAffectedIds = useMemo(() => {
    if (networkMode === "attention" && attentionVulnerableIds.size > 0) {
      return attentionVulnerableIds;
    }
    return affectedIds;
  }, [networkMode, attentionVulnerableIds, affectedIds]);

  // Five-field diagnostic (memoized)
  const diagnostic = useMemo(
    () => runDiagnostic(promises),
    [promises]
  );

  // Heuristic CPTs for edge encoding
  const cpts = useMemo(
    () => computeHeuristicCPTs(promises),
    [promises]
  );

  // Probabilistic cascade when simulation is active
  const probabilistic = useMemo(() => {
    if (!cascadeResult) return undefined;
    return simulateProbabilisticCascade(promises, cascadeResult.query);
  }, [promises, cascadeResult]);

  // Bayesian cascade — mean-field probability shifts (runs alongside deterministic)
  const bayesianCascade = useMemo(() => {
    if (!cascadeResult) return undefined;
    try {
      return simulateBayesianCascade(promises, cascadeResult.query);
    } catch {
      return undefined;
    }
  }, [promises, cascadeResult]);

  // Resize observer to fill container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Switching to attention mode clears the cascade selection
  function handleSetNetworkMode(mode: NetworkMode) {
    setNetworkMode(mode);
    if (mode === "attention") {
      onReset();
      setAttentionVulnerableIds(new Set());
    } else {
      setAttentionVulnerableIds(new Set());
    }
  }

  function handleAllocationChange(result: AllocationResult) {
    setAttentionAllocation(result);
  }

  function handleShowCascadeRisk(vulnerableIds: string[]) {
    setAttentionVulnerableIds(new Set(vulnerableIds));
  }

  const showSidePanel =
    panelOpen &&
    (networkMode === "attention" || selectedPromise || cascadeResult);

  // Build the attention panel content (shared between desktop overlay and mobile drawer)
  const attentionPanelContent =
    networkMode === "attention" ? (
      <div className="backdrop-blur-md bg-white/95 rounded-xl shadow-xl">
        <AttentionPanel
          promises={promises}
          domains={domains}
          baselineHealth={baselineHealth}
          onAllocationChange={handleAllocationChange}
          onShowCascadeRisk={handleShowCascadeRisk}
        />
      </div>
    ) : null;

  return (
    <>
      <div
        className="relative w-full rounded-xl border bg-gray-900 overflow-hidden"
        style={{ height: "75vh", minHeight: 500 }}
      >
        {/* Full-bleed canvas container */}
        <div ref={containerRef} className="absolute inset-0">
          <ProceduralGraph
            promises={promises}
            agents={agents}
            threats={threats}
            width={dimensions.width}
            height={dimensions.height}
            selectedPromiseId={selectedPromiseId}
            affectedIds={effectiveAffectedIds}
            onNodeClick={onNodeClick}
            diagnostic={diagnostic}
            cpts={cpts}
            probabilistic={probabilistic}
            cascadeActive={!!cascadeResult}
            cascadeSourceId={cascadeResult?.query.promiseId}
            viewMode={viewMode}
            attentionAllocation={attentionAllocationMap}
          />
        </div>

        {/* Top bar: view switcher */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          <ViewSwitcher activeView={viewMode} onViewChange={setViewMode} />
        </div>

        {/* Mode toggle: What If | Attention Allocation */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1">
          <div className="flex rounded-lg bg-black/50 backdrop-blur-sm text-xs overflow-hidden">
            <button
              onClick={() => handleSetNetworkMode("whatif")}
              className={`px-2.5 py-1.5 font-medium transition-colors ${
                networkMode === "whatif"
                  ? "bg-white/20 text-white"
                  : "text-white/60 hover:text-white/80"
              }`}
              aria-pressed={networkMode === "whatif"}
            >
              What If
            </button>
            <button
              onClick={() => handleSetNetworkMode("attention")}
              className={`px-2.5 py-1.5 font-medium transition-colors ${
                networkMode === "attention"
                  ? "bg-white/20 text-white"
                  : "text-white/60 hover:text-white/80"
              }`}
              aria-pressed={networkMode === "attention"}
            >
              Attention
            </button>
          </div>
        </div>

        {/* Settings gear button */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="p-2 rounded-lg bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-colors"
            aria-label="Toggle settings"
            aria-expanded={settingsOpen}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Settings dropdown */}
          {settingsOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 p-3 text-xs text-white/80 space-y-3">
              <div className="font-medium text-white/60 uppercase tracking-wider text-[10px]">Visual Encoding</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
                  <span>Size = FMEA severity</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-400 opacity-50 inline-block" />
                  <span>Saturation = Verification quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400 inline-block animate-pulse" />
                  <span>Pulse = Risk (RPN)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-300 inline-block" style={{ boxShadow: "0 0 6px #FCD34D" }} />
                  <span>Glow = Superspreader</span>
                </div>
              </div>
              <div className="border-t border-white/10 pt-2 space-y-1.5">
                <div className="font-medium text-white/60 uppercase tracking-wider text-[10px]">Edges</div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-white/60 inline-block" />
                  <span>Thickness = Cascade prob.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-white/60 inline-block border-dashed border-t border-white/60" />
                  <span>Dash = Incentive compat.</span>
                </div>
              </div>
              {networkMode === "attention" && (
                <div className="border-t border-white/10 pt-2 space-y-1.5">
                  <div className="font-medium text-white/60 uppercase tracking-wider text-[10px]">Attention Mode</div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-white/80 inline-block" />
                    <span>Size ∝ k (attention)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-white/30 inline-block" />
                    <span>Fade = neglected promise</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Overlay side panel — desktop only */}
        {showSidePanel && (
          <div className="hidden md:block absolute top-14 right-3 z-10 w-80 max-h-[calc(100%-5rem)] overflow-y-auto space-y-3">
            {/* Collapse toggle */}
            <div className="flex justify-end">
              <button
                onClick={() => setPanelOpen(false)}
                className="p-1.5 rounded-md bg-black/50 backdrop-blur-sm text-white/70 hover:text-white text-xs"
                aria-label="Hide panel"
              >
                Hide Panel
              </button>
            </div>

            {/* Attention Allocation mode */}
            {networkMode === "attention" && attentionPanelContent}

            {/* What If mode */}
            {networkMode === "whatif" && selectedPromise && !cascadeResult && (
              <div className="backdrop-blur-md bg-white/95 rounded-xl shadow-xl">
                <WhatIfPanel
                  promise={selectedPromise}
                  onSimulate={onSimulate}
                  onClose={onReset}
                />
              </div>
            )}

            {networkMode === "whatif" && cascadeResult && (
              <div className="backdrop-blur-md bg-white/95 rounded-xl shadow-xl">
                <CascadeResults
                  result={cascadeResult}
                  promises={promises}
                  agents={agents}
                  onReset={onReset}
                  probabilistic={probabilistic}
                  bayesianCascade={bayesianCascade}
                />
              </div>
            )}
          </div>
        )}

        {/* Collapsed panel restore button */}
        {!panelOpen && (selectedPromise || cascadeResult || networkMode === "attention") && (
          <div className="hidden md:block absolute bottom-3 right-3 z-10">
            <button
              onClick={() => setPanelOpen(true)}
              className="px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm text-white/80 hover:text-white text-xs font-medium transition-colors"
            >
              {networkMode === "attention"
                ? "Show Attention"
                : cascadeResult
                ? "Show Results"
                : "Show What If"}
            </button>
          </div>
        )}

        {/* Empty state prompt — only in What If mode without selection */}
        {networkMode === "whatif" && !selectedPromise && !cascadeResult && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2.5 rounded-lg bg-black/50 backdrop-blur-sm text-white/70 text-xs text-center max-w-md">
            Click any node to open the What If simulation panel
          </div>
        )}

        {/* Attention mode: vulnerable nodes indicator */}
        {networkMode === "attention" && attentionVulnerableIds.size > 0 && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2.5 rounded-lg bg-amber-500/80 backdrop-blur-sm text-white text-xs text-center"
            role="status"
            aria-live="polite"
          >
            {attentionVulnerableIds.size} neglected promise
            {attentionVulnerableIds.size !== 1 ? "s" : ""} highlighted
          </div>
        )}
      </div>

      {/* Mobile bottom drawer — fixed to viewport, escapes overflow-hidden */}
      {networkMode === "attention" && (
        <div
          className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-2xl shadow-2xl border-t border-gray-200"
          style={{
            maxHeight: mobileDrawerOpen ? "70vh" : undefined,
          }}
        >
          {/* Drawer handle + header */}
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-left"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            aria-expanded={mobileDrawerOpen}
            aria-label={`${mobileDrawerOpen ? "Collapse" : "Expand"} attention allocation panel`}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 rounded-full bg-gray-300 mx-auto" aria-hidden="true" />
              <span className="font-mono text-xs font-bold text-gray-500 uppercase tracking-wider ml-2">
                Attention Allocation
              </span>
            </div>
            {attentionAllocation && (
              <div
                className="flex items-center gap-1 font-mono text-sm"
                aria-live="polite"
                aria-atomic="true"
              >
                <span className="text-gray-600">{Math.round(baselineHealth)}</span>
                <span className="text-gray-300">→</span>
                <span
                  style={{
                    color:
                      attentionAllocation.networkHealth >= baselineHealth
                        ? "#1a5f4a"
                        : "#991b1b",
                  }}
                >
                  {Math.round(attentionAllocation.networkHealth)}
                </span>
              </div>
            )}
          </button>

          {/* Drawer content */}
          {mobileDrawerOpen && (
            <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 3.5rem)" }}>
              <AttentionPanel
                promises={promises}
                domains={domains}
                baselineHealth={baselineHealth}
                onAllocationChange={handleAllocationChange}
                onShowCascadeRisk={handleShowCascadeRisk}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
