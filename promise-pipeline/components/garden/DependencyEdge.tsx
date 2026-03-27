"use client";

import type { GardenPromise } from "@/lib/types/personal";

interface DependencyEdgeProps {
  /** The promise that has dependencies */
  promise: GardenPromise;
  /** All promises in the garden, keyed by id */
  allPromises: Record<string, GardenPromise>;
}

const STATUS_DOT: Record<string, string> = {
  verified:     "bg-green-500",
  declared:     "bg-gray-400",
  degraded:     "bg-amber-500",
  violated:     "bg-gray-300",
  unverifiable: "bg-gray-200",
};

export function DependencyEdge({ promise, allPromises }: DependencyEdgeProps) {
  const deps = promise.depends_on
    .map((id) => allPromises[id])
    .filter(Boolean) as GardenPromise[];

  if (deps.length === 0) return null;

  const stressed = deps.some((d) => d.status === "degraded" || d.status === "violated");

  return (
    <div
      className={`mt-2 pt-2 border-t text-xs flex flex-wrap gap-1.5 items-center ${
        stressed ? "border-amber-200" : "border-gray-100"
      }`}
      aria-label={`Depends on: ${deps.map((d) => d.body).join(", ")}`}
    >
      <span className={`text-gray-400 ${stressed ? "text-amber-600" : ""}`}>
        depends on
      </span>
      {deps.map((dep) => (
        <span
          key={dep.id}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-gray-600 ${
            dep.status === "degraded" || dep.status === "violated"
              ? "bg-amber-50 text-amber-700"
              : "bg-gray-50"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full inline-block ${STATUS_DOT[dep.status] ?? "bg-gray-300"}`}
            aria-hidden="true"
          />
          {dep.body.length > 28 ? dep.body.slice(0, 28) + "…" : dep.body}
        </span>
      ))}
    </div>
  );
}
