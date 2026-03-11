"use client";

import { useState, useEffect } from "react";
import { Promise as PromiseType, Agent, Domain, PromiseStatus } from "@/lib/types/promise";
import PromiseCard from "./PromiseCard";
import DomainFilter from "./DomainFilter";

interface PromiseListProps {
  promises: PromiseType[];
  agents: Agent[];
  domains: Domain[];
  onWhatIf?: (promiseId: string) => void;
  simulatedIds?: Set<string>;
  onPromiseClick?: (promiseId: string) => void;
  initialDomainFilter?: string | null;
}

const STATUS_ORDER: PromiseStatus[] = ["violated", "degraded", "unverifiable", "declared", "verified"];

export default function PromiseList({
  promises,
  agents,
  domains,
  onWhatIf,
  simulatedIds,
  onPromiseClick,
  initialDomainFilter,
}: PromiseListProps) {
  const [domainFilter, setDomainFilter] = useState<string | null>(initialDomainFilter ?? null);
  const [statusFilter, setStatusFilter] = useState<PromiseStatus | null>(null);

  // Sync external domain filter
  useEffect(() => {
    if (initialDomainFilter !== undefined && initialDomainFilter !== null) {
      setDomainFilter(initialDomainFilter);
    }
  }, [initialDomainFilter]);

  let filtered = promises;
  if (domainFilter) filtered = filtered.filter((p) => p.domain === domainFilter);
  if (statusFilter) filtered = filtered.filter((p) => p.status === statusFilter);

  // Sort: violated first, then degraded, etc.
  filtered = [...filtered].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DomainFilter domains={domains} selected={domainFilter} onSelect={setDomainFilter} />
        <div className="flex gap-1">
          {(["violated", "degraded", "unverifiable", "declared", "verified"] as PromiseStatus[]).map(
            (s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? null : s)}
                className={`rounded px-2 py-0.5 text-[10px] font-medium capitalize transition-colors ${
                  statusFilter === s
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {s}
              </button>
            )
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Showing {filtered.length} of {promises.length} promises
      </p>

      <div className="space-y-4">
        {filtered.map((p) => (
          <PromiseCard
            key={p.id}
            promise={p}
            agents={agents}
            allPromises={promises}
            simulated={simulatedIds?.has(p.id)}
            onWhatIf={onWhatIf}
            onClick={onPromiseClick ? () => onPromiseClick(p.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
