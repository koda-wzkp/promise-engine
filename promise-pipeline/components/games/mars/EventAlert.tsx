"use client";

import { MarsEvent } from "../../../lib/types/mars-game";

interface EventAlertProps {
  events: MarsEvent[];
}

export default function EventAlert({ events }: EventAlertProps) {
  if (events.length === 0) return null;

  return (
    <div
      className="rounded border border-[#f5a623] bg-[#1a1f36] p-4"
      role="alert"
      aria-live="polite"
      aria-label={`${events.length} event${events.length > 1 ? "s" : ""} this quarter`}
    >
      <div className="font-mono text-[10px] uppercase tracking-wider text-[#f5a623] mb-3">
        Incoming Transmission — Q{events[0].quarter} Event{events.length > 1 ? "s" : ""}
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id}>
            <div className="flex items-start justify-between gap-4 mb-1">
              <h3 className="font-mono text-sm font-bold text-[#f9fafb]">
                {event.name}
              </h3>
              <span
                className={`font-mono text-xs font-bold shrink-0 ${event.budgetImpact >= 0 ? "text-[#00ff88]" : "text-[#ef4444]"}`}
                aria-label={`Budget impact: ${event.budgetImpact >= 0 ? "+" : ""}${event.budgetImpact.toFixed(1)} billion`}
              >
                {event.budgetImpact >= 0 ? "+" : ""}
                {event.budgetImpact.toFixed(1)}B
              </span>
            </div>

            <p className="font-serif text-xs text-[#9ca3af] leading-relaxed mb-2">
              {event.flavorText}
            </p>

            {event.promiseEffects.length > 0 && (
              <div className="font-mono text-[10px] text-[#9ca3af]">
                Promise effects:{" "}
                {event.promiseEffects.map((ef, i) => (
                  <span key={ef.promiseId}>
                    {i > 0 && ", "}
                    <span className="text-[#e5e7eb]">{ef.promiseId}</span>{" "}
                    <span
                      className={
                        ef.progressDelta >= 0
                          ? "text-[#00ff88]"
                          : "text-[#ef4444]"
                      }
                    >
                      {ef.progressDelta >= 0 ? "+" : ""}
                      {ef.progressDelta}%
                    </span>
                  </span>
                ))}
              </div>
            )}

            {event.statusOverride && (
              <div className="mt-2 border-l-2 border-[#a78bfa] pl-2 font-mono text-[10px] text-[#a78bfa]">
                {event.statusOverride.note}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-[#2d3748] font-mono text-[10px] text-[#9ca3af]">
        Budget and promise progress adjusted before your allocation.
      </div>
    </div>
  );
}
