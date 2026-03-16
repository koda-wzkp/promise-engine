"use client";

import { useEffect, useRef, useState } from "react";

interface CascadeRippleProps {
  /** Source node position */
  sourceX: number;
  sourceY: number;
  /** Maximum cascade depth from simulation results */
  maxDepth: number;
  /** Whether the ripple animation is active */
  active: boolean;
  /** Called when animation completes */
  onComplete?: () => void;
}

/**
 * Expanding concentric ripple rings from the cascade source node.
 * Uses requestAnimationFrame for smooth animation.
 * Disabled when prefers-reduced-motion is active.
 */
export function CascadeRipple({
  sourceX,
  sourceY,
  maxDepth,
  active,
  onComplete,
}: CascadeRippleProps) {
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const totalDuration = maxDepth * 300 + 800 + 200; // delays + expansion + buffer

  useEffect(() => {
    if (!active) {
      setElapsed(0);
      return;
    }

    startRef.current = performance.now();

    function animate(time: number) {
      const dt = time - startRef.current;
      setElapsed(dt);

      if (dt < totalDuration) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, totalDuration, onComplete]);

  if (!active || elapsed === 0) return null;

  const rings: Array<{
    key: number;
    radius: number;
    opacity: number;
    color: string;
  }> = [];

  for (let depth = 1; depth <= maxDepth; depth++) {
    const delay = depth * 300;
    const dt = elapsed - delay;
    if (dt < 0) continue;

    const progress = Math.min(dt / 800, 1);
    const radius = progress * (depth * 80);
    const opacity = (1 - progress) * (0.6 / depth);
    const hue = Math.max(0, 40 - depth * 15);

    if (opacity > 0.01) {
      rings.push({
        key: depth,
        radius,
        opacity,
        color: `hsla(${hue}, 80%, 50%, ${opacity})`,
      });
    }
  }

  return (
    <g className="motion-reduce:hidden" aria-hidden="true">
      {rings.map((ring) => (
        <circle
          key={ring.key}
          cx={sourceX}
          cy={sourceY}
          r={ring.radius}
          fill="none"
          stroke={ring.color}
          strokeWidth={2}
        />
      ))}
    </g>
  );
}
