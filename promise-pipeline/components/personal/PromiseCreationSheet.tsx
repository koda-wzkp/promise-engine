"use client";

/**
 * PromiseCreationSheet
 *
 * Inline promise-creation form that overlays the garden.
 * On mobile: slides up as a bottom sheet.
 * On desktop (≥768px): appears as a centred overlay card.
 *
 * Only two fields are required: body (what are you promising?) + domain.
 * Duration, stakes, promisee, and target date are optional behind a <details> expander.
 *
 * Accessibility:
 *  - Focus is trapped within the sheet while open
 *  - Escape closes the sheet
 *  - Focus returns to returnFocusRef (or a fallback) on close
 *  - Domain selector uses role="radiogroup" / role="radio" / aria-checked
 *  - All inputs have visible <label> associations
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type RefObject,
} from "react";
import { PersonalPromise } from "@/lib/types/personal";

// ─── Domain config ────────────────────────────────────────────────────────────

const DOMAINS = [
  { id: "health",        label: "Health",        emoji: "🍎", color: "#059669" },
  { id: "work",          label: "Work",           emoji: "🌳", color: "#1e40af" },
  { id: "relationships", label: "Relationships",  emoji: "🌸", color: "#db2777" },
  { id: "creative",      label: "Creative",       emoji: "🌿", color: "#7c3aed" },
  { id: "financial",     label: "Financial",      emoji: "🌲", color: "#0891b2" },
] as const;

type DomainId = (typeof DOMAINS)[number]["id"];

// ─── Props ────────────────────────────────────────────────────────────────────

interface PromiseCreationSheetProps {
  /** Called with the new promise when the user taps "Plant this seed" */
  onSuccess: (promise: PersonalPromise) => void;
  /** Called when the sheet is closed without a successful plant */
  onClose: () => void;
  /** Element to restore focus to on close */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

