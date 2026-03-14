"use client";

import { MarsPromise, marsDomainColors } from "../../../lib/types/mars-game";
import { budgetConfig } from "../../../lib/data/mars-colony";

interface BriefingScreenProps {
  promises: MarsPromise[];
  onStart: () => void;
}

const PROMISEE_LABELS: Record<string, string> = {
  colonists: "COLONISTS",
  shareholders: "SHAREHOLDERS",
  both: "BOTH",
};

const PROMISEE_COLORS: Record<string, string> = {
  colonists: "#00ff88",
  shareholders: "#60a5fa",
  both: "#f5a623",
};

export default function BriefingScreen({
  promises,
  onStart,
}: BriefingScreenProps) {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#0a0e1a] py-8 px-4"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 4px)",
      }}
    >
      <section
        className="mx-auto max-w-4xl"
        aria-labelledby="briefing-title"
      >
        {/* Header */}
        <div className="border border-[#f5a623] rounded p-6 mb-6 font-mono">
          <div className="text-[10px] text-[#9ca3af] uppercase tracking-wider mb-2">
            Classification: GOVERNOR-CEO BRIEFING PACKET
          </div>
          <h1
            id="briefing-title"
            className="text-lg font-bold text-[#f9fafb] mb-1"
          >
            HELIOS CORP — ARES STATION GOVERNANCE PROTOCOL
          </h1>
          <div className="text-xs text-[#9ca3af]">
            Date: Sol 412, Martian Year 47 (Q1 2047 Terrestrial)
          </div>
        </div>

        {/* Appointment */}
        <div className="border border-[#2d3748] rounded p-5 mb-6 font-mono">
          <h2 className="text-xs font-bold text-[#f5a623] uppercase tracking-wider mb-3">
            Appointment Confirmation
          </h2>
          <p className="text-sm text-[#e5e7eb] leading-relaxed mb-4">
            You have been appointed{" "}
            <strong className="text-[#f9fafb]">Governor-CEO of Ares Station</strong>
            , a Helios Corp joint-venture colony. You answer to two principals:
          </p>
          <div className="space-y-2 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-[#00ff88] shrink-0">•</span>
              <span className="text-sm text-[#e5e7eb]">
                The{" "}
                <strong className="text-[#00ff88]">2,847 colonists</strong> of
                Ares Station (trust threshold: survival)
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#60a5fa] shrink-0">•</span>
              <span className="text-sm text-[#e5e7eb]">
                The{" "}
                <strong className="text-[#60a5fa]">
                  Helios Corp Board of Directors
                </strong>{" "}
                (confidence threshold: return)
              </span>
            </div>
          </div>
          <div className="text-xs text-[#9ca3af]">
            Your term: 4 Martian quarters (~2 Earth years).
          </div>
        </div>

        {/* Campaign commitments */}
        <div className="border border-[#2d3748] rounded p-5 mb-6">
          <h2 className="font-mono text-xs font-bold text-[#f5a623] uppercase tracking-wider mb-4">
            Campaign Commitments — Q1 2047
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {promises.map((promise) => (
              <PromiseCard key={promise.id} promise={promise} />
            ))}
          </div>
        </div>

        {/* Budget overview */}
        <div className="border border-[#2d3748] rounded p-5 mb-6 font-mono">
          <h2 className="text-xs font-bold text-[#f5a623] uppercase tracking-wider mb-4">
            Budget Overview
          </h2>
          <div className="space-y-2 text-sm mb-4">
            <BudgetLine
              label="Starting capital"
              value={`$${budgetConfig.startingCapital.toFixed(1)}B`}
              note="(Helios Corp initial investment)"
            />
            <BudgetLine
              label="Quarterly allocation"
              value={`$${budgetConfig.quarterlyAllocation.toFixed(1)}B`}
              note="(Earth transfer — 26-minute signal delay)"
            />
            <BudgetLine
              label="Potential mining revenue"
              value={`$${budgetConfig.miningRevenueBonus.toFixed(1)}B/q`}
              note="(if P4 reaches 60% progress)"
            />
          </div>
          <div className="border-t border-[#2d3748] pt-3 space-y-2 text-sm">
            <BudgetLine
              label="Maximum available (4 quarters, no mining)"
              value={`$${budgetConfig.totalAvailableNoMining.toFixed(1)}B`}
              highlight="terminal"
            />
            <BudgetLine
              label="Estimated full-funding cost (all 8 promises)"
              value={`~$${budgetConfig.totalCostFullFunding.toFixed(1)}B`}
              highlight="danger"
            />
          </div>
          <div className="mt-4 border border-[#ef4444] rounded p-3 text-xs text-[#ef4444]">
            <strong>You cannot fund everything.</strong> The mandate is
            structurally unfulfillable. ${budgetConfig.totalAvailableNoMining}B
            available, ~${budgetConfig.totalCostFullFunding}B needed. Prioritize
            accordingly.
          </div>
        </div>

        {/* Dependency note */}
        <div className="border border-[#2d3748] rounded p-5 mb-6 font-mono text-xs">
          <h2 className="font-bold text-[#f5a623] uppercase tracking-wider mb-3">
            Structural Notes
          </h2>
          <div className="space-y-2 text-[#9ca3af]">
            <div>
              <span className="text-[#e5e7eb]">P3 (Water)</span> underpins both
              P1 (Life Support) and P4 (Mining). If water fails, both cascade.
            </div>
            <div>
              <span className="text-[#e5e7eb]">P4 (Mining) at {">"} $2B/quarter</span>{" "}
              draws from the same power reserves as P1 (Life Support). This is
              a structural conflict in your mandate.
            </div>
            <div>
              <span className="text-[#e5e7eb]">P5 (Shareholder Return)</span> is
              computed from P4 and P8. You cannot fund it directly.
            </div>
            <div>
              <span className="text-[#a78bfa]">P7 (Radiation Shielding)</span>{" "}
              is permanently unverifiable. Independent measurement
              infrastructure does not exist on Mars.
            </div>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full font-mono text-base font-bold text-[#0a0e1a] bg-[#f5a623] py-4 rounded hover:bg-[#c4841a] focus-visible:ring-2 focus-visible:ring-[#f5a623] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a] transition-colors"
        >
          INITIATE GOVERNANCE PROTOCOL →
        </button>
      </section>
    </main>
  );
}

