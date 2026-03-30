"use client";

import { useState, useEffect } from "react";
import type { GardenPromise } from "@/lib/types/personal";

const STATUS_COLOR: Record<string, string> = {
  verified:     "#059669",
  declared:     "#9ca3af",
  degraded:     "#d97706",
  violated:     "#6b7280",
  unverifiable: "#d1d5db",
};

interface RootSystemProps {
  parent: GardenPromise;
  children: GardenPromise[];
  /** Whether the root system should be visible (zoom level >= 3) */
  visible: boolean;
  onSelectChild?: (id: string) => void;
}

export function RootSystem({ parent: _parent, children, visible, onSelectChild }: RootSystemProps) {
  const W = 240;
  const H = 90;
  const cx = W / 2;
  const rootCount = children.length;

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      style={{
        overflow: "hidden",
        maxHeight: visible ? `${H + 4}px` : "0px",
        opacity: visible ? 1 : 0,
        transition: reducedMotion ? "none" : "max-height 0.4s ease, opacity 0.3s ease",
      }}
    >
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={rootCount === 0 ? "Root system: no sub-promises yet" : `Root system: ${rootCount} sub-promise${rootCount !== 1 ? "s" : ""}`}
      >
        {/* Trunk */}
        <line
          x1={cx} y1={0}
          x2={cx} y2={16}
          stroke="#9ca3af"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {rootCount === 0 && (
          <>
            {/* Empty state: faded stub root */}
            <line
              x1={cx} y1={16}
              x2={cx} y2={H - 20}
              stroke="#d1d5db"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              strokeLinecap="round"
              opacity="0.7"
            />
            <circle cx={cx} cy={H - 20} r="4" fill="#d1d5db" opacity="0.5" />
            <text
              x={cx}
              y={H - 4}
              textAnchor="middle"
              fontSize="7"
              fill="#9ca3af"
              fontFamily="sans-serif"
            >
              No sub-promises yet
            </text>
          </>
        )}

        {children.map((child, i) => {
          const x = (W / (rootCount + 1)) * (i + 1);
          const color = STATUS_COLOR[child.status] ?? "#9ca3af";
          const label = child.body.length > 14 ? child.body.slice(0, 14) + "…" : child.body;
          const clickable = !!onSelectChild;

          return (
            <g
              key={child.id}
              onClick={clickable ? () => onSelectChild!(child.id) : undefined}
              style={{ cursor: clickable ? "pointer" : "default" }}
              role={clickable ? "button" : undefined}
              aria-label={clickable ? `Sub-promise: ${child.body}` : undefined}
              tabIndex={clickable ? 0 : undefined}
              onKeyDown={clickable ? (e) => { if (e.key === "Enter") onSelectChild!(child.id); } : undefined}
            >
              {/* Root tendril — cubic bezier from trunk down to tip */}
              <path
                d={`M ${cx} 16 C ${cx} 45, ${x} 50, ${x} ${H - 18}`}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.75"
              />
              {/* Tip node */}
              <circle
                cx={x}
                cy={H - 18}
                r="5"
                fill={color}
                opacity="0.85"
              />
              {/* Label */}
              <text
                x={x}
                y={H - 4}
                textAnchor="middle"
                fontSize="7"
                fill={color}
                fontFamily="sans-serif"
                opacity="0.9"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
