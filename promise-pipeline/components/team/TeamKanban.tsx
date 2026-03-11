"use client";

import { TeamPromise } from "@/lib/types/team";
import { PromiseStatus } from "@/lib/types/promise";
import { statusColors, statusBgColors, statusLabels } from "@/lib/utils/colors";

interface TeamKanbanProps {
  promises: TeamPromise[];
  onUpdateStatus: (id: string, status: PromiseStatus) => void;
}

const COLUMNS: { status: PromiseStatus; label: string }[] = [
  { status: "declared", label: "Declared" },
  { status: "verified", label: "Verified" },
  { status: "degraded", label: "Degraded" },
  { status: "violated", label: "Violated" },
];

export default function TeamKanban({ promises, onUpdateStatus }: TeamKanbanProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {COLUMNS.map((col) => {
        const items = promises.filter((p) => p.status === col.status);
        return (
          <div key={col.status} className="rounded-lg bg-gray-50 p-3">
            <div className="mb-3 flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: statusColors[col.status] }}
              />
              <h4 className="text-sm font-semibold text-gray-700">{col.label}</h4>
              <span className="text-xs text-gray-400">{items.length}</span>
            </div>

            <div className="space-y-2">
              {items.map((p) => (
                <KanbanCard key={p.id} promise={p} onUpdateStatus={onUpdateStatus} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({
  promise,
  onUpdateStatus,
}: {
  promise: TeamPromise;
  onUpdateStatus: (id: string, status: PromiseStatus) => void;
}) {
  const priorityColors: Record<string, string> = {
    critical: "#991b1b",
    high: "#78350f",
    normal: "#4b5563",
    low: "#6b7280",
  };

  const status: PromiseStatus = promise.status;
  const actions: { label: string; target: PromiseStatus }[] = [];
  if (status !== "verified") actions.push({ label: "Verify", target: "verified" });
  if (status === "declared") actions.push({ label: "Degrade", target: "degraded" });

  return (
    <div className="rounded border border-gray-200 bg-white p-3 shadow-sm">
      <p className="text-xs font-medium text-gray-900">{promise.body}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-gray-400">{promise.promiser}</span>
        {promise.priority && (
          <span
            className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
            style={{ backgroundColor: priorityColors[promise.priority] ?? "#6b7280" }}
          >
            {promise.priority}
          </span>
        )}
      </div>
      {actions.length > 0 && (
        <div className="mt-2 flex gap-1">
          {actions.map((a) => (
            <button
              key={a.target}
              onClick={() => onUpdateStatus(promise.id, a.target)}
              className="rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: statusBgColors[a.target],
                color: statusColors[a.target],
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
