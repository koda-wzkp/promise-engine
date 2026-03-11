"use client";

import { PersonalPromise } from "@/lib/types/personal";
import { statusColors, statusBgColors, statusLabels } from "@/lib/utils/colors";
import { PromiseStatus } from "@/lib/types/promise";

interface PromiseTimelineProps {
  promises: PersonalPromise[];
  onUpdateStatus: (id: string, status: PromiseStatus) => void;
  onReflect: (id: string, reflection: string) => void;
}

const STATUS_TRANSITIONS: Record<PromiseStatus, PromiseStatus[]> = {
  declared: ["verified", "degraded", "violated"],
  verified: [],
  degraded: ["verified", "violated"],
  violated: ["declared"],
  unverifiable: [],
};

export default function PromiseTimeline({ promises, onUpdateStatus, onReflect }: PromiseTimelineProps) {
  const sorted = [...promises].sort((a, b) => {
    if (a.status === "declared" && b.status !== "declared") return -1;
    if (b.status === "declared" && a.status !== "declared") return 1;
    if (a.status === "degraded" && b.status !== "degraded") return -1;
    if (b.status === "degraded" && a.status !== "degraded") return 1;
    return 0;
  });

  if (sorted.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        No promises yet. Make your first commitment above.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((p) => (
        <TimelineCard
          key={p.id}
          promise={p}
          onUpdateStatus={onUpdateStatus}
          onReflect={onReflect}
        />
      ))}
    </div>
  );
}

function TimelineCard({
  promise,
  onUpdateStatus,
  onReflect,
}: {
  promise: PersonalPromise;
  onUpdateStatus: (id: string, status: PromiseStatus) => void;
  onReflect: (id: string, reflection: string) => void;
}) {
  const transitions = STATUS_TRANSITIONS[promise.status];
  const isCompleted = promise.status === "verified" || promise.status === "violated";

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      style={{ borderLeftColor: statusColors[promise.status], borderLeftWidth: 3 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{promise.body}</p>
          <div className="mt-1 flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: statusBgColors[promise.status],
                color: statusColors[promise.status],
              }}
            >
              {statusLabels[promise.status]}
            </span>
            <span className="text-xs text-gray-400">{promise.domain}</span>
            {promise.target && (
              <span className="text-xs text-gray-400">· target: {promise.target}</span>
            )}
          </div>
        </div>

        {transitions.length > 0 && (
          <div className="flex gap-1">
            {transitions.map((s) => (
              <button
                key={s}
                onClick={() => onUpdateStatus(promise.id, s)}
                className="rounded px-2 py-1 text-xs font-medium transition-colors hover:opacity-80"
                style={{
                  backgroundColor: statusBgColors[s],
                  color: statusColors[s],
                }}
              >
                {statusLabels[s]}
              </button>
            ))}
          </div>
        )}
      </div>

      {isCompleted && !promise.reflection && (
        <div className="mt-3">
          <input
            placeholder="Add a reflection..."
            className="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onReflect(promise.id, (e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>
      )}

      {promise.reflection && (
        <p className="mt-2 text-xs italic text-gray-500">"{promise.reflection}"</p>
      )}
    </div>
  );
}
