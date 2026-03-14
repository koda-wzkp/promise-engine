"use client";

import { MarsPromise, marsDomainColors } from "../../../lib/types/mars-game";
import { computeStatus } from "../../../lib/games/mars-engine";

interface BudgetAllocatorProps {
  promises: MarsPromise[];
  allocations: Record<string, number>;
  totalBudget: number;
  onAllocate: (promiseId: string, amount: number) => void;
}

const DOMAIN_LABELS: Record<string, string> = {
  Survival: "SURVIVAL",
  Housing: "HOUSING",
  Resources: "RESOURCES",
  Revenue: "REVENUE",
  Finance: "FINANCE",
  Community: "COMMUNITY",
  Safety: "SAFETY",
  Transparency: "TRANSPARENCY",
};

function formatBudget(amount: number): string {
  return `$${amount.toFixed(1)}B`;
}

export default function BudgetAllocator({
  promises,
  allocations,
  totalBudget,
  onAllocate,
}: BudgetAllocatorProps) {
  const totalAllocated = Object.values(allocations).reduce(
    (sum, v) => sum + v,
    0
  );
  const remaining = totalBudget - totalAllocated;

  return (
    <div
      className="space-y-4"
      role="group"
      aria-label="Budget allocation controls"
    >
      {/* Budget summary */}
      <div className="flex items-center justify-between font-mono text-xs border-b border-[#2d3748] pb-3">
        <span className="text-[#9ca3af]">Budget</span>
        <div className="flex gap-4">
          <span className="text-[#9ca3af]">
            Available:{" "}
            <span className="text-[#e5e7eb]">{formatBudget(totalBudget)}</span>
          </span>
          <span className="text-[#9ca3af]">
            Allocated:{" "}
            <span className="text-[#f5a623]">
              {formatBudget(totalAllocated)}
            </span>
          </span>
          <span className="text-[#9ca3af]">
            Remaining:{" "}
            <span
              className={remaining < 0.5 ? "text-[#ef4444]" : "text-[#00ff88]"}
            >
              {formatBudget(remaining)}
            </span>
          </span>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        {promises.map((promise) => {
          if (promise.id === "P5") {
            return (
              <P5ReadOnly key={promise.id} promise={promise} promises={promises} />
            );
          }
          return (
            <PromiseSlider
              key={promise.id}
              promise={promise}
              promises={promises}
              allocated={allocations[promise.id] ?? 0}
              maxAllocatable={
                (allocations[promise.id] ?? 0) + remaining
              }
              onAllocate={onAllocate}
            />
          );
        })}
      </div>
    </div>
  );
}

