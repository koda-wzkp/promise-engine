"use client";

import type { ZoomChainLevel } from "@/lib/types/phase4";
import type { PromiseStatus } from "@/lib/types/promise";

interface CivicZoomTransitionProps {
  chain: ZoomChainLevel[];
  activeLevel?: number;
  onSelectLevel?: (index: number) => void;
  onViewCivicDashboard?: (dashboard: string) => void;
}

const LEVEL_ICONS: Record<ZoomChainLevel["level"], string> = {
  "sub-promise": "·",
  personal: "🌱",
  team: "🌿",
  org: "🌳",
  "civic-dependency": "🏛",
  "civic-dashboard": "📊",
  state: "⚖",
};

const LEVEL_LABELS: Record<ZoomChainLevel["level"], string> = {
  "sub-promise": "Sub-promise",
  personal: "Personal",
  team: "Team",
  org: "Organization",
  "civic-dependency": "Civic Dependency",
  "civic-dashboard": "Civic Dashboard",
  state: "State-level",
};

const STATUS_DOT: Record<PromiseStatus, string> = {
  declared: "bg-blue-400",
  degraded: "bg-amber-400",
  verified: "bg-emerald-400",
  violated: "bg-red-400",
  unverifiable: "bg-gray-300",
};

/**
 * Visual transition showing the full NCTP zoom chain:
 * personal → team → org → civic → state
 *
 * The garden aesthetic fades at the org→civic boundary
 * and the dashboard aesthetic emerges.
 */
export function CivicZoomTransition({
  chain,
  activeLevel,
  onSelectLevel,
  onViewCivicDashboard,
}: CivicZoomTransitionProps) {
  if (chain.length === 0) return null;

  // Find the boundary where garden → civic transition happens
  const civicBoundary = chain.findIndex(
    (l) => l.level === "civic-dependency" || l.level === "civic-dashboard"
  );

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="p-4 pb-2">
        <h3 className="text-sm font-medium text-gray-900 mb-1">NCTP Zoom Chain</h3>
        <p className="text-[10px] text-gray-400">
          One schema, one engine, one zoom — from your personal promise to state legislation
        </p>
      </div>

      <div className="relative">
        {chain.map((level, i) => {
          const isActive = i === activeLevel;
          const isCivic = i >= civicBoundary && civicBoundary >= 0;
          const isLast = i === chain.length - 1;

          return (
            <div key={i}>
              {/* Visual boundary at civic transition */}
              {i === civicBoundary && civicBoundary > 0 && (
                <div className="px-4 py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-gradient-to-r from-green-300 to-blue-300" />
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      garden → civic
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-blue-300 to-gray-300" />
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  onSelectLevel?.(i);
                  if (level.level === "civic-dashboard" && level.entityName) {
                    onViewCivicDashboard?.(level.entityName);
                  }
                }}
                className={`w-full text-left px-4 py-2.5 flex items-start gap-3 transition-colors ${
                  isActive
                    ? isCivic
                      ? "bg-blue-50"
                      : "bg-green-50"
                    : "hover:bg-gray-50"
                }`}
              >
                {/* Vertical connecting line */}
                <div className="relative flex flex-col items-center w-5">
                  <span className="text-sm">{LEVEL_ICONS[level.level]}</span>
                  {!isLast && (
                    <div className={`w-px h-4 mt-0.5 ${
                      isCivic ? "bg-blue-200" : "bg-green-200"
                    }`} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                      {LEVEL_LABELS[level.level]}
                    </span>
                    {level.status && (
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[level.status]}`} />
                    )}
                    {level.entityName && (
                      <span className="text-[10px] text-gray-300">
                        {level.entityName}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${
                    isActive ? "text-gray-900 font-medium" : "text-gray-600"
                  }`}>
                    {level.label}
                  </p>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
