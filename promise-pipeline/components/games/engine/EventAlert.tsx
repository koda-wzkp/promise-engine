"use client";

import { ScenarioEvent, ScenarioTheme } from "../../../lib/games/types";

interface EventAlertProps {
  events: ScenarioEvent[];
  theme: ScenarioTheme;
}

export default function EventAlert({ events, theme }: EventAlertProps) {
  if (!events.length) return null;

  return (
    <div className="space-y-2">
      {events.map((event) => {
        const hasBudgetImpact = event.budgetImpact !== 0;
        const hasSupplierEvents =
          event.upstreamSupplierEvents && event.upstreamSupplierEvents.length > 0;

        return (
          <div
            key={event.id}
            className="rounded border p-3 space-y-1"
            style={{
              borderColor: hasBudgetImpact
                ? event.budgetImpact < 0
                  ? theme.danger
                  : theme.terminal
                : theme.border,
              backgroundColor: theme.bgCard,
            }}
            role="alert"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="font-mono text-[10px] uppercase tracking-wider"
                  style={{ color: theme.accent }}
                >
                  EVENT
                </span>
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: theme.textBright }}
                >
                  {event.name}
                </span>
              </div>
              {hasBudgetImpact && (
                <span
                  className="font-mono text-xs font-bold shrink-0"
                  style={{
                    color: event.budgetImpact < 0 ? theme.danger : theme.terminal,
                  }}
                >
                  {event.budgetImpact > 0 ? "+" : ""}
                  {event.budgetImpact}M
                </span>
              )}
            </div>
            <p
              className="font-mono text-[11px] leading-relaxed"
              style={{ color: theme.text }}
            >
              {event.flavorText}
            </p>
            {event.promiseEffects.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {event.promiseEffects.map((fx) => (
                  <span
                    key={fx.promiseId}
                    className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                    style={{
                      color:
                        fx.progressDelta < 0 ? theme.danger : theme.terminal,
                      border: `1px solid ${
                        fx.progressDelta < 0 ? theme.danger : theme.terminal
                      }44`,
                    }}
                  >
                    {fx.promiseId}{" "}
                    {fx.progressDelta > 0 ? "+" : ""}
                    {fx.progressDelta}%
                  </span>
                ))}
              </div>
            )}
            {hasSupplierEvents &&
              event.upstreamSupplierEvents!.map((se) => (
                <div
                  key={se.supplierId}
                  className="rounded border-l-2 pl-2 mt-2"
                  style={{ borderLeftColor: theme.accent }}
                >
                  <div
                    className="font-mono text-[10px] font-bold"
                    style={{ color: theme.accent }}
                  >
                    SUPPLIER: {se.supplierName}
                  </div>
                  <div
                    className="font-mono text-[10px]"
                    style={{ color: theme.textMuted }}
                  >
                    Outcome:{" "}
                    <span
                      style={{
                        color:
                          se.outcome === "delivered"
                            ? theme.terminal
                            : se.outcome === "cancelled"
                            ? theme.danger
                            : theme.statusColors.degraded,
                      }}
                    >
                      {se.outcome.toUpperCase()}
                    </span>
                  </div>
                  {se.playerCanMitigate && se.mitigationCost && (
                    <div
                      className="font-mono text-[10px] mt-0.5"
                      style={{ color: theme.statusColors.degraded }}
                    >
                      Mitigation available for ${se.mitigationCost}M
                    </div>
                  )}
                </div>
              ))}
          </div>
        );
      })}
    </div>
  );
}
