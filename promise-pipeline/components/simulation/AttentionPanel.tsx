"use client";

import { useState, useEffect, useMemo } from "react";
import { Promise as PromiseType, Domain } from "@/lib/types/promise";
import {
  allocateAttention,
  defaultWeights,
  AllocationResult,
  ATTENTION_BETA,
} from "@/lib/simulation/softmax";

interface AttentionPanelProps {
  promises: PromiseType[];
  domains: Domain[];
  baselineHealth: number;
  onAllocationChange: (allocation: AllocationResult) => void;
  onShowCascadeRisk?: (vulnerableIds: string[]) => void;
}

export function AttentionPanel({
  promises,
  domains,
  baselineHealth,
  onAllocationChange,
  onShowCascadeRisk,
}: AttentionPanelProps) {
  const [weights, setWeights] = useState<Record<string, number>>(() =>
    defaultWeights(promises)
  );
  const [tau, setTau] = useState(1.0);
  const [collapsedDomains, setCollapsedDomains] = useState<Set<string>>(
    new Set()
  );

  const allocation = useMemo(
    () => allocateAttention(promises, weights, tau),
    [promises, weights, tau]
  );

  // Notify parent on every allocation change.
  // Intentionally omitting onAllocationChange from deps — it's a callback ref.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    onAllocationChange(allocation);
  }, [allocation]);

  const kBudget = ATTENTION_BETA * promises.length;

  // Group promises by domain, preserving domain order from the domains prop
  const domainGroups = useMemo(() => {
    const groups: Record<string, PromiseType[]> = {};
    for (const p of promises) {
      if (!groups[p.domain]) groups[p.domain] = [];
      groups[p.domain].push(p);
    }
    return groups;
  }, [promises]);

  // Domain color lookup from the domains prop
  const domainColorMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const d of domains) m[d.name] = d.color;
    return m;
  }, [domains]);

  // Per-promise allocation keyed by promise ID
  const allocationMap = useMemo(() => {
    const m = new Map<string, (typeof allocation.allocations)[0]>();
    for (const a of allocation.allocations) m.set(a.promiseId, a);
    return m;
  }, [allocation]);

  // Domain aggregate k (mean across promises in domain)
  const domainAggregateK = useMemo(() => {
    const result: Record<string, number> = {};
    for (const [domainName, domainPromises] of Object.entries(domainGroups)) {
      const ks = domainPromises.map(
        (p) => allocationMap.get(p.id)?.kEffective ?? 0
      );
      result[domainName] = ks.reduce((a, b) => a + b, 0) / Math.max(ks.length, 1);
    }
    return result;
  }, [domainGroups, allocationMap]);

  function handleWeightChange(promiseId: string, value: number) {
    setWeights((prev) => ({ ...prev, [promiseId]: value }));
  }

  function handleReset() {
    setWeights(defaultWeights(promises));
    setTau(1.0);
  }

  function handleShowCascadeRisk() {
    if (!onShowCascadeRisk) return;

    // Find promises whose k dropped significantly from baseline and aren't verified.
    // These are the neglected promises most at risk.
    const vulnerable = allocation.allocations
      .filter((a) => {
        const p = promises.find((px) => px.id === a.promiseId);
        return a.kEffective < a.kBaseline * 0.7 && p?.status !== "verified";
      })
      .sort((x, y) => x.kEffective - y.kEffective)
      .slice(0, 5)
      .map((a) => a.promiseId);

    // Fallback: lowest-k non-verified promises if nothing qualifies
    if (vulnerable.length === 0) {
      const fallback = allocation.allocations
        .filter((a) => {
          const p = promises.find((px) => px.id === a.promiseId);
          return p?.status !== "verified";
        })
        .sort((x, y) => x.kEffective - y.kEffective)
        .slice(0, 3)
        .map((a) => a.promiseId);
      onShowCascadeRisk(fallback);
    } else {
      onShowCascadeRisk(vulnerable);
    }
  }

  function toggleDomain(domainName: string) {
    setCollapsedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domainName)) next.delete(domainName);
      else next.add(domainName);
      return next;
    });
  }

  const healthChange = allocation.networkHealth - baselineHealth;
  const healthImproved = healthChange >= 0;

  // Ordered domains: use the domains prop order, then append any extras from promises
  const orderedDomainNames = useMemo(() => {
    const fromProp = domains.map((d) => d.name).filter((n) => domainGroups[n]);
    const extras = Object.keys(domainGroups).filter(
      (n) => !fromProp.includes(n)
    );
    return [...fromProp, ...extras];
  }, [domains, domainGroups]);

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-lg"
      role="region"
      aria-labelledby="attention-panel-title"
    >
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        {/* Title row + τ slider */}
        <div className="flex items-center justify-between mb-1">
          <h3
            id="attention-panel-title"
            className="font-mono text-[10px] font-bold tracking-widest uppercase text-gray-500"
          >
            Attention Allocation
          </h3>
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="tau-slider"
              className="font-mono text-[10px] text-gray-400"
            >
              τ:
            </label>
            <input
              id="tau-slider"
              type="range"
              min={0.1}
              max={3.0}
              step={0.05}
              value={tau}
              onChange={(e) => setTau(parseFloat(e.target.value))}
              className="w-18 h-1.5 accent-[#1a1a2e]"
              style={{ width: "4.5rem" }}
              aria-label="Attention concentration temperature"
              aria-valuemin={0.1}
              aria-valuemax={3.0}
              aria-valuenow={tau}
              aria-valuetext={`τ = ${tau.toFixed(2)}, ${
                tau < 0.8
                  ? "concentrated"
                  : tau > 1.8
                  ? "diffuse"
                  : "balanced"
              }`}
            />
            <span className="font-mono text-[10px] text-gray-600 w-8 text-right tabular-nums">
              {tau.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Concentration scale label */}
        <div className="flex justify-end gap-2 text-[9px] text-gray-300 font-mono mb-3">
          <span>concentration ←</span>
          <span>→ diffusion</span>
        </div>

        {/* Health score delta */}
        <div
          className="flex items-baseline gap-1.5"
          aria-live="assertive"
          aria-atomic="true"
        >
          <span className="font-mono text-xl font-bold text-gray-800">
            {Math.round(baselineHealth)}
          </span>
          <span className="font-mono text-gray-300 text-base">→</span>
          <span
            className="font-mono text-xl font-bold"
            style={{ color: healthImproved ? "#1a5f4a" : "#991b1b" }}
          >
            {Math.round(allocation.networkHealth)}
          </span>
          <span
            className="font-mono text-sm font-semibold"
            style={{ color: healthImproved ? "#1a5f4a" : "#991b1b" }}
            aria-label={`Network health ${healthImproved ? "increased" : "decreased"} by ${Math.abs(Math.round(healthChange))} points`}
          >
            ({healthChange >= 0 ? "+" : ""}
            {Math.round(healthChange)})
          </span>
        </div>
        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
          Network health · budget {kBudget.toFixed(1)} k-units
        </div>
      </div>

      {/* ── Domain sections ── */}
      <div
        className="divide-y divide-gray-50"
        style={{ maxHeight: "380px", overflowY: "auto" }}
      >
        {orderedDomainNames.map((domainName) => {
          const domainPromises = domainGroups[domainName] ?? [];
          if (domainPromises.length === 0) return null;

          const isCollapsed = collapsedDomains.has(domainName);
          const aggK = domainAggregateK[domainName] ?? 0;
          const color = domainColorMap[domainName] ?? "#6b7280";

          return (
            <div key={domainName}>
              {/* Domain header (collapsible) */}
              <button
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                onClick={() => toggleDomain(domainName)}
                aria-expanded={!isCollapsed}
                aria-controls={`domain-section-${domainName}`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-1 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  <span className="font-serif text-xs font-semibold text-gray-700">
                    {domainName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-gray-400 tabular-nums">
                    avg k={aggK.toFixed(2)}
                  </span>
                  <svg
                    className={`w-3 h-3 text-gray-400 transition-transform duration-150 ${
                      isCollapsed ? "" : "rotate-180"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Promise sliders */}
              {!isCollapsed && (
                <div
                  id={`domain-section-${domainName}`}
                  className="px-3 pb-3 space-y-3"
                >
                  {domainPromises.map((p) => {
                    const a = allocationMap.get(p.id);
                    if (!a) return null;

                    const rawWeight = weights[p.id] ?? 0.37;
                    // Fill percent for range input gradient (based on raw weight 0.1–1.0)
                    const sliderFillPct =
                      ((rawWeight - 0.1) / (1.0 - 0.1)) * 100;
                    // k bar fill (based on k_effective 0.05–0.95)
                    const kBarPct = ((a.kEffective - 0.05) / (0.95 - 0.05)) * 100;

                    const deltaSign =
                      a.kDelta >= 0.005
                        ? "up"
                        : a.kDelta <= -0.005
                        ? "down"
                        : "neutral";

                    return (
                      <div key={p.id} className="flex items-start gap-2">
                        {/* Promise ID */}
                        <div className="w-7 flex-shrink-0 pt-1">
                          <span className="font-mono text-[9px] text-gray-400">
                            {p.id}
                          </span>
                        </div>

                        {/* Slider column */}
                        <div className="flex-1 min-w-0">
                          {/* Body text */}
                          <p
                            className="text-[9px] text-gray-600 truncate mb-1"
                            title={p.body}
                            aria-hidden="true"
                          >
                            {p.body.length > 48
                              ? p.body.slice(0, 48) + "…"
                              : p.body}
                          </p>

                          {/* Range input with gradient track */}
                          <label
                            htmlFor={`slider-${p.id}`}
                            className="sr-only"
                          >
                            Attention weight for: {p.body}
                          </label>
                          <input
                            id={`slider-${p.id}`}
                            type="range"
                            min={0.1}
                            max={1.0}
                            step={0.05}
                            value={rawWeight}
                            onChange={(e) =>
                              handleWeightChange(p.id, parseFloat(e.target.value))
                            }
                            className="w-full h-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1a1a2e] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#1a1a2e] [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, ${color}99 0%, ${color}99 ${sliderFillPct}%, #e5e7eb ${sliderFillPct}%, #e5e7eb 100%)`,
                            }}
                            aria-label={`Attention weight for ${p.body}`}
                            aria-valuemin={0.1}
                            aria-valuemax={1.0}
                            aria-valuenow={rawWeight}
                            aria-valuetext={`weight ${rawWeight.toFixed(2)}, effective k ${a.kEffective.toFixed(2)}`}
                          />

                          {/* k effective bar (outcome after softmax) */}
                          <div
                            className="h-1 rounded-full bg-gray-100 mt-1 overflow-hidden"
                            aria-hidden="true"
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${kBarPct}%`,
                                backgroundColor:
                                  deltaSign === "up"
                                    ? "#1a5f4a"
                                    : deltaSign === "down"
                                    ? "#991b1b"
                                    : color + "66",
                              }}
                            />
                          </div>
                        </div>

                        {/* k value + delta */}
                        <div
                          className="flex flex-col items-end flex-shrink-0 w-10 pt-1"
                          aria-live="polite"
                          aria-atomic="true"
                        >
                          <span className="font-mono text-[10px] text-gray-700 tabular-nums">
                            {a.kEffective.toFixed(2)}
                          </span>
                          {deltaSign !== "neutral" && (
                            <span
                              className="font-mono text-[9px] tabular-nums"
                              style={{
                                color:
                                  deltaSign === "up" ? "#1a5f4a" : "#991b1b",
                              }}
                              aria-label={`k ${
                                deltaSign === "up" ? "increased" : "decreased"
                              } by ${Math.abs(a.kDelta).toFixed(2)}`}
                            >
                              {deltaSign === "up" ? "▲" : "▼"}
                              {Math.abs(a.kDelta).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
        <button
          onClick={handleReset}
          className="flex-1 py-1.5 px-3 text-xs font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reset to Default
        </button>
        <button
          onClick={handleShowCascadeRisk}
          className="flex-1 py-1.5 px-3 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          Show Cascade Risk
        </button>
      </div>
    </div>
  );
}
