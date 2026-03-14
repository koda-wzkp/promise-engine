"use client";

interface ColonyIntegrityScoreProps {
  colonyIntegrity: number;
  colonistTrust: number;
  shareholderConfidence: number;
  showExplainer?: boolean;
}

function ScoreDisplay({
  value,
  label,
  ariaLabel,
}: {
  value: number;
  label: string;
  ariaLabel: string;
}) {
  const color =
    value >= 60 ? "#00ff88" : value >= 30 ? "#f59e0b" : "#ef4444";

  return (
    <div className="text-center">
      <div
        className="font-mono text-2xl font-bold tabular-nums"
        style={{ color }}
        aria-label={ariaLabel}
      >
        {Math.round(value)}
      </div>
      <div className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </div>
  );
}

export default function ColonyIntegrityScore({
  colonyIntegrity,
  colonistTrust,
  shareholderConfidence,
  showExplainer = false,
}: ColonyIntegrityScoreProps) {
  return (
    <div
      className="rounded border border-[#2d3748] bg-[#111827] p-3"
      role="region"
      aria-label="Colony scoring dashboard"
    >
      <div className="font-mono text-[10px] uppercase tracking-wider text-[#9ca3af] mb-3">
        Network Health
      </div>

      <div className="grid grid-cols-3 gap-3 divide-x divide-[#2d3748]">
        <ScoreDisplay
          value={colonyIntegrity}
          label="Colony Integrity"
          ariaLabel={`Colony Integrity Score: ${Math.round(colonyIntegrity)} out of 100`}
        />
        <div className="pl-3">
          <ScoreDisplay
            value={colonistTrust}
            label="Colonist Trust"
            ariaLabel={`Colonist Trust Score: ${Math.round(colonistTrust)} out of 100`}
          />
        </div>
        <div className="pl-3">
          <ScoreDisplay
            value={shareholderConfidence}
            label="Shareholder Conf."
            ariaLabel={`Shareholder Confidence Score: ${Math.round(shareholderConfidence)} out of 100`}
          />
        </div>
      </div>

      <div className="mt-3 flex gap-2 font-mono text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#ef4444]" aria-hidden="true" />
          <span className="text-[#9ca3af]">
            Colonist ≤10 → Mutiny
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#ef4444]" aria-hidden="true" />
          <span className="text-[#9ca3af]">
            Shareholder ≤10 → Defunded
          </span>
        </div>
      </div>

      {showExplainer && (
        <div className="mt-3 border-t border-[#2d3748] pt-3 font-serif text-xs text-[#9ca3af] leading-relaxed">
          <p>
            Colony Integrity is the weighted average of all promise statuses
            across both stakeholder groups. It is not about any single
            commitment — it&apos;s the structural health of your entire
            obligation network.
          </p>
          <p className="mt-2">
            <strong className="text-[#e5e7eb]">Colonist Trust</strong> weights
            survival and community promises. If it hits zero, the colony
            mutinies.{" "}
            <strong className="text-[#e5e7eb]">Shareholder Confidence</strong>{" "}
            weights revenue and transparency promises. If it hits zero, Helios
            Corp pulls funding.
          </p>
        </div>
      )}
    </div>
  );
}
