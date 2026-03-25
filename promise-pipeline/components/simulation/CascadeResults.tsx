"use client";

import { useState } from "react";
import { CascadeResult } from "@/lib/types/simulation";
import { Promise as PromiseType, Agent, PromiseStatus, isPromiseFactory } from "@/lib/types/promise";
import { StatusBadge } from "@/components/promise/StatusBadge";
import { ProbabilisticCascadeResult, StatusDistribution } from "@/lib/types/analysis";
import { generateFactoryNarrative } from "@/lib/analysis/factory";
import { BayesianCascadeResult } from "@/lib/simulation/bayesianCascade";

interface CascadeResultsProps {
  result: CascadeResult;
  promises: PromiseType[];
  agents: Agent[];
  onReset: () => void;
  /** Optional probabilistic supplement — populated when the What If engine has run */
  probabilistic?: ProbabilisticCascadeResult;
  /** Optional Bayesian cascade supplement — mean-field probability shifts */
  bayesianCascade?: BayesianCascadeResult;
}

/** Colors for each status segment in the probability bar. */
const STATUS_BAR_COLORS: Record<PromiseStatus, string> = {
  verified:     "#1a5f4a",
  declared:     "#1e40af",
  degraded:     "#b45309",
  violated:     "#b91c1c",
  unverifiable: "#6b7280",
};

const STATUS_ORDER: PromiseStatus[] = [
  "verified", "declared", "degraded", "violated", "unverifiable",
];

/**
 * A small horizontal stacked probability bar.
 * Each segment is colored by status and sized proportionally.
 */
function ProbabilityBar({ dist }: { dist: StatusDistribution }) {
  return (
    <div
      className="flex h-2 rounded overflow-hidden mt-1"
      style={{ minWidth: "120px" }}
      aria-hidden="true"
    >
      {STATUS_ORDER.map((s) => {
        const pct = (dist[s] ?? 0) * 100;
        if (pct < 0.5) return null;
        return (
          <div
            key={s}
            style={{ width: `${pct}%`, backgroundColor: STATUS_BAR_COLORS[s] }}
            title={`${s}: ${Math.round(pct)}%`}
          />
        );
      })}
    </div>
  );
}

/**
 * Format a StatusDistribution as a readable text label.
 * Shows the top 3 statuses by probability.
 */
function formatDistribution(dist: StatusDistribution): string {
  return STATUS_ORDER
    .map((s) => ({ s, p: dist[s] ?? 0 }))
    .sort((a, b) => b.p - a.p)
    .filter(({ p }) => p >= 0.05)
    .slice(0, 3)
    .map(({ s, p }) => `${Math.round(p * 100)}% ${s}`)
    .join(" · ");
}

