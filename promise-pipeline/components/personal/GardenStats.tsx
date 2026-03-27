"use client";

import type { GardenStatsV2 } from "@/lib/types/personal";

interface GardenStatsProps {
  stats: GardenStatsV2;
}

const K_CONFIG = {
  composting: { label: "Composting", color: "#d97706", desc: "No verification — organic decay" },
  ecological: { label: "Ecological", color: "#059669", desc: "Self-report or filing" },
  physics:    { label: "Physics",    color: "#2563eb", desc: "Sensor or audit verified" },
} as const;

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs text-gray-400 w-4 text-right">{value}</span>
    </div>
  );
}

export function GardenStats({ stats }: GardenStatsProps) {
  const kTotal = stats.totalPromises || 1;
  const gObsPct = Math.min(100, Math.round((stats.gObsRate / stats.gDecRate) * 100));

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: `${Math.round(stats.keptRate * 100)}%`, label: "Kept rate" },
          { value: stats.keptCount,    label: "Kept" },
          { value: stats.activePromises, label: "Active" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-3 text-center">
            <p className="font-serif text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* k-regime distribution */}
      <div className="bg-white rounded-xl border p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">Verification regime</h3>
        <div className="space-y-3">
          {(Object.keys(K_CONFIG) as Array<keyof typeof K_CONFIG>).map((regime) => {
            const cfg = K_CONFIG[regime];
            const count = stats.kDistribution[regime];
            return (
              <div key={regime}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">{cfg.label}</span>
                  <span className="text-xs text-gray-400">{cfg.desc}</span>
                </div>
                <Bar value={count} max={kTotal} color={cfg.color} />
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-gray-400 leading-relaxed">
          Verified promises (physics regime) resolve at near-constant rates.
          Unverified promises (composting) stagnate — the longer they go unchecked, the less likely they are to resolve.
        </p>
      </div>

      {/* g_obs / g_dec */}
      <div className="bg-white rounded-xl border p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">Observation rate</h3>
        <p className="text-xs text-gray-400 mb-3">
          How your check-in rate compares to the baseline decay rate (g_dec = 0.25/day)
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(gObsPct, 100)}%`,
                background: gObsPct >= 100 ? "#059669" : gObsPct >= 50 ? "#d97706" : "#6b7280",
              }}
            />
          </div>
          <span className="text-xs font-medium text-gray-700 w-12 text-right">
            {gObsPct}%
          </span>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          {gObsPct >= 150
            ? "Excellent — checking in well above the decay threshold"
            : gObsPct >= 70
            ? "On pace — roughly matching the decay rate"
            : gObsPct > 0
            ? "Behind — promises may be drifting without observation"
            : "No check-ins yet — garden is frozen in potential"}
        </p>
      </div>

      {/* Per-domain breakdown */}
      {Object.keys(stats.byDomain).length > 0 && (
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">By domain</h3>
          <div className="space-y-4">
            {Object.entries(stats.byDomain).map(([domain, d]) => (
              <div key={domain}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700 capitalize">{domain}</span>
                  <span className="text-xs text-gray-400">
                    k̄ = {d.averageK.toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-1 text-xs text-gray-500">
                  <span>{d.total} total</span>
                  <span>·</span>
                  <span>{d.active} active</span>
                  <span>·</span>
                  <span className="text-green-700">{d.kept} kept</span>
                  {d.broken > 0 && (
                    <>
                      <span>·</span>
                      <span className="text-gray-400">{d.broken} dormant</span>
                    </>
                  )}
                </div>
                <Bar
                  value={d.kept}
                  max={d.total}
                  color="#059669"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.renegotiatedCount > 0 && (
        <p className="text-xs text-center text-gray-400">
          {stats.renegotiatedCount} promise{stats.renegotiatedCount !== 1 ? "s" : ""} renegotiated —
          renegotiation is not failure, it&apos;s calibration.
        </p>
      )}
    </div>
  );
}
