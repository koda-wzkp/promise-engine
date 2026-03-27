"use client";

/**
 * BenchmarkCard — shows how the user's k values compare to baselines.
 * Displayed in the stats tab for contribution-enabled users.
 *
 * Non-contributors see a teaser with a prompt to contribute instead.
 */

import { DOMAIN_BASELINES } from "@/lib/contribution/compute";
import type { GardenStatsV2 } from "@/lib/types/personal";
import type { ContributionState } from "@/lib/types/contribution";

interface BenchmarkCardProps {
  stats: GardenStatsV2;
  contribution: ContributionState;
}

export function BenchmarkCard({ stats, contribution }: BenchmarkCardProps) {
  const isContributor = contribution.enabled;

  if (!isContributor) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center space-y-2">
        <p className="text-2xl" aria-hidden="true">🔭</p>
        <p className="text-sm font-serif font-semibold text-gray-700">
          Benchmarks available for contributors
        </p>
        <p className="text-xs text-gray-500 max-w-xs mx-auto">
          Opt into anonymous data contribution to see how your patterns compare
          to similar promises — no identity required.
        </p>
      </div>
    );
  }

  const domains = Object.keys(stats.byDomain).filter(
    (d) => stats.byDomain[d].total > 0
  );

  if (domains.length === 0) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-100 p-4">
        <p className="text-sm text-green-800">
          Benchmarks will appear as you keep and resolve promises.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-serif font-semibold text-gray-900 text-sm">
          Your benchmarks
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          How your patterns compare across domains
        </p>
      </div>

      <div className="space-y-2">
        {domains.map((domain) => {
          const domainStats = stats.byDomain[domain];
          const baseline = DOMAIN_BASELINES[domain];
          if (!baseline) return null;

          const yourRate = domainStats.keptRate;
          const baseRate = baseline.fulfillmentRate;
          const diff = yourRate - baseRate;
          const isAbove = diff > 0.05;
          const isBelow = diff < -0.05;

          return (
            <div
              key={domain}
              className="rounded-xl border border-gray-100 bg-gray-50 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {domain}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isAbove
                      ? "bg-green-100 text-green-700"
                      : isBelow
                      ? "bg-amber-100 text-amber-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {isAbove ? "Above avg" : isBelow ? "Below avg" : "Near avg"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-600">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span>Yours</span>
                    <span className="font-medium">
                      {Math.round(yourRate * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${Math.round(yourRate * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span>Baseline</span>
                    <span className="font-medium text-gray-400">
                      {Math.round(baseRate * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-400 rounded-full"
                      style={{ width: `${Math.round(baseRate * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {domainStats.averageK > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Avg k: {domainStats.averageK.toFixed(2)} &nbsp;·&nbsp;
                  {domainStats.total} promise{domainStats.total !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
