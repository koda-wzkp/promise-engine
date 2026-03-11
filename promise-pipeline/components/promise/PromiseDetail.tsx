"use client";

import { Promise as PromiseType, Agent } from "@/lib/types/promise";
import StatusBadge from "./StatusBadge";
import { getDependents, getDependencies } from "@/lib/simulation/graph";

interface PromiseDetailProps {
  promise: PromiseType;
  agents: Agent[];
  allPromises: PromiseType[];
}

export default function PromiseDetail({ promise, agents, allPromises }: PromiseDetailProps) {
  const promiser = agents.find((a) => a.id === promise.promiser);
  const promisee = agents.find((a) => a.id === promise.promisee);
  const upstreamIds = getDependencies(promise.id, allPromises);
  const downstreamIds = getDependents(promise.id, allPromises);

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-gray-900">{promise.body}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {promiser?.name ?? promise.promiser} → {promisee?.name ?? promise.promisee}
          </p>
        </div>
        <StatusBadge status={promise.status} />
      </div>

      <p className="text-sm text-gray-600">{promise.note}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {upstreamIds.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase text-gray-400">
              Full Upstream Chain ({upstreamIds.length})
            </h4>
            <ul className="mt-1 space-y-1">
              {upstreamIds.map((id) => {
                const p = allPromises.find((pr) => pr.id === id);
                return p ? (
                  <li key={id} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <StatusBadge status={p.status} size="sm" />
                    <span className="font-mono">{p.id}</span>
                    <span className="truncate">{p.body}</span>
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        )}

        {downstreamIds.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase text-gray-400">
              Full Downstream Chain ({downstreamIds.length})
            </h4>
            <ul className="mt-1 space-y-1">
              {downstreamIds.map((id) => {
                const p = allPromises.find((pr) => pr.id === id);
                return p ? (
                  <li key={id} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <StatusBadge status={p.status} size="sm" />
                    <span className="font-mono">{p.id}</span>
                    <span className="truncate">{p.body}</span>
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
