"use client";

import { PersonalStats } from "@/lib/types/personal";

interface ReliabilityScoreProps {
  stats: PersonalStats;
}

export default function ReliabilityScore({ stats }: ReliabilityScoreProps) {
  const momentum = getMomentum(stats.keptRate, stats.totalPromises);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Your Momentum
      </h3>

      <div className="flex items-end gap-3">
        <span className={`font-serif text-2xl font-bold ${momentum.color}`}>
          {momentum.label}
        </span>
        {stats.totalPromises > 0 && (
          <span className="mb-0.5 text-sm text-gray-400">
            {Math.round(stats.keptRate)}% kept
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500">{momentum.message}</p>

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

function getMomentum(
  keptRate: number,
  totalPromises: number,
): { label: string; message: string; color: string } {
  if (totalPromises === 0) {
    return {
      label: "Ready to begin",
      message: "Your first promise is waiting. Start small.",
      color: "text-gray-700",
    };
  }

  if (totalPromises <= 2) {
    return {
      label: "Planting seeds",
      message: "Early days. Every commitment counts.",
      color: "text-sky-accent",
    };
  }

  if (keptRate >= 85) {
    return {
      label: "Thriving",
      message: "Strong follow-through. Your word means something.",
      color: "text-green-700",
    };
  }

  if (keptRate >= 65) {
    return {
      label: "Building steady",
      message: "Consistent progress. Keep showing up.",
      color: "text-blue-700",
    };
  }

  if (keptRate >= 40) {
    return {
      label: "Finding your rhythm",
      message: "Some promises land, some teach you. Both matter.",
      color: "text-amber-700",
    };
  }

  return {
    label: "Still here",
    message: "Showing up is the hardest part. Try smaller promises.",
    color: "text-gray-700",
  };
}
