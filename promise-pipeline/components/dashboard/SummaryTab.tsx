"use client";

import { useMemo } from "react";
import { DashboardData, PromiseStatus } from "@/lib/types/promise";
import { NetworkHealthBar } from "@/components/simulation/NetworkHealthBar";
import { StatusBadge } from "@/components/promise/StatusBadge";
import { calculateNetworkHealth, identifyBottlenecks } from "@/lib/simulation/cascade";
import { statusBreakdown, domainHealthScores, calculateNetworkEntropy, identifyHighLeverageNodes } from "@/lib/simulation/scoring";
import { getGradeFromScore } from "@/lib/utils/formatting";
import { statusColors } from "@/lib/utils/colors";
import { runDiagnostic } from "@/lib/analysis";

interface SummaryTabProps {
  data: DashboardData;
}

const PRIORITY_COLORS: Record<"critical" | "high" | "medium" | "low", { bg: string; text: string; border: string }> = {
  critical: { bg: "#fef2f2", text: "#991b1b", border: "#fca5a5" },
  high:     { bg: "#fffbeb", text: "#78350f", border: "#fcd34d" },
  medium:   { bg: "#eff6ff", text: "#1e40af", border: "#93c5fd" },
  low:      { bg: "#ecfdf5", text: "#1a5f4a", border: "#6ee7b7" },
};