export function CascadeResults({
  result,
  promises,
  agents,
  onReset,
  probabilistic,
  bayesianCascade,
}: CascadeResultsProps) {
  const [bayesianOpen, setBayesianOpen] = useState(false);
  const healthDelta = result.newNetworkHealth - result.originalNetworkHealth;
  const promiseMap = new Map(promises.map((p) => [p.id, p]));

  // Suppress unused variable warning — agents available for future use
  void agents;

  return (
    <div className="bg-white rounded-xl border border-orange-200 shadow-lg p-5">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-serif font-semibold text-gray-900">
          Cascade Results
        </h3>
        <button
          onClick={onReset}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Health score change */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-gray-500">Before</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(result.originalNetworkHealth)}
          </p>
        </div>
        <div className="text-center">
          <span
            className={`text-lg font-bold ${
              healthDelta < 0 ? "text-red-600" : healthDelta > 0 ? "text-green-600" : "text-gray-500"
            }`}
          >
            {healthDelta > 0 ? "+" : ""}
            {Math.round(healthDelta)}
          </span>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">After</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(result.newNetworkHealth)}
          </p>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-700 mb-4 leading-relaxed">{result.summary}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded">
          <p className="text-xl font-bold text-gray-900">
            {result.coherentCount ?? result.affectedPromises.filter(a => a.propagationType === 'coherent' && a.newStatus !== a.originalStatus).length}
          </p>
          <p className="text-xs text-gray-500">Structural</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <p className="text-xl font-bold text-gray-900">
            {result.incoherentCount ?? result.affectedPromises.filter(a => a.propagationType === 'incoherent').length}
          </p>
          <p className="text-xs text-gray-500">At Risk</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <p className="text-xl font-bold text-gray-900">
            {result.cascadeDepth}
          </p>
          <p className="text-xs text-gray-500">Max Depth</p>
        </div>
      </div>

      {/* Percolation risk indicator */}
      {result.percolationRisk && result.percolationRisk !== 'safe' && (
        <div
          className="mb-4 p-3 rounded-lg border"
          style={{
            backgroundColor: result.percolationRisk === 'critical' ? '#fef2f2' : '#fffbeb',
            borderColor: result.percolationRisk === 'critical' ? '#fca5a5' : '#fcd34d',
          }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: result.percolationRisk === 'critical' ? '#991b1b' : '#78350f' }}
          >
            {result.percolationRisk === 'critical'
              ? 'Network past fragility threshold — systemic risk'
              : 'Network approaching fragility threshold'}
          </p>
        </div>
      )}

      {/* Zeno trap indicator */}
      {result.zenoTrappedCount > 0 && (
        <div className="mb-4 p-3 rounded-lg border" style={{ backgroundColor: '#fffbeb', borderColor: '#fcd34d' }}>
          <p className="text-sm" style={{ color: '#78350f' }}>
            {result.zenoTrappedCount} promise{result.zenoTrappedCount > 1 ? 's have' : ' has'} no structural pathway to resolution.
            Adding verification infrastructure or dependency connections would activate {result.zenoTrappedCount > 1 ? 'them' : 'it'}.
          </p>
        </div>
      )}

      {/* Triggered threats */}
      {result.triggeredThreats.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm font-medium text-red-800 mb-1">
            Triggered Threats
          </p>
          {result.triggeredThreats.map((id) => (
            <p key={id} className="text-xs text-red-700">
              {id}
            </p>
          ))}
        </div>
      )}

      {/* Certainty impacts */}
      {result.certaintyImpacts && result.certaintyImpacts.length > 0 && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm font-medium text-purple-800 mb-2">
            Certainty Effects ({result.certaintyImpacts.length} promise{result.certaintyImpacts.length !== 1 ? "s" : ""})
          </p>
          <div className="space-y-1.5">
            {result.certaintyImpacts.map((ci) => {
              return (
                <div key={ci.promiseId} className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-gray-500">{ci.promiseId}</span>
                    <span className="text-purple-700">
                      certainty {Math.round(ci.previousCertainty * 100)}% → {Math.round(ci.newCertainty * 100)}%
                    </span>
                  </div>
                  <p className="text-gray-500 ml-4 truncate">{ci.reason}</p>
                </div>
              );
            })}
          </div>
          {result.originalNetworkEntropy !== undefined && (
            <div className="mt-2 pt-2 border-t border-purple-200 text-xs text-purple-800">
              Network Certainty: {Math.round(100 - result.originalNetworkEntropy)} → {Math.round(100 - result.newNetworkEntropy)}
              <span className="ml-1">
                ({Math.round(result.originalNetworkEntropy - result.newNetworkEntropy) > 0 ? "+" : ""}{Math.round((100 - result.newNetworkEntropy) - (100 - result.originalNetworkEntropy))})
              </span>
            </div>
          )}
        </div>
      )}

      {/* Affected promises */}
      {result.affectedPromises.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Affected Promises
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {result.affectedPromises.map((ap) => {
              const promise = promiseMap.get(ap.promiseId);
              // Find matching probabilistic entry for this promise
              const probEntry = probabilistic?.affectedPromises.find(
                (pe) => pe.promiseId === ap.promiseId
              );
              const probDist = probabilistic?.posteriors[ap.promiseId];

              const isFactory = promise && isPromiseFactory(promise);
              const factoryNarrative = isFactory
                ? generateFactoryNarrative(promise, promises, ap.newStatus)
                : null;

              const isIncoherent = ap.propagationType === 'incoherent';

              return (
                <div
                  key={ap.promiseId}
                  className={`flex flex-col gap-1 p-2 rounded text-sm ${
                    isIncoherent
                      ? 'bg-amber-50 border border-dashed border-amber-400'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-xs text-gray-500 shrink-0">
                      {ap.promiseId}
                    </span>
                    <div className="flex-1 min-w-0">
                      {factoryNarrative ? (
                        <p className="text-xs text-amber-700 font-medium">
                          {factoryNarrative}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-600 truncate">
                          {promise?.body}
                        </p>
                      )}
                      {isIncoherent ? (
                        <div className="flex items-center gap-1 mt-1">
                          <StatusBadge status={ap.originalStatus} size="xs" />
                          <span
                            className="text-xs font-medium px-1.5 py-0.5 rounded"
                            style={{ color: '#78350f', backgroundColor: '#fffbeb' }}
                          >
                            At risk (score: {ap.riskScore?.toFixed(2) ?? '—'}) — weak structural connection
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 mt-1">
                          <StatusBadge status={ap.originalStatus} size="xs" />
                          <span className="text-xs text-gray-400">→</span>
                          <StatusBadge status={ap.newStatus} size="xs" />
                          <span className="text-xs text-gray-400 ml-1">
                            (depth {ap.cascadeDepth})
                          </span>
                          {ap.newStatus !== ap.originalStatus && (
                            <span className="text-xs text-gray-400 ml-1">
                              {ap.degradationProbability !== undefined
                                ? `structural cascade (p=${ap.degradationProbability.toFixed(2)})`
                                : '(structural cascade)'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Probabilistic supplement per affected promise */}
                  {probDist && (
                    <div className="ml-10 mt-0.5">
                      <p className="text-xs text-gray-500">
                        Probability: {formatDistribution(probDist)}
                      </p>
                      <ProbabilityBar dist={probDist} />
                      {probEntry && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Most likely: <span className="font-medium text-gray-600">{probEntry.mostLikelyNewStatus}</span>
                          {" "}({Math.round(probEntry.confidence * 100)}% confidence)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bayesian Probability Analysis — collapsible supplement */}
      {bayesianCascade && (
        <div className="mt-4 border border-indigo-200 rounded-lg overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-3 py-2 bg-indigo-50 text-sm font-medium text-indigo-900 hover:bg-indigo-100 transition-colors"
            onClick={() => setBayesianOpen(!bayesianOpen)}
            aria-expanded={bayesianOpen}
            aria-controls="bayesian-cascade-panel"
          >
            <span>▸ Probability Analysis (Bayesian)</span>
            <span className="text-xs text-indigo-600 font-normal">
              {bayesianOpen ? "collapse" : "expand"}
            </span>
          </button>
          {bayesianOpen && (
            <div id="bayesian-cascade-panel" className="p-3 text-xs space-y-3">
              {/* Network-level shifts */}
              <div className="space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-600">Network health</span>
                  <span>
                    {Math.round(bayesianCascade.networkHealthBefore * 100)}%
                    {" → "}
                    {Math.round(bayesianCascade.networkHealthAfter * 100)}%
                    <span
                      className={`ml-1 ${
                        bayesianCascade.networkHealthAfter < bayesianCascade.networkHealthBefore
                          ? "text-red-700"
                          : "text-green-700"
                      }`}
                    >
                      ({bayesianCascade.networkHealthAfter >= bayesianCascade.networkHealthBefore ? "+" : ""}
                      {Math.round((bayesianCascade.networkHealthAfter - bayesianCascade.networkHealthBefore) * 100)}%)
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Network certainty</span>
                  <span>
                    {Math.round(bayesianCascade.networkCertaintyBefore * 100)}%
                    {" → "}
                    {Math.round(bayesianCascade.networkCertaintyAfter * 100)}%
                    <span
                      className={`ml-1 ${
                        bayesianCascade.networkCertaintyAfter < bayesianCascade.networkCertaintyBefore
                          ? "text-red-700"
                          : "text-green-700"
                      }`}
                    >
                      ({bayesianCascade.networkCertaintyAfter >= bayesianCascade.networkCertaintyBefore ? "+" : ""}
                      {Math.round((bayesianCascade.networkCertaintyAfter - bayesianCascade.networkCertaintyBefore) * 100)}%)
                    </span>
                  </span>
                </div>
                <div className="text-gray-400">
                  Converged in {bayesianCascade.convergenceIterations} iteration{bayesianCascade.convergenceIterations !== 1 ? "s" : ""}
                </div>
              </div>

              {/* Probability shifts */}
              {bayesianCascade.probabilityShifts.length > 0 && (
                <div>
                  <p className="text-gray-600 font-medium mb-1.5">Largest probability shifts:</p>
                  <div className="space-y-1 font-mono">
                    {bayesianCascade.probabilityShifts.slice(0, 8).map((ps) => (
                      <div key={ps.promiseId} className="flex items-center justify-between gap-2">
                        <span className="text-gray-500 w-10 shrink-0">{ps.promiseId}</span>
                        <span className="flex-1 text-gray-700">
                          {Math.round(ps.originalPKept * 100)}%
                          {" → "}
                          {Math.round(ps.newPKept * 100)}%
                          <span
                            className={`ml-1 font-bold ${ps.shift < 0 ? "text-red-700" : "text-green-700"}`}
                          >
                            ({ps.shift >= 0 ? "+" : ""}{Math.round(ps.shift * 100)}%)
                          </span>
                        </span>
                        <span className="text-gray-400 text-[10px] capitalize shrink-0">
                          {ps.regime}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bayesianCascade.probabilityShifts.length === 0 && (
                <p className="text-gray-500 italic">
                  No meaningful probability shifts (all changes &lt;1%).
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Network Health Impact — deterministic vs probabilistic */}
      {probabilistic && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-semibold text-blue-900 mb-2">Network Health Impact</p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">Deterministic</span>
              <span className="font-mono text-blue-900">
                {Math.round(result.originalNetworkHealth)} → {Math.round(result.newNetworkHealth)}{" "}
                <span className={result.newNetworkHealth < result.originalNetworkHealth ? "text-red-700" : "text-green-700"}>
                  ({result.newNetworkHealth < result.originalNetworkHealth ? "" : "+"}{Math.round(result.newNetworkHealth - result.originalNetworkHealth)})
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-800">Expected value</span>
              <span className="font-mono text-blue-900">
                {Math.round(probabilistic.originalNetworkHealth)} → {probabilistic.expectedNetworkHealth.toFixed(1)}{" "}
                <span className={probabilistic.expectedNetworkHealth < probabilistic.originalNetworkHealth ? "text-red-700" : "text-green-700"}>
                  ({probabilistic.expectedNetworkHealth < probabilistic.originalNetworkHealth ? "" : "+"}{(probabilistic.expectedNetworkHealth - probabilistic.originalNetworkHealth).toFixed(1)})
                </span>
              </span>
            </div>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            The expected value estimate is typically less severe than the deterministic result
            because it accounts for probability at each edge rather than assuming worst-case.
            Both values communicate the range of uncertainty.
          </p>
        </div>
      )}
    </div>
  );
}
