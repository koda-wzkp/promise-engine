"use client";

import { PersonalStats } from "@/lib/types/personal";

interface ReliabilityScoreProps {
  stats: PersonalStats;
}

export default function ReliabilityScore({ stats }: ReliabilityScoreProps) {
  const grade = getGrade(stats.keptRate);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Reliability Score
      </h3>

      <div className="flex items-end gap-3">
        <span className="font-serif text-4xl font-bold text-gray-900">
          {stats.totalPromises > 0 ? `${Math.round(stats.keptRate)}%` : "—"}
        </span>
        <span className="mb-1 text-lg font-medium text-gray-400">{grade}</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-lg font-semibold text-gray-900">{stats.totalPromises}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-green-700">{stats.activePromises}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">
            {stats.averageDaysToComplete > 0 ? `${stats.averageDaysToComplete}d` : "—"}
          </p>
          <p className="text-xs text-gray-500">Avg Days</p>
        </div>
      </div>
    </div>
  );
}

function getGrade(rate: number): string {
  if (rate >= 90) return "A";
  if (rate >= 80) return "B";
  if (rate >= 70) return "C";
  if (rate >= 60) return "D";
  return "F";
}
