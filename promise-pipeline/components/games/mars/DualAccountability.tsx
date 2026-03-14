"use client";

interface DualAccountabilityProps {
  colonistTrust: number;
  shareholderConfidence: number;
  prevColonistTrust?: number;
  prevShareholderConfidence?: number;
}

function AccountabilityBar({
  value,
  prev,
  label,
  dangerLabel,
  ariaLabel,
}: {
  value: number;
  prev?: number;
  label: string;
  dangerLabel: string;
  ariaLabel: string;
}) {
  const color =
    value >= 60 ? "#00ff88" : value >= 30 ? "#f59e0b" : "#ef4444";
  const delta = prev !== undefined ? value - prev : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-xs text-[#e5e7eb]">{label}</span>
        <div className="flex items-center gap-2">
          {delta !== null && delta !== 0 && (
            <span
              className={`font-mono text-xs ${delta > 0 ? "text-[#00ff88]" : "text-[#ef4444]"}`}
              aria-label={`Change: ${delta > 0 ? "+" : ""}${Math.round(delta)}`}
            >
              {delta > 0 ? "+" : ""}
              {Math.round(delta)}
            </span>
          )}
          <span
            className="font-mono text-sm font-bold tabular-nums"
            style={{ color }}
            aria-label={ariaLabel}
          >
            {Math.round(value)}
          </span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-[#2d3748] overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      {value <= 20 && (
        <p className="mt-1 font-mono text-[10px] text-[#ef4444]">
          ⚠ {dangerLabel}
        </p>
      )}
    </div>
  );
}

export default function DualAccountability({
  colonistTrust,
  shareholderConfidence,
  prevColonistTrust,
  prevShareholderConfidence,
}: DualAccountabilityProps) {
  return (
    <div
      className="space-y-3 rounded border border-[#2d3748] bg-[#111827] p-3"
      role="region"
      aria-label="Dual accountability scores"
    >
      <div className="font-mono text-[10px] uppercase tracking-wider text-[#9ca3af]">
        Accountability
      </div>
      <AccountabilityBar
        value={colonistTrust}
        prev={prevColonistTrust}
        label="Colonist Trust"
        dangerLabel="Approaching mutiny threshold"
        ariaLabel={`Colonist Trust: ${Math.round(colonistTrust)} out of 100`}
      />
      <AccountabilityBar
        value={shareholderConfidence}
        prev={prevShareholderConfidence}
        label="Shareholder Confidence"
        dangerLabel="Approaching defunding threshold"
        ariaLabel={`Shareholder Confidence: ${Math.round(shareholderConfidence)} out of 100`}
      />
    </div>
  );
}
