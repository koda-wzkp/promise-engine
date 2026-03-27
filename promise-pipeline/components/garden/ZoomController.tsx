"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type ZoomLevel = 0 | 1 | 2 | 3;
// 0 = landscape (all domains visible, scale 0.6)
// 1 = garden (default, individual plants, scale 1.0)
// 2 = plant detail (scale 1.4)
// 3 = root system (sub-promises visible, scale 2.0)

const SCALE: Record<ZoomLevel, number> = { 0: 0.6, 1: 1.0, 2: 1.4, 3: 2.0 };

const ZOOM_LABELS: Record<ZoomLevel, string> = {
  0: "Landscape",
  1: "Garden",
  2: "Plant",
  3: "Roots",
};

interface ZoomControllerProps {
  children: (zoomLevel: ZoomLevel) => React.ReactNode;
  onZoomChange?: (level: ZoomLevel) => void;
  defaultLevel?: ZoomLevel;
}

export function ZoomController({ children, onZoomChange, defaultLevel = 1 }: ZoomControllerProps) {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(defaultLevel);
  const initialDistRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const changeZoom = useCallback((delta: number) => {
    setZoomLevel((prev) => {
      const next = Math.max(0, Math.min(3, prev + delta)) as ZoomLevel;
      onZoomChange?.(next);
      return next;
    });
  }, [onZoomChange]);

  // Pinch gesture detection
  const getDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      initialDistRef.current = getDistance(e.touches);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2 || initialDistRef.current === null) return;
    const dist = getDistance(e.touches);
    const ratio = dist / initialDistRef.current;
    if (ratio > 1.35) {
      changeZoom(1);
      initialDistRef.current = dist;
    } else if (ratio < 0.65) {
      changeZoom(-1);
      initialDistRef.current = dist;
    }
  }, [changeZoom]);

  const handleTouchEnd = useCallback(() => {
    initialDistRef.current = null;
  }, []);

  const scale = SCALE[zoomLevel];

  return (
    <div
      ref={containerRef}
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Zoom controls — top-right corner */}
      <div
        className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-gray-200 shadow-sm"
        role="group"
        aria-label="Zoom controls"
      >
        <span className="text-xs text-gray-500 mr-1 select-none">
          {ZOOM_LABELS[zoomLevel]}
        </span>
        <button
          onClick={() => changeZoom(-1)}
          disabled={zoomLevel === 0}
          className="w-6 h-6 flex items-center justify-center text-gray-600 disabled:opacity-30 hover:bg-gray-100 rounded focus-visible:outline-2 focus-visible:outline-green-600"
          aria-label="Zoom out"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <button
          onClick={() => changeZoom(1)}
          disabled={zoomLevel === 3}
          className="w-6 h-6 flex items-center justify-center text-gray-600 disabled:opacity-30 hover:bg-gray-100 rounded focus-visible:outline-2 focus-visible:outline-green-600"
          aria-label="Zoom in"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Pinch hint — only shown at zoom level 1, disappears after first pinch */}
      {zoomLevel === 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <span className="text-xs text-gray-400 bg-white/70 px-2 py-0.5 rounded-full">
            Pinch to zoom
          </span>
        </div>
      )}

      {/* Scaled content */}
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center top",
          transition: reducedMotion ? "none" : "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {children(zoomLevel)}
      </div>
    </div>
  );
}
