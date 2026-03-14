"use client";

import { MarsGameState, MarsGameAction } from "../../../lib/types/mars-game";
import { computeVerdict } from "../../../lib/games/mars-engine";
import { computeStatus } from "../../../lib/games/mars-engine";

interface VerdictScreenProps {
  state: MarsGameState;
  dispatch: (action: MarsGameAction) => void;
}

const BOARD_COLORS: Record<string, string> = {
  Retain: "#00ff88",
  Probation: "#f59e0b",
  Terminate: "#ef4444",
};

export default function VerdictScreen({ state, dispatch }: VerdictScreenProps) {
  const { boardRecommendation, colonistResult, colonistVotePercent } =
    computeVerdict(state);

  const p4 = state.promises.find((p) => p.id === "P4")!;
  const p5 = state.promises.find((p) => p.id === "P5")!;

  const miningStatus =
    p4.progress >= 60
      ? "On schedule"
      : p4.progress >= 30
        ? "Behind schedule"
        : "Not operational";

  const returnStatus =
    p5.progress >= 80
      ? "Achieved"
      : p5.progress >= 40
        ? "Partial"
        : "Failed";

  // Determine what actually happened for post-mortem
  const p3 = state.promises.find((p) => p.id === "P3")!;
  const hasCascade =
    state.quarterHistory.some((q) => q.cascades.length > 0);
  const hasVerificationGap = state.teachingMomentsSeen.has("verification-gap");
  const hasStructuralConflict = state.quarterHistory.some(
    (q) => q.cascades.some((c) => c.sourcePromiseId === "P4")
  );

  // Which promises were sacrificed (violated)?
  const violatedPromises = state.promises
    .filter((p) => computeStatus(p) === "violated")
    .map((p) => p.id);

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
        aria-labelledby="verdict-title"
      >
        <h1
          id="verdict-title"
          className="font-mono text-lg font-bold text-[#f9fafb] mb-6 text-center"
        >
          TERM ASSESSMENT — MARTIAN YEAR 47
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Board assessment */}
          <div className="border border-[#2d3748] rounded p-5 font-mono">
            <div className="text-[10px] uppercase tracking-wider text-[#9ca3af] mb-3">
              Helios Corp — Board Assessment
            </div>
            <h2 className="text-xs font-bold text-[#f5a623] mb-4">
              GOVERNOR-CEO PERFORMANCE REVIEW
            </h2>

            <div className="space-y-2 text-xs mb-4">
              <ScoreLine
                label="Colony Integrity"
                value={`${Math.round(state.colonyIntegrity)}/100`}
                color={
                  state.colonyIntegrity >= 60
                    ? "#00ff88"
                    : state.colonyIntegrity >= 30
                      ? "#f59e0b"
                      : "#ef4444"
                }
              />
              <ScoreLine
                label="Shareholder Confidence"
                value={`${Math.round(state.shareholderConfidence)}/100`}
                color={
                  state.shareholderConfidence >= 60
                    ? "#00ff88"
                    : state.shareholderConfidence >= 30
                      ? "#f59e0b"
                      : "#ef4444"
                }
              />
              <ScoreLine
                label="Colonist Trust"
                value={`${Math.round(state.colonistTrust)}/100`}
                color={
                  state.colonistTrust >= 60
                    ? "#00ff88"
                    : state.colonistTrust >= 30
                      ? "#f59e0b"
                      : "#ef4444"
                }
              />
            </div>

            <div className="border-t border-[#2d3748] pt-3 space-y-1 text-xs">
              <ScoreLine
                label="Mining Operations"
                value={miningStatus}
                color={
                  miningStatus === "On schedule"
                    ? "#00ff88"
                    : miningStatus === "Behind schedule"
                      ? "#f59e0b"
                      : "#ef4444"
                }
              />
              <ScoreLine
                label="Shareholder Return"
                value={returnStatus}
                color={
                  returnStatus === "Achieved"
                    ? "#00ff88"
                    : returnStatus === "Partial"
                      ? "#f59e0b"
                      : "#ef4444"
                }
              />
            </div>

            <div className="mt-4 border border-[#2d3748] rounded p-3">
              <div className="text-[10px] text-[#9ca3af] uppercase tracking-wider mb-1">
                Board Recommendation
              </div>
              <div
                className="text-lg font-bold"
                style={{ color: BOARD_COLORS[boardRecommendation] }}
                aria-label={`Board recommendation: ${boardRecommendation}`}
              >
                {boardRecommendation.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Colonist referendum */}
          <div className="border border-[#2d3748] rounded p-5 font-mono">
            <div className="text-[10px] uppercase tracking-wider text-[#9ca3af] mb-3">
              Ares Station Colonist Referendum
            </div>
            <h2 className="text-xs font-bold text-[#00ff88] mb-4">
              GOVERNANCE CONFIDENCE VOTE
            </h2>

            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between text-[#9ca3af]">
                <span>Registered colonists:</span>
                <span className="text-[#e5e7eb]">2,847</span>
              </div>
              <div className="flex justify-between text-[#9ca3af]">
                <span>Votes cast:</span>
                <span className="text-[#e5e7eb]">2,614 (91.8%)</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#9ca3af]">In favor of retention:</span>
                <span className="text-[#e5e7eb] font-bold">
                  {Math.round(colonistVotePercent)}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-[#2d3748] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#00ff88] transition-all duration-1000"
                  style={{ width: `${colonistVotePercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] mt-0.5">
                <span className="text-[#9ca3af]">
                  Against: {Math.round(100 - colonistVotePercent)}%
                </span>
              </div>
            </div>

            <div className="border border-[#2d3748] rounded p-3">
              <div className="text-[10px] text-[#9ca3af] uppercase tracking-wider mb-1">
                Referendum Result
              </div>
              <div
                className="text-lg font-bold"
                style={{
                  color:
                    colonistResult === "RETAINED" ? "#00ff88" : "#ef4444",
                }}
                aria-label={`Colonist referendum result: ${colonistResult}`}
              >
                {colonistResult}
              </div>
            </div>
          </div>
        </div>

        {/* Post-mortem */}
        <div className="border border-[#2d3748] rounded p-5 mb-6">
          <h2 className="font-mono text-xs font-bold text-[#f5a623] uppercase tracking-wider mb-4">
            Structural Analysis — What the Graph Showed
          </h2>

          <div className="font-serif text-sm text-[#e5e7eb] space-y-4 leading-relaxed">
            {hasCascade && (
              <p>
                <strong className="text-[#f9fafb]">Cascade propagation:</strong>{" "}
                When water reclamation (P3) dropped below threshold, the failure
                propagated through P1 (life support), P2 (hab expansion), and P4
                (mining) — four consequences from a single underfunded promise.
                In a promise network, failure doesn&apos;t stay local.
              </p>
            )}

            {state.structuralConflictTriggered && (
              <p>
                <strong className="text-[#f9fafb]">Structural conflict:</strong>{" "}
                The conflict between mining revenue and life support was designed
                into your mandate. No amount of optimization resolves a
                structural contradiction — it can only be made visible.
              </p>
            )}

            {hasVerificationGap && (
              <p>
                <strong className="text-[#f9fafb]">Verification gap:</strong>{" "}
                You invested funds in radiation shielding (P7). Whether it
                worked remains unknown. The verification gap isn&apos;t about
                effort — it&apos;s about who controls the measurement.
              </p>
            )}

            {violatedPromises.length > 0 ? (
              <p>
                <strong className="text-[#f9fafb]">Promise triage:</strong>{" "}
                {violatedPromises.length > 0 && (
                  <>
                    {violatedPromises.join(", ")} ended in violation. The dual
                    accountability structure forced a triage that single-constituency
                    governance doesn&apos;t require. You chose who to fail.
                  </>
                )}
              </p>
            ) : (
              <p>
                <strong className="text-[#f9fafb]">Resilience:</strong> You kept
                all promises from violation. That required sustained investment
                across a structurally underfunded mandate. The dual accountability
                structure made every allocation a compromise.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => dispatch({ type: "VIEW_CTA" })}
            className="flex-1 font-mono text-sm font-bold text-[#0a0e1a] bg-[#f5a623] py-3 rounded hover:bg-[#c4841a] focus-visible:ring-2 focus-visible:ring-[#f5a623] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a] transition-colors"
          >
            CONTINUE →
          </button>
          <button
            onClick={() => dispatch({ type: "RESTART" })}
            className="px-6 font-mono text-sm font-bold text-[#9ca3af] border border-[#2d3748] py-3 rounded hover:border-[#9ca3af] hover:text-[#e5e7eb] focus-visible:ring-2 focus-visible:ring-[#9ca3af] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a] transition-colors"
          >
            Play Again
          </button>
        </div>
      </section>
    </main>
  );
}

function ScoreLine({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-[#9ca3af]">{label}:</span>
      <span className="font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
