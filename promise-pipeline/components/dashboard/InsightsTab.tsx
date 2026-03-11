"use client";

import { Insight, Promise as PromiseType } from "@/lib/types/promise";
import StatusBadge from "../promise/StatusBadge";

interface InsightsTabProps {
  insights: Insight[];
  promises: PromiseType[];
}

const severityStyles = {
  critical: {
    border: "border-red-200",
    bg: "bg-red-50",
    icon: "text-red-600",
    badge: "bg-red-100 text-red-700",
  },
  warning: {
    border: "border-yellow-200",
    bg: "bg-yellow-50",
    icon: "text-yellow-600",
    badge: "bg-yellow-100 text-yellow-700",
  },
  positive: {
    border: "border-green-200",
    bg: "bg-green-50",
    icon: "text-green-600",
    badge: "bg-green-100 text-green-700",
  },
};

export default function InsightsTab({ insights, promises }: InsightsTabProps) {
  return (
    <div className="space-y-4">
      {insights.map((insight, i) => {
        const styles = severityStyles[insight.severity];

        return (
          <div key={i} className={`rounded-lg border ${styles.border} ${styles.bg} p-5`}>
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 text-lg ${styles.icon}`}>
                {insight.severity === "critical" && "!!"}
                {insight.severity === "warning" && "!"}
                {insight.severity === "positive" && "~"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${styles.badge}`}>
                    {insight.type}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900">{insight.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">{insight.body}</p>

                {/* Referenced promises */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {insight.promises.map((id) => {
                    const p = promises.find((pr) => pr.id === id);
                    return p ? (
                      <div
                        key={id}
                        className="flex items-center gap-1.5 rounded bg-white/70 px-2 py-1 text-xs"
                      >
                        <span className="font-mono text-gray-500">{id}</span>
                        <StatusBadge status={p.status} size="sm" />
                      </div>
                    ) : (
                      <span key={id} className="font-mono text-xs text-gray-400">{id}</span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
