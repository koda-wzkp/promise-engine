"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Promise as PromiseType, Agent, PromiseStatus, Threat } from "@/lib/types/promise";
import { CascadeResult, CertaintyImpact } from "@/lib/types/simulation";
import { runDiagnostic, computeHeuristicCPTs, simulateProbabilisticCascade } from "@/lib/analysis";
import { ProceduralGraph } from "@/components/network/ProceduralGraph";
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });

  const selectedPromise = promises.find((p) => p.id === selectedPromiseId);

  const certaintyAffectedIds = new Set(
    (cascadeResult?.certaintyImpacts || []).map((ci: CertaintyImpact) => ci.promiseId)
  );

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

  const showSidePanel = panelOpen && (selectedPromise || cascadeResult);

  return (
    <div className="relative w-full rounded-xl border bg-gray-900 overflow-hidden" style={{ height: "75vh", minHeight: 500 }}>
      {/* Full-bleed canvas container */}
      <div ref={containerRef} className="absolute inset-0">
        <ProceduralGraph
          promises={promises}
          agents={agents}
          threats={threats}
          width={dimensions.width}
          height={dimensions.height}
          selectedPromiseId={selectedPromiseId}
          affectedIds={affectedIds}
          onNodeClick={onNodeClick}
          diagnostic={diagnostic}
          cpts={cpts}
          probabilistic={probabilistic}
          cascadeActive={!!cascadeResult}
          cascadeSourceId={cascadeResult?.query.promiseId}
          viewMode={viewMode}
        />
      </div>

      {/* Top bar: settings toggle + view switcher */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        <ViewSwitcher activeView={viewMode} onViewChange={setViewMode} />
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
          </div>
        )}
      </div>

      {/* Overlay side panel: What If + Cascade Results */}
      {showSidePanel && (
        <div className="absolute top-14 right-3 z-10 w-80 max-h-[calc(100%-5rem)] overflow-y-auto space-y-3">
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

          {selectedPromise && !cascadeResult && (
            <div className="backdrop-blur-md bg-white/95 rounded-xl shadow-xl">
              <WhatIfPanel
                promise={selectedPromise}
                onSimulate={onSimulate}
                onClose={onReset}
              />
            </div>
          )}

          {cascadeResult && (
            <div className="backdrop-blur-md bg-white/95 rounded-xl shadow-xl">
              <CascadeResults
                result={cascadeResult}
                promises={promises}
                agents={agents}
                onReset={onReset}
                probabilistic={probabilistic}
              />
            </div>
          )}
        </div>
      )}

      {/* Collapsed panel restore button */}
      {!panelOpen && (selectedPromise || cascadeResult) && (
        <div className="absolute bottom-3 right-3 z-10">
          <button
            onClick={() => setPanelOpen(true)}
            className="px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm text-white/80 hover:text-white text-xs font-medium transition-colors"
          >
            {cascadeResult ? "Show Results" : "Show What If"}
          </button>
        </div>
      )}

      {/* Empty state prompt */}
      {!selectedPromise && !cascadeResult && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2.5 rounded-lg bg-black/50 backdrop-blur-sm text-white/70 text-xs text-center max-w-md">
          Click any node to open the What If simulation panel
        </div>
      )}
    </div>
  );
}
