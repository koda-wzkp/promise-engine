"use client";

interface CascadeAlertProps {
  type: "cascade" | "verification-gap" | "structural-conflict" | "network-health";
  data?: {
    p3Progress?: number;
    p7Progress?: number;
    p4Allocation?: number;
    p1Penalty?: number;
    conflictExplanation?: string;
  };
  onDismiss: () => void;
}

export default function CascadeAlert({ type, data = {}, onDismiss }: CascadeAlertProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      role="alertdialog"
      aria-modal="true"
      aria-live="assertive"
      aria-labelledby="cascade-alert-title"
    >
      <div className="max-w-2xl w-full rounded border border-[#f5a623] bg-[#0a0e1a] p-6 shadow-2xl">
        {type === "cascade" && (
          <CascadeContent
            p3Progress={data.p3Progress ?? 0}
            onDismiss={onDismiss}
          />
        )}
        {type === "verification-gap" && (
          <VerificationGapContent
            p7Progress={data.p7Progress ?? 0}
            onDismiss={onDismiss}
          />
        )}
        {type === "structural-conflict" && (
          <StructuralConflictContent
            p4Allocation={data.p4Allocation ?? 0}
            p1Penalty={data.p1Penalty ?? 0}
            explanation={data.conflictExplanation ?? ""}
            onDismiss={onDismiss}
          />
        )}
        {type === "network-health" && (
          <NetworkHealthContent onDismiss={onDismiss} />
        )}
      </div>
    </div>
  );
}

function CascadeContent({
  p3Progress,
  onDismiss,
}: {
  p3Progress: number;
  onDismiss: () => void;
}) {
  return (
    <>
      <div className="font-mono text-[10px] uppercase tracking-wider text-[#f5a623] mb-2">
        Teaching Moment — Promise Theory
      </div>
      <h2
        id="cascade-alert-title"
        className="font-mono text-base font-bold text-[#f9fafb] mb-4"
      >
        CASCADE DETECTED — WATER RECLAMATION FAILURE
      </h2>
      <p className="font-serif text-sm text-[#e5e7eb] mb-4">
        Water reclamation at{" "}
        <strong className="text-[#ef4444]">{Math.round(p3Progress)}%</strong>.
        Systems below minimum operational threshold.
      </p>

      <div className="border border-[#2d3748] rounded p-3 mb-4 font-mono text-xs space-y-2">
        <div className="text-[#9ca3af] uppercase tracking-wider text-[10px] mb-2">
          Downstream Effects
        </div>
        <div className="text-[#e5e7eb]">
          <span className="text-[#ef4444]">P1 (Life Support):</span> Efficiency
          dropping. Water is a core life support input.
        </div>
        <div className="text-[#e5e7eb]">
          <span className="text-[#ef4444]">P2 (Hab Expansion):</span> Halted.
          Cannot build new quarters while life support is at risk.
        </div>
        <div className="text-[#e5e7eb]">
          <span className="text-[#ef4444]">P4 (Mining):</span> Operations
          suspended. Equipment cooling requires water reclamation ≥50%.
        </div>
      </div>

      <p className="font-serif text-sm text-[#9ca3af] mb-4 leading-relaxed">
        Four consequences from one underfunded promise. This is how cascades
        work: failure doesn&apos;t stay local. It propagates through every
        commitment that depends on the failing one.
      </p>

      <p className="font-serif text-xs text-[#64748b] italic mb-4 border-l-2 border-[#2d3748] pl-3">
        In Oregon&apos;s HB 2021, PacifiCorp&apos;s rejected clean energy plan
        cascaded to emissions targets, workforce transition, and equity
        provisions across three domains.
      </p>

      <button
        onClick={onDismiss}
        className="w-full font-mono text-sm font-bold text-[#0a0e1a] bg-[#f5a623] py-2 rounded hover:bg-[#c4841a] focus-visible:ring-2 focus-visible:ring-[#f5a623] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a] transition-colors"
        autoFocus
      >
        ACKNOWLEDGE CASCADE →
      </button>
    </>
  );
}

function VerificationGapContent({
  p7Progress,
  onDismiss,
}: {
  p7Progress: number;
  onDismiss: () => void;
}) {
  return (
    <>
      <div className="font-mono text-[10px] uppercase tracking-wider text-[#a78bfa] mb-2">
        Teaching Moment — Verification Gap
      </div>
      <h2
        id="cascade-alert-title"
        className="font-mono text-base font-bold text-[#f9fafb] mb-4"
      >
        VERIFICATION GAP — RADIATION SHIELDING
      </h2>
      <p className="font-serif text-sm text-[#e5e7eb] mb-3 leading-relaxed">
        Shielding contractor reports{" "}
        <strong className="text-[#a78bfa]">
          {Math.round(p7Progress)}% reduction
        </strong>{" "}
        in radiation exposure.
      </p>
      <p className="font-serif text-sm text-[#9ca3af] mb-3 leading-relaxed">
        Independent measurement infrastructure does not exist on Mars. The
        sensors that measure shielding effectiveness are owned and operated by
        the same corporation that promised the shielding. This promise cannot
        be verified by anyone outside Helios Corp.
      </p>
      <div className="border border-[#a78bfa33] rounded p-3 mb-4 font-mono text-xs text-[#a78bfa]">
        Status: <strong>Unverifiable</strong>. Not because nothing is being
        done — but because no one can confirm what&apos;s being done.
      </div>
      <p className="font-serif text-xs text-[#64748b] italic mb-4 border-l-2 border-[#2d3748] pl-3">
        In Oregon&apos;s HB 2021, equity promises — commitments to
        environmental justice communities, affordability protections — have no
        comparable verification infrastructure. The promises exist in statute,
        but no mechanism exists to determine whether they&apos;re being kept.
        Measurable commitments get accountability. Unmeasurable ones get
        rhetoric.
      </p>
      <button
        onClick={onDismiss}
        className="w-full font-mono text-sm font-bold text-[#0a0e1a] bg-[#a78bfa] py-2 rounded hover:bg-[#7c3aed] focus-visible:ring-2 focus-visible:ring-[#a78bfa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a] transition-colors"
        autoFocus
      >
        ACKNOWLEDGE VERIFICATION GAP →
      </button>
    </>
  );
}

