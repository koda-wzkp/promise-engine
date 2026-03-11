"use client";

import { PersonalStats } from "@/lib/types/personal";

interface DomainBreakdownProps {
  stats: PersonalStats;
}

export default function DomainBreakdown({ stats }: DomainBreakdownProps) {
  const domains = Object.entries(stats.byDomain).sort((a, b) => b[1].total - a[1].total);

  if (domains.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        By Domain
      </h3>

      <div className="space-y-3">
        {domains.map(([domain, data]) => (
          <div key={domain}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{domain}</span>
              <span className="text-xs text-gray-500">
                {data.kept}/{data.total} kept
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-green-600 transition-all"
                style={{ width: `${data.total > 0 ? (data.kept / data.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
