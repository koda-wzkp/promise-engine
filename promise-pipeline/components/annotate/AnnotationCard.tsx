"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PromiseCandidate } from "@/lib/types/annotation";
import { hb2021DomainColors } from "@/lib/utils/colors";

const DOMAINS = [
  "Emissions",
  "Planning",
  "Verification",
  "Equity",
  "Affordability",
  "Tribal",
  "Workforce",
  "Safety",
  "Transparency",
  "Other",
];

const VERIFICATION_METHODS = [
  "filing",
  "audit",
  "self-report",
  "sensor",
  "benchmark",
  "none",
] as const;

interface AnnotationCardProps {
  candidate: PromiseCandidate;
  index: number;
  total: number;
  stats: { accepted: number; edited: number; rejected: number; skipped: number };
  onAccept: (id: string, edits?: Partial<PromiseCandidate>) => void;
  onReject: (id: string) => void;
  onSkip: (id: string) => void;
  onPrevious: () => void;
  hasPrevious: boolean;
  transitionClass: string;
}

function getConfidenceColor(c: number): string {
  if (c >= 0.85) return "#1a5f4a";
  if (c >= 0.65) return "#78350f";
  return "#991b1b";
}

function getConfidenceBg(c: number): string {
  if (c >= 0.85) return "#ecfdf5";
  if (c >= 0.65) return "#fffbeb";
  return "#fef2f2";
}

function extractCommitmentType(notes: string): string | null {
  const match = notes.match(/commitment_type:\s*(\S+)/);
  return match ? match[1] : null;
}

