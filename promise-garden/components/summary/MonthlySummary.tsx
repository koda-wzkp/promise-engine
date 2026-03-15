"use client";

import type { PersonalDomain } from "@/lib/types/personal";
import type { PersonalPromise } from "@/lib/types/personal";
import { domainColors } from "@/lib/utils/colors";
import { domainMeta } from "@/lib/types/personal";
import { formatPercent } from "@/lib/utils/formatting";
import { getTrendArrow } from "@/lib/simulation/scoring";

interface MonthlySummaryProps {
  reliabilityByDomain: Record<PersonalDomain, number>;
  trendsVsLastMonth: Record<PersonalDomain, number>;
  overallReliability: number;
  wildlifeGained: string[];
  wildlifeLost: string[];
  landscapeChanges: string[];
  dependencyInsights: string[];
  onAddPromise: () => void;
  onRenegotiate: () => void;
  onAbandon: () => void;
  onReclaim: () => void;
  onDismiss: () => void;
}

export default function MonthlySummary({
  reliabilityByDomain,
  trendsVsLastMonth,
  overallReliability,
  wildlifeGained,
  wildlifeLost,
  landscapeChanges,
  dependencyInsights,
  onAddPromise,
  onRenegotiate,
  onAbandon,
  onReclaim,
  onDismiss,
}: MonthlySummaryProps) {
  const domains: PersonalDomain[] = [
    "health", "work", "relationships", "creative", "financial",
  ];
  const activeDomains = domains.filter((d) => reliabilityByDomain[d] !== undefined);

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <h2 className="text-xl font-serif font-semibold">
        Monthly Review
      </h2>

      {/* Overall */}
      <div className="text-center bg-gray-50 rounded-xl p-4">
        <p className="text-sm text-[var(--text-muted)]">Garden Health</p>
        <p className="text-3xl font-semibold">{formatPercent(overallReliability)}</p>
      </div>

      {/* Per-domain */}
      <div className="space-y-2">
        {activeDomains.map((domain) => {
          const dc = domainColors[domain];
          const reliability = reliabilityByDomain[domain] ?? 0;
          const trend = trendsVsLastMonth[domain] ?? 0;

          return (
            <div key={domain} className="flex items-center justify-between">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ color: dc.text, backgroundColor: dc.bg }}
              >
                {domainMeta[domain].label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {formatPercent(reliability)}
                </span>
                <span className="text-xs">{getTrendArrow(trend)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Wildlife changes */}
      {(wildlifeGained.length > 0 || wildlifeLost.length > 0) && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm font-medium mb-2">Wildlife</p>
          {wildlifeGained.map((w) => (
            <p key={w} className="text-sm text-domain-health">+ {w} appeared</p>
          ))}
          {wildlifeLost.map((w) => (
            <p key={w} className="text-sm text-status-missed">- {w} departed</p>
          ))}
        </div>
      )}

      {/* Landscape changes */}
      {landscapeChanges.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm font-medium mb-2">Landscape</p>
          {landscapeChanges.map((c, i) => (
            <p key={i} className="text-sm">{c}</p>
          ))}
        </div>
      )}

      {/* Dependency insights */}
      {dependencyInsights.length > 0 && (
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm font-medium mb-2 text-amber-800">
            Connections
          </p>
          {dependencyInsights.map((insight, i) => (
            <p key={i} className="text-sm text-amber-700">{insight}</p>
          ))}
        </div>
      )}

      {/* Renegotiation prompt */}
      <div>
        <p className="text-sm font-medium mb-3">
          Any promises to add, drop, or adjust?
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onAddPromise}
            className="py-2.5 border border-domain-health/30 rounded-xl text-sm text-domain-health hover:bg-domain-healthBg transition-colors"
          >
            Add a new promise
          </button>
          <button
            onClick={onRenegotiate}
            className="py-2.5 border border-domain-work/30 rounded-xl text-sm text-domain-work hover:bg-domain-workBg transition-colors"
          >
            Renegotiate
          </button>
          <button
            onClick={onAbandon}
            className="py-2.5 border border-status-missed/30 rounded-xl text-sm text-status-missed hover:bg-status-missedBg transition-colors"
          >
            Let a promise go
          </button>
          <button
            onClick={onReclaim}
            className="py-2.5 border border-domain-creative/30 rounded-xl text-sm text-domain-creative hover:bg-domain-creativeBg transition-colors"
          >
            Reclaim a stump
          </button>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="w-full py-3 bg-garden-green text-white rounded-xl text-sm font-medium"
      >
        Everything&apos;s good
      </button>
    </div>
  );
}
