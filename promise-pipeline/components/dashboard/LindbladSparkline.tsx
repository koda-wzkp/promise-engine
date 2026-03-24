"use client";

import { projectLindbladState } from "@/lib/simulation/lindblad";

interface LindbladSparklineProps {
  regime: string;
  width?: number;
  height?: number;
}

export function LindbladSparkline({
  regime,
  width = 80,
  height = 24,
}: LindbladSparklineProps) {
  const projection = projectLindbladState(regime, 15);
  const n = projection.timePoints.length;

  const x = (i: number) => (i / (n - 1)) * width;
  const y = (p: number) => height - p * height;

  const pathD = (values: number[]) =>
    values
      .map(
        (v, i) =>
          `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`
      )
      .join(" ");

  return (
    <svg
      width={width}
      height={height}
      style={{ display: "inline-block", verticalAlign: "middle" }}
      aria-label={`Lindblad projection for ${regime} regime`}
      role="img"
    >
      <path
        d={pathD(projection.pDeclared)}
        fill="none"
        stroke="#1e40af"
        strokeWidth={1.5}
        opacity={0.7}
      />
      <path
        d={pathD(projection.pMet)}
        fill="none"
        stroke="#1a5f4a"
        strokeWidth={1}
        opacity={0.6}
      />
      <path
        d={pathD(projection.pNotMet)}
        fill="none"
        stroke="#991b1b"
        strokeWidth={1}
        opacity={0.6}
      />
      {projection.crossoverCycle && (
        <line
          x1={x(Math.round(projection.crossoverCycle))}
          y1={0}
          x2={x(Math.round(projection.crossoverCycle))}
          y2={height}
          stroke="#991b1b"
          strokeWidth={0.5}
          strokeDasharray="2 2"
          opacity={0.4}
        />
      )}
    </svg>
  );
}
