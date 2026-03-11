"use client";

import { DashboardData } from "@/lib/types/promise";
import { NetworkHealthScore } from "@/lib/types/simulation";
import StatusBadge from "../promise/StatusBadge";
import NetworkHealthBar from "../simulation/NetworkHealthBar";
import { statusColors } from "@/lib/utils/colors";
import { computeGrade } from "@/lib/utils/formatting";

interface SummaryTabProps {
  data: DashboardData;
  health: NetworkHealthScore;
  onDomainClick?: (domain: string) => void;
  onPromiseClick?: (promiseId: string) => void;
}

export default function SummaryTab({ data, health, onDomainClick, onPromiseClick }: SummaryTabProps) {
  const statusCounts = {
    verified: data.promises.filter((p) => p.status === "verified").length,
    declared: data.promises.filter((p) => p.status === "declared").length,
    degraded: data.promises.filter((p) => p.status === "degraded").length,
    violated: data.promises.filter((p) => p.status === "violated").length,
    unverifiable: data.promises.filter((p) => p.status === "unverifiable").length,
  };

  const grade = computeGrade(health.overall);

  // Generate grade improvement hint
  const gradeHint = getGradeHint(data, health);

  return (
    <div className="space-y-6">
      {/* Top row: Grade + Health + Status breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Grade */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Overall Grade</p>
          <p className="mt-2 font-serif text-5xl font-bold text-gray-900">{grade}</p>
          <p className="mt-2 text-xs text-gray-500">{data.gradeExplanation}</p>
          {gradeHint && (
            <p className="mt-2 rounded bg-blue-50 px-2 py-1 text-[11px] text-blue-700">
              {gradeHint}
            </p>
          )}
        </div>

        {/* Health Score */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Network Health</p>
          <p className="mt-2 text-4xl font-bold text-gray-900">
            {health.overall}<span className="text-lg text-gray-400">/100</span>
          </p>
          <div className="mt-4">
            <NetworkHealthBar score={health.overall} showLabel={false} />
          </div>
          {health.bottlenecks.length > 0 && (
            <p className="mt-3 text-xs text-gray-500">
              Bottleneck:{" "}
              <button
                onClick={() => onPromiseClick?.(health.bottlenecks[0])}
                className="font-mono font-medium text-gray-700 underline decoration-gray-300 hover:text-gray-900"
              >
                {health.bottlenecks[0]}
              </button>
              {health.bottlenecks.length > 1 && ` +${health.bottlenecks.length - 1} more`}
            </p>
          )}
        </div>

        {/* Status breakdown */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Promise Status</p>
          <div className="mt-3 space-y-2">
            {(Object.entries(statusCounts) as [string, number][]).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: statusColors[status as keyof typeof statusColors] }}
                  />
                  <span className="text-xs capitalize text-gray-600">{status}</span>
                </div>
                <span className="font-mono text-xs font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
          {/* Mini bar chart */}
          <div className="mt-3 flex h-3 overflow-hidden rounded-full">
            {Object.entries(statusCounts).map(([status, count]) => (
              count > 0 ? (
                <div
                  key={status}
                  style={{
                    width: `${(count / data.promises.length) * 100}%`,
                    backgroundColor: statusColors[status as keyof typeof statusColors],
                  }}
                />
              ) : null
            ))}
          </div>
        </div>
      </div>

      {/* Domain Health — clickable */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Domain Health</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.domains.map((domain) => (
            <button
              key={domain.name}
              onClick={() => onDomainClick?.(domain.name)}
              className="rounded-lg bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{domain.name}</span>
                <span className="font-mono text-xs text-gray-400">{domain.promiseCount} promises</span>
              </div>
              <div className="mt-2">
                <NetworkHealthBar
                  score={health.byDomain[domain.name] ?? domain.healthScore}
                  showLabel={false}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* At Risk — clickable */}
      {health.atRisk.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-yellow-700">At Risk</p>
          <p className="mt-1 text-xs text-yellow-600">
            These promises are currently on track but depend on upstream promises that are degraded or violated.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {health.atRisk.map((id) => {
              const p = data.promises.find((pr) => pr.id === id);
              return p ? (
                <button
                  key={id}
                  onClick={() => onPromiseClick?.(id)}
                  className="flex items-center gap-1 rounded bg-white px-2 py-1 text-xs transition-colors hover:bg-yellow-100"
                >
                  <span className="font-mono font-semibold text-gray-500">{id}</span>
                  <StatusBadge status={p.status} size="sm" />
                </button>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function getGradeHint(data: DashboardData, health: NetworkHealthScore): string | null {
  if (health.bottlenecks.length > 0) {
    const bottleneck = data.promises.find((p) => p.id === health.bottlenecks[0]);
    if (bottleneck && (bottleneck.status === "violated" || bottleneck.status === "degraded")) {
      const currentGrade = computeGrade(health.overall);
      const estimatedImprovement = health.overall + 8;
      const newGrade = computeGrade(estimatedImprovement);
      if (newGrade !== currentGrade) {
        return `Resolving the ${bottleneck.id} cascade could raise this to ${newGrade}.`;
      }
      return `Resolving ${bottleneck.id} would improve network health.`;
    }
  }
  return null;
}
