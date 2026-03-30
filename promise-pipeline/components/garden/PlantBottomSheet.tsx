"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { GardenPromise } from "@/lib/types/personal";
import { isDue } from "@/lib/garden/adaptiveCheckin";

const STATUS_LABELS: Record<string, string> = {
  declared:     "Declared",
  verified:     "On track",
  degraded:     "Slipping",
  violated:     "Dormant",
  unverifiable: "Unverifiable",
};

const STATUS_COLORS: Record<string, string> = {
  declared:     "bg-blue-100 text-blue-700",
  verified:     "bg-green-100 text-green-700",
  degraded:     "bg-amber-100 text-amber-700",
  violated:     "bg-gray-100 text-gray-500",
  unverifiable: "bg-gray-50 text-gray-400",
};

const K_COLORS: Record<string, string> = {
  composting: "#d97706",
  ecological: "#059669",
  physics:    "#2563eb",
};

interface PlantBottomSheetProps {
  promise: GardenPromise;
  isStressed?: boolean;
  onCheckIn: () => void;
  onSubPromise: () => void;
  onDependency: () => void;
  onPartner: () => void;
  onSensor: () => void;
  onClose: () => void;
}

export function PlantBottomSheet({
  promise,
  isStressed,
  onCheckIn,
  onSubPromise,
  onDependency,
  onPartner,
  onSensor,
  onClose,
}: PlantBottomSheetProps) {
  const [visible, setVisible] = useState(false);
  const due = isDue(promise);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Drag state
  const dragRef = useRef<{ startY: number; startTranslate: number } | null>(null);
  const [dragTranslateY, setDragTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, reducedMotion ? 0 : 280);
  }, [onClose, reducedMotion]);

  // Fire action after sheet close animation
  const act = useCallback((fn: () => void) => {
    close();
    setTimeout(fn, reducedMotion ? 0 : 280);
  }, [close, reducedMotion]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  // ── Drag handling ──
  const handleDragStart = useCallback((clientY: number) => {
    dragRef.current = { startY: clientY, startTranslate: dragTranslateY };
    setIsDragging(true);
  }, [dragTranslateY]);

  const handleDragMove = useCallback((clientY: number) => {
    if (!dragRef.current) return;
    const dy = clientY - dragRef.current.startY;
    // Only allow dragging downward (positive dy) or slightly upward
    const newTranslate = Math.max(-20, dragRef.current.startTranslate + dy);
    setDragTranslateY(newTranslate);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!dragRef.current) return;
    const sheet = sheetRef.current;
    const sheetHeight = sheet?.offsetHeight ?? 300;
    // If dragged more than 30% of sheet height, dismiss
    if (dragTranslateY > sheetHeight * 0.3) {
      close();
    } else {
      setDragTranslateY(0);
    }
    dragRef.current = null;
    setIsDragging(false);
  }, [dragTranslateY, close]);

  // Touch events on drag handle
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  }, [handleDragStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  }, [handleDragMove]);

  const onTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Mouse events on drag handle
  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientY);
    const onMouseUp = () => handleDragEnd();
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const transitionStyle = reducedMotion || isDragging
    ? "none"
    : "transform 280ms ease-out";

  const sheetTransform = visible
    ? `translateY(${dragTranslateY}px)`
    : "translateY(100%)";

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col justify-end"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-black/25"
        style={{
          opacity: visible ? 1 : 0,
          transition: reducedMotion ? "none" : "opacity 280ms",
        }}
        aria-hidden="true"
        onClick={close}
      />

      {/* Sheet — capped at 50vh on mobile */}
      <div
        ref={sheetRef}
        className="relative bg-white rounded-t-2xl shadow-2xl"
        style={{
          transform: sheetTransform,
          transition: transitionStyle,
          maxHeight: "50vh",
          display: "flex",
          flexDirection: "column",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`Promise details: ${promise.body}`}
      >
        {/* Drag handle — functional */}
        <div
          className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none select-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={(e) => handleDragStart(e.clientY)}
          aria-label="Drag to resize or dismiss"
          role="separator"
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full" aria-hidden="true" />
        </div>

        <div className="px-5 pb-8 pt-2 space-y-4 overflow-y-auto flex-1 min-h-0">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-base font-medium text-gray-900 leading-snug flex-1">
                {promise.body}
              </p>
              <button
                onClick={close}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0 mt-0.5"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[promise.status] ?? "bg-gray-50 text-gray-400"}`}>
                {STATUS_LABELS[promise.status] ?? promise.status}
              </span>
              <span
                className="px-2 py-0.5 text-xs rounded-full"
                style={{
                  background: (K_COLORS[promise.kRegime] ?? "#9ca3af") + "22",
                  color:      K_COLORS[promise.kRegime] ?? "#9ca3af",
                }}
              >
                {promise.kRegime}
              </span>
              {due && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">
                  due now
                </span>
              )}
              {isStressed && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-600">
                  dependency struggling
                </span>
              )}
              {promise.partner && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-purple-50 text-purple-700">
                  {promise.partner.inviteStatus === "accepted" ? "partnered" : "invite sent"}
                </span>
              )}
              {promise.children.length > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-50 text-gray-500">
                  {promise.children.length} sub
                </span>
              )}
            </div>

            {promise.lastCheckIn && (
              <p className="text-xs text-gray-400 mt-1.5">
                Last check-in: {new Date(promise.lastCheckIn).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => act(onCheckIn)}
            className="w-full py-3.5 bg-green-700 text-white rounded-xl font-semibold text-sm hover:bg-green-800 active:bg-green-900 transition-colors focus-visible:outline-2 focus-visible:outline-green-600"
          >
            Check in
          </button>

          {/* Secondary actions */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => act(onSubPromise)}
              className="py-3 text-xs font-medium rounded-xl bg-gray-50 text-green-700 hover:bg-green-50 transition-colors"
            >
              {promise.children.length > 0 ? `Break (${promise.children.length})` : "Break down"}
            </button>
            <button
              onClick={() => act(onDependency)}
              className="py-3 text-xs font-medium rounded-xl bg-gray-50 text-blue-700 hover:bg-blue-50 transition-colors"
            >
              {promise.depends_on.length > 0 ? `Depends (${promise.depends_on.length})` : "Depends"}
            </button>
            <button
              onClick={() => act(onPartner)}
              className="py-3 text-xs font-medium rounded-xl bg-gray-50 text-purple-700 hover:bg-purple-50 transition-colors"
            >
              {promise.partner ? "Partner ✓" : "Partner"}
            </button>
            <button
              onClick={() => act(onSensor)}
              className="py-3 text-xs font-medium rounded-xl bg-gray-50 text-blue-700 hover:bg-blue-50 transition-colors"
            >
              {promise.sensor ? "Sensor ✓" : "Sensor"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
