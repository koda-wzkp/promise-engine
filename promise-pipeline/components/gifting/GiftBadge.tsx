"use client";

import type { Artifact } from "@/lib/types/phase3";

interface GiftBadgeProps {
  artifacts: Artifact[];
}

const MATERIAL_COLORS: Record<string, string> = {
  organic: "bg-green-100 text-green-700",
  crystalline: "bg-blue-100 text-blue-700",
  metallic: "bg-gray-100 text-gray-700",
};

/**
 * Compact badge showing artifact collection count.
 * Shown in the garden header or stats area.
 */
export function GiftBadge({ artifacts }: GiftBadgeProps) {
  if (artifacts.length === 0) return null;

  const gifted = artifacts.filter((a) => a.gifted).length;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border rounded-lg">
      <span className="text-sm">&#9830;</span>
      <span className="text-xs font-medium text-gray-700">
        {artifacts.length} artifact{artifacts.length !== 1 ? "s" : ""}
      </span>
      {gifted > 0 && (
        <span className="text-[10px] text-gray-400">
          ({gifted} gifted)
        </span>
      )}
      {/* Material breakdown */}
      <div className="flex gap-1 ml-1">
        {Object.entries(countByMaterial(artifacts)).map(([material, count]) => (
          <span
            key={material}
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${MATERIAL_COLORS[material] ?? "bg-gray-100 text-gray-500"}`}
          >
            {count}
          </span>
        ))}
      </div>
    </div>
  );
}

function countByMaterial(artifacts: Artifact[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const a of artifacts) {
    counts[a.material] = (counts[a.material] ?? 0) + 1;
  }
  return counts;
}
