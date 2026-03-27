"use client";

/**
 * OnboardingFlow
 *
 * Step 1: Domain Selection — user picks a life domain
 * Step 2: Promise Creation — user creates 2-3 promises
 * Step 3: Garden renders (handled by parent)
 *
 * Accessibility:
 *  - All buttons are keyboard navigable
 *  - Domain selector uses role="radiogroup"
 *  - Focus management between steps
 *  - No shame language, no streak mechanics
 */

import { useState, useRef, useEffect, useCallback } from "react";
import type { GardenPromise } from "@/lib/types/personal";
import type { VerificationSource } from "@/lib/types/promise";
import { createGardenPromise, classifyKRegime } from "@/lib/types/personal";

interface OnboardingFlowProps {
  onComplete: (promises: GardenPromise[], domain: string) => void;
}

type Step = "domain" | "promises";

const DOMAINS = [
  { id: "health", label: "Health", emoji: "🍎", color: "#059669" },
  { id: "work", label: "Work", emoji: "🌳", color: "#1e40af" },
  { id: "creative", label: "Creative", emoji: "🌿", color: "#7c3aed" },
  { id: "financial", label: "Financial", emoji: "🌲", color: "#0891b2" },
  { id: "relationships", label: "Relationships", emoji: "🌸", color: "#db2777" },
] as const;

type VerificationChoice = "self-report" | "sensor" | "none";

