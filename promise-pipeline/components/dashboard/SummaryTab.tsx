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
}

export default function SummaryTab({ data, health }: SummaryTabProps) {
  const statusCounts = {
    verified: data.promises.filter((p) => p.status === "verified").length,
    declared: data.promises.filter((p) => p.status === "declared").length,
    degraded: data.promises.filter((p) => p.status === "degraded").length,
    violated: data.promises.filter((p) => p.status === "violated").length,
    unverifiable: data.promises.filter((p) => p.status === "unverifiable").length,
  };

  const grade = computeGrade(health.overall);

  return (
    <div className="space-y-6">
      {/* Top row: Grade + Health + Status breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Grade */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
          <p className="text-xs font-semibold uppercase text-gray-400">Overall Grade</p>
          <p className="mt-2 font-serif text-5xl font-bold text-gray-900">{grade}</p>
          <p className="mt-2 text-xs text-gray-500">{data.gradeExplanation}</p>
        </div>

        {/* Health Score */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase text-gray-400">Network Health</p>
          <p className="mt-2 text-4xl font-bold text-gray-900">{health.overall}<span className="text-lg text-gray-400">/100</span></p>
          <div className="mt-4">
            <NetworkHealthBar score={health.overall} showLabel={false} />
          </div>
          {health.bottlenecks.length > 0 && (
            <p className="mt-3 text-xs text-gray-500">
              Bottleneck: <span className="font-mono font-medium">{health.bottlenecks[0]}</span>
              {health.bottlenecks.length > 1 && ` +${health.bottlenecks.length - 1} more`}
            </p>
          )}
        </div>

        {/* Status breakdown */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase text-gray-400">Promise Status</p>
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
                <span className="text-xs font-medium text-gray-900">{count}</span>
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

      {/* Domain Health */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="mb-4 text-xs font-semibold uppercase text-gray-400">Domain Health</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.domains.map((domain) => (
            <div key={domain.name} className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{domain.name}</span>
                <span className="text-xs text-gray-400">{domain.promiseCount} promises</span>
              </div>
              <div className="mt-2">
                <NetworkHealthBar
                  score={health.byDomain[domain.name] ?? domain.healthScore}
                  showLabel={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* At Risk */}
      {health.atRisk.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-xs font-semibold uppercase text-yellow-700">At Risk</p>
          <p className="mt-1 text-xs text-yellow-600">
            These promises are currently on track but depend on upstream promises that are degraded or violated.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {health.atRisk.map((id) => {
              const p = data.promises.find((pr) => pr.id === id);
              return p ? (
                <div key={id} className="flex items-center gap-1 rounded bg-white px-2 py-1 text-xs">
                  <span className="font-mono text-gray-400">{id}</span>
                  <StatusBadge status={p.status} size="sm" />
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
