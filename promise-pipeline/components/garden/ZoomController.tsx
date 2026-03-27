"use client";

/**
 * ZoomController — Infinite zoom with pinch gestures.
 *
 * Maps continuous pinch-zoom to discrete LOD transitions:
 *   roots ↔ plant ↔ domain ↔ landscape
 *
 * Content fades in/out based on zoom level. When prefers-reduced-motion
 * is set, transitions are instant (no animation).
 */

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { CameraState, ZoomLevel } from "@/lib/types/garden-phase2";

interface ZoomControllerProps {
  camera: CameraState;
  onZoomChange: (camera: Partial<CameraState>) => void;
  children: (context: ZoomContext) => ReactNode;
}

export interface ZoomContext {
  zoomLevel: ZoomLevel;
  zoom: number;
  /** Opacity multiplier for landscape-level content (domain labels, overview) */
  landscapeOpacity: number;
  /** Opacity multiplier for domain-level content (individual plants) */
  domainOpacity: number;
  /** Opacity multiplier for plant-level content (plant details) */
  plantOpacity: number;
  /** Opacity multiplier for root-level content (sub-promises) */
  rootsOpacity: number;
  /** Whether reduced motion is active */
  reducedMotion: boolean;
}

const ZOOM_THRESHOLDS: Record<ZoomLevel, [number, number]> = {
  landscape: [0, 0.25],
  domain: [0.25, 0.5],
  plant: [0.5, 0.75],
  roots: [0.75, 1.0],
};

function zoomLevelFromValue(zoom: number): ZoomLevel {
  if (zoom < 0.25) return "landscape";
  if (zoom < 0.5) return "domain";
  if (zoom < 0.75) return "plant";
  return "roots";
}

/** Smooth fade: 1.0 when within range, fades out within ±0.15 of boundaries */
function computeLayerOpacity(zoom: number, range: [number, number]): number {
  const FADE = 0.15;
  const [lo, hi] = range;

  if (zoom >= lo && zoom <= hi) return 1;
  if (zoom < lo) return Math.max(0, 1 - (lo - zoom) / FADE);
  return Math.max(0, 1 - (zoom - hi) / FADE);
}

export function ZoomController({ camera, onZoomChange, children }: ZoomControllerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useRef(false);
  const [localZoom, setLocalZoom] = useState(camera.zoom);
  const lastTouchDistance = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      reducedMotion.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }
  }, []);

  // Sync external camera changes
  useEffect(() => {
    setLocalZoom(camera.zoom);
  }, [camera.zoom]);

  const handleZoom = useCallback(
    (delta: number) => {
      setLocalZoom((prev) => {
        const next = Math.max(0, Math.min(1, prev + delta));
        const newLevel = zoomLevelFromValue(next);
        onZoomChange({ zoom: next, zoomLevel: newLevel });
        return next;
      });
    },
    [onZoomChange]
  );

  // Wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      handleZoom(delta);
    },
    [handleZoom]
  );

  // Touch pinch zoom
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length < 2) {
        lastTouchDistance.current = null;
        return;
      }

      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (lastTouchDistance.current !== null) {
        const delta = (distance - lastTouchDistance.current) * 0.002;
        handleZoom(delta);
      }

      lastTouchDistance.current = distance;
    },
    [handleZoom]
  );

  const handleTouchEnd = useCallback(() => {
    lastTouchDistance.current = null;
  }, []);

  const context: ZoomContext = {
    zoomLevel: zoomLevelFromValue(localZoom),
    zoom: localZoom,
    landscapeOpacity: computeLayerOpacity(localZoom, ZOOM_THRESHOLDS.landscape),
    domainOpacity: computeLayerOpacity(localZoom, ZOOM_THRESHOLDS.domain),
    plantOpacity: computeLayerOpacity(localZoom, ZOOM_THRESHOLDS.plant),
    rootsOpacity: computeLayerOpacity(localZoom, ZOOM_THRESHOLDS.roots),
    reducedMotion: reducedMotion.current,
  };

  const transitionStyle = reducedMotion.current
    ? undefined
    : "transform 0.3s ease-out";

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-full overflow-hidden"
      style={{ touchAction: "none", transition: transitionStyle }}
      role="application"
      aria-label="Promise garden with zoom navigation. Pinch or scroll to zoom between landscape, domain, plant, and root views."
      aria-roledescription="zoomable garden"
    >
      {children(context)}
    </div>
  );
}
