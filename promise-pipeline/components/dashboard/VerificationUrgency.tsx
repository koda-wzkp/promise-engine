"use client";

import { NetworkBelief } from "@/lib/types/bayesian";
import { Promise as PromiseType } from "@/lib/types/promise";

interface VerificationUrgencyProps {
  urgencyItems: NetworkBelief["verificationUrgency"];
  promises: PromiseType[];
  onPromiseClick?: (promiseId: string) => void;
}

import { UrgencyType } from "@/lib/types/bayesian";

function UrgencyTypeBadge({ type }: { type: UrgencyType }) {
  if (type === "STANDARD") return null;

  const styles =
    type === "MONITOR_BOTTLENECK"
      ? "bg-red-50 text-red-800 border border-red-200"
      : "bg-amber-50 text-amber-800 border border-amber-200";
  const label =
    type === "MONITOR_BOTTLENECK" ? "Bottleneck" : "Composting risk";

  return (
    <span
      className={`font-mono text-xs px-1.5 py-0.5 rounded ${styles}`}
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {label}
    </span>
  );
}

function UrgencyBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? "#991b1b" : pct >= 40 ? "#d97706" : "#2563eb";
  return (
    <div
      role="meter"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Urgency: ${pct}%`}
      className="h-1.5 rounded-full overflow-hidden"
      style={{ backgroundColor: "#e5e7eb", width: "80px" }}
    >
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function VerificationUrgency({
  urgencyItems,
  promises,
  onPromiseClick,
}: VerificationUrgencyProps) {
  if (urgencyItems.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif font-semibold text-gray-900 mb-2">
          Verification Priorities
        </h3>
        <p className="text-sm text-gray-500">
          All promises are either recently verified or in the computing regime.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-serif font-semibold text-gray-900">
          Verification Priorities
        </h3>
        <span
          className="text-xs text-gray-400 cursor-help"
          title="Promises where independent verification would have the highest marginal impact on network confidence. Ranked by composting regime depth, uncertainty, dwell time, and downstream dependencies."
          aria-label="Verification priorities explanation: Promises where independent verification would have the highest marginal impact on network confidence."
        >
          ?
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Promises where verifying NOW has the highest marginal impact on network confidence.
      </p>
      <ul className="space-y-3" role="list">
        {urgencyItems.map((item) => {
          const promise = promises.find((p) => p.id === item.promiseId);
          const pct = Math.round(item.urgencyScore * 100);
          return (
            <li key={item.promiseId} className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                {onPromiseClick ? (
                  <button
                    className="font-mono text-xs text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                    onClick={() => onPromiseClick(item.promiseId)}
                    aria-label={`View promise ${item.promiseId}`}
                  >
                    {item.promiseId}
                  </button>
                ) : (
                  <span className="font-mono text-xs text-gray-500">
                    {item.promiseId}
                  </span>
                )}
                <UrgencyBar score={item.urgencyScore} />
                <span className="text-xs text-gray-400" aria-label={`Urgency score: ${pct}%`}>
                  {pct}%
                </span>
                <UrgencyTypeBadge type={item.urgencyType} />
              </div>
              {promise && (
                <p className="text-xs text-gray-700 truncate pl-1" title={promise.body}>
                  {promise.body}
                </p>
              )}
              <p className="text-xs text-gray-400 pl-1">{item.reason}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
