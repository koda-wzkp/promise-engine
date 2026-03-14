"use client";

import { useReducer, useCallback, useState, useRef, useEffect } from "react";
import BillSearch from "@/components/annotate/BillSearch";
import BillTextViewer from "@/components/annotate/BillTextViewer";
import AnnotationCard from "@/components/annotate/AnnotationCard";
import {
  AnnotationState,
  AnnotationAction,
  BillMeta,
  PromiseCandidate,
  AnnotatedPromise,
} from "@/lib/types/annotation";

// ─── State Reducer ───

const initialState: AnnotationState = {
  phase: "search",
  bill: null,
  billText: "",
  candidates: [],
  currentIndex: 0,
  decisions: {},
  edits: {},
  extractionError: null,
};

function annotationReducer(
  state: AnnotationState,
  action: AnnotationAction
): AnnotationState {
  switch (action.type) {
    case "BILL_LOADED":
      return {
        ...state,
        phase: "extracting",
        bill: action.bill,
        billText: action.text,
        candidates: [],
        currentIndex: 0,
        decisions: {},
        edits: {},
        extractionError: null,
      };
    case "EXTRACTION_COMPLETE":
      return {
        ...state,
        phase: action.candidates.length > 0 ? "annotating" : "complete",
        candidates: action.candidates,
        currentIndex: 0,
      };
    case "EXTRACTION_FAILED":
      return { ...state, phase: "error", extractionError: action.error };
    case "ACCEPT": {
      const newDecisions = { ...state.decisions, [action.id]: "accepted" as const };
      const newEdits = action.edits
        ? { ...state.edits, [action.id]: action.edits }
        : state.edits;
      const nextIndex = findNextUndecided(
        state.candidates,
        state.currentIndex,
        newDecisions
      );
      return {
        ...state,
        decisions: newDecisions,
        edits: newEdits,
        currentIndex: nextIndex,
        phase: nextIndex === -1 ? "complete" : "annotating",
      };
    }
    case "REJECT": {
      const newDecisions = { ...state.decisions, [action.id]: "rejected" as const };
      const nextIndex = findNextUndecided(
        state.candidates,
        state.currentIndex,
        newDecisions
      );
      return {
        ...state,
        decisions: newDecisions,
        currentIndex: nextIndex,
        phase: nextIndex === -1 ? "complete" : "annotating",
      };
    }
    case "SKIP": {
      const newDecisions = { ...state.decisions, [action.id]: "skipped" as const };
      const nextIndex = findNextUndecided(
        state.candidates,
        state.currentIndex,
        newDecisions
      );
      return {
        ...state,
        decisions: newDecisions,
        currentIndex: nextIndex,
        phase: nextIndex === -1 ? "complete" : "annotating",
      };
    }
    case "PREVIOUS": {
      // Go back to the previous candidate
      let prevIndex = state.currentIndex - 1;
      while (prevIndex >= 0) {
        if (state.decisions[state.candidates[prevIndex].id] !== undefined) {
          break;
        }
        prevIndex--;
      }
      if (prevIndex < 0) prevIndex = 0;
      return { ...state, currentIndex: prevIndex, phase: "annotating" };
    }
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

function findNextUndecided(
  candidates: PromiseCandidate[],
  currentIndex: number,
  decisions: Record<string, string>
): number {
  // Look forward from current position
  for (let i = currentIndex + 1; i < candidates.length; i++) {
    if (!decisions[candidates[i].id]) return i;
  }
  // Wrap around and check from start
  for (let i = 0; i <= currentIndex; i++) {
    if (!decisions[candidates[i].id]) return i;
  }
  return -1; // All decided
}

// ─── Helper: Convert PromiseCandidate → AnnotatedPromise ───

function toAnnotatedPromise(
  candidate: PromiseCandidate,
  billMeta: BillMeta,
  status: "accepted" | "rejected" | "skipped",
  edits: Partial<PromiseCandidate> | undefined,
  acceptedCount: number,
  rejectedCount: number
): AnnotatedPromise {
  const merged = { ...candidate, ...(edits || {}) } as PromiseCandidate;
  const prefix = billMeta.slug.split("-")[0].toUpperCase();
  const wasEdited = !!edits && Object.keys(edits).length > 0;

  let finalId: string;
  if (status === "accepted") {
    finalId = `${prefix}-${String(acceptedCount + 1).padStart(3, "0")}`;
  } else if (status === "rejected") {
    finalId = `${prefix}-REJ-${String(rejectedCount + 1).padStart(3, "0")}`;
  } else {
    finalId = candidate.id; // skipped keeps candidate ID
  }

  return {
    id: finalId,
    ref: merged.ref,
    promiser: merged.promiser,
    promisee: merged.promisee,
    body: merged.body,
    domain: merged.domain,
    status: "declared",
    target: merged.target || undefined,
    progress: merged.progress ?? undefined,
    required: merged.required ?? undefined,
    note: merged.note,
    verification: {
      method: merged.verification.method,
      source: merged.verification.source || undefined,
      metric: merged.verification.metric || undefined,
      frequency: merged.verification.frequency || undefined,
    },
    depends_on: merged.depends_on || [],
    _annotation: {
      billSlug: billMeta.slug,
      billName: billMeta.name,
      jurisdiction: billMeta.jurisdiction,
      annotatedAt: new Date().toISOString(),
      annotationStatus: status,
      wasEdited,
      originalExtraction: {
        id: candidate.id,
        body: candidate.body,
        promiser: candidate.promiser,
        promisee: candidate.promisee,
        domain: candidate.domain,
        confidence: candidate.confidence,
      },
      sourceText: candidate.sourceText,
      confidence: candidate.confidence,
      claudeNotes: candidate.extractionNotes,
    },
  };
}

// ─── Main Page Component ───

export default function AnnotatePage() {
  const [state, dispatch] = useReducer(annotationReducer, initialState);
  const [retryCount, setRetryCount] = useState(0);
  const [rawResponseText, setRawResponseText] = useState("");
  const [transitionClass, setTransitionClass] = useState("annotate-card-enter");
  const [showBillTextDrawer, setShowBillTextDrawer] = useState(false);
  const savingRef = useRef(false);

  // Count decisions
  const stats = {
    accepted: Object.values(state.decisions).filter((d) => d === "accepted").length,
    edited: Object.entries(state.decisions)
      .filter(([, d]) => d === "accepted")
      .filter(([id]) => state.edits[id] && Object.keys(state.edits[id]).length > 0).length,
    rejected: Object.values(state.decisions).filter((d) => d === "rejected").length,
    skipped: Object.values(state.decisions).filter((d) => d === "skipped").length,
  };

  // Current candidate
  const currentCandidate =
    state.phase === "annotating" ? state.candidates[state.currentIndex] : null;

  // ─── Bill Loading ───

  const handleBillLoaded = useCallback(
    async (bill: BillMeta, text: string) => {
      dispatch({ type: "BILL_LOADED", bill, text });
      setRetryCount(0);

      try {
        const res = await fetch("/api/annotate/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ billText: text, billMeta: bill }),
        });

        if (res.status === 422) {
          const data = await res.json();
          dispatch({
            type: "EXTRACTION_FAILED",
            error: { type: "parse_failed", rawText: data.rawText || "" },
          });
          return;
        }

        if (!res.ok) {
          const data = await res.json();
          dispatch({
            type: "EXTRACTION_FAILED",
            error: {
              type: "parse_failed",
              rawText: data.error || `API error: ${res.status}`,
            },
          });
          return;
        }

        const data = await res.json();
        dispatch({
          type: "EXTRACTION_COMPLETE",
          candidates: data.candidates || [],
        });
      } catch (err) {
        dispatch({
          type: "EXTRACTION_FAILED",
          error: {
            type: "parse_failed",
            rawText:
              err instanceof Error ? err.message : "Network error",
          },
        });
      }
    },
    []
  );

  // ─── Retry extraction ───

  const handleRetry = useCallback(async () => {
    if (!state.bill || !state.billText) return;
    setRetryCount((c) => c + 1);
    dispatch({ type: "BILL_LOADED", bill: state.bill, text: state.billText });

    try {
      const res = await fetch("/api/annotate/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billText: state.billText,
          billMeta: state.bill,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        dispatch({
          type: "EXTRACTION_FAILED",
          error: {
            type: "parse_failed",
            rawText: data.rawText || data.error || "",
          },
        });
        return;
      }

      const data = await res.json();
      dispatch({
        type: "EXTRACTION_COMPLETE",
        candidates: data.candidates || [],
      });
    } catch (err) {
      dispatch({
        type: "EXTRACTION_FAILED",
        error: {
          type: "parse_failed",
          rawText:
            err instanceof Error ? err.message : "Network error",
        },
      });
    }
  }, [state.bill, state.billText]);

  // ─── Auto-save on decision ───

  const saveDecision = useCallback(
    async (
      candidateId: string,
      action: "accept" | "reject" | "skip"
    ) => {
      if (savingRef.current || !state.bill) return;
      savingRef.current = true;

      const candidate = state.candidates.find((c) => c.id === candidateId);
      if (!candidate) {
        savingRef.current = false;
        return;
      }

      const edits = state.edits[candidateId];
      const annotated = toAnnotatedPromise(
        candidate,
        state.bill,
        action === "accept" ? "accepted" : action === "reject" ? "rejected" : "skipped",
        edits,
        stats.accepted,
        stats.rejected
      );

      try {
        await fetch("/api/annotate/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            billSlug: state.bill.slug,
            billMeta: state.bill,
            promise: annotated,
            action,
          }),
        });
      } catch {
        // Save failed — continue anyway; data is in state
      } finally {
        savingRef.current = false;
      }
    },
    [state.bill, state.candidates, state.edits, stats.accepted, stats.rejected]
  );

  // ─── Action handlers ───

  function triggerTransition(type: "slide" | "fade") {
    setTransitionClass(
      type === "slide" ? "annotate-card-exit-left" : "annotate-card-fade-out"
    );
    setTimeout(() => {
      setTransitionClass(
        type === "slide" ? "annotate-card-enter" : "annotate-card-fade-in"
      );
    }, 200);
  }

  const handleAccept = useCallback(
    (id: string, edits?: Partial<PromiseCandidate>) => {
      triggerTransition("slide");
      setTimeout(() => {
        dispatch({ type: "ACCEPT", id, edits });
        saveDecision(id, "accept");
      }, 200);
    },
    [saveDecision]
  );

  const handleReject = useCallback(
    (id: string) => {
      triggerTransition("slide");
      setTimeout(() => {
        dispatch({ type: "REJECT", id });
        saveDecision(id, "reject");
      }, 200);
    },
    [saveDecision]
  );

  const handleSkip = useCallback(
    (id: string) => {
      triggerTransition("fade");
      setTimeout(() => {
        dispatch({ type: "SKIP", id });
        saveDecision(id, "skip");
      }, 200);
    },
    [saveDecision]
  );

  const handlePrevious = useCallback(() => {
    dispatch({ type: "PREVIOUS" });
  }, []);

  // ─── Export ───

  const handleExport = useCallback(() => {
    if (!state.bill) return;

    const promises = state.candidates
      .filter((c) => state.decisions[c.id])
      .map((c, idx) => {
        const decision = state.decisions[c.id];
        return toAnnotatedPromise(
          c,
          state.bill!,
          decision,
          state.edits[c.id],
          // Recount up to this index
          state.candidates
            .slice(0, idx)
            .filter((p) => state.decisions[p.id] === "accepted").length,
          state.candidates
            .slice(0, idx)
            .filter((p) => state.decisions[p.id] === "rejected").length
        );
      });

    const exportData = {
      bill: state.bill,
      stats,
      promises,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.bill.slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.bill, state.candidates, state.decisions, state.edits, stats]);

  // ─── Render ───

  return (
    <main
      id="main-content"
      className="min-h-screen"
      style={{ background: "#faf9f6" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-semibold text-[#1f2937]">
            Promise Annotation Tool
          </h1>
          <p className="text-sm text-[#4b5563] mt-1 font-sans">
            Extract and verify legislative promises for ML training data
          </p>
        </div>

        {/* Phase: Search */}
        {state.phase === "search" && (
          <BillSearch onBillLoaded={handleBillLoaded} />
        )}

        {/* Phase: Extracting */}
        {state.phase === "extracting" && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-[#1a5f4a] rounded-full animate-spin" />
            <p className="text-sm text-[#4b5563] font-sans">
              Extracting promise candidates from{" "}
              <span className="font-medium text-[#1f2937]">
                {state.bill?.name}
              </span>
              ...
            </p>
            <p className="text-xs text-[#4b5563]">
              This may take a minute for long bills
            </p>
          </div>
        )}

        {/* Phase: Error */}
        {state.phase === "error" && state.extractionError && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div
              className="px-4 py-3 rounded-md text-sm font-sans"
              style={{ background: "#fef2f2", color: "#991b1b" }}
              role="alert"
            >
              Claude returned a response that couldn&apos;t be parsed.
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                disabled={retryCount >= 2}
                className="px-4 py-2 text-sm font-medium text-white rounded-md
                  bg-[#1f2937] hover:bg-[#374151] disabled:opacity-50
                  focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Retry ({2 - retryCount} remaining)
              </button>
              <button
                onClick={() => dispatch({ type: "RESET" })}
                className="px-4 py-2 text-sm font-medium text-[#4b5563] border border-gray-300 rounded-md
                  hover:bg-gray-50
                  focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Start over
              </button>
            </div>
            {retryCount >= 2 && (
              <div>
                <p className="text-sm text-[#4b5563] mb-2">
                  Edit the raw response and try parsing manually:
                </p>
                <textarea
                  value={rawResponseText || state.extractionError.rawText}
                  onChange={(e) => setRawResponseText(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs
                    focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                  aria-label="Raw Claude response"
                />
                <button
                  onClick={() => {
                    try {
                      const clean = (rawResponseText || state.extractionError!.rawText)
                        .replace(/```json|```/g, "")
                        .trim();
                      const parsed = JSON.parse(clean);
                      dispatch({
                        type: "EXTRACTION_COMPLETE",
                        candidates: parsed,
                      });
                    } catch {
                      alert("Still not valid JSON. Check the format.");
                    }
                  }}
                  className="mt-2 px-4 py-2 text-sm font-medium text-white rounded-md
                    bg-[#1a5f4a] hover:bg-[#155e3d]
                    focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Parse manually
                </button>
              </div>
            )}
            {retryCount < 2 && state.extractionError.rawText && (
              <details className="text-xs">
                <summary className="cursor-pointer text-[#4b5563] font-medium focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none">
                  View raw response
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded-md overflow-x-auto font-mono text-[11px] text-[#4b5563]">
                  {state.extractionError.rawText}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Phase: Annotating */}
        {state.phase === "annotating" && currentCandidate && state.bill && (
          <div>
            {/* Progress header */}
            <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg font-serif font-medium text-[#1f2937]">
                {state.bill.name}
              </h2>
              <button
                onClick={handleExport}
                className="px-3 py-1.5 text-xs font-medium text-[#4b5563] border border-gray-300 rounded-md
                  hover:bg-gray-50
                  focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Export JSON
              </button>
            </div>

            {/* Split layout */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Left panel: Bill text (desktop) */}
              <div className="hidden lg:block lg:w-[40%] border border-gray-200 rounded-lg bg-white overflow-hidden">
                <div className="h-[calc(100vh-220px)]">
                  <BillTextViewer
                    text={state.billText}
                    sourceText={currentCandidate.sourceText}
                    sourceRef={currentCandidate.ref}
                  />
                </div>
              </div>

              {/* Mobile: bill text drawer toggle */}
              <div className="lg:hidden">
                <button
                  onClick={() => setShowBillTextDrawer(!showBillTextDrawer)}
                  className="w-full px-3 py-2 text-sm font-medium text-[#4b5563] border border-gray-300 rounded-md
                    hover:bg-gray-50
                    focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                  aria-expanded={showBillTextDrawer}
                >
                  {showBillTextDrawer ? "Hide" : "View"} source text
                </button>
                {showBillTextDrawer && (
                  <div className="mt-2 border border-gray-200 rounded-lg bg-white h-64 overflow-hidden">
                    <BillTextViewer
                      text={state.billText}
                      sourceText={currentCandidate.sourceText}
                      sourceRef={currentCandidate.ref}
                    />
                  </div>
                )}
              </div>

              {/* Right panel: Annotation card */}
              <div className="lg:w-[60%]">
                <AnnotationCard
                  key={currentCandidate.id}
                  candidate={currentCandidate}
                  index={state.currentIndex}
                  total={state.candidates.length}
                  stats={stats}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onSkip={handleSkip}
                  onPrevious={handlePrevious}
                  hasPrevious={state.currentIndex > 0}
                  transitionClass={transitionClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* Phase: Complete */}
        {state.phase === "complete" && state.bill && (
          <div className="max-w-md mx-auto text-center py-20 space-y-6">
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
              style={{ background: "#ecfdf5" }}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#1a5f4a"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-serif font-medium text-[#1f2937]">
                {stats.accepted} promise{stats.accepted !== 1 ? "s" : ""}{" "}
                verified from {state.bill.name}
              </p>
              {state.candidates.length === 0 ? (
                <p className="text-sm text-[#4b5563] mt-2">
                  No promise candidates found in this text. Try the manual
                  paste option or search for a different bill.
                </p>
              ) : (
                <p className="text-sm text-[#4b5563] mt-2">
                  {stats.rejected} rejected · {stats.skipped} skipped
                </p>
              )}
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => dispatch({ type: "RESET" })}
                className="px-5 py-2 text-sm font-medium text-white rounded-md
                  bg-[#1f2937] hover:bg-[#374151]
                  focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Start new bill
              </button>
              <button
                onClick={handleExport}
                className="px-5 py-2 text-sm font-medium text-[#4b5563] border border-gray-300 rounded-md
                  hover:bg-gray-50
                  focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Export all data
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
