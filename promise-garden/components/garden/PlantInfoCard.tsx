"use client";

import { useState } from "react";
import type { PlantState } from "@/lib/types/garden";
import type { PersonalPromise } from "@/lib/types/personal";
import type { CheckIn } from "@/lib/types/check-in";
import { getPlantDefinition } from "@/lib/garden/plants";
import { domainColors, responseColors } from "@/lib/utils/colors";
import { formatDate, formatPercent, daysAgo } from "@/lib/utils/formatting";
import { domainMeta, stakesMeta, durationMeta } from "@/lib/types/personal";
import { simulateWhatIf } from "@/lib/simulation/cascade";

interface PlantInfoCardProps {
  plant: PlantState;
  promise: PersonalPromise;
  checkIns: CheckIn[];
  allPromises: PersonalPromise[];
  onClose: () => void;
  onRenegotiate?: (promiseId: string) => void;
  onAbandon?: (promiseId: string) => void;
  onComplete?: (promiseId: string) => void;
}

export default function PlantInfoCard({
  plant,
  promise,
  checkIns,
  allPromises,
  onClose,
  onRenegotiate,
  onAbandon,
  onComplete,
}: PlantInfoCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const def = getPlantDefinition(plant.domain, plant.durationTier, plant.stakesTier);
  const dc = domainColors[plant.domain];
  const hasDeps = promise.depends_on.length > 0;

  // Last 7 days of check-ins
  const recentDates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    recentDates.push(daysAgo(i));
  }

  const recentCheckIns = recentDates.map((date) => {
    const ci = checkIns.find((c) => c.promiseId === promise.id && c.date === date);
    return { date, response: ci?.response ?? null };
  });

  // Growth percentage
  const growthPercent = Math.round(plant.growthProgress * 100);
  const stageLabel =
    plant.growthStage.charAt(0).toUpperCase() + plant.growthStage.slice(1);

  // What If preview
  const whatIfEffects = showWhatIf
    ? simulateWhatIf(promise.id, allPromises)
    : [];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 animate-slide-up">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative bg-white rounded-t-2xl shadow-xl max-h-[70vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="px-5 pb-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold leading-tight">
                {promise.body}
              </h3>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ color: dc.text, backgroundColor: dc.bg }}
                >
                  {domainMeta[plant.domain].label}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {durationMeta[plant.durationTier].label}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span
                className="text-sm font-medium"
                style={{ color: dc.text }}
              >
                {stageLabel}
              </span>
              <p className="text-xs text-[var(--text-muted)]">
                {def.name} &middot; {growthPercent}% to{" "}
                {plant.growthStage === "mature" ? "maturity" : "next stage"}
              </p>
            </div>
          </div>

          {/* Check-in history — last 7 days */}
          <div className="mb-4">
            <p className="text-xs text-[var(--text-muted)] mb-2">
              Last 7 days
            </p>
            <div className="flex gap-1.5">
              {recentCheckIns.map(({ date, response }) => (
                <div key={date} className="flex flex-col items-center gap-1">
                  <div
                    className="w-6 h-6 rounded-full border-2"
                    style={
                      response
                        ? {
                            backgroundColor:
                              responseColors[response].bg,
                            borderColor: responseColors[response].text,
                          }
                        : {
                            backgroundColor: "#f3f4f6",
                            borderColor: "#d1d5db",
                          }
                    }
                  />
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {new Date(date).toLocaleDateString("en", {
                      weekday: "narrow",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Promisee</span>
              <span>{promise.promisee}</span>
            </div>
            {promise.targetDate && (
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Target</span>
                <span>{formatDate(promise.targetDate)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Streak</span>
              <span>{plant.consecutiveKept}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Created</span>
              <span>{formatDate(promise.createdAt)}</span>
            </div>
          </div>

          {/* Dependencies */}
          {hasDeps && (
            <div className="mb-4">
              <p className="text-xs text-[var(--text-muted)] mb-2">
                Depends on
              </p>
              <div className="space-y-1">
                {promise.depends_on.map((depId) => {
                  const dep = allPromises.find((p) => p.id === depId);
                  if (!dep) return null;
                  return (
                    <div
                      key={depId}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: domainColors[dep.domain as keyof typeof domainColors]?.text ?? "#6b7280",
                        }}
                      />
                      <span className="truncate">{dep.body}</span>
                    </div>
                  );
                })}
              </div>

              {/* What If button */}
              <button
                onClick={() => setShowWhatIf(!showWhatIf)}
                className="mt-2 text-xs font-medium text-domain-work hover:underline"
              >
                {showWhatIf ? "Close preview" : "What If?"}
              </button>

              {showWhatIf && whatIfEffects.length > 0 && (
                <div className="mt-2 p-3 bg-amber-50 rounded-lg text-sm">
                  <p className="font-medium text-amber-800 mb-1">
                    Dropping this would affect {whatIfEffects.length} connected
                    promise{whatIfEffects.length === 1 ? "" : "s"}:
                  </p>
                  <ul className="space-y-1">
                    {whatIfEffects.map((e) => (
                      <li key={e.promiseId} className="text-amber-700 text-xs">
                        &bull; {e.body}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {plant.growthStage !== "dead" && (
            <div>
              {!showActions ? (
                <button
                  onClick={() => setShowActions(true)}
                  className="w-full py-2.5 border border-gray-200 rounded-xl text-sm text-[var(--text-muted)] hover:bg-gray-50 transition-colors"
                >
                  Update status
                </button>
              ) : (
                <div className="space-y-2">
                  {onRenegotiate && (
                    <button
                      onClick={() => onRenegotiate(promise.id)}
                      className="w-full py-2.5 border border-domain-work/30 rounded-xl text-sm text-domain-work hover:bg-domain-workBg transition-colors"
                    >
                      Renegotiate
                    </button>
                  )}
                  {onComplete && (
                    <button
                      onClick={() => onComplete(promise.id)}
                      className="w-full py-2.5 border border-domain-health/30 rounded-xl text-sm text-domain-health hover:bg-domain-healthBg transition-colors"
                    >
                      Mark complete
                    </button>
                  )}
                  {onAbandon && (
                    <button
                      onClick={() => onAbandon(promise.id)}
                      className="w-full py-2.5 border border-status-missed/30 rounded-xl text-sm text-status-missed hover:bg-status-missedBg transition-colors"
                    >
                      Let this go
                    </button>
                  )}
                  <button
                    onClick={() => setShowActions(false)}
                    className="w-full py-2 text-xs text-[var(--text-muted)]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
