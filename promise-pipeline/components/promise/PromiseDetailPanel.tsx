"use client";

import { useEffect, useRef } from "react";
import { Promise as PromiseType, Agent } from "@/lib/types/promise";
import StatusBadge from "./StatusBadge";
import { hb2021DomainColors } from "@/lib/utils/colors";
import { formatDate } from "@/lib/utils/formatting";

interface PromiseDetailPanelProps {
  promise: PromiseType;
  agents: Agent[];
  allPromises: PromiseType[];
  onClose: () => void;
  onSimulateCascade?: (promiseId: string) => void;
  onSelectPromise?: (promiseId: string) => void;
}

export default function PromiseDetailPanel({
  promise,
  agents,
  allPromises,
  onClose,
  onSimulateCascade,
  onSelectPromise,
}: PromiseDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const promiser = agents.find((a) => a.id === promise.promiser);
  const promisee = agents.find((a) => a.id === promise.promisee);

  const dependencies = promise.depends_on
    .map((id) => allPromises.find((p) => p.id === id))
    .filter(Boolean) as PromiseType[];

  const dependents = allPromises.filter((p) => p.depends_on.includes(promise.id));

  const domainColor = hb2021DomainColors[promise.domain as keyof typeof hb2021DomainColors] ?? "#6b7280";

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // Delay to avoid closing from the click that opened it
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  function handlePromiseClick(id: string) {
    onSelectPromise?.(id);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[2px]">
      <div
        ref={panelRef}
        className="detail-panel-slide-in h-full w-full max-w-md overflow-y-auto border-l border-gray-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-gray-400">{promise.id}</span>
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
                  style={{ backgroundColor: domainColor }}
                >
                  {promise.domain}
                </span>
                <StatusBadge status={promise.status} />
              </div>
              <h2 className="mt-2 font-serif text-lg font-bold leading-tight text-gray-900">
                {promise.body}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5">
          {/* Promiser → Promisee */}
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Promiser</p>
                <p className="mt-0.5 font-medium text-gray-900">{promiser?.name ?? promise.promiser}</p>
                {promiser && (
                  <p className="font-mono text-[10px] italic text-gray-400">{promiser.short}</p>
                )}
              </div>
              <div className="mx-3 text-gray-300">→</div>
              <div className="text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Promisee</p>
                <p className="mt-0.5 font-medium text-gray-900">{promisee?.name ?? promise.promisee}</p>
                {promisee && (
                  <p className="font-mono text-[10px] italic text-gray-400">{promisee.short}</p>
                )}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {promise.progress != null && promise.required != null && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Progress</p>
              <div className="mt-1.5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((promise.progress / promise.required) * 100, 100)}%`,
                        backgroundColor: domainColor,
                      }}
                    />
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold text-gray-700">
                  {promise.progress}%
                </span>
                <span className="text-xs text-gray-400">/ {promise.required}%</span>
              </div>
            </div>
          )}

          {/* Target Deadline */}
          {promise.target && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Target Deadline</p>
              <p className="mt-0.5 font-mono text-sm text-gray-700">{formatDate(promise.target)}</p>
            </div>
          )}

          {/* Note */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Assessment</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{promise.note}</p>
          </div>

          {/* Verification */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Verification</p>
            <div className="mt-1 text-sm text-gray-600">
              {promise.verification.method === "none" ? (
                <p className="italic text-gray-400">No verification mechanism defined</p>
              ) : (
                <div className="space-y-0.5">
                  <p>
                    <span className="font-medium capitalize">{promise.verification.method}</span>
                    {promise.verification.source && (
                      <span className="text-gray-400"> via {promise.verification.source}</span>
                    )}
                  </p>
                  {promise.verification.metric && (
                    <p className="font-mono text-xs text-gray-400">
                      {promise.verification.metric}
                      {promise.verification.threshold && (
                        <> {promise.verification.threshold.operator} {promise.verification.threshold.value}</>
                      )}
                    </p>
                  )}
                  {promise.verification.frequency && (
                    <p className="text-xs text-gray-400">Frequency: {promise.verification.frequency}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Statutory Reference */}
          {promise.ref && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Statutory Reference</p>
              <p className="mt-0.5 font-mono text-sm text-gray-700">{promise.ref}</p>
            </div>
          )}

          {/* Effective Date */}
          {promise.effectiveDate && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Effective Date</p>
              <p className="mt-0.5 font-mono text-sm text-gray-700">{formatDate(promise.effectiveDate)}</p>
            </div>
          )}

          {/* Modifier Node Badge */}
          {promise.nodeType === "modifier" && (
            <div className="rounded-md border border-purple-200 bg-purple-50 px-3 py-2">
              <p className="text-xs font-semibold text-purple-700">Modifier Node</p>
              <p className="mt-0.5 text-[11px] text-purple-600">
                This is a legal/political event that modified other promises, not a standard commitment.
              </p>
            </div>
          )}

          {/* Outcome Data */}
          {promise.outcomeData && promise.outcomeData.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Outcome Data</p>
              <div className="mt-1.5 space-y-1.5">
                {promise.outcomeData.map((o, i) => (
                  <div key={i} className="rounded-md bg-gray-50 px-3 py-2 text-xs">
                    <p className="font-medium text-gray-700">{o.metric}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-gray-400">Target: <span className="font-mono font-medium text-gray-600">{o.target}</span></span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-400">Actual: <span className="font-mono font-medium text-gray-900">{o.actual}</span></span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-gray-400">Source: {o.source}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legal Challenges */}
          {promise.legalChallenges && promise.legalChallenges.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Legal Challenges</p>
              <div className="mt-1.5 space-y-1.5">
                {promise.legalChallenges.map((lc, i) => (
                  <div key={i} className="rounded-md border border-purple-100 bg-purple-50 px-3 py-2 text-xs">
                    <p className="font-semibold text-purple-800">{lc.case} ({lc.year})</p>
                    <p className="mt-0.5 text-purple-700">{lc.outcome}</p>
                    <p className="mt-0.5 text-purple-600">{lc.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* State Variance */}
          {promise.stateVariance && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">State-Level Variance</p>
              <div className="mt-1 rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-xs">
                <p className="font-semibold text-amber-800">{promise.stateVariance.description}</p>
                <p className="mt-0.5 text-amber-700">{promise.stateVariance.statesAffected} states affected</p>
                <p className="mt-0.5 text-amber-600">{promise.stateVariance.details}</p>
              </div>
            </div>
          )}

          {/* Dependencies */}
          {dependencies.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                This promise depends on
              </p>
              <div className="mt-1.5 space-y-1.5">
                {dependencies.map((dep) => (
                  <button
                    key={dep.id}
                    onClick={() => handlePromiseClick(dep.id)}
                    className="flex w-full items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-left transition-colors hover:bg-gray-100"
                  >
                    <span className="font-mono text-xs font-semibold text-gray-400">{dep.id}</span>
                    <StatusBadge status={dep.status} size="sm" />
                    <span className="flex-1 truncate text-xs text-gray-600">{dep.body}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dependents */}
          {dependents.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                These promises depend on this
              </p>
              <div className="mt-1.5 space-y-1.5">
                {dependents.map((dep) => (
                  <button
                    key={dep.id}
                    onClick={() => handlePromiseClick(dep.id)}
                    className="flex w-full items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-left transition-colors hover:bg-gray-100"
                  >
                    <span className="font-mono text-xs font-semibold text-gray-400">{dep.id}</span>
                    <StatusBadge status={dep.status} size="sm" />
                    <span className="flex-1 truncate text-xs text-gray-600">{dep.body}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Simulate Cascade button */}
          {onSimulateCascade && (
            <button
              onClick={() => onSimulateCascade(promise.id)}
              className="mt-2 w-full rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-yellow-600"
            >
              Simulate Cascade
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
