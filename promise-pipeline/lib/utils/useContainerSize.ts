"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface ContainerSize {
  width: number;
  height: number;
}

/**
 * Hook that observes a container's dimensions via ResizeObserver.
 * Returns a ref to attach to the container and the measured size.
 * Falls back to the provided defaults until the first measurement.
 */
export function useContainerSize(
  defaultWidth = 900,
  defaultHeight = 700,
): { ref: React.RefObject<HTMLDivElement | null>; width: number; height: number } {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<ContainerSize>({
    width: defaultWidth,
    height: defaultHeight,
  });

  const updateSize = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (rect.width > 0) {
        // On mobile, use a shorter height to fit better
        const w = Math.floor(rect.width);
        const h = Math.floor(Math.min(w * 0.78, defaultHeight));
        setSize((prev) =>
          prev.width === w && prev.height === h ? prev : { width: w, height: h },
        );
      }
    }
  }, [defaultHeight]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [updateSize]);

  return { ref, width: size.width, height: size.height };
}