function PromiseSlider({
  promise,
  promises,
  allocated,
  maxAllocatable,
  onAllocate,
}: {
  promise: MarsPromise;
  promises: MarsPromise[];
  allocated: number;
  maxAllocatable: number;
  onAllocate: (id: string, amount: number) => void;
}) {
  const status = computeStatus(promise);
  const domainColor = marsDomainColors[promise.domain] ?? "#64748b";

  // Check upstream dependencies
  const upstreamWarnings: string[] = [];
  for (const depId of promise.dependsOn) {
    const upstream = promises.find((p) => p.id === depId);
    if (upstream && upstream.progress < promise.cascadeThreshold) {
      upstreamWarnings.push(
        `⚠ Upstream ${depId} at ${Math.round(upstream.progress)}% — cascade risk (threshold: ${promise.cascadeThreshold}%)`
      );
    }
  }

  const statusColors: Record<string, string> = {
    verified: "#00ff88",
    declared: "#60a5fa",
    degraded: "#f59e0b",
    violated: "#ef4444",
    unverifiable: "#a78bfa",
  };
  const statusColor = statusColors[status] ?? "#9ca3af";

  const sliderId = `slider-${promise.id}`;

  return (
    <div
      className="rounded border-l-2 bg-[#111827] p-3"
      style={{ borderLeftColor: domainColor }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-[#f9fafb]">
              {promise.id}
            </span>
            <span
              className="font-mono text-[10px] px-1 rounded"
              style={{ color: domainColor, border: `1px solid ${domainColor}33` }}
            >
              {DOMAIN_LABELS[promise.domain] ?? promise.domain}
            </span>
            <span
              className="font-mono text-[10px] font-bold"
              style={{ color: statusColor }}
            >
              {status.toUpperCase()}
            </span>
            {promise.id === "P7" && (
              <span className="font-mono text-[10px] text-[#a78bfa]">
                (Unverifiable)
              </span>
            )}
          </div>
          <p className="font-mono text-xs text-[#e5e7eb] mt-0.5 leading-relaxed">
            {promise.body}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div
            className="font-mono text-sm font-bold text-[#f5a623]"
            aria-live="polite"
            aria-label={`Allocated to ${promise.id}: ${formatBudget(allocated)}`}
          >
            {formatBudget(allocated)}
          </div>
          <div className="font-mono text-[10px] text-[#9ca3af]">
            Rec: {formatBudget(promise.costPerQuarter)}
            {promise.isOneTime && " (once)"}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-1 rounded-full bg-[#2d3748] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${promise.progress}%`,
              backgroundColor: statusColor,
            }}
          />
        </div>
        <span className="font-mono text-[10px] text-[#9ca3af] w-8 text-right">
          {Math.round(promise.progress)}%
        </span>
      </div>

      {/* Dependency info */}
      {promise.dependsOn.length > 0 && (
        <div className="mb-2 font-mono text-[10px] text-[#9ca3af]">
          Requires:{" "}
          {promise.dependsOn.map((depId) => {
            const dep = promises.find((p) => p.id === depId);
            return (
              <span key={depId} className="text-[#e5e7eb]">
                {depId}
                {dep ? ` (${dep.domain}) ≥${promise.cascadeThreshold}%` : ""}
              </span>
            );
          })}
        </div>
      )}

      {/* Upstream warnings */}
      {upstreamWarnings.map((warn, i) => (
        <div
          key={i}
          className="mb-2 font-mono text-[10px] text-[#f59e0b]"
          role="alert"
        >
          {warn}
        </div>
      ))}

      {/* Slider */}
      <div>
        <label htmlFor={sliderId} className="sr-only">
          Allocate budget to {promise.id}: {promise.body}. Current:{" "}
          {formatBudget(allocated)}. Maximum: {formatBudget(maxAllocatable)}.
        </label>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={Math.max(maxAllocatable, allocated)}
          step={0.1}
          value={allocated}
          onChange={(e) => onAllocate(promise.id, parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={
            {
              background: `linear-gradient(to right, ${domainColor} 0%, ${domainColor} ${(allocated / Math.max(maxAllocatable, 0.1)) * 100}%, #2d3748 ${(allocated / Math.max(maxAllocatable, 0.1)) * 100}%, #2d3748 100%)`,
              ["--thumb-color" as string]: "#f5a623",
            } as Record<string, string>
          }
          aria-valuetext={`${formatBudget(allocated)} of ${formatBudget(maxAllocatable)} available`}
        />
      </div>
    </div>
  );
}

function P5ReadOnly({
  promise,
  promises,
}: {
  promise: MarsPromise;
  promises: MarsPromise[];
}) {
  const domainColor = marsDomainColors[promise.domain] ?? "#64748b";
  const p4 = promises.find((p) => p.id === "P4");
  const p8 = promises.find((p) => p.id === "P8");

  return (
    <div
      className="rounded border-l-2 bg-[#111827] p-3 opacity-70"
      style={{ borderLeftColor: domainColor }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#f9fafb]">
              P5
            </span>
            <span
              className="font-mono text-[10px] px-1 rounded"
              style={{ color: domainColor, border: `1px solid ${domainColor}33` }}
            >
              FINANCE
            </span>
            <span className="font-mono text-[10px] text-[#9ca3af] italic">
              computed
            </span>
          </div>
          <p className="font-mono text-xs text-[#e5e7eb] mt-0.5">
            {promise.body}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-sm font-bold text-[#9ca3af]">N/A</div>
          <div className="font-mono text-[10px] text-[#64748b]">
            Not fundable
          </div>
        </div>
      </div>
      <div className="mt-2 font-mono text-[10px] text-[#9ca3af]">
        Computed from P4 (mining, 70%) + P8 (comms, 30%)
        {p4 && p8 && (
          <span>
            {" "}
            — P4: {Math.round(p4.progress)}%, P8: {Math.round(p8.progress)}%
          </span>
        )}
      </div>
      <div className="mt-1 h-1 rounded-full bg-[#2d3748] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#06b6d4]"
          style={{ width: `${promise.progress}%` }}
        />
      </div>
    </div>
  );
}
