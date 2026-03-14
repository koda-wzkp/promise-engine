"use client";

import { CascadeEvent, TeachingMomentConfig, ScenarioTheme } from "../../../lib/games/types";

interface CascadeAlertProps {
  cascades: CascadeEvent[];
  teachingMoment: TeachingMomentConfig | null;
  theme: ScenarioTheme;
  onDismiss: () => void;
}

export default function CascadeAlert({
  cascades,
  teachingMoment,
  theme,
  onDismiss,
}: CascadeAlertProps) {
  if (!teachingMoment && cascades.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cascade-title"
    >
      <div
        className="w-full max-w-lg rounded border-2 p-6 space-y-4"
        style={{
          borderColor: teachingMoment
            ? teachingMoment.severity === "critical"
              ? theme.danger
              : teachingMoment.severity === "warning"
              ? theme.statusColors.degraded
              : theme.accent
            : theme.danger,
          backgroundColor: theme.bgCard,
        }}
      >
        {teachingMoment ? (
          <>
            <div className="space-y-1">
              <div
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{
                  color:
                    teachingMoment.severity === "critical"
                      ? theme.danger
                      : teachingMoment.severity === "warning"
                      ? theme.statusColors.degraded
                      : theme.accent,
                }}
              >
                TEACHING MOMENT — {teachingMoment.type.toUpperCase()}
              </div>
              <h2
                id="cascade-title"
                className="font-mono text-lg font-bold"
                style={{ color: theme.textBright }}
              >
                {teachingMoment.title}
              </h2>
              <div
                className="font-mono text-sm font-bold"
                style={{ color: theme.accent }}
              >
                {teachingMoment.headline}
              </div>
            </div>
            <p
              className="font-mono text-sm leading-relaxed"
              style={{ color: theme.text }}
            >
              {teachingMoment.bodyTemplate}
            </p>
            {teachingMoment.downstreamEffects.length > 0 && (
              <div className="space-y-1">
                <div
                  className="font-mono text-[10px] uppercase tracking-wider"
                  style={{ color: theme.textMuted }}
                >
                  Downstream effects:
                </div>
                {teachingMoment.downstreamEffects.map((fx, i) => (
                  <div
                    key={i}
                    className="font-mono text-[11px] flex gap-2"
                    style={{ color: theme.text }}
                  >
                    <span style={{ color: theme.danger }}>→</span>
                    {fx}
                  </div>
                ))}
              </div>
            )}
            <div
              className="rounded border p-3"
              style={{
                borderColor: `${theme.accent}44`,
                backgroundColor: `${theme.accent}10`,
              }}
            >
              <div
                className="font-mono text-[10px] uppercase tracking-wider mb-1"
                style={{ color: theme.accent }}
              >
                Real-world parallel
              </div>
              <p
                className="font-mono text-[11px] leading-relaxed"
                style={{ color: theme.textMuted }}
              >
                {teachingMoment.realWorldParallel}
              </p>
            </div>
          </>
        ) : (
          <>
            <div
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: theme.danger }}
            >
              CASCADE FAILURE
            </div>
            <h2
              id="cascade-title"
              className="font-mono text-lg font-bold"
              style={{ color: theme.textBright }}
            >
              {cascades.length} Cascade{cascades.length !== 1 ? "s" : ""} Detected
            </h2>
          </>
        )}

        {cascades.length > 0 && (
          <div className="space-y-1.5">
            <div
              className="font-mono text-[10px] uppercase tracking-wider"
              style={{ color: theme.textMuted }}
            >
              Cascade chain:
            </div>
            {cascades.map((c, i) => (
              <div
                key={i}
                className="font-mono text-[11px] flex items-center gap-2"
              >
                <span style={{ color: theme.textMuted }}>
                  {"  ".repeat(c.depth - 1)}
                </span>
                <span style={{ color: theme.text }}>
                  {c.sourcePromiseId}
                </span>
                <span style={{ color: theme.danger }}>→</span>
                <span style={{ color: theme.text }}>
                  {c.affectedPromiseId}
                </span>
                <span
                  className="ml-auto"
                  style={{ color: theme.danger }}
                >
                  -{c.penalty.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onDismiss}
          className="w-full rounded border px-4 py-2 font-mono text-sm font-bold transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            borderColor: theme.accent,
            color: theme.accent,
            backgroundColor: "transparent",
          }}
        >
          ACKNOWLEDGE
        </button>
      </div>
    </div>
  );
}
