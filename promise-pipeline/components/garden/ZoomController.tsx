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
  // pan is mirrored in ref so drag handlers always read current value without stale closures
  const [pan, setPanState] = useState({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const zoomLevelRef = useRef<ZoomLevel>(defaultLevel);

  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  // Last tap position in container coords — used as focal point for next zoom
  const lastFocusRef = useRef<{ x: number; y: number } | null>(null);

  // Drag state stored entirely in refs to avoid stale closures in window listeners
  const dragRef = useRef({ active: false, startX: 0, startY: 0, startPanX: 0, startPanY: 0 });

  // Pinch state
  const pinchRef = useRef<{ dist: number; cx: number; cy: number } | null>(null);
  // Single-touch pan start
  const touchPanRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number } | null>(null);

  function setPan(p: { x: number; y: number }) {
    panRef.current = p;
    setPanState(p);
  }

  // ── Core zoom function ───────────────────────────────────────────────────────
  // Zooms by `delta` levels, keeping the content point under (focalX, focalY) fixed.
  // focalX/focalY are in container-local pixel coords (before the CSS transform).

  const doZoom = useCallback(
    (focalX: number, focalY: number, delta: number) => {
      const prevLevel = zoomLevelRef.current;
      const newLevel = Math.max(0, Math.min(3, prevLevel + delta)) as ZoomLevel;
      if (newLevel === prevLevel) return;

      const prevScale = SCALE[prevLevel];
      const newScale = SCALE[newLevel];

      let newPan: { x: number; y: number };

      if (newLevel === 0) {
        // Landscape: center the scaled content horizontally, anchor top
        const cw = containerRef.current?.getBoundingClientRect().width ?? 0;
        newPan = { x: cw * (1 - SCALE[0]) / 2, y: 0 };
      } else if (newLevel === 1) {
        // Garden: identity — content fills container width
        newPan = { x: 0, y: 0 };
      } else {
        // Zoom toward focal point:
        // Content point under focal = (focalX - prevPan.x) / prevScale
        // After zoom: newPan so that same content point maps to focalX
        const contentX = (focalX - panRef.current.x) / prevScale;
        const contentY = (focalY - panRef.current.y) / prevScale;
        newPan = {
          x: focalX - contentX * newScale,
          y: focalY - contentY * newScale,
        };
      }

      setPan(newPan);
      zoomLevelRef.current = newLevel;
      setZoomLevel(newLevel);
      onZoomChange?.(newLevel);
    },
    [onZoomChange]
  );

  // ── Button zoom ──────────────────────────────────────────────────────────────
  // Uses the last tap position as focal point; falls back to container center-top.

  const changeZoom = useCallback(
    (delta: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      const focus = lastFocusRef.current;
      const x = focus?.x ?? (rect ? rect.width / 2 : 200);
      const y = focus?.y ?? (rect ? rect.height / 4 : 80);
      doZoom(x, y, delta);
    },
    [doZoom]
  );

  // ── Mouse events ─────────────────────────────────────────────────────────────

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Record tap position for next zoom operation
    lastFocusRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    // Begin pan drag only when zoomed in enough
    if (zoomLevelRef.current <= 1) return;

    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startPanX: panRef.current.x,
      startPanY: panRef.current.y,
    };
    setIsDragging(true);
  }, []);

  // Window-level listeners so drag continues if the cursor leaves the container
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPan({
        x: dragRef.current.startPanX + dx,
        y: dragRef.current.startPanY + dy,
      });
    };
    const onMouseUp = () => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      setIsDragging(false);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // ── Touch events ─────────────────────────────────────────────────────────────

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (e.touches.length === 1) {
      const t = e.touches[0];
      const cx = t.clientX - rect.left;
      const cy = t.clientY - rect.top;
      lastFocusRef.current = { x: cx, y: cy };
      pinchRef.current = null;
      touchPanRef.current = {
        x: t.clientX,
        y: t.clientY,
        startPanX: panRef.current.x,
        startPanY: panRef.current.y,
      };
    } else if (e.touches.length === 2) {
      // Switch to pinch — cancel any single-touch pan
      touchPanRef.current = null;
      setIsDragging(false);
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
      pinchRef.current = { dist, cx, cy };
      lastFocusRef.current = { x: cx, y: cy };
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1 && touchPanRef.current) {
        // Single-finger pan — only when zoomed in
        if (zoomLevelRef.current <= 1) return;
        const t = e.touches[0];
        const dx = t.clientX - touchPanRef.current.x;
        const dy = t.clientY - touchPanRef.current.y;
        setPan({
          x: touchPanRef.current.startPanX + dx,
          y: touchPanRef.current.startPanY + dy,
        });
        setIsDragging(true);
      } else if (e.touches.length === 2 && pinchRef.current) {
        // Two-finger pinch zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const ratio = dist / pinchRef.current.dist;
        if (ratio > 1.35) {
          doZoom(pinchRef.current.cx, pinchRef.current.cy, 1);
          pinchRef.current = { ...pinchRef.current, dist };
        } else if (ratio < 0.65) {
          doZoom(pinchRef.current.cx, pinchRef.current.cy, -1);
          pinchRef.current = { ...pinchRef.current, dist };
        }
      }
    },
    [doZoom]
  );

  const handleTouchEnd = useCallback(() => {
    touchPanRef.current = null;
    pinchRef.current = null;
    setIsDragging(false);
  }, []);

  const scale = SCALE[zoomLevel];
  const canPan = zoomLevel > 1;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ cursor: canPan ? (isDragging ? "grabbing" : "grab") : "default" }}
    >
      {/* Zoom controls — top-right, above content */}
      <div
        className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-gray-200 shadow-sm"
        role="group"
        aria-label="Zoom controls"
        // Prevent mousedown on controls from starting a pan drag
        onMouseDown={(e) => e.stopPropagation()}
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
            <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <button
          onClick={() => changeZoom(1)}
          disabled={zoomLevel === 3}
          className="w-6 h-6 flex items-center justify-center text-gray-600 disabled:opacity-30 hover:bg-gray-100 rounded focus-visible:outline-2 focus-visible:outline-green-600"
          aria-label="Zoom in"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M6 2v8M2 6h8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Contextual hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        {canPan ? (
          <span className="text-xs text-gray-400 bg-white/70 px-2 py-0.5 rounded-full">
            Drag to pan · pinch to zoom
          </span>
        ) : zoomLevel === 1 ? (
          <span className="text-xs text-gray-400 bg-white/70 px-2 py-0.5 rounded-full">
            Tap a plant · then zoom in
          </span>
        ) : null}
      </div>

      {/* Scaled + translated content */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: "0 0",
          transition:
            !reducedMotion && !isDragging
              ? "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
              : "none",
          userSelect: "none",
          // Prevent browser scroll handling when we're panning (zoom > 1)
          touchAction: canPan ? "none" : "pan-y",
        }}
      >
        {children(zoomLevel)}
      </div>
    </div>
  );
}
