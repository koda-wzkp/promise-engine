"use client";

import { Trajectory } from "@/lib/types/promise";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

interface TrajectoryTabProps {
  trajectories: Trajectory[];
}

const COLORS = ["#1e40af", "#991b1b", "#1a5f4a", "#78350f"];

export default function TrajectoryTab({ trajectories }: TrajectoryTabProps) {
  return (
    <div className="space-y-8">
      {trajectories.map((traj, i) => {
        const color = COLORS[i % COLORS.length];

        // Merge all data points into one series
        const chartData = traj.data.map((d) => ({
          year: d.year,
          actual: d.actual,
          projected: d.projected,
          target: d.target,
        }));

        return (
          <div key={traj.agentId} className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 font-serif text-lg font-bold text-gray-900">{traj.label}</h3>
            <p className="mb-4 text-xs text-gray-500">
              Emissions reduction from 2010-2012 baseline (0.428 MTCO2e/MWh)
            </p>

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
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "#4b5563" }}
                    tickLine={false}
                    label={{
                      value: "% Reduction",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 11, fill: "#4b5563" },
                    }}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    formatter={(value: number, name: string) => [
                      `${value}%`,
                      name === "actual" ? "Actual" : name === "projected" ? "Projected" : "Target",
                    ]}
                  />

                  {/* Target reference lines */}
                  <ReferenceLine y={80} stroke="#991b1b" strokeDasharray="5 5" label={{ value: "80% (2030)", position: "right", fontSize: 10, fill: "#991b1b" }} />
                  <ReferenceLine y={90} stroke="#78350f" strokeDasharray="5 5" label={{ value: "90% (2035)", position: "right", fontSize: 10, fill: "#78350f" }} />
                  <ReferenceLine y={100} stroke="#1a5f4a" strokeDasharray="5 5" label={{ value: "100% (2040)", position: "right", fontSize: 10, fill: "#1a5f4a" }} />

                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke={color}
                    fill={color}
                    fillOpacity={0.15}
                    strokeWidth={2}
                    dot={{ r: 4, fill: color }}
                    connectNulls={false}
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
