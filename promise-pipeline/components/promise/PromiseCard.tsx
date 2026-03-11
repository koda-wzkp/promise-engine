"use client";

import { useState } from "react";
import { Promise as PromiseType, Agent } from "@/lib/types/promise";
import StatusBadge from "./StatusBadge";
import { hb2021DomainColors } from "@/lib/utils/colors";
import { formatDate } from "@/lib/utils/formatting";

interface PromiseCardProps {
  promise: PromiseType;
  agents: Agent[];
  allPromises: PromiseType[];
  simulated?: boolean;
  onWhatIf?: (promiseId: string) => void;
  onClick?: () => void;
}

export default function PromiseCard({
  promise,
  agents,
  allPromises,
  simulated,
  onWhatIf,
  onClick,
}: PromiseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const promiser = agents.find((a) => a.id === promise.promiser);
  const promisee = agents.find((a) => a.id === promise.promisee);

  const dependents = allPromises.filter((p) => p.depends_on.includes(promise.id));
  const dependencies = promise.depends_on
    .map((id) => allPromises.find((p) => p.id === id))
    .filter(Boolean) as PromiseType[];

  const domainColor = hb2021DomainColors[promise.domain as keyof typeof hb2021DomainColors] ?? "#6b7280";

  return (
    <div
      className={`group rounded-lg border bg-white p-4 transition-all hover:shadow-md ${
        simulated ? "ring-2 ring-yellow-300" : "border-gray-200"
      } ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-gray-400">{promise.id}</span>
            {promise.ref && (
              <span className="font-mono text-[10px] text-gray-300">{promise.ref}</span>
            )}
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
              style={{ backgroundColor: domainColor }}
            >
              {promise.domain}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900">{promise.body}</p>
          <p className="mt-1 text-xs text-gray-500">
            {promiser?.short ?? promise.promiser} → {promisee?.short ?? promise.promisee}
          </p>
        </div>
        <StatusBadge status={promise.status} simulated={simulated} />
      </div>

      {/* Progress bar */}
      {promise.progress != null && promise.required != null && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progress: {promise.progress}%</span>
            <span>Target: {promise.required}%</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-gray-100">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((promise.progress / promise.required) * 100, 100)}%`,
                backgroundColor: domainColor,
              }}
            />
          </div>
        </div>
      )}

      {promise.target && (
        <p className="mt-2 text-xs text-gray-400">
          Deadline: {formatDate(promise.target)}
        </p>
      )}

      {/* Expand / What If buttons */}
      <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {expanded ? "Less" : "Details"}
        </button>
        {onWhatIf && (
          <button
            onClick={() => onWhatIf(promise.id)}
            className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 hover:bg-yellow-50 hover:text-yellow-700"
          >
            What If?
          </button>
        )}
        {(promise.depends_on.length > 0 || dependents.length > 0) && (
          <span className="text-[10px] text-gray-400">
            {promise.depends_on.length > 0 && `${promise.depends_on.length} upstream`}
            {promise.depends_on.length > 0 && dependents.length > 0 && " · "}
            {dependents.length > 0 && `${dependents.length} downstream`}
          </span>
        )}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-3 space-y-2 border-t border-gray-100 pt-3" onClick={(e) => e.stopPropagation()}>
          <p className="text-xs leading-relaxed text-gray-600">{promise.note}</p>

          <div className="text-xs text-gray-500">
            <span className="font-medium">Verification:</span>{" "}
            {promise.verification.method === "none"
              ? "No verification mechanism"
              : `${promise.verification.method}${promise.verification.source ? ` (${promise.verification.source})` : ""}${promise.verification.frequency ? `, ${promise.verification.frequency}` : ""}`}
          </div>

          {dependencies.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500">Depends on:</p>
              <ul className="ml-3 mt-1 space-y-0.5">
                {dependencies.map((dep) => (
                  <li key={dep.id} className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="font-mono font-semibold">{dep.id}</span>
                    <StatusBadge status={dep.status} size="sm" />
                    <span className="truncate">{dep.body}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {dependents.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500">Downstream:</p>
              <ul className="ml-3 mt-1 space-y-0.5">
                {dependents.map((dep) => (
                  <li key={dep.id} className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="font-mono font-semibold">{dep.id}</span>
                    <StatusBadge status={dep.status} size="sm" />
                    <span className="truncate">{dep.body}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
