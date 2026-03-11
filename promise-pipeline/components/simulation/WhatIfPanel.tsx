"use client";

import { useState } from "react";
import { Promise as PromiseType, PromiseStatus, Agent } from "@/lib/types/promise";
import StatusBadge from "../promise/StatusBadge";

interface WhatIfPanelProps {
  promise: PromiseType;
  agents: Agent[];
  onSimulate: (promiseId: string, newStatus: PromiseStatus) => void;
  onClose: () => void;
  statusOptions?: PromiseStatus[];
}

const DEFAULT_STATUSES: PromiseStatus[] = ["verified", "declared", "degraded", "violated", "unverifiable"];

export default function WhatIfPanel({ promise, agents, onSimulate, onClose, statusOptions }: WhatIfPanelProps) {
  const STATUSES = statusOptions ?? DEFAULT_STATUSES;
  const [selectedStatus, setSelectedStatus] = useState<PromiseStatus>(
    promise.status === "violated" ? "verified" : "violated"
  );
  const promiser = agents.find((a) => a.id === promise.promiser);

  return (
    <div className="rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">What If?</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Simulate a status change and see cascade effects
          </p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-3 rounded bg-white p-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-gray-400">{promise.id}</span>
          <StatusBadge status={promise.status} size="sm" />
        </div>
        <p className="mt-1 text-sm text-gray-800">{promise.body}</p>
        <p className="text-xs text-gray-400">{promiser?.name ?? promise.promiser}</p>
      </div>

      <div className="mt-3">
        <label className="text-xs font-medium text-gray-600">Change status to:</label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {STATUSES.filter((s) => s !== promise.status).map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                selectedStatus === s
                  ? "bg-yellow-400 text-yellow-900"
                  : "bg-white text-gray-500 hover:bg-gray-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSimulate(promise.id, selectedStatus)}
        className="mt-4 w-full rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-yellow-600"
      >
        Simulate Cascade
      </button>
    </div>
  );
}
