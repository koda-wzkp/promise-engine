"use client";

import { Trajectory } from "@/lib/types/promise";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";

interface TrajectoryTabProps {
  trajectories: Trajectory[];
}

const COLORS = ["#1e40af", "#991b1b", "#1a5f4a", "#78350f"];
const MILESTONE_COLORS = ["#991b1b", "#78350f", "#1a5f4a", "#1e40af"];

export default function TrajectoryTab({ trajectories }: TrajectoryTabProps) {
  if (trajectories.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">No trajectory data available for this network.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {trajectories.map((traj, i) => {
        const color = COLORS[i % COLORS.length];
        const yDomain = traj.yDomain ?? [0, 100];
        const yLabel = traj.yAxisLabel ?? "% Reduction";
        const subtitle = traj.subtitle ?? "";

        const chartData = traj.data.map((d) => ({
          year: d.year,
          actual: d.actual,
          projected: d.projected,
          target: d.target,
        }));

        return (
          <div key={traj.agentId} className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-1 font-serif text-lg font-bold text-gray-900">{traj.label}</h3>
            {subtitle && (
              <p className="mb-4 text-xs text-gray-500">{subtitle}</p>
            )}

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 11, fill: "#4b5563" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={yDomain}
                    tick={{ fontSize: 11, fill: "#4b5563" }}
                    tickLine={false}
                    label={{
                      value: yLabel,
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 11, fill: "#4b5563" },
                    }}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    formatter={(value: number, name: string) => {
                      const formatted = Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 1 });
                      const label = name === "actual" ? "Actual" : name === "projected" ? "Projected" : "Target";
                      return [formatted, label];
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={30}
                    formatter={(value: string) =>
                      value === "actual" ? "Actual" : value === "projected" ? "Projected" : "Target"
                    }
                    iconType="line"
                    wrapperStyle={{ fontSize: 11 }}
                  />

                  {/* Configurable milestone reference lines */}
                  {traj.milestones?.map((m, mi) => (
                    <ReferenceLine
                      key={mi}
                      y={m.value}
                      stroke={m.color ?? MILESTONE_COLORS[mi % MILESTONE_COLORS.length]}
                      strokeDasharray="5 5"
                      label={{
                        value: m.label,
                        position: "right",
                        fontSize: 10,
                        fill: m.color ?? MILESTONE_COLORS[mi % MILESTONE_COLORS.length],
                      }}
                    />
                  ))}

                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke={color}
                    fill={color}
                    fillOpacity={0.15}
                    strokeWidth={2}
                    dot={{ r: 4, fill: color }}
                    connectNulls={false}
                    name="actual"
                  />
                  <Area
                    type="monotone"
                    dataKey="projected"
                    stroke={color}
                    fill={color}
                    fillOpacity={0.05}
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    dot={{ r: 3, fill: "white", stroke: color, strokeWidth: 2 }}
                    connectNulls={false}
                    name="projected"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}
