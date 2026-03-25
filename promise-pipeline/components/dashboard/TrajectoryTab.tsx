"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Trajectory } from "@/lib/types/promise";

interface TrajectoryTabProps {
  trajectories: Trajectory[];
}

export function TrajectoryTab({ trajectories }: TrajectoryTabProps) {
  return (
    <div className="space-y-8">
      {trajectories.map((trajectory) => (
        <div key={trajectory.agentId} className="bg-white rounded-xl border p-6">
          <h3 className="font-serif font-semibold text-gray-900 mb-1">
            {trajectory.label}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Emissions relative to 2019 baseline (100%)
          </p>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trajectory.data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  domain={[0, 110]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    fontSize: 13,
                  }}
                  formatter={(value: any) => [`${value}%`]}
                />
                <Legend />

                {/* Target line */}
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#1a5f4a"
                  fill="#ecfdf5"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Target"
                  dot={false}
                />

                {/* Projected */}
                <Area
                  type="monotone"
                  dataKey="projected"
                  stroke="#b45309"
                  fill="#fffbeb"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  name="Projected"
                  dot={false}
                />

                {/* Actual */}
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#2563eb"
                  fill="#eff6ff"
                  strokeWidth={2}
                  name="Actual"
                  dot={{ fill: "#2563eb", r: 3 }}
                />

                {/* Key milestone lines */}
                <ReferenceLine x={2030} stroke="#6b7280" strokeDasharray="3 3" label={{ value: "2030", position: "top" }} />
                <ReferenceLine y={20} stroke="#dc2626" strokeDasharray="3 3" opacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-blue-600" />
              <span>Actual emissions</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-amber-600 border-dashed" style={{ borderTop: "1px dashed" }} />
              <span>Projected path</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-green-800 border-dashed" style={{ borderTop: "1px dashed" }} />
              <span>Required target</span>
            </div>
          </div>

          {/* Lindblad Analysis — PGE */}
          {trajectory.agentId === "PGE" && (
            <div style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '14px 16px',
              marginTop: 12,
              marginBottom: 24,
            }}>
              <div style={{ fontFamily: 'IBM Plex Serif, serif', fontWeight: 600, fontSize: 14, marginBottom: 6, color: '#1f2937' }}>
                Lindblad Analysis
              </div>
              <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, margin: 0 }}>
                PGE&apos;s emissions reduction (P001) is in the <strong>transitional regime</strong> (k = 0.66)
                with audit-based verification through Oregon DEQ. The Lindblad projection shows P(met)
                rising — resolution is trending, driven by the strongest verification infrastructure in
                the network. The crossover point (where resolution becomes more probable than the current
                state) occurs at approximately <strong>cycle 5</strong>. PGE&apos;s clean energy plan (P002,
                verified) is the upstream dependency — its verified status keeps the emissions trajectory
                on a correctable path. Current review frequency (annual DEQ audit) matches the optimal
                interval for the transitional regime.
              </p>
            </div>
          )}

          {/* Lindblad Analysis — PacifiCorp */}
          {trajectory.agentId === "PAC" && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '14px 16px',
              marginTop: 12,
              marginBottom: 24,
            }}>
              <div style={{ fontFamily: 'IBM Plex Serif, serif', fontWeight: 600, fontSize: 14, marginBottom: 6, color: '#991b1b' }}>
                Lindblad Analysis — Cascade Risk
              </div>
              <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, margin: 0 }}>
                PacifiCorp&apos;s emissions reduction (P004) is <strong>degraded</strong> with its upstream
                dependency (P003, clean energy plan) also degraded after PUC rejection. The Weibull
                parameter for planning promises at this network position (k = 0.55) indicates a
                transitional regime — the promise could recover with intervention or decay further
                without it. The Lindblad projection shows this is currently in a <strong>met-rising
                crossover</strong> (resolution still more probable than failure), but the crossover
                window is narrowing. Historical data from comparable institutional commitments shows
                planning rejections at this network position have a mean resolution time of 6–8 review
                cycles. Each cycle of delay increases downstream cascade probability. The PacifiCorp
                trajectory diverging from the target line is the visual expression of this narrowing window.
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
