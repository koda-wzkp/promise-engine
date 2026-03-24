"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";

interface PanZoomWrapperProps {
  children: React.ReactNode;
  width: number;
  height: number;
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  reducedMotion?: boolean;
}

export function PanZoomWrapper({
  children,
  width,
  height,
  minZoom = 0.5,
  maxZoom = 3.0,
  initialZoom,
  reducedMotion = false,
}: PanZoomWrapperProps) {
  const isMobile = width < 768;
  const defaultZoom = initialZoom ?? (isMobile ? 0.85 : 1.0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(defaultZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const lastTouchDistRef = useRef<number | null>(null);

  const clampZoom = useCallback(
    (z: number) => Math.min(maxZoom, Math.max(minZoom, z)),
    [minZoom, maxZoom],
  );

  const resetView = useCallback(() => {
    setZoom(defaultZoom);
    setPan({ x: 0, y: 0 });
  }, [defaultZoom]);

  // --- Mouse wheel zoom (desktop) ---
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((z) => clampZoom(z * delta));
    },
    [clampZoom],
  );

  // Attach wheel handler with { passive: false } to allow preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // --- Check if event target is a promise node ---
  function isNodeTarget(target: EventTarget | null): boolean {
    if (!target || !(target instanceof Element)) return false;
    return target.closest("[data-promise-node]") !== null;
  }

  // --- Mouse drag pan (desktop) ---
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isNodeTarget(e.target)) return;
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    },
    [pan],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    },
    [isPanning],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // --- Touch: pinch zoom + drag pan (mobile) ---
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        lastTouchDistRef.current = dist;
      } else if (e.touches.length === 1) {
        if (isNodeTarget(e.target)) return;
        setIsPanning(true);
        panStartRef.current = {
          x: e.touches[0].clientX - pan.x,
          y: e.touches[0].clientY - pan.y,
        };
      }
    },
    [pan],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && lastTouchDistRef.current !== null) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        const scale = dist / lastTouchDistRef.current;
        setZoom((z) => clampZoom(z * scale));
        lastTouchDistRef.current = dist;
      } else if (e.touches.length === 1 && isPanning) {
        setPan({
          x: e.touches[0].clientX - panStartRef.current.x,
          y: e.touches[0].clientY - panStartRef.current.y,
        });
      }
    },
    [isPanning, clampZoom],
  );

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
    lastTouchDistRef.current = null;
  }, []);

  // --- Double tap/click to reset ---
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isNodeTarget(e.target)) return;
      resetView();
    },
    [resetView],
  );

  // --- Keyboard zoom ---
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "=" || e.key === "+") {
        e.preventDefault();
        setZoom((z) => clampZoom(z * 1.2));
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        setZoom((z) => clampZoom(z * 0.8));
      } else if (e.key === "0") {
        e.preventDefault();
        resetView();
      }
    },
    [clampZoom, resetView],
  );

  const transition =
    isPanning || reducedMotion ? "none" : "transform 0.1s ease-out";

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      style={{
        width,
        height,
        overflow: "hidden",
        position: "relative",
        cursor: isPanning ? "grabbing" : "grab",
        touchAction: "none",
        outline: "none",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
    >
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          transition,
        }}
      >
        {children}
      </div>

      {/* Zoom controls — bottom-left, semi-transparent */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          display: "flex",
          gap: 4,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => setZoom((z) => clampZoom(z * 1.2))}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: "1px solid rgba(0,0,0,0.15)",
            background: "rgba(255,255,255,0.85)",
            fontSize: 16,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => clampZoom(z * 0.8))}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: "1px solid rgba(0,0,0,0.15)",
            background: "rgba(255,255,255,0.85)",
            fontSize: 16,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Zoom out"
        >
          {"\u2212"}
        </button>
        <button
          onClick={resetView}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: "1px solid rgba(0,0,0,0.15)",
            background: "rgba(255,255,255,0.85)",
            fontSize: 11,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "IBM Plex Mono, monospace",
          }}
          aria-label="Reset zoom"
        >
          1:1
        </button>
      </div>
    </div>
  );
}