export default function AnnotationCard({
  candidate,
  index,
  total,
  stats,
  onAccept,
  onReject,
  onSkip,
  onPrevious,
  hasPrevious,
  transitionClass,
}: AnnotationCardProps) {
  const [edits, setEdits] = useState<Partial<PromiseCandidate>>({});
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Reset edits when candidate changes
  useEffect(() => {
    setEdits({});
    setEditingField(null);
    setShowDetails(false);
  }, [candidate.id]);

  const current = { ...candidate, ...edits } as PromiseCandidate;
  const commitmentType = extractCommitmentType(current.extractionNotes);
  const domainColor = hb2021DomainColors[current.domain] || "#6b7280";
  const hasEdits = Object.keys(edits).length > 0;

  const handleAccept = useCallback(() => {
    onAccept(candidate.id, hasEdits ? edits : undefined);
  }, [candidate.id, edits, hasEdits, onAccept]);

  const handleReject = useCallback(() => {
    onReject(candidate.id);
  }, [candidate.id, onReject]);

  const handleSkip = useCallback(() => {
    onSkip(candidate.id);
  }, [candidate.id, onSkip]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "a":
          handleAccept();
          break;
        case "r":
          handleReject();
          break;
        case "s":
          handleSkip();
          break;
        case "e":
          e.preventDefault();
          setEditingField("body");
          setTimeout(() => bodyRef.current?.focus(), 50);
          break;
        case "arrowleft":
          if (hasPrevious) onPrevious();
          break;
        case "arrowright":
          handleAccept();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAccept, handleReject, handleSkip, hasPrevious, onPrevious]);

  function updateEdit<K extends keyof PromiseCandidate>(
    field: K,
    value: PromiseCandidate[K]
  ) {
    setEdits((prev) => ({ ...prev, [field]: value }));
  }

  function updateVerification(
    field: keyof PromiseCandidate["verification"],
    value: string | null
  ) {
    setEdits((prev) => ({
      ...prev,
      verification: { ...current.verification, [field]: value },
    }));
  }

  return (
    <div
      className={`${transitionClass} border rounded-lg bg-white shadow-sm`}
      style={{ borderLeftWidth: "4px", borderLeftColor: domainColor }}
    >
      {/* Progress header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between text-xs text-[#4b5563] font-sans">
          <span>
            Promise {index + 1} of {total}
          </span>
          <span>
            {stats.accepted} accepted{" "}
            {stats.edited > 0 && `· ${stats.edited} edited `}·{" "}
            {stats.rejected} rejected · {stats.skipped} skipped
          </span>
        </div>
      </div>

      {/* Card header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-[#4b5563]">
              {candidate.id}
            </span>
            <span
              className="inline-block px-2 py-0.5 rounded text-xs font-medium"
              style={{ background: domainColor + "18", color: domainColor }}
            >
              {current.domain}
            </span>
            <span
              className="inline-block px-2 py-0.5 rounded text-xs font-medium"
              style={{ background: "#eff6ff", color: "#1e40af" }}
            >
              {current.verification.method}
            </span>
            {commitmentType && (
              <span
                className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                style={{ background: "#fffbeb", color: "#78350f" }}
              >
                ⚠ {commitmentType} — review domain assignment
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#4b5563]">Confidence:</span>
            <span
              className="inline-block px-2 py-0.5 rounded text-xs font-semibold"
              style={{
                background: getConfidenceBg(current.confidence),
                color: getConfidenceColor(current.confidence),
              }}
            >
              {Math.round(current.confidence * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Low confidence warning */}
      {current.confidence < 0.65 && (
        <div
          className="mx-4 mt-3 px-3 py-2 rounded text-xs font-sans"
          style={{ background: "#fef2f2", color: "#991b1b" }}
          role="alert"
        >
          Claude is uncertain — review carefully
        </div>
      )}

      {/* Editable fields */}
      <div className="p-4 space-y-4">
        {/* Body */}
        <div>
          <label
            htmlFor={`field-body-${candidate.id}`}
            className="block text-xs font-medium text-[#4b5563] mb-1"
          >
            Commitment
          </label>
          {editingField === "body" ? (
            <textarea
              ref={bodyRef}
              id={`field-body-${candidate.id}`}
              value={current.body}
              onChange={(e) => updateEdit("body", e.target.value)}
              onBlur={() => setEditingField(null)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-sans text-sm
                focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          ) : (
            <button
              id={`field-body-${candidate.id}`}
              onClick={() => setEditingField("body")}
              className="w-full text-left px-3 py-2 text-sm font-sans text-[#1f2937] rounded-md
                hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {current.body}
            </button>
          )}
        </div>

        {/* Promiser / Promisee row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor={`field-promiser-${candidate.id}`}
              className="block text-xs font-medium text-[#4b5563] mb-1"
            >
              Promiser
            </label>
            <input
              id={`field-promiser-${candidate.id}`}
              type="text"
              value={current.promiser}
              onChange={(e) => updateEdit("promiser", e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-sans text-sm
                focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor={`field-promisee-${candidate.id}`}
              className="block text-xs font-medium text-[#4b5563] mb-1"
            >
              Promisee
            </label>
            <input
              id={`field-promisee-${candidate.id}`}
              type="text"
              value={current.promisee}
              onChange={(e) => updateEdit("promisee", e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-sans text-sm
                focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          </div>
        </div>

        {/* Domain / Ref row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor={`field-domain-${candidate.id}`}
              className="block text-xs font-medium text-[#4b5563] mb-1"
            >
              Domain
            </label>
            <select
              id={`field-domain-${candidate.id}`}
              value={current.domain}
              onChange={(e) => updateEdit("domain", e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-sans text-sm
                focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor={`field-ref-${candidate.id}`}
              className="block text-xs font-medium text-[#4b5563] mb-1"
            >
              Statutory reference
            </label>
            <input
              id={`field-ref-${candidate.id}`}
              type="text"
              value={current.ref}
              onChange={(e) => updateEdit("ref", e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono text-sm
                focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          </div>
        </div>

        {/* Target / Progress / Required row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label
              htmlFor={`field-target-${candidate.id}`}
              className="block text-xs font-medium text-[#4b5563] mb-1"
            >
              Target date
            </label>
            <input
              id={`field-target-${candidate.id}`}
              type="text"
              value={current.target || ""}
              onChange={(e) =>
                updateEdit("target", e.target.value || null)
              }
              placeholder="YYYY-MM-DD or none"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono text-sm
                focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor={`field-progress-${candidate.id}`}
              className="block text-xs font-medium text-[#4b5563] mb-1"
            >
              Progress (0-100)
            </label>
            <input
              id={`field-progress-${candidate.id}`}
              type="number"
              min={0}
              max={100}
              value={current.progress ?? ""}
              onChange={(e) =>
                updateEdit(
                  "progress",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-sans text-sm
                focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor={`field-required-${candidate.id}`}
              className="block text-xs font-medium text-[#4b5563] mb-1"
            >
              Required (0-100)
            </label>
            <input
              id={`field-required-${candidate.id}`}
              type="number"
              min={0}
              max={100}
              value={current.required ?? ""}
              onChange={(e) =>
                updateEdit(
                  "required",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-sans text-sm
                focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          </div>
        </div>

        {/* Verification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor={`field-vmethod-${candidate.id}`}
              className="block text-xs font-medium text-[#4b5563] mb-1"
            >
              Verification method
            </label>
            <select
              id={`field-vmethod-${candidate.id}`}
              value={current.verification.method}
              onChange={(e) =>
                updateVerification(
                  "method",
                  e.target.value
                )
              }
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-sans text-sm
                focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {VERIFICATION_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor={`field-vsource-${candidate.id}`}
              className="block text-xs font-medium text-[#4b5563] mb-1"
            >
              Verification source
            </label>
            <input
              id={`field-vsource-${candidate.id}`}
              type="text"
              value={current.verification.source || ""}
              onChange={(e) =>
                updateVerification("source", e.target.value || null)
              }
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-sans text-sm
                focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor={`field-vmetric-${candidate.id}`}
              className="block text-xs font-medium text-[#4b5563] mb-1"
            >
              Verification metric
            </label>
            <input
              id={`field-vmetric-${candidate.id}`}
              type="text"
              value={current.verification.metric || ""}
              onChange={(e) =>
                updateVerification("metric", e.target.value || null)
              }
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-sans text-sm
                focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor={`field-vfreq-${candidate.id}`}
              className="block text-xs font-medium text-[#4b5563] mb-1"
            >
              Verification frequency
            </label>
            <input
              id={`field-vfreq-${candidate.id}`}
              type="text"
              value={current.verification.frequency || ""}
              onChange={(e) =>
                updateVerification("frequency", e.target.value || null)
              }
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-sans text-sm
                focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          </div>
        </div>

        {/* Note */}
        <div>
          <label
            htmlFor={`field-note-${candidate.id}`}
            className="block text-xs font-medium text-[#4b5563] mb-1"
          >
            Note
          </label>
          <textarea
            id={`field-note-${candidate.id}`}
            value={current.note}
            onChange={(e) => updateEdit("note", e.target.value)}
            rows={2}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-sans text-xs
              focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
        </div>

        {/* Depends on */}
        <div>
          <label
            htmlFor={`field-deps-${candidate.id}`}
            className="block text-xs font-medium text-[#4b5563] mb-1"
          >
            Depends on (comma-separated IDs)
          </label>
          <input
            id={`field-deps-${candidate.id}`}
            type="text"
            value={
              (edits.depends_on ?? current.depends_on)?.join(", ") || ""
            }
            onChange={(e) =>
              updateEdit(
                "depends_on",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono text-sm
              focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
        </div>

        {/* Extraction metadata (collapsed) */}
        <details className="text-xs">
          <summary
            className="cursor-pointer text-[#4b5563] font-medium py-1
              focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            onClick={(e) => {
              e.preventDefault();
              setShowDetails(!showDetails);
            }}
          >
            {showDetails ? "Hide" : "Show"} extraction metadata
          </summary>
          {showDetails && (
            <div className="mt-2 space-y-2">
              <div>
                <span className="font-medium text-[#4b5563]">Source text:</span>
                <blockquote className="mt-1 pl-3 border-l-2 border-gray-300 text-[#4b5563] font-mono text-[11px] leading-relaxed">
                  {current.sourceText}
                </blockquote>
              </div>
              {current.extractionNotes && (
                <div>
                  <span className="font-medium text-[#4b5563]">
                    Claude notes:
                  </span>
                  <p className="mt-1 text-[#4b5563]">
                    {current.extractionNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </details>
      </div>

      {/* Action buttons */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="px-3 py-1.5 text-sm font-medium text-[#4b5563] border border-gray-300 rounded-md
            hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed
            focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-label="Previous card"
        >
          ← Previous
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSkip}
            className="px-3 py-1.5 text-sm font-medium text-[#4b5563] border border-gray-300 rounded-md
              hover:bg-gray-50
              focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Skip
          </button>
          <button
            onClick={handleReject}
            className="px-3 py-1.5 text-sm font-medium rounded-md border
              hover:bg-red-50"
            style={{
              color: "#991b1b",
              borderColor: "#fecaca",
            }}
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 text-sm font-medium text-white rounded-md
              hover:opacity-90
              focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            style={{ background: "#1a5f4a" }}
          >
            Accept →
          </button>
        </div>
      </div>

      {/* Keyboard shortcuts legend */}
      <div className="px-4 py-2 border-t border-gray-50 flex items-center gap-4 text-[10px] text-[#4b5563] font-mono">
        <span>
          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px]">A</kbd>{" "}
          Accept
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px]">R</kbd>{" "}
          Reject
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px]">S</kbd>{" "}
          Skip
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px]">E</kbd>{" "}
          Edit body
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px]">←</kbd>
          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px]">→</kbd>{" "}
          Navigate
        </span>
      </div>
    </div>
  );
}