// ─── Focus trap ───────────────────────────────────────────────────────────────

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function trapFocus(container: HTMLElement, e: KeyboardEvent) {
  const nodes = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter((el) => el.offsetParent !== null); // visible only
  if (nodes.length === 0) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PromiseCreationSheet({
  onSuccess,
  onClose,
  returnFocusRef,
}: PromiseCreationSheetProps) {
  const [body, setBody] = useState("");
  const [domain, setDomain] = useState<DomainId | null>(null);
  const [promisee, setPromisee] = useState("self");
  const [target, setTarget] = useState("");
  const [duration, setDuration] = useState<"short" | "medium" | "long">("medium");
  const [stakes, setStakes] = useState<"low" | "medium" | "high">("medium");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canPlant = body.trim().length >= 3 && domain !== null;

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    // Slight delay so the slide-up CSS transition is visible
    const id = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(id);
  }, []);

  // Auto-focus the textarea when the sheet opens
  useEffect(() => {
    if (mounted) {
      textareaRef.current?.focus();
    }
  }, [mounted]);

  // Keyboard: Escape to close, Tab to trap focus
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && sheetRef.current) {
        trapFocus(sheetRef.current, e);
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Return focus on unmount
  useEffect(() => {
    return () => {
      const target =
        returnFocusRef?.current ?? document.querySelector<HTMLElement>("[data-garden-seed]");
      target?.focus();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!canPlant || !domain) return;

      const promise: PersonalPromise = {
        id: `PG-${Date.now()}`,
        isPersonal: true,
        promiser: "self",
        promisee: promisee.trim() || "self",
        body: body.trim(),
        domain,
        status: "declared",
        note: "",
        verification: { method: "self-report" },
        depends_on: [],
        polarity: "give",
        origin: "voluntary",
        createdAt: new Date().toISOString(),
        target: target || undefined,
      };

      onSuccess(promise);
    },
    [body, domain, promisee, target, canPlant, onSuccess]
  );

  // ─── Shared toggle-button style helpers ────────────────────────────────────

  function toggleClass(active: boolean) {
    return active
      ? "px-3 py-1.5 text-xs font-medium rounded-md bg-green-700 text-white"
      : "px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200";
  }

  // ─── Slide-up transform for mobile ─────────────────────────────────────────

  const mobileTransform = reducedMotion
    ? "translateY(0)"
    : mounted
    ? "translateY(0)"
    : "translateY(100%)";

  const desktopOpacity = reducedMotion ? 1 : mounted ? 1 : 0;

  return (
    <>
      <style>{`
        @keyframes pg-sheet-in {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes pg-card-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Backdrop — dims the garden to ~60% */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.40)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet / Card */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Plant a new promise"
        className={[
          "fixed z-50 bg-white",
          // Mobile: bottom sheet
          "bottom-0 left-0 right-0 rounded-t-2xl",
          // Desktop: centred card
          "tablet:top-1/2 tablet:left-1/2 tablet:bottom-auto tablet:right-auto",
          "tablet:-translate-x-1/2 tablet:-translate-y-1/2",
          "tablet:rounded-xl tablet:w-full tablet:max-w-md tablet:shadow-lg",
        ].join(" ")}
        style={{
          // Mobile slide-up
          transform: mobileTransform,
          transition:
            reducedMotion ? "none" : "transform 0.28s cubic-bezier(0.32,0.72,0,1)",
          // Desktop fade-in (overridden by tablet: classes above)
          opacity: 1,
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        {/* Drag handle (mobile visual only) */}
        <div
          className="flex justify-center pt-3 pb-1 tablet:hidden"
          aria-hidden="true"
        >
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <form onSubmit={handleSubmit} className="p-6 tablet:p-8 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h2 className="font-serif text-lg font-semibold text-gray-900">
              Plant a new promise
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-gray-400 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded p-1"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M2 2l12 12M14 2L2 14"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* ── Required: promise body ────────────────────────────────────── */}
          <div>
            <label
              htmlFor="pg-body"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your promise
            </label>
            <textarea
              ref={textareaRef}
              id="pg-body"
              rows={2}
              maxLength={200}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="e.g., Exercise 3 times a week"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent"
              aria-required="true"
            />
          </div>

          {/* ── Required: domain ─────────────────────────────────────────── */}
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">
              Domain
            </legend>
            <div
              role="radiogroup"
              aria-label="Promise domain"
              className="flex gap-1.5 flex-wrap"
            >
              {DOMAINS.map((d) => {
                const selected = domain === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setDomain(d.id)}
                    className={[
                      "flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border text-xs font-medium",
                      "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
                      selected
                        ? "border-transparent text-white"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50",
                    ].join(" ")}
                    style={
                      selected
                        ? { backgroundColor: d.color }
                        : undefined
                    }
                  >
                    <span className="text-base leading-none" aria-hidden="true">
                      {d.emoji}
                    </span>
                    {d.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* ── Optional: more options ───────────────────────────────────── */}
          <details className="group">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 select-none list-none flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
                className="transition-transform group-open:rotate-90"
              >
                <path d="M3 2l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              More options
            </summary>

            <div className="mt-4 space-y-4 pl-1">
              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Duration
                </label>
                <div className="flex gap-2" role="group" aria-label="Duration">
                  {(
                    [
                      { id: "short",  label: "Short (< 1 mo)" },
                      { id: "medium", label: "Medium (1–6 mo)" },
                      { id: "long",   label: "Long (6+ mo)" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={duration === opt.id}
                      onClick={() => setDuration(opt.id)}
                      className={toggleClass(duration === opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stakes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Stakes
                </label>
                <div className="flex gap-2" role="group" aria-label="Stakes">
                  {(["low", "medium", "high"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={stakes === s}
                      onClick={() => setStakes(s)}
                      className={toggleClass(stakes === s)}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* To whom */}
              <div>
                <label
                  htmlFor="pg-promisee"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  To whom?
                </label>
                <input
                  id="pg-promisee"
                  type="text"
                  value={promisee}
                  onChange={(e) => setPromisee(e.target.value)}
                  placeholder="Myself"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                />
              </div>

              {/* By when */}
              <div>
                <label
                  htmlFor="pg-target"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  By when? <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  id="pg-target"
                  type="date"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                />
              </div>
            </div>
          </details>

          {/* ── Plant button ─────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={!canPlant}
            className={[
              "w-full py-3 rounded-lg text-base font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
              canPlant
                ? "bg-[#1a5f4a] text-white hover:bg-[#155240]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed",
            ].join(" ")}
          >
            Plant this seed 🌱
          </button>
        </form>
      </div>
    </>
  );
}
