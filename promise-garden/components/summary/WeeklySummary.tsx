"use client";

import { useState } from "react";
import type { PersonalDomain } from "@/lib/types/personal";
import type { CheckIn } from "@/lib/types/check-in";
import { domainColors, responseColors } from "@/lib/utils/colors";
import { domainMeta } from "@/lib/types/personal";
import { formatPercent } from "@/lib/utils/formatting";
import { calculateDomainReliability, getTrendArrow } from "@/lib/simulation/scoring";
import type { PersonalPromise } from "@/lib/types/personal";

interface WeeklySummaryProps {
  promises: PersonalPromise[];
  currentWeekCheckIns: CheckIn[];
  previousWeekCheckIns: CheckIn[];
  narrative: string;
  onDismiss: () => void;
  onReflect?: (text: string) => void;
}

export default function WeeklySummary({
  promises,
  currentWeekCheckIns,
  previousWeekCheckIns,
  narrative,
  onDismiss,
  onReflect,
}: WeeklySummaryProps) {
  const [reflection, setReflection] = useState("");

  const domains: PersonalDomain[] = [
    "health", "work", "relationships", "creative", "financial",
  ];

  const currentReliability = calculateDomainReliability(promises, currentWeekCheckIns);
  const previousReliability = calculateDomainReliability(promises, previousWeekCheckIns);

  const activeDomains = domains.filter(
    (d) => promises.some((p) => p.domain === d && !p.completedAt && !p.abandonedAt)
  );

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-xl font-serif font-semibold mb-4">
        Weekly Summary
      </h2>

      {/* Per-domain check-in dots */}
      <div className="space-y-3 mb-6">
        {activeDomains.map((domain) => {
          const dc = domainColors[domain];
          const domainCheckIns = currentWeekCheckIns.filter((ci) => {
            const p = promises.find((pr) => pr.id === ci.promiseId);
            return p?.domain === domain;
          });
          const keptCount = domainCheckIns.filter((c) => c.response === "kept").length;
          const partialCount = domainCheckIns.filter((c) => c.response === "partial").length;
          const missedCount = domainCheckIns.filter((c) => c.response === "missed").length;
          const trend = (currentReliability[domain] ?? 0) - (previousReliability[domain] ?? 0);

          return (
            <div key={domain} className="flex items-center gap-3">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full w-28 text-center"
                style={{ color: dc.text, backgroundColor: dc.bg }}
              >
                {domainMeta[domain].label}
              </span>
              <div className="flex gap-1 flex-1">
                {Array.from({ length: keptCount }).map((_, i) => (
                  <div key={`k${i}`} className="w-3 h-3 rounded-full" style={{ backgroundColor: responseColors.kept.text }} />
                ))}
                {Array.from({ length: partialCount }).map((_, i) => (
                  <div key={`p${i}`} className="w-3 h-3 rounded-full" style={{ backgroundColor: responseColors.partial.text }} />
                ))}
                {Array.from({ length: missedCount }).map((_, i) => (
                  <div key={`m${i}`} className="w-3 h-3 rounded-full" style={{ backgroundColor: responseColors.missed.text }} />
                ))}
              </div>
              <span className="text-xs">{getTrendArrow(trend)}</span>
            </div>
          );
        })}
      </div>

      {/* Narrative */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <p className="text-sm leading-relaxed">{narrative}</p>
      </div>

      {/* Reflection */}
      {onReflect && (
        <div className="mb-6">
          <label className="block text-sm text-[var(--text-muted)] mb-1.5">
            Anything you want to adjust for next week?
          </label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
            placeholder="Optional reflection..."
          />
          {reflection.trim() && (
            <button
              onClick={() => {
                onReflect(reflection.trim());
                setReflection("");
              }}
              className="mt-2 text-sm text-garden-green font-medium"
            >
              Save reflection
            </button>
          )}
        </div>
      )}

      <button
        onClick={onDismiss}
        className="w-full py-3 bg-garden-green text-white rounded-xl text-sm font-medium"
      >
        Done
      </button>
    </div>
  );
}