export function SummaryTab({ data }: SummaryTabProps) {
  const health = useMemo(() => calculateNetworkHealth(data.promises), [data.promises]);
  const breakdown = useMemo(() => statusBreakdown(data.promises), [data.promises]);
  const domainScores = useMemo(() => domainHealthScores(data.promises), [data.promises]);
  const bottlenecks = useMemo(() => identifyBottlenecks(data.promises), [data.promises]);
  const grade = useMemo(() => getGradeFromScore(health.overall), [health.overall]);
  const entropy = useMemo(() => calculateNetworkEntropy(data.promises), [data.promises]);
  const certainty = Math.round(100 - entropy.overall);
  const leverageNodes = useMemo(() => identifyHighLeverageNodes(data.promises), [data.promises]);
  const domainEntropy = entropy.byDomain;

  // Five-field diagnostic (memoized — pure functions, no side effects)
  const diagnostic = useMemo(() => runDiagnostic(data.promises), [data.promises]);
  const { epidemiology, reliability, information, strategy } = diagnostic;

  const medianDeps = leverageNodes.length > 0
    ? leverageNodes[Math.floor(leverageNodes.length / 2)].dependentCount
    : 0;

  // Suppress unused variable warning — bottlenecks used indirectly via health
  void bottlenecks;

  return (
    <div className="space-y-6">
      {/* Top metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Network Health</p>
          <p className="text-4xl font-bold" style={{ color: health.overall >= 60 ? "#1a5f4a" : health.overall >= 40 ? "#b45309" : "#b91c1c" }}>
            {Math.round(health.overall)}
          </p>
          <p className="text-xs text-gray-400 mt-1">out of 100</p>
          <div className="mt-3">
            <NetworkHealthBar score={health.overall} showLabel={false} />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Network Certainty</p>
          <p className="text-4xl font-bold" style={{ color: certainty >= 70 ? "#1a5f4a" : certainty >= 40 ? "#78350f" : "#991b1b" }}>
            {certainty}
          </p>
          <p className="text-xs text-gray-400 mt-1">out of 100</p>
          <div className="mt-3">
            <NetworkHealthBar score={certainty} showLabel={false} />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Overall Grade</p>
          <p className="text-4xl font-bold text-gray-900">{grade}</p>
          <p className="text-xs text-gray-400 mt-1">{data.promises.length} promises, {data.agents.length} agents</p>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif font-semibold text-gray-900 mb-4">Status Breakdown</h3>
        <div className="flex flex-wrap gap-4">
          {(Object.entries(breakdown) as [PromiseStatus, number][]).map(([status, count]) => (
            <div key={status} className="flex items-center gap-2">
              <StatusBadge status={status} size="sm" />
              <span className="text-sm font-bold text-gray-900">{count}</span>
            </div>
          ))}
        </div>
        {/* Visual bar */}
        <div className="mt-4 flex h-4 rounded-full overflow-hidden">
          {(Object.entries(breakdown) as [PromiseStatus, number][]).map(([status, count]) => {
            if (count === 0) return null;
            return (
              <div
                key={status}
                className="h-full"
                style={{
                  width: `${(count / data.promises.length) * 100}%`,
                  backgroundColor: statusColors[status] || "#6b7280",
                }}
                title={`${status}: ${count}`}
              />
            );
          })}
        </div>
      </div>

      {/* Certainty warning */}
      {certainty < 50 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-800">
            This network&apos;s assessment has high uncertainty — {entropy.byStatus.unverifiable + entropy.byStatus.declared} promises have no verification mechanism or remain untested.
          </p>
        </div>
      )}

      {/* Domain health */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif font-semibold text-gray-900 mb-4">Domain Health</h3>
        <div className="space-y-3">
          {Object.entries(domainScores)
            .sort((a, b) => b[1] - a[1])
            .map(([domain, score]) => {
              const domCertainty = Math.round(100 - (domainEntropy[domain] || 0));
              const hasVerificationGap = domCertainty < 30;
              return (
                <div key={domain}>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-gray-700 w-28">{domain}</span>
                    <span className="text-xs text-gray-500">Health: {Math.round(score)}</span>
                    <span className="text-xs" style={{ color: domCertainty >= 70 ? "#1a5f4a" : domCertainty >= 40 ? "#78350f" : "#991b1b" }}>
                      Certainty: {domCertainty}
                    </span>
                    {hasVerificationGap && (
                      <span className="text-xs text-amber-700 font-medium">⚠ Verification gap</span>
                    )}
                  </div>
                  <NetworkHealthBar score={score} showLabel={false} />
                </div>
              );
            })}
        </div>
      </div>

      {/* High-Leverage Promises */}
      {leverageNodes.length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-serif font-semibold text-gray-900 mb-3">High-Leverage Promises</h3>
          <p className="text-sm text-gray-500 mb-3">
            Promises ranked by combined dependent count and structural bridge score (betweenness centrality).
          </p>
          <div className="space-y-2">
            {leverageNodes.slice(0, 5).map((node) => {
              const promise = data.promises.find((p) => p.id === node.promiseId);
              if (!promise) return null;
              const isStructuralBridge = node.betweenness > 0.7 && node.dependentCount < medianDeps;
              return (
                <div key={node.promiseId} className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-xs text-gray-500 w-10">{node.promiseId}</span>
                  <StatusBadge status={promise.status} size="xs" />
                  <span className="text-gray-500 text-xs whitespace-nowrap">
                    {node.dependentCount} dep{node.dependentCount !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs text-gray-400">|</span>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    Bridge: {node.betweenness.toFixed(2)}
                  </span>
                  {isStructuralBridge && (
                    <span className="text-xs text-amber-700 font-medium whitespace-nowrap">← structural bridge</span>
                  )}
                  <span className="text-gray-700 truncate">{promise.body}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STRUCTURAL DIAGNOSTIC ── */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif font-semibold text-gray-900 mb-1">Structural Diagnostic</h3>
        <p className="text-xs text-gray-400 mb-5">
          Five-field analysis: epidemiology · FMEA · information theory · incentive alignment
        </p>

        <div className="space-y-6">

          {/* 1. Cascade Risk (Epidemiology) */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Cascade Risk</h4>
            <div
              className="rounded-lg border p-4"
              style={{
                backgroundColor: epidemiology.cascadeProne ? "#fffbeb" : "#ecfdf5",
                borderColor: epidemiology.cascadeProne ? "#fcd34d" : "#6ee7b7",
              }}
            >
              <div className="flex items-center gap-3 mb-1">
                <span
                  className="text-sm font-bold"
                  style={{ color: epidemiology.cascadeProne ? "#78350f" : "#1a5f4a" }}
                >
                  Rₑ = {epidemiology.Re.toFixed(2)}
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: epidemiology.cascadeProne ? "#78350f" : "#1a5f4a" }}
                >
                  {epidemiology.cascadeProne ? "Cascade-Prone ⚠" : "Contained ✓"}
                </span>
              </div>
              <p className="text-xs mb-1" style={{ color: epidemiology.cascadeProne ? "#92400e" : "#065f46" }}>
                {epidemiology.cascadeProne
                  ? "The network is in a state where a single hub failure will propagate."
                  : "A single violation is unlikely to cascade beyond its direct dependents."}
              </p>
              <p className="text-xs text-gray-500">
                R₀ = {epidemiology.R0.toFixed(2)} (network) · R₀ hubs = {epidemiology.R0_hubs.toFixed(2)}
              </p>
              {epidemiology.verificationsNeeded > 0 && (
                <p className="text-xs mt-2 font-medium" style={{ color: "#78350f" }}>
                  Verification target: {epidemiology.verificationsNeeded} more promise{epidemiology.verificationsNeeded !== 1 ? "s" : ""} need
                  independent verification to contain cascade risk (herd immunity threshold:{" "}
                  {Math.round(epidemiology.herdImmunityThreshold * 100)}%).
                </p>
              )}
            </div>
          </div>

          {/* 2. Top Risk Promises (FMEA) */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Top Risk Promises</h4>
            <p className="text-xs text-gray-400 mb-3">
              Ranked by Risk Priority Number (RPN = Severity × Occurrence × Detection). Network reliability:{" "}
              {(reliability.networkReliability * 100).toFixed(1)}%.
            </p>
            <div className="space-y-2">
              {reliability.criticalPromises.map((entry, idx) => {
                const colors = PRIORITY_COLORS[entry.priority];
                return (
                  <div
                    key={entry.promiseId}
                    className="rounded-lg border p-3"
                    style={{ backgroundColor: colors.bg, borderColor: colors.border }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-mono text-gray-400 shrink-0">#{idx + 1}</span>
                        <span className="font-mono text-xs font-semibold shrink-0" style={{ color: colors.text }}>
                          {entry.promiseId}
                        </span>
                        <span className="text-xs text-gray-600 truncate">{entry.promiseBody}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold" style={{ color: colors.text }}>
                          RPN: {entry.RPN}
                        </span>
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded uppercase"
                          style={{ backgroundColor: colors.text, color: colors.bg }}
                        >
                          {entry.priority}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      Severity {entry.severity} · Occurrence {entry.occurrence} · Detection {entry.detection}
                    </p>
                    <p className="text-xs" style={{ color: colors.text }}>{entry.explanation}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Verification Infrastructure (Information Theory) */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Verification Infrastructure</h4>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">
                  Verification Capacity:{" "}
                  <span className="font-semibold text-gray-900">
                    {information.actualChannelCapacity.toFixed(1)} / {information.maxChannelCapacity.toFixed(1)} bits
                  </span>{" "}
                  ({Math.round(information.capacityRatio * 100)}%)
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={Math.round(information.capacityRatio * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Verification capacity: ${Math.round(information.capacityRatio * 100)}%`}
                className="h-3 rounded-full overflow-hidden"
                style={{ backgroundColor: "#e5e7eb" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${information.capacityRatio * 100}%`,
                    backgroundColor: "#1a5f4a",
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(information.unobservablePercent)}% of this network&apos;s state is unobservable.
              </p>
            </div>
            {/* Method breakdown */}
            <div className="space-y-1">
              {Object.entries(information.capacityByMethod)
                .sort((a, b) => b[1].totalCapacity - a[1].totalCapacity)
                .map(([method, stats]) => (
                  <div key={method} className="flex items-center gap-2 text-xs">
                    <span className="w-24 text-gray-600 capitalize">{method}:</span>
                    <span className="text-gray-500 w-16">{stats.count} promise{stats.count !== 1 ? "s" : ""}</span>
                    <span className="font-mono text-gray-700">{stats.totalCapacity.toFixed(1)} bits</span>
                    {method === "none" && stats.count > 0 && (
                      <span className="text-red-700 font-medium">← verification gap</span>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* 4. Incentive Alignment (Strategy) */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Incentive Alignment</h4>
            <div className="space-y-1 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <span style={{ color: "#1a5f4a" }} aria-label="Compatible">✓</span>
                <span className="text-gray-700">
                  <span className="font-semibold">{strategy.incentiveCompatibility.compatible}</span> promise{strategy.incentiveCompatibility.compatible !== 1 ? "s" : ""} have independent verification
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span style={{ color: "#78350f" }} aria-label="Partial">◐</span>
                <span className="text-gray-700">
                  <span className="font-semibold">{strategy.incentiveCompatibility.partial}</span> promise{strategy.incentiveCompatibility.partial !== 1 ? "s" : ""} have partial oversight
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span style={{ color: "#991b1b" }} aria-label="Incompatible">✗</span>
                <span className="text-gray-700">
                  <span className="font-semibold">{strategy.incentiveCompatibility.incompatible}</span> promise{strategy.incentiveCompatibility.incompatible !== 1 ? "s" : ""} have no incentive-compatible verification
                </span>
              </div>
            </div>
            {strategy.highestAgencyCost.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Highest Agency Cost:</p>
                <div className="space-y-1">
                  {strategy.highestAgencyCost.slice(0, 2).map((entry) => (
                    <div key={entry.promiseId} className="text-xs text-gray-600 pl-2 border-l-2 border-gray-200">
                      <span className="font-mono font-semibold text-gray-800">{entry.promiseId}</span>
                      {" — "}
                      moral hazard: {entry.moralHazard.toFixed(2)}, agency cost: {entry.agencyCost.toFixed(2)}
                      <br />
                      <span className="text-gray-500">{entry.promiseBody.slice(0, 60)}{entry.promiseBody.length > 60 ? "..." : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Grade explanation */}
      <div className="bg-gray-50 rounded-xl border p-6">
        <h3 className="font-serif font-semibold text-gray-900 mb-2">Assessment</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{data.gradeExplanation}</p>
      </div>
    </div>
  );
}
