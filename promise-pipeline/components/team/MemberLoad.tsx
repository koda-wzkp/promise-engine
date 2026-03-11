"use client";

import { TeamMember } from "@/lib/types/team";

interface MemberLoadProps {
  members: TeamMember[];
}

export default function MemberLoad({ members }: MemberLoadProps) {
  const sorted = [...members].sort((a, b) => b.loadScore - a.loadScore);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Member Load
      </h3>

      <div className="space-y-3">
        {sorted.map((m) => {
          const loadColor =
            m.loadScore >= 80 ? "#b91c1c" : m.loadScore >= 60 ? "#b45309" : "#1a5f4a";
          return (
            <div key={m.id}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{m.name}</span>
                <span className="text-xs text-gray-500">
                  {m.activePromiseCount} active · {Math.round(m.keptRate)}% kept
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${m.loadScore}%`, backgroundColor: loadColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
