"use client";

import type { PersonalDomain } from "@/lib/types/personal";
import { domainColors } from "@/lib/utils/colors";
import { domainMeta } from "@/lib/types/personal";
import { formatPercent } from "@/lib/utils/formatting";
import { getTrendArrow } from "@/lib/simulation/scoring";

interface GardenOverlayProps {
  domainReliability: Record<PersonalDomain, number>;
  domainTrends: Record<PersonalDomain, number>;
  domainCounts: Record<PersonalDomain, { active: number; kept: number }>;
  overallReliability: number;
}

export default function GardenOverlay({
  domainReliability,
  domainTrends,
  domainCounts,
  overallReliability,
}: GardenOverlayProps) {
  const domains: PersonalDomain[] = [
    "health",
    "work",
    "relationships",
    "creative",
    "financial",
  ];

  const activeDomains = domains.filter(
    (d) => (domainCounts[d]?.active ?? 0) > 0
  );

  return (
    <div className="absolute inset-x-0 top-0 z-30 pointer-events-none p-4">
      {/* Overall score */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
          <span className="text-sm font-medium text-[var(--text-muted)]">
            Garden Health
          </span>
          <span className="text-lg font-semibold">
            {formatPercent(overallReliability)}
          </span>
        </div>
      </div>

      {/* Per-domain stats */}
      <div className="flex flex-wrap justify-center gap-2">
        {activeDomains.map((domain) => {
          const dc = domainColors[domain];
          const reliability = domainReliability[domain] ?? 0;
          const trend = domainTrends[domain] ?? 0;
          const counts = domainCounts[domain] ?? { active: 0, kept: 0 };

          return (
            <div
              key={domain}
              className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="text-sm font-semibold"
                  style={{ color: dc.text }}
                >
                  {domainMeta[domain].label}
                </span>
                <span className="text-sm font-medium">
                  {formatPercent(reliability)}
                </span>
                <span className="text-xs">{getTrendArrow(trend)}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                {counts.active} active &middot; {counts.kept} kept
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