interface PromiseInput {
  body: string;
  verification: VerificationChoice;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>("domain");
  const [domain, setDomain] = useState<string | null>(null);
  const [promiseInputs, setPromiseInputs] = useState<PromiseInput[]>([
    { body: "", verification: "self-report" },
    { body: "", verification: "self-report" },
  ]);
  const [sensorNote, setSensorNote] = useState<number | null>(null);

  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    stepRef.current?.focus();
  }, [step]);

  const updatePromise = useCallback(
    (index: number, field: keyof PromiseInput, value: string) => {
      setPromiseInputs((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
      if (field === "verification" && value === "sensor") {
        setSensorNote(index);
      }
    },
    []
  );

  const addPromise = useCallback(() => {
    if (promiseInputs.length < 5) {
      setPromiseInputs((prev) => [
        ...prev,
        { body: "", verification: "self-report" },
      ]);
    }
  }, [promiseInputs.length]);

  const handleSubmit = useCallback(() => {
    if (!domain) return;
    const filled = promiseInputs.filter((p) => p.body.trim().length >= 3);
    if (filled.length < 1) return;

    const promises = filled.map((input) => {
      // Sensor → self-report in Phase 1
      const method: VerificationSource["method"] =
        input.verification === "sensor" ? "self-report" : input.verification === "none" ? "none" : "self-report";

      return createGardenPromise({
        body: input.body.trim(),
        domain,
        verificationMethod: method,
      });
    });

    onComplete(promises, domain);
  }, [domain, promiseInputs, onComplete]);

  const filledCount = promiseInputs.filter(
    (p) => p.body.trim().length >= 3
  ).length;

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      ref={stepRef}
      tabIndex={-1}
      className="outline-none max-w-lg mx-auto px-4"
    >
      {step === "domain" && (
        <div
          className="space-y-6 py-12"
          style={{
            opacity: 1,
            animation: reducedMotion ? "none" : "pg-fade-in 0.3s ease",
          }}
        >
          <style>{`
            @keyframes pg-fade-in {
              from { opacity: 0; transform: translateY(8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div className="text-center">
            <h2 className="font-serif text-2xl font-bold text-gray-900">
              What area of your life do you want to focus on?
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Pick one to start. You can always add more later.
            </p>
          </div>

          <fieldset>
            <legend className="sr-only">Choose a domain</legend>
            <div
              role="radiogroup"
              aria-label="Life domain"
              className="grid grid-cols-2 gap-3 sm:grid-cols-3"
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
                      "flex flex-col items-center gap-2 px-4 py-5 rounded-xl border-2 text-sm font-medium",
                      "transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
                      selected
                        ? "border-current text-white shadow-md"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50",
                    ].join(" ")}
                    style={
                      selected ? { backgroundColor: d.color, borderColor: d.color } : undefined
                    }
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {d.emoji}
                    </span>
                    {d.label}
                  </button>
                );
              })}

              {/* Custom option */}
              <button
                type="button"
                role="radio"
                aria-checked={
                  domain !== null && !DOMAINS.some((d) => d.id === domain)
                }
                onClick={() => {
                  const custom = prompt("Enter your domain name:");
                  if (custom && custom.trim()) {
                    setDomain(custom.trim().toLowerCase());
                  }
                }}
                className="flex flex-col items-center gap-2 px-4 py-5 rounded-xl border-2 border-dashed border-gray-300 text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                <span className="text-2xl" aria-hidden="true">
                  +
                </span>
                Custom...
              </button>
            </div>
          </fieldset>

          <button
            type="button"
            disabled={!domain}
            onClick={() => setStep("promises")}
            className={[
              "w-full py-3 rounded-lg text-base font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
              domain
                ? "bg-[#1a5f4a] text-white hover:bg-[#155240]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed",
            ].join(" ")}
          >
            Next
          </button>
        </div>
      )}

      {step === "promises" && (
        <div
          className="space-y-6 py-8"
          style={{
            opacity: 1,
            animation: reducedMotion ? "none" : "pg-fade-in 0.3s ease",
          }}
        >
          <div>
            <button
              type="button"
              onClick={() => setStep("domain")}
              className="text-sm text-gray-500 hover:text-gray-700 mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
            >
              &larr; Back
            </button>
            <h2 className="font-serif text-xl font-bold text-gray-900">
              What are your commitments in{" "}
              <span className="capitalize">{domain}</span>?
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Start with 2-3 promises. Keep them specific and achievable.
            </p>
          </div>

          <div className="space-y-5">
            {promiseInputs.map((input, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
              >
                <div>
                  <label
                    htmlFor={`promise-${i}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Promise {i + 1}
                  </label>
                  <input
                    id={`promise-${i}`}
                    type="text"
                    value={input.body}
                    onChange={(e) => updatePromise(i, "body", e.target.value)}
                    placeholder={
                      i === 0
                        ? "e.g., Exercise three times a week"
                        : i === 1
                        ? "e.g., Read 20 minutes before bed"
                        : "Another commitment..."
                    }
                    maxLength={200}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent"
                  />
                </div>

                <fieldset>
                  <legend className="text-xs text-gray-500 mb-1.5">
                    How will you know?
                  </legend>
                  <div className="flex gap-2 flex-wrap">
                    {(
                      [
                        { id: "self-report", label: "I'll check in myself" },
                        { id: "sensor", label: "Connect a sensor" },
                        { id: "none", label: "Add later" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        aria-pressed={input.verification === opt.id}
                        onClick={() => updatePromise(i, "verification", opt.id)}
                        className={[
                          "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1",
                          input.verification === opt.id
                            ? "bg-[#1a5f4a] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                        ].join(" ")}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                {sensorNote === i && input.verification === "sensor" && (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded-md px-3 py-2">
                    Sensor integration coming soon. Starting with self-report
                    for now.
                  </p>
                )}
              </div>
            ))}
          </div>

          {promiseInputs.length < 5 && (
            <button
              type="button"
              onClick={addPromise}
              className="text-sm text-[#1a5f4a] hover:text-[#155240] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
            >
              + Add another
            </button>
          )}

          <button
            type="button"
            disabled={filledCount < 1}
            onClick={handleSubmit}
            className={[
              "w-full py-3 rounded-lg text-base font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
              filledCount >= 1
                ? "bg-[#1a5f4a] text-white hover:bg-[#155240]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed",
            ].join(" ")}
          >
            Plant my garden
          </button>
        </div>
      )}
    </div>
  );
}
