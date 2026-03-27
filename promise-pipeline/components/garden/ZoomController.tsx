"use client";

/**
 * ZoomController — Phase 2 Infinite Zoom
 *
 * Manages the continuous camera transform for the NCTP zoom:
 *   sub-promise ↔ plant ↔ domain ↔ landscape
 *
 * Content fades in/out based on zoom level. Supports:
 * - Pinch gestures (touch)
 * - Scroll wheel (desktop)
 * - Reduced motion: instant jumps, no animation
 */

import {
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  CameraState,
  ZoomLevel,
  getZoomLevel,
  DEFAULT_CAMERA,
} from "@/lib/types/garden";
import type { PersonalDomain } from "@/lib/types/personal";

interface ZoomControllerProps {
  camera: CameraState;
  onCameraChange: (camera: Partial<CameraState>) => void;
  children: ReactNode;
  reducedMotion?: boolean;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4.0;
const ZOOM_SENSITIVITY = 0.002;
const PINCH_SENSITIVITY = 0.01;

export function ZoomController({
  camera,
  onCameraChange,
  children,
  reducedMotion = false,
}: ZoomControllerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPinchDistance = useRef<number | null>(null);
  const animationRef = useRef<number>(0);
  const targetCamera = useRef<CameraState>(camera);

  // Smooth animation toward target (skipped for reduced motion)
  useEffect(() => {
    if (reducedMotion) return;

    let running = true;
    function animate() {
      if (!running) return;

      const target = targetCamera.current;
      const lerp = 0.12;

      const nextZoom = camera.zoom + (target.zoom - camera.zoom) * lerp;
      const nextPanX = camera.panX + (target.panX - camera.panX) * lerp;
      const nextPanY = camera.panY + (target.panY - camera.panY) * lerp;

      const zoomDelta = Math.abs(nextZoom - target.zoom);
      const panDelta = Math.abs(nextPanX - target.panX) + Math.abs(nextPanY - target.panY);

      if (zoomDelta > 0.001 || panDelta > 0.5) {
        onCameraChange({
          zoom: nextZoom,
          panX: nextPanX,
          panY: nextPanY,
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      cancelAnimationFrame(animationRef.current);
    };
  }, [camera.zoom, camera.panX, camera.panY, reducedMotion, onCameraChange]);

  // Wheel zoom handler
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * ZOOM_SENSITIVITY;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, camera.zoom + delta));

      if (reducedMotion) {
        onCameraChange({ zoom: newZoom });
      } else {
        targetCamera.current = { ...targetCamera.current, zoom: newZoom };
      }
    },
    [camera.zoom, reducedMotion, onCameraChange]
  );

  // Pinch zoom handlers
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length !== 2) {
        lastPinchDistance.current = null;
        return;
      }

      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (lastPinchDistance.current !== null) {
        const delta = (distance - lastPinchDistance.current) * PINCH_SENSITIVITY;
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, camera.zoom + delta));

        if (reducedMotion) {
          onCameraChange({ zoom: newZoom });
        } else {
          targetCamera.current = { ...targetCamera.current, zoom: newZoom };
        }
      }

      lastPinchDistance.current = distance;
    },
    [camera.zoom, reducedMotion, onCameraChange]
  );

  const handleTouchEnd = useCallback(() => {
    lastPinchDistance.current = null;
  }, []);

  // Attach event listeners
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleWheel, handleTouchMove, handleTouchEnd]);

  const zoomLevel = getZoomLevel(camera.zoom);

  // Opacity for LOD-based content visibility
  const landscapeOpacity = zoomLevel === "landscape" ? 1 : zoomLevel === "domain" ? 0.3 : 0;
  const domainOpacity = zoomLevel === "domain" ? 1 : zoomLevel === "landscape" ? 0.5 : zoomLevel === "plant" ? 0.4 : 0;
  const plantOpacity = zoomLevel === "plant" ? 1 : zoomLevel === "domain" ? 0.6 : zoomLevel === "roots" ? 0.5 : 0;
  const rootsOpacity = zoomLevel === "roots" ? 1 : zoomLevel === "plant" ? 0.2 : 0;

  const transitionStyle = reducedMotion ? "none" : "transform 0.3s ease, opacity 0.3s ease";

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden touch-none"
      style={{ minHeight: "100%" }}
      role="region"
      aria-label={`Garden view at ${zoomLevel} zoom level`}
    >
      <div
        style={{
          transform: `scale(${camera.zoom}) translate(${camera.panX}px, ${camera.panY}px)`,
          transformOrigin: "center center",
          transition: transitionStyle,
        }}
      >
        {children}
      </div>

      {/* Zoom level indicator */}
      <div
        className="absolute bottom-3 left-3 text-xs font-medium px-2 py-1 rounded-full bg-black/20 text-white/80 backdrop-blur-sm"
        aria-hidden="true"
      >
        {zoomLevel === "landscape" && "Landscape"}
        {zoomLevel === "domain" && (camera.focusDomain ?? "Garden")}
        {zoomLevel === "plant" && "Plant"}
        {zoomLevel === "roots" && "Root System"}
      </div>

      {/* Zoom controls for keyboard/button users */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        <button
          onClick={() => onCameraChange({ zoom: Math.min(MAX_ZOOM, camera.zoom * 1.3) })}
          className="w-8 h-8 rounded-full bg-black/20 text-white/80 backdrop-blur-sm text-lg leading-none flex items-center justify-center hover:bg-black/30"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => onCameraChange({ zoom: Math.max(MIN_ZOOM, camera.zoom / 1.3) })}
          className="w-8 h-8 rounded-full bg-black/20 text-white/80 backdrop-blur-sm text-lg leading-none flex items-center justify-center hover:bg-black/30"
          aria-label="Zoom out"
        >
          -
        </button>
        <button
          onClick={() => onCameraChange(DEFAULT_CAMERA)}
          className="w-8 h-8 rounded-full bg-black/20 text-white/80 backdrop-blur-sm text-xs leading-none flex items-center justify-center hover:bg-black/30"
          aria-label="Reset zoom"
        >
          1:1
        </button>
      </div>
    </div>
  );
}

/** Hook: get opacity for LOD-based content at the current zoom level. */
export function useZoomOpacity(zoom: number) {
  const level = getZoomLevel(zoom);
  return {
    landscape: level === "landscape" ? 1 : level === "domain" ? 0.3 : 0,
    domain: level === "domain" ? 1 : level === "landscape" ? 0.5 : level === "plant" ? 0.4 : 0,
    plant: level === "plant" ? 1 : level === "domain" ? 0.6 : level === "roots" ? 0.5 : 0,
    roots: level === "roots" ? 1 : level === "plant" ? 0.2 : 0,
    level,
  };
}