function PromiseCard({ promise }: { promise: MarsPromise }) {
  const domainColor = marsDomainColors[promise.domain] ?? "#64748b";
  const promiseeColor = PROMISEE_COLORS[promise.promisee] ?? "#9ca3af";

  return (
    <div
      className="rounded border-l-2 bg-[#111827] p-3 font-mono"
      style={{ borderLeftColor: domainColor }}
    >
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="text-xs font-bold" style={{ color: domainColor }}>
          {promise.id}
        </span>
        <span
          className="text-[10px] px-1 rounded"
          style={{ color: domainColor, border: `1px solid ${domainColor}33` }}
        >
          {promise.domain.toUpperCase()}
        </span>
        <span
          className="text-[10px]"
          style={{ color: promiseeColor }}
        >
          → {PROMISEE_LABELS[promise.promisee]}
        </span>
      </div>
      <p className="text-xs text-[#e5e7eb] leading-relaxed mb-2">
        {promise.body}
      </p>
      <div className="text-[10px] text-[#9ca3af] space-y-0.5">
        {promise.id === "P5" ? (
          <div>Cost: Computed (not directly fundable)</div>
        ) : (
          <div>
            Cost:{" "}
            <span className="text-[#f5a623]">
              ${promise.costPerQuarter.toFixed(1)}B
              {promise.isOneTime ? " (one-time)" : "/quarter"}
            </span>
          </div>
        )}
        {promise.dependsOn.length > 0 && (
          <div>
            Depends on:{" "}
            <span className="text-[#e5e7eb]">
              {promise.dependsOn.join(", ")}
            </span>
          </div>
        )}
        <div className="text-[#64748b] italic">{promise.verificationNote}</div>
      </div>
    </div>
  );
}

function BudgetLine({
  label,
  value,
  note,
  highlight,
}: {
  label: string;
  value: string;
  note?: string;
  highlight?: "terminal" | "danger";
}) {
  const valueColor =
    highlight === "terminal"
      ? "#00ff88"
      : highlight === "danger"
        ? "#ef4444"
        : "#f5a623";

  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-[#9ca3af]">
        {label}
        {note && (
          <span className="text-[#64748b]"> {note}</span>
        )}
      </span>
      <span className="font-bold shrink-0" style={{ color: valueColor }}>
        {value}
      </span>
    </div>
  );
}
