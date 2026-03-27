"use client";

/**
 * GardenStats
 *
 * Displays k distribution, g_obs/g_dec ratio, and fulfillment rates.
 * No streak mechanics, no shame signals.
 *
 * Accessibility:
 *  - All data has text labels (not just visual bars)
 *  - High contrast colors
 */

import type { PersonalStats } from "@/lib/types/personal";

interface GardenStatsProps {
  stats: PersonalStats;
}

export function GardenStats({ stats }: GardenStatsProps) {
  const weatherRatio =
    stats.gDecRate > 0 ? stats.gObsRate / stats.gDecRate : 0;
  const weatherLabel =
    weatherRatio > 1.5
      ? "Sunny"
      : weatherRatio > 0.7
      ? "Partly cloudy"
      : weatherRatio > 0
      ? "Overcast"
      : "Dormant";

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif font-semibold text-gray-900 mb-4">
          Garden Overview
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            value={stats.totalPromises}
            label="Total promises"
            color="text-gray-900"
          />
          <StatCard
            value={stats.activePromises}
            label="Active"
            color="text-blue-600"
          />
          <StatCard
            value={stats.keptCount}
            label="Kept"
            color="text-green-700"
          />
          <StatCard
            value={`${Math.round(stats.keptRate * 100)}%`}
            label="Kept rate"
            color="text-green-700"
          />
        </div>
      </div>

      {/* Weather / Check-in health */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif font-semibold text-gray-900 mb-4">
          Garden Weather
        </h3>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-3xl" aria-hidden="true">
            {weatherRatio > 1.5
              ? "☀️"
              : weatherRatio > 0.7
              ? "⛅"
              : weatherRatio > 0
              ? "☁️"
              : "🌙"}
          </span>
          <div>
            <p className="font-semibold text-gray-900">{weatherLabel}</p>
            <p className="text-xs text-gray-500">
              Check-in rate vs. decay rate:{" "}
              {weatherRatio > 0 ? weatherRatio.toFixed(2) : "—"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-semibold text-gray-900">
              {stats.gObsRate > 0 ? stats.gObsRate.toFixed(3) : "0"}
            </p>
            <p className="text-xs text-gray-500">
              g<sub>obs</sub> (check-in rate)
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-semibold text-gray-900">
              {stats.gDecRate.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              g<sub>dec</sub> (decay baseline)
            </p>
          </div>
        </div>
      </div>

      {/* k Distribution */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif font-semibold text-gray-900 mb-4">
          Verification Regimes
        </h3>
        <div className="space-y-3">
          <KBar
            label="Composting"
            sublabel="Self-tracked, soft signals"
            count={stats.kDistribution.composting}
            total={stats.totalPromises}
            color="bg-amber-500"
          />
          <KBar
            label="Ecological"
            sublabel="Self-reported, regular check-ins"
            count={stats.kDistribution.ecological}
            total={stats.totalPromises}
            color="bg-green-600"
          />
          <KBar
            label="Physics"
            sublabel="Sensor or audit verified"
            count={stats.kDistribution.physics}
            total={stats.totalPromises}
            color="bg-blue-600"
          />
        </div>
      </div>

      {/* Domain breakdown */}
      {Object.keys(stats.byDomain).length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-serif font-semibold text-gray-900 mb-4">
            By Domain
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byDomain).map(([domain, data]) => (
              <div
                key={domain}
                className="flex items-center justify-between text-sm"
              >
                <span className="capitalize font-medium text-gray-700">
                  {domain}
                </span>
                <span className="text-gray-500">
                  {data.kept}/{data.total} kept
                  {data.averageK > 0 && (
                    <span className="ml-2 text-xs text-gray-400">
                      k̄={data.averageK.toFixed(2)}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  value,
  label,
  color,
}: {
  value: number | string;
  label: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function KBar({
  label,
  sublabel,
  count,
  total,
  color,
}: {
  label: string;
  sublabel: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-xs text-gray-400 ml-2">{sublabel}</span>
        </div>
        <span className="text-xs text-gray-500">
          {count} ({Math.round(pct)}%)
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%`, transition: "width 0.3s ease" }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${Math.round(pct)}%`}
        />
      </div>
    </div>
  );
}
