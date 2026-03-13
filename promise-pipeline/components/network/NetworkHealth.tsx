"use client";

import { NetworkHealthScore } from "@/lib/types/simulation";
import { NetworkConfig } from "@/lib/types/network";

interface NetworkHealthProps {
  health: NetworkHealthScore;
  config: NetworkConfig;
  variant: "compact" | "full" | "gauge";
}

function getGrade(score: number, config: NetworkConfig): { label: string; color: string } {
  if (score >= config.healthThresholds.good) return { label: "Healthy", color: "#1a5f4a" };
  if (score >= config.healthThresholds.warning) return { label: "Caution", color: "#d97706" };
  return { label: "Critical", color: "#991b1b" };
}

function getTrendArrow(score: number, config: NetworkConfig): string {
  if (score >= config.healthThresholds.good) return "\u2191";
  if (score >= config.healthThresholds.warning) return "\u2192";
  return "\u2193";
}

export default function NetworkHealth({ health, config, variant }: NetworkHealthProps) {
  const grade = getGrade(health.overall, config);

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 text-sm" role="status" aria-label={`Network health: ${health.overall}%`}>
        <span className="font-semibold" style={{ color: grade.color }}>
          {health.overall}%
        </span>
        <span className="text-gray-400">{getTrendArrow(health.overall, config)}</span>
        <span className="text-xs text-gray-500">{grade.label}</span>
      </div>
    );
  }

  if (variant === "gauge") {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const progress = (health.overall / 100) * circumference;

    return (
      <div className="flex flex-col items-center" role="status" aria-label={`Network health: ${health.overall}%`}>
        <svg width="100" height="100" viewBox="0 0 100 100" aria-hidden="true">
          {/* Background circle */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="8"
          />
          {/* Progress arc */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={grade.color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            className="transition-all duration-700"
          />
          {/* Score text */}
          <text x="50" y="48" textAnchor="middle" className="text-2xl font-bold" fill={grade.color}>
            {health.overall}
          </text>
          <text x="50" y="62" textAnchor="middle" className="text-xs" fill="#6b7280">
            {grade.label}
          </text>
        </svg>
      </div>
    );
  }

  // variant === "full"
  const domainEntries = Object.entries(health.byDomain);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm" role="region" aria-label="Network health">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Network Health</h3>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold" style={{ color: grade.color }}>
            {health.overall}%
          </span>
          <span className="text-xs text-gray-500">{grade.label}</span>
        </div>
      </div>

      {/* Overall bar */}
      <div className="mb-4">
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${health.overall}%`, backgroundColor: grade.color }}
          />
        </div>
      </div>

      {/* Domain bars */}
      {domainEntries.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">By Domain</h4>
          {domainEntries.map(([domain, score]) => {
            const domainGrade = getGrade(score, config);
            return (
              <div key={domain} className="flex items-center gap-2">
                <span className="w-24 text-xs text-gray-600 truncate">{domain}</span>
                <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${score}%`, backgroundColor: domainGrade.color }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-gray-500">{score}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottlenecks */}
      {health.bottlenecks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Bottlenecks</h4>
          <p className="text-xs text-gray-600">
            {health.bottlenecks.length} promise{health.bottlenecks.length !== 1 ? "s" : ""} with downstream dependencies
          </p>
        </div>
      )}

      {/* At risk */}
      {health.atRisk.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-orange-600">
            {health.atRisk.length} promise{health.atRisk.length !== 1 ? "s" : ""} at risk from failing upstream dependencies
          </p>
        </div>
      )}
    </div>
  );
}
