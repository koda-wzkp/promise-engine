"use client";

/**
 * CascadeAnimation — Phase 2 Wilting Propagation Visual
 *
 * Shows a visual ripple/wave effect when a status change cascades
 * through dependencies. The animation originates from the changed
 * promise and propagates outward through connected promises.
 */

import { useState, useEffect, useCallback } from "react";
import type { CascadeEffect } from "@/lib/garden/gardenCascade";

interface CascadeAnimationProps {
  effects: CascadeEffect[];
  /** Position map: promiseId → screen position */
  positions: Map<string, { x: number; y: number }>;
  /** Called when the animation completes */
  onComplete?: () => void;
}

const ANIMATION_DURATION = 2000; // ms total
const DELAY_PER_DEPTH = 400; // ms per cascade depth level

export function CascadeAnimation({
  effects,
  positions,
  onComplete,
}: CascadeAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (effects.length === 0) {
      setActive(false);
      onComplete?.();
      return;
    }

    const maxDepth = Math.max(...effects.map((e) => e.depth));
    const totalDuration = ANIMATION_DURATION + maxDepth * DELAY_PER_DEPTH;
    const start = performance.now();

    let rafId: number;
    function animate(now: number) {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / totalDuration);
      setProgress(p);

      if (p < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setActive(false);
        onComplete?.();
      }
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [effects, onComplete]);

  if (!active || effects.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20" aria-hidden="true">
      {effects.map((effect) => {
        const pos = positions.get(effect.promiseId);
        if (!pos) return null;

        // Each effect appears after a delay based on cascade depth
        const effectDelay = (effect.depth - 1) * DELAY_PER_DEPTH;
        const effectProgress = Math.max(
          0,
          (progress * (ANIMATION_DURATION + effects.length * DELAY_PER_DEPTH) - effectDelay) /
            ANIMATION_DURATION
        );

        if (effectProgress <= 0) return null;

        const rippleSize = 30 + effectProgress * 40;
        const rippleOpacity = (1 - effectProgress) * effect.stressLevel * 0.6;

        return (
          <div
            key={effect.promiseId}
            className="absolute rounded-full"
            style={{
              left: pos.x - rippleSize / 2,
              top: pos.y - rippleSize / 2,
              width: rippleSize,
              height: rippleSize,
              border: `2px solid rgba(255, 152, 0, ${rippleOpacity})`,
              backgroundColor: `rgba(255, 152, 0, ${rippleOpacity * 0.15})`,
              transform: `scale(${0.5 + effectProgress * 0.5})`,
              transition: "none",
            }}
          />
        );
      })}
    </div>
  );
}
