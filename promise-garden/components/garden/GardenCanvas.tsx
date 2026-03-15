"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { GardenState, PlantState } from "@/lib/types/garden";
import { renderGarden, hitTestPlant } from "@/lib/garden/renderer";

interface GardenCanvasProps {
  gardenState: GardenState;
  onPlantTap?: (plant: PlantState) => void;
  className?: string;
}

export default function GardenCanvas({
  gardenState,
  onPlantTap,
  className,
}: GardenCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, camX: 0, camY: 0 });
  const lastPinchDist = useRef(0);
  const reducedMotion = useRef(false);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      reducedMotion.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }
  }, []);

  // Resize canvas to fill container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas!.parentElement!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width = `${rect.width}px`;
      canvas!.style.height = `${rect.height}px`;
      const ctx = canvas!.getContext("2d")!;
      ctx.scale(dpr, dpr);
    }

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;

    function loop(time: number) {
      if (!running || !canvas || !ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      renderGarden(
        {
          canvas,
          ctx,
          width: w,
          height: h,
          camera,
          time,
          reducedMotion: reducedMotion.current,
        },
        gardenState
      );

      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [gardenState, camera]);

  // ─── INPUT HANDLERS ───

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        camX: camera.x,
        camY: camera.y,
      };
    },
    [camera]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setCamera((c) => ({
        ...c,
        x: dragStart.current.camX - dx / c.zoom,
        y: dragStart.current.camY - dy / c.zoom,
      }));
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const wasDrag = Math.abs(dx) > 5 || Math.abs(dy) > 5;

      setIsDragging(false);

      // If it was a tap (not a drag), check for plant hit
      if (!wasDrag && onPlantTap && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const dpr = window.devicePixelRatio || 1;

        const hit = hitTestPlant(
          gardenState,
          x,
          y,
          camera,
          canvasRef.current.width / dpr,
          canvasRef.current.height / dpr
        );
        if (hit) onPlantTap(hit);
      }
    },
    [gardenState, camera, onPlantTap]
  );

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setCamera((c) => ({
      ...c,
      zoom: Math.max(0.3, Math.min(3, c.zoom - e.deltaY * 0.001)),
    }));
  }, []);

  // Touch pinch zoom
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (lastPinchDist.current > 0) {
        const delta = dist - lastPinchDist.current;
        setCamera((c) => ({
          ...c,
          zoom: Math.max(0.3, Math.min(3, c.zoom + delta * 0.005)),
        }));
      }
      lastPinchDist.current = dist;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastPinchDist.current = 0;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`garden-canvas w-full h-full ${className ?? ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setIsDragging(false)}
      onWheel={handleWheel}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="img"
      aria-label="Your promise garden — an isometric landscape where each plant represents a promise"
    />
  );
}
