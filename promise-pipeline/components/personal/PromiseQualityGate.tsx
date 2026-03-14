"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { PromiseQualityEvaluation } from "@/lib/types/quality";

interface PromiseQualityGateProps {
  promiseText: string;
  domain?: string;
  onTextChange: (newText: string) => void;
  onEvaluationComplete: (evaluation: PromiseQualityEvaluation) => void;
}

type CriterionKey = "autonomous" | "observable" | "specific" | "affirmative";

const CRITERIA_LABELS: Record<CriterionKey, string> = {
  autonomous: "Autonomous",
  observable: "Observable",
  specific: "Specific",
  affirmative: "Affirmative",
};

export default function PromiseQualityGate({
  promiseText,
  domain,
  onTextChange,
  onEvaluationComplete,
}: PromiseQualityGateProps) {
  const [evaluation, setEvaluation] =
    useState<PromiseQualityEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedCriterion, setExpandedCriterion] =
    useState<CriterionKey | null>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Reset evaluation when promise text changes
  useEffect(() => {
    setEvaluation(null);
    setExpandedCriterion(null);
  }, [promiseText]);

  const checkPromise = useCallback(async () => {
    if (!promiseText.trim() || promiseText.trim().length < 3) return;

    setLoading(true);
    setEvaluation(null);

    try {
      const response = await fetch("/api/evaluate-promise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promise_text: promiseText,
          domain: domain || undefined,
          tier: "personal",
        }),
      });

      if (!response.ok) {
        throw new Error("API error");
      }

      const data = await response.json();
      const eval_result: PromiseQualityEvaluation = {
        autonomous: data.evaluation.autonomous,
        observable: data.evaluation.observable,
        specific: data.evaluation.specific,
        affirmative: data.evaluation.affirmative,
        passes_all: data.evaluation.passes_all,
        reframes: data.evaluation.reframes || [],
        encouragement: data.evaluation.encouragement || "",
        evaluated_by: data.evaluation.evaluated_by,
        evaluated_at: data.evaluation.evaluated_at,
        was_overridden: false,
        reframe_selected: null,
      };

      setEvaluation(eval_result);
      onEvaluationComplete(eval_result);
    } catch {
      // On any error, the API already falls back to rules-only.
      // If even the fetch fails, just silently do nothing.
      setEvaluation(null);
    } finally {
      setLoading(false);
    }
  }, [promiseText, domain, onEvaluationComplete]);

  const selectReframe = useCallback(
    (reframe: string) => {
      onTextChange(reframe);
      if (evaluation) {
        const updated: PromiseQualityEvaluation = {
          ...evaluation,
          reframe_selected: reframe,
        };
        setEvaluation(updated);
        onEvaluationComplete(updated);
      }
    },
    [evaluation, onTextChange, onEvaluationComplete],
  );

  const keepOriginal = useCallback(() => {
    if (evaluation) {
      const updated: PromiseQualityEvaluation = {
        ...evaluation,
        was_overridden: true,
      };
      setEvaluation(updated);
      onEvaluationComplete(updated);

      // Log for analytics
      if (process.env.NODE_ENV === "development") {
        console.log("[Promise Quality]", {
          tier: "personal",
          domain: domain || "general",
          passes_all: evaluation.passes_all,
          criteria_results: {
            autonomous: evaluation.autonomous.pass,
            observable: evaluation.observable.pass,
            specific: evaluation.specific.pass,
            affirmative: evaluation.affirmative.pass,
          },
          reframe_count: evaluation.reframes.length,
          override: true,
          reframe_selected: false,
        });
      }
    }
  }, [evaluation, domain, onEvaluationComplete]);

  const toggleCriterion = useCallback(
    (key: CriterionKey) => {
      setExpandedCriterion((prev) => (prev === key ? null : key));
    },
    [],
  );

  // Nothing to show if no text
  if (!promiseText.trim()) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* Check button */}
      {!evaluation && !loading && (
        <button
          type="button"
          onClick={checkPromise}
          className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Check my promise
        </button>
      )}

      {/* Live region for screen readers */}
      <div ref={liveRegionRef} aria-live="polite" className="sr-only">
        {loading && "Checking your promise\u2026"}
        {evaluation &&
          (evaluation.passes_all
            ? "All four criteria pass. Well-formed promise."
            : `${
                [
                  !evaluation.autonomous.pass && "Autonomous",
                  !evaluation.observable.pass && "Observable",
                  !evaluation.specific.pass && "Specific",
                  !evaluation.affirmative.pass && "Affirmative",
                ]
                  .filter(Boolean)
                  .join(", ")
              } criteria need attention.`)}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {(
              Object.keys(CRITERIA_LABELS) as CriterionKey[]
            ).map((key) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-mono text-gray-400 motion-safe:animate-pulse"
              >
                <span className="h-2 w-2 rounded-full bg-gray-300" />
                {CRITERIA_LABELS[key]}
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-400">
            Checking your promise&hellip;
          </span>
        </div>
      )}

      {/* Evaluation results */}
      {evaluation && (
        <div className="space-y-3">
          {/* Criteria pills */}
          <div className="flex flex-wrap gap-1.5">
            {(
              Object.keys(CRITERIA_LABELS) as CriterionKey[]
            ).map((key) => {
              const criterion = evaluation[key];
              const pass = criterion.pass;
              const isExpanded = expandedCriterion === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleCriterion(key)}
                  role="status"
                  aria-label={`${CRITERIA_LABELS[key]}: ${pass ? "passing" : "failing"}`}
                  aria-expanded={isExpanded}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-mono transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                    pass
                      ? "bg-[#ecfdf5] text-[#1a5f4a]"
                      : "bg-[#fffbeb] text-[#78350f]"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      pass ? "bg-[#1a5f4a]" : "bg-[#78350f]"
                    }`}
                  />
                  {CRITERIA_LABELS[key]}
                </button>
              );
            })}
          </div>

          {/* Expanded reason */}
          {expandedCriterion && evaluation[expandedCriterion] && (
            <p className="rounded bg-gray-50 px-3 py-2 text-xs text-gray-700">
              <span className="font-semibold">
                {CRITERIA_LABELS[expandedCriterion]}:
              </span>{" "}
              {evaluation[expandedCriterion].reason}
            </p>
          )}

          {/* Passing state */}
          {evaluation.passes_all && (
            <div className="rounded-lg border border-[#ecfdf5] bg-[#ecfdf5] px-3 py-2">
              <p className="text-sm font-medium text-[#1a5f4a]">
                Well-formed promise &mdash; all four criteria pass.
              </p>
              <p className="mt-0.5 text-xs text-[#1a5f4a]/80">
                {evaluation.encouragement}
              </p>
            </div>
          )}

          {/* Reframe cards */}
          {!evaluation.passes_all && evaluation.reframes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">
                Consider these alternatives:
              </p>
              {evaluation.reframes.map((reframe, i) => (
                <div
                  key={i}
                  className="group flex items-start justify-between gap-3 rounded-lg border border-[#e5e2db] bg-white px-3 py-2.5 border-l-[3px] border-l-[#1e40af]"
                >
                  <p className="flex-1 text-sm text-gray-800">
                    &ldquo;{reframe}&rdquo;
                  </p>
                  <button
                    type="button"
                    role="button"
                    tabIndex={0}
                    onClick={() => selectReframe(reframe)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        selectReframe(reframe);
                      }
                    }}
                    className="shrink-0 rounded border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    Use this
                  </button>
                </div>
              ))}

              {/* Override option */}
              {!evaluation.was_overridden && (
                <button
                  type="button"
                  onClick={keepOriginal}
                  className="mt-1 text-xs text-[#4b5563] hover:underline transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Keep my original wording &rarr;
                </button>
              )}
              {evaluation.was_overridden && (
                <p className="mt-1 text-xs text-[#4b5563]">
                  Keeping your original wording. Your promise, your call.
                </p>
              )}
            </div>
          )}

          {/* Encouragement for failing promises without reframes (rules-only fallback) */}
          {!evaluation.passes_all && evaluation.reframes.length === 0 && (
            <p className="text-xs text-gray-500">
              {evaluation.encouragement}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
