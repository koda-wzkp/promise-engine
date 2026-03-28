"use client";

import { useState, useEffect } from "react";
import type { ExternalDependency } from "@/lib/types/org";
import type { PromiseStatus } from "@/lib/types/promise";
import { fetchCivicPromiseSummary } from "@/lib/garden/civicSync";

interface CivicPromiseNode {
  id: string;
  body: string;
  domain: string;
  status: PromiseStatus;
  promiser: string;
}

/**
 * CivicZoomTransition — The visual boundary between garden aesthetic and civic dashboard.
 *
 * Renders an "outer zoom" panel where the garden metaphor fades and the
 * Promise Pipeline civic dashboard aesthetic emerges. Data is continuous;
 * only the visual metaphor shifts.
 *
 * Level progression:
 *   garden (team/org) → external dependency card → civic promise node → full dashboard link
 */
export function CivicZoomTransition({
  dependency,
  onClose,
  onOpenCivicDashboard,
}: {
  dependency: ExternalDependency;
  onClose: () => void;
  onOpenCivicDashboard?: (dashboard: string) => void;
}) {
  const [civicData, setCivicData] = useState<CivicPromiseNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [zoomPhase, setZoomPhase] = useState<"garden" | "boundary" | "civic">("garden");

  useEffect(() => {
    if (!dependency.civicPromiseId || !dependency.civicDashboard) return;
    setLoading(true);
    fetchCivicPromiseSummary(dependency.civicPromiseId, dependency.civicDashboard)
      .then((s) => setCivicData(s))
      .finally(() => setLoading(false));
  }, [dependency.civicPromiseId, dependency.civicDashboard]);

  // Animate through zoom phases
  useEffect(() => {
    const t1 = setTimeout(() => setZoomPhase("boundary"), 300);
    const t2 = setTimeout(() => setZoomPhase("civic"), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const STATUS_RING: Record<PromiseStatus, string> = {
    declared:     "border-blue-300",
    verified:     "border-green-400",
    degraded:     "border-amber-400",
    violated:     "border-red-400",
    unverifiable: "border-gray-300",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background:
          zoomPhase === "garden"
            ? "rgba(0,0,0,0.3)"
            : zoomPhase === "boundary"
            ? "rgba(10,20,40,0.6)"
            : "rgba(15,30,60,0.85)",
        transition: "background 0.6s ease",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Civic zoom transition"
    >
      <div
        className="max-w-lg w-full mx-4 rounded-2xl overflow-hidden"
        style={{
          background:
            zoomPhase === "garden"
              ? "#faf9f6"
              : zoomPhase === "boundary"
              ? "linear-gradient(135deg, #faf9f6 0%, #0f172a 100%)"
              : "#0f172a",
          transition: "background 0.6s ease",
          border: zoomPhase === "civic" ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
        }}
      >
        {/* Zoom level breadcrumb */}
        <div
          className="px-4 py-2 text-xs flex items-center gap-1.5 overflow-x-auto"
          style={{ color: zoomPhase === "civic" ? "rgba(255,255,255,0.5)" : "#6b7280" }}
        >
          <span>Personal</span>
          <span>›</span>
          <span>Team</span>
          <span>›</span>
          <span>Org</span>
          <span>›</span>
          <span
            className="font-medium"
            style={{ color: zoomPhase === "civic" ? "rgba(255,255,255,0.9)" : "#374151" }}
          >
            {dependency.civicDashboard
              ? dependency.civicDashboard.charAt(0).toUpperCase() + dependency.civicDashboard.slice(1)
              : "Civic"}
          </span>
          {zoomPhase === "civic" && (
            <>
              <span>›</span>
              <span style={{ color: "rgba(255,255,255,0.9)" }}>State</span>
            </>
          )}
        </div>

        <div className="px-5 pb-5">
          {/* Dependency label */}
          <div
            className="text-xs font-semibold uppercase tracking-wide mb-2"
            style={{ color: zoomPhase === "civic" ? "rgba(255,255,255,0.5)" : "#9ca3af" }}
          >
            External dependency
          </div>
          <p
            className="font-medium text-sm mb-4"
            style={{ color: zoomPhase === "civic" ? "rgba(255,255,255,0.9)" : "#111827" }}
          >
            {dependency.label}
          </p>

          {/* Civic promise node */}
          {loading ? (
            <div
              className="text-xs py-8 text-center"
              style={{ color: zoomPhase === "civic" ? "rgba(255,255,255,0.4)" : "#9ca3af" }}
            >
              Loading civic promise data…
            </div>
          ) : civicData ? (
            <div
              className={`rounded-xl border-2 p-4 transition-all ${
                civicData.status ? STATUS_RING[civicData.status] : "border-gray-300"
              }`}
              style={{
                background: zoomPhase === "civic" ? "rgba(255,255,255,0.05)" : "white",
              }}
            >
              <div
                className="text-xs font-semibold uppercase tracking-wide mb-1"
                style={{ color: zoomPhase === "civic" ? "rgba(255,255,255,0.4)" : "#6b7280" }}
              >
                {civicData.domain}
              </div>
              <p
                className="text-sm leading-snug mb-2"
                style={{ color: zoomPhase === "civic" ? "rgba(255,255,255,0.9)" : "#111827" }}
              >
                {civicData.body}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className="text-xs"
                  style={{ color: zoomPhase === "civic" ? "rgba(255,255,255,0.5)" : "#6b7280" }}
                >
                  {civicData.promiser}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full border"
                  style={{
                    borderColor: zoomPhase === "civic" ? "rgba(255,255,255,0.2)" : "#e5e7eb",
                    color: zoomPhase === "civic" ? "rgba(255,255,255,0.7)" : "#374151",
                  }}
                >
                  {civicData.status}
                </span>
              </div>
            </div>
          ) : dependency.civicPromiseId ? (
            <p
              className="text-xs text-center py-4"
              style={{ color: zoomPhase === "civic" ? "rgba(255,255,255,0.4)" : "#9ca3af" }}
            >
              Civic promise {dependency.civicPromiseId} not found in local data.
            </p>
          ) : null}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 text-sm rounded-xl border transition-colors"
              style={{
                borderColor: zoomPhase === "civic" ? "rgba(255,255,255,0.2)" : "#e5e7eb",
                color: zoomPhase === "civic" ? "rgba(255,255,255,0.7)" : "#374151",
                background: "transparent",
              }}
            >
              Back to garden
            </button>
            {dependency.civicDashboard && onOpenCivicDashboard && (
              <button
                onClick={() => onOpenCivicDashboard(dependency.civicDashboard!)}
                className="flex-1 py-2 text-sm rounded-xl font-medium transition-colors"
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                }}
              >
                Open civic dashboard ↗
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
