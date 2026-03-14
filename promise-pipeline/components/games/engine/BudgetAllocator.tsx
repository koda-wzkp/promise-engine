"use client";

import { RuntimePromise, ScenarioConfig, ScenarioTheme } from "../../../lib/games/types";
import { computeStatus } from "../../../lib/games/engine";

interface BudgetAllocatorProps {
  promises: RuntimePromise[];
  allocations: Record<string, number>;
  totalBudget: number;
  config: ScenarioConfig;
  onAllocate: (promiseId: string, amount: number) => void;
}

function formatAmount(amount: number, unitLabel: string, unitScale: string): string {
  return `${unitLabel}${amount.toFixed(1)}${unitScale}`;
}

export default function BudgetAllocator({
  promises,
  allocations,
  totalBudget,
  config,
  onAllocate,
}: BudgetAllocatorProps) {
  const theme = config.theme;
  const { unitLabel, unitScale } = config.setting;
  const fmt = (n: number) => formatAmount(n, unitLabel, unitScale);

  const totalAllocated = Object.values(allocations).reduce((s, v) => s + v, 0);
  const remaining = totalBudget - totalAllocated;

  return (
    <div className="space-y-4" role="group" aria-label="Budget allocation controls">
      {/* Budget summary */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs border-b pb-3"
        style={{ borderColor: theme.border }}
      >
        <span style={{ color: theme.textMuted }}>Budget</span>
        <div className="flex flex-wrap gap-4">
          <span style={{ color: theme.textMuted }}>
            Available:{" "}
            <span style={{ color: theme.text }}>{fmt(totalBudget)}</span>
          </span>
          <span style={{ color: theme.textMuted }}>
            Allocated:{" "}
            <span style={{ color: theme.accent }}>{fmt(totalAllocated)}</span>
          </span>
          <span style={{ color: theme.textMuted }}>
            Remaining:{" "}
            <span
              style={{ color: remaining < 0.5 ? theme.danger : theme.terminal }}
            >
              {fmt(remaining)}
            </span>
          </span>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        {promises.map((promise) => {
          if (!promise.isFundable) {
            return (
              <ComputedRow
                key={promise.id}
                promise={promise}
                promises={promises}
                config={config}
                fmt={fmt}
              />
            );
          }
          return (
            <PromiseSlider
              key={promise.id}
              promise={promise}
              promises={promises}
              allocated={allocations[promise.id] ?? 0}
              maxAllocatable={(allocations[promise.id] ?? 0) + remaining}
              config={config}
              fmt={fmt}
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
  config,
  fmt,
  onAllocate,
}: {
  promise: RuntimePromise;
  promises: RuntimePromise[];
  allocated: number;
  maxAllocatable: number;
  config: ScenarioConfig;
  fmt: (n: number) => string;
  onAllocate: (id: string, amount: number) => void;
}) {
  const theme = config.theme;
  const status = computeStatus(promise);
  const statusColor = theme.statusColors[status] ?? theme.textMuted;
  const domainColor = theme.domainColors[promise.domain] ?? theme.textMuted;
  const sliderId = `slider-${promise.id}`;
  const max = Math.max(maxAllocatable, allocated);

  return (
    <div
      className="rounded border-l-2 p-3"
      style={{ borderLeftColor: domainColor, backgroundColor: theme.bgCard }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold" style={{ color: theme.textBright }}>
              {promise.id}
            </span>
            <span
              className="font-mono text-[10px] px-1 rounded"
              style={{ color: domainColor, border: `1px solid ${domainColor}44` }}
            >
              {promise.domain.toUpperCase()}
            </span>
            <span className="font-mono text-[10px] font-bold" style={{ color: statusColor }}>
              {status.toUpperCase()}
            </span>
            {promise.forceStatus === "unverifiable" && (
              <span className="font-mono text-[10px]" style={{ color: theme.statusColors.unverifiable }}>
                (Unverifiable)
              </span>
            )}
          </div>
          <p className="font-mono text-xs mt-0.5 leading-relaxed" style={{ color: theme.text }}>
            {promise.body}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div
            className="font-mono text-sm font-bold"
            style={{ color: theme.accent }}
            aria-live="polite"
            aria-label={`Allocated to ${promise.id}: ${fmt(allocated)}`}
          >
            {fmt(allocated)}
          </div>
          <div className="font-mono text-[10px]" style={{ color: theme.textMuted }}>
            Rec: {fmt(promise.costPerRound)}
            {promise.isOneTime && " (once)"}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="flex-1 h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: theme.bg }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${promise.currentProgress}%`, backgroundColor: statusColor }}
          />
        </div>
        <span className="font-mono text-[10px] w-8 text-right" style={{ color: theme.textMuted }}>
          {Math.round(promise.currentProgress)}%
        </span>
      </div>

      {/* Slider */}
      <label htmlFor={sliderId} className="sr-only">
        Allocate budget to {promise.id}: {promise.body}. Current: {fmt(allocated)}. Maximum:{" "}
        {fmt(maxAllocatable)}.
      </label>
      <input
        id={sliderId}
        type="range"
        min={0}
        max={max}
        step={0.1}
        value={allocated}
        onChange={(e) => onAllocate(promise.id, parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={
          {
            background: `linear-gradient(to right, ${domainColor} 0%, ${domainColor} ${(allocated / Math.max(max, 0.1)) * 100}%, ${theme.border} ${(allocated / Math.max(max, 0.1)) * 100}%, ${theme.border} 100%)`,
            ["--thumb-color" as string]: theme.accent,
          } as Record<string, string>
        }
        aria-valuetext={`${fmt(allocated)} of ${fmt(maxAllocatable)} available`}
      />
    </div>
  );
}

function ComputedRow({
  promise,
  promises,
  config,
  fmt,
}: {
  promise: RuntimePromise;
  promises: RuntimePromise[];
  config: ScenarioConfig;
  fmt: (n: number) => string;
}) {
  const theme = config.theme;
  const domainColor = theme.domainColors[promise.domain] ?? theme.textMuted;
  const rule = config.computedPromises.find((r) => r.promiseId === promise.id);

  return (
    <div
      className="rounded border-l-2 p-3 opacity-75"
      style={{ borderLeftColor: domainColor, backgroundColor: theme.bgCard }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold" style={{ color: theme.textBright }}>
              {promise.id}
            </span>
            <span
              className="font-mono text-[10px] px-1 rounded"
              style={{ color: domainColor, border: `1px solid ${domainColor}44` }}
            >
              {promise.domain.toUpperCase()}
            </span>
            <span className="font-mono text-[10px] italic" style={{ color: theme.textMuted }}>
              computed
            </span>
          </div>
          <p className="font-mono text-xs mt-0.5" style={{ color: theme.text }}>
            {promise.body}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-sm font-bold" style={{ color: theme.textMuted }}>
            N/A
          </div>
          <div className="font-mono text-[10px]" style={{ color: theme.textMuted }}>
            Not fundable
          </div>
        </div>
      </div>
      {rule && (
        <div className="mt-2 font-mono text-[10px]" style={{ color: theme.textMuted }}>
          Computed from{" "}
          {rule.formula.inputs.map((inp, i) => (
            <span key={inp.promiseId}>
              {i > 0 && " + "}
              <span style={{ color: theme.text }}>
                {inp.promiseId}
              </span>{" "}
              ({Math.round(inp.weight * 100)}%)
              {(() => {
                const src = promises.find((p) => p.id === inp.promiseId);
                return src ? ` — ${Math.round(src.currentProgress)}%` : "";
              })()}
            </span>
          ))}
        </div>
      )}
      <div
        className="mt-1 h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: theme.bg }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${promise.currentProgress}%`, backgroundColor: theme.accent }}
        />
      </div>
    </div>
  );
}
