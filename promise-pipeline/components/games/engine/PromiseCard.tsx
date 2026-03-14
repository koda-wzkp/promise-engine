"use client";

import { RuntimePromise, ScenarioTheme } from "../../../lib/games/types";
import { computeStatus } from "../../../lib/games/engine";

interface PromiseCardProps {
  promise: RuntimePromise;
  allPromises: RuntimePromise[];
  theme: ScenarioTheme;
  compact?: boolean;
}

export default function PromiseCard({
  promise,
  allPromises,
  theme,
  compact = false,
}: PromiseCardProps) {
  const status = computeStatus(promise);
  const statusColor = theme.statusColors[status] ?? theme.textMuted;
  const statusBg = theme.statusBgColors[status] ?? "transparent";
  const domainColor = theme.domainColors[promise.domain] ?? theme.textMuted;

  const upstreamWarnings: string[] = [];
  for (const p of allPromises) {
    if (p.currentProgress < promise.degradeThreshold) {
      const dep = allPromises.find(
        (x) => x.id === promise.id && (promise as any).dependsOn?.includes(p.id)
      );
      if (dep) {
        upstreamWarnings.push(`⚠ ${p.id} at ${Math.round(p.currentProgress)}%`);
      }
    }
  }

  if (compact) {
    return (
      <div
        className="rounded border-l-2 px-3 py-2 flex items-center justify-between gap-2"
        style={{ borderLeftColor: domainColor, backgroundColor: theme.bgCard }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-xs font-bold" style={{ color: theme.textBright }}>
            {promise.id}
          </span>
          <span
            className="font-mono text-[10px] truncate"
            style={{ color: theme.textMuted }}
          >
            {promise.body}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="h-1.5 w-16 rounded-full overflow-hidden"
            style={{ backgroundColor: theme.bg }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${promise.currentProgress}%`,
                backgroundColor: statusColor,
              }}
            />
          </div>
          <span
            className="font-mono text-[10px] font-bold w-8 text-right"
            style={{ color: statusColor }}
          >
            {Math.round(promise.currentProgress)}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded border-l-2 p-3 space-y-2"
      style={{ borderLeftColor: domainColor, backgroundColor: theme.bgCard }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-mono text-xs font-bold"
              style={{ color: theme.textBright }}
            >
              {promise.id}
            </span>
            <span
              className="font-mono text-[10px] px-1.5 py-0.5 rounded"
              style={{ color: domainColor, border: `1px solid ${domainColor}44` }}
            >
              {promise.domain.toUpperCase()}
            </span>
            <span
              className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ color: statusColor, backgroundColor: statusBg }}
            >
              {status.toUpperCase()}
            </span>
            {promise.forceStatus === "unverifiable" && (
              <span
                className="font-mono text-[10px] italic"
                style={{ color: theme.statusColors.unverifiable }}
              >
                (Unverifiable)
              </span>
            )}
            {!promise.isFundable && (
              <span
                className="font-mono text-[10px] italic"
                style={{ color: theme.textMuted }}
              >
                computed
              </span>
            )}
          </div>
          <p
            className="font-mono text-xs mt-0.5 leading-relaxed"
            style={{ color: theme.text }}
          >
            {promise.body}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="flex-1 h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: theme.bg }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${promise.currentProgress}%`,
              backgroundColor: statusColor,
            }}
          />
        </div>
        <span
          className="font-mono text-[10px] w-8 text-right"
          style={{ color: theme.textMuted }}
        >
          {Math.round(promise.currentProgress)}%
        </span>
      </div>

      {!compact && promise.verificationNote && (
        <div
          className="font-mono text-[10px] leading-relaxed"
          style={{ color: theme.textMuted }}
        >
          <span style={{ color: theme.accent }}>VERIFY:</span> {promise.verificationNote}
        </div>
      )}

      {upstreamWarnings.map((warn, i) => (
        <div
          key={i}
          className="font-mono text-[10px]"
          style={{ color: theme.statusColors.degraded }}
          role="alert"
        >
          {warn}
        </div>
      ))}
    </div>
  );
}
