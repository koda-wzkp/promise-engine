"use client";

import type { OrgPromise } from "@/lib/types/org";
import type { GardenTeamPromise } from "@/lib/types/gardenTeam";
import type { PromiseStatus } from "@/lib/types/promise";

const STATUS_COLOR: Record<PromiseStatus, string> = {
  declared:     "#3b82f6",
  verified:     "#16a34a",
  degraded:     "#f59e0b",
  violated:     "#dc2626",
  unverifiable: "#9ca3af",
};

interface DependencyNode {
  id: string;
  body: string;
  status: PromiseStatus;
  teamId?: string;
  type: "org" | "team";
}

interface DependencyEdge {
  from: string;
  to: string;
  crossTeam: boolean;
}

/**
 * DependencyMap — directed graph of all cross-team dependencies.
 * Renders as a simple adjacency-list visualization with status-colored nodes.
 * Each node shows the promise body truncated, colored by status.
 */
export function DependencyMap({
  orgPromises,
  teamPromises,
  teamNames,
}: {
  orgPromises: OrgPromise[];
  teamPromises: GardenTeamPromise[];
  teamNames?: Record<string, string>;
}) {
  const nodes: DependencyNode[] = [
    ...orgPromises.map((p) => ({
      id: p.id,
      body: p.body,
      status: p.status as PromiseStatus,
      teamId: p.owningTeam,
      type: "org" as const,
    })),
    ...teamPromises.map((p) => ({
      id: p.id,
      body: p.body,
      status: p.status as PromiseStatus,
      teamId: p.assignee,
      type: "team" as const,
    })),
  ];

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const edges: DependencyEdge[] = [];
  for (const p of orgPromises) {
    for (const depId of p.depends_on) {
      const from = nodeMap.get(p.id);
      const to = nodeMap.get(depId);
      edges.push({
        from: p.id,
        to: depId,
        crossTeam: !!(from && to && from.teamId !== to.teamId),
      });
    }
  }

  if (nodes.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-400">
        No dependency links yet. Add cross-team depends_on to org promises.
      </div>
    );
  }

  const teamName = (id?: string) =>
    id ? (teamNames?.[id] ?? id.slice(0, 8)) : "unassigned";

  // Group nodes by team for layout
  const byTeam = nodes.reduce((acc, n) => {
    const key = n.teamId ?? "unassigned";
    (acc[key] = acc[key] ?? []).push(n);
    return acc;
  }, {} as Record<string, DependencyNode[]>);

  const crossTeamEdges = edges.filter((e) => e.crossTeam);

  return (
    <div className="space-y-4" role="region" aria-label="Dependency map">
      {/* Node groups by team */}
      {Object.entries(byTeam).map(([tid, tnodes]) => (
        <div key={tid} className="bg-gray-50 rounded-xl border p-3">
          <p className="text-xs font-semibold text-gray-500 mb-2">{teamName(tid)}</p>
          <div className="space-y-1.5">
            {tnodes.map((n) => (
              <div
                key={n.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border text-xs"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: STATUS_COLOR[n.status] ?? "#9ca3af" }}
                  aria-label={`Status: ${n.status}`}
                />
                <span className="flex-1 truncate text-gray-700">{n.body}</span>
                <span
                  className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs"
                  style={{
                    background: (STATUS_COLOR[n.status] ?? "#9ca3af") + "18",
                    color: STATUS_COLOR[n.status] ?? "#6b7280",
                  }}
                >
                  {n.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Cross-team edges */}
      {crossTeamEdges.length > 0 && (
        <div className="bg-white rounded-xl border p-3">
          <p className="text-xs font-semibold text-gray-500 mb-2">
            Cross-team dependencies ({crossTeamEdges.length})
          </p>
          <div className="space-y-1.5">
            {crossTeamEdges.map((e, i) => {
              const from = nodeMap.get(e.from);
              const to = nodeMap.get(e.to);
              if (!from) return null;
              return (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: STATUS_COLOR[from.status] }}
                  />
                  <span className="truncate max-w-[120px]" title={from.body}>
                    {from.body.slice(0, 30)}…
                  </span>
                  <span className="text-gray-400">→</span>
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: to ? STATUS_COLOR[to.status] : "#9ca3af" }}
                  />
                  <span className="truncate max-w-[120px]" title={to?.body}>
                    {to ? to.body.slice(0, 30) + "…" : e.to.slice(0, 12)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