function StructuralConflictContent({
  p4Allocation,
  p1Penalty,
  explanation,
  onDismiss,
}: {
  p4Allocation: number;
  p1Penalty: number;
  explanation: string;
  onDismiss: () => void;
}) {
  return (
    <>
      <div className="font-mono text-[10px] uppercase tracking-wider text-[#ef4444] mb-2">
        Teaching Moment — Structural Conflict
      </div>
      <h2
        id="cascade-alert-title"
        className="font-mono text-base font-bold text-[#f9fafb] mb-4"
      >
        STRUCTURAL CONFLICT — REVENUE vs. SURVIVAL
      </h2>
      <p className="font-serif text-sm text-[#e5e7eb] mb-3 leading-relaxed">
        Mining operations funded at{" "}
        <strong className="text-[#ef4444]">
          ${p4Allocation.toFixed(1)}B/quarter
        </strong>{" "}
        draw{" "}
        <strong className="text-[#ef4444]">{p1Penalty}%</strong> of colony
        power reserves — the same capacity maintained for life support surge
        protection.
      </p>
      <p className="font-serif text-sm text-[#9ca3af] mb-3 leading-relaxed">
        This is not a resource allocation error. This is a structural property
        of your mandate: the shareholders who fund the colony require return on
        investment, and the mining operations that generate that return consume
        the same power reserves that keep colonists alive. Maximizing one
        degrades the other.
      </p>
      <div className="border border-[#ef444433] rounded p-3 mb-4 font-mono text-xs text-[#ef4444]">
        <strong>This conflict was present in your mandate before you took
        office.</strong> It is not solvable by better budgeting. It is a
        built-in contradiction between your two accountability obligations.
      </div>
      <p className="font-serif text-xs text-[#64748b] italic mb-4 border-l-2 border-[#2d3748] pl-3">
        In Oregon&apos;s HB 2021, a cost cap structurally favors electricity
        rates over emissions reduction. When the clean energy transition becomes
        expensive, the cost cap triggers, and emissions goals yield to
        affordability goals. The promise network contains a built-in conflict
        that the graph makes visible.
      </p>
      <button
        onClick={onDismiss}
        className="w-full font-mono text-sm font-bold text-[#f9fafb] bg-[#991b1b] py-2 rounded hover:bg-[#7f1d1d] focus-visible:ring-2 focus-visible:ring-[#ef4444] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a] transition-colors"
        autoFocus
      >
        ACKNOWLEDGE CONFLICT →
      </button>
    </>
  );
}

function NetworkHealthContent({ onDismiss }: { onDismiss: () => void }) {
  return (
    <>
      <div className="font-mono text-[10px] uppercase tracking-wider text-[#00ff88] mb-2">
        Teaching Moment — Network Health
      </div>
      <h2
        id="cascade-alert-title"
        className="font-mono text-base font-bold text-[#f9fafb] mb-4"
      >
        COLONY INTEGRITY SCORE
      </h2>
      <p className="font-serif text-sm text-[#e5e7eb] mb-3 leading-relaxed">
        Colony Integrity is the weighted average of all promise statuses across
        both your stakeholder groups. It is not about any single commitment —
        it&apos;s the structural health of your entire obligation network.
      </p>
      <div className="border border-[#2d3748] rounded p-3 mb-4 space-y-2 font-mono text-xs">
        <div>
          <span className="text-[#00ff88]">Colonist Trust</span>{" "}
          <span className="text-[#9ca3af]">
            weights survival and community promises. If it hits zero, the
            colony mutinies.
          </span>
        </div>
        <div>
          <span className="text-[#60a5fa]">Shareholder Confidence</span>{" "}
          <span className="text-[#9ca3af]">
            weights revenue and transparency promises. If it hits zero, Helios
            Corp pulls funding.
          </span>
        </div>
      </div>
      <p className="font-serif text-xs text-[#64748b] italic mb-4 border-l-2 border-[#2d3748] pl-3">
        This is how Promise Pipeline models accountability. The same scoring
        formula powers the Oregon HB 2021 dashboard — where the real promises,
        real dependencies, and real cascades are playing out now.
      </p>
      <button
        onClick={onDismiss}
        className="w-full font-mono text-sm font-bold text-[#0a0e1a] bg-[#00ff88] py-2 rounded hover:bg-[#00cc6a] focus-visible:ring-2 focus-visible:ring-[#00ff88] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a] transition-colors"
        autoFocus
      >
        BEGIN GOVERNANCE →
      </button>
    </>
  );
}
