"use client";

import { useState, useRef, useId } from "react";
import { GardenPromise, classifyKRegime, expectedKValue } from "@/lib/types/personal";
import { computeAdaptiveFrequency } from "@/lib/garden/adaptiveCheckin";

const DOMAINS = [
  { id: "health",        label: "Health",        emoji: "🌱", desc: "Body, sleep, movement" },
  { id: "work",          label: "Work",           emoji: "🌳", desc: "Craft, career, focus" },
  { id: "creative",      label: "Creative",       emoji: "🌿", desc: "Making, writing, play" },
  { id: "financial",     label: "Financial",      emoji: "🌲", desc: "Saving, spending, building" },
  { id: "relationships", label: "Relationships",  emoji: "🌸", desc: "People, presence, care" },
] as const;

type DomainId = (typeof DOMAINS)[number]["id"];

interface DraftPromise {
  body: string;
  verification: "self-report" | "sensor" | "none";
}

interface OnboardingFlowProps {
  onComplete: (promises: GardenPromise[]) => void;
}

function hashSeed(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return Math.abs(h >>> 0);
}

function makeDraft(): DraftPromise {
  return { body: "", verification: "self-report" };
}

function buildGardenPromise(draft: DraftPromise, domain: DomainId, index: number): GardenPromise {
  const id = `gp-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`;
  const kRegime = classifyKRegime(draft.verification === "sensor" ? "sensor" : draft.verification === "none" ? "none" : "self-report");
  const expectedK = expectedKValue(kRegime);
  const adaptive = computeAdaptiveFrequency({
    expectedK,
    checkInFrequency: { userMin: 1, userMax: 14, adaptive: 4 },
  } as GardenPromise);

  return {
    id,
    body: draft.body.trim(),
    domain,
    status: "declared",
    promiser: "self",
    promisee: "self",
    note: "",
    depends_on: [],
    verification: { method: draft.verification === "sensor" ? "sensor" : draft.verification === "none" ? "none" : "self-report" },
    isPersonal: true,
    origin: "voluntary",
    createdAt: new Date().toISOString(),
    visibility: "private",
    kRegime,
    expectedK,
    checkInFrequency: { userMin: 1, userMax: 14, adaptive },
    lastCheckIn: null,
    checkInHistory: [],
    gardenPlot: domain,
    plantSeed: hashSeed(id),
    graftHistory: [],
    fossilized: false,
    artifact: null,
    completedAt: null,
    reflection: null,
  };
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<"domain" | "promises">("domain");
  const [domain, setDomain] = useState<DomainId | null>(null);
  const [drafts, setDrafts] = useState<DraftPromise[]>([makeDraft(), makeDraft()]);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const domainGroupId = useId();

  function handleDomainNext() {
    if (!domain) return;
    setStep("promises");
    setTimeout(() => firstInputRef.current?.focus(), 50);
  }

  function updateDraft(index: number, field: keyof DraftPromise, value: string) {
    setDrafts((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    );
  }

  function addDraft() {
    if (drafts.length >= 5) return;
    setDrafts((prev) => [...prev, makeDraft()]);
  }

  function removeDraft(index: number) {
    if (drafts.length <= 1) return;
    setDrafts((prev) => prev.filter((_, i) => i !== index));
  }

  function handlePlant() {
    if (!domain) return;
    const valid = drafts.filter((d) => d.body.trim().length >= 3);
    if (valid.length === 0) return;
    const promises = valid.map((d, i) => buildGardenPromise(d, domain, i));
    onComplete(promises);
  }

  const canPlant = domain !== null && drafts.some((d) => d.body.trim().length >= 3);

  if (step === "domain") {
    return (
      <div
        role="main"
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: "linear-gradient(180deg, #bfdbfe 0%, #faf9f6 100%)" }}
      >
        <div className="w-full max-w-md">
          <h1 className="font-serif text-3xl font-bold text-gray-900 text-center mb-2">
            Promise Garden
          </h1>
          <p className="text-center text-gray-600 mb-8">
            What area of your life do you want to focus on?
          </p>

          <div
            role="radiogroup"
            aria-label="Choose a domain"
            id={domainGroupId}
            className="space-y-3"
          >
            {DOMAINS.map((d) => (
              <button
                key={d.id}
                role="radio"
                aria-checked={domain === d.id}
                onClick={() => setDomain(d.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-green-600 ${
                  domain === d.id
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="text-2xl" aria-hidden="true">{d.emoji}</span>
                <span>
                  <span className="block font-semibold text-gray-900">{d.label}</span>
                  <span className="text-sm text-gray-500">{d.desc}</span>
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={handleDomainNext}
            disabled={!domain}
            className="mt-8 w-full py-3 bg-green-700 text-white font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-800 transition-colors focus-visible:outline-2 focus-visible:outline-green-600"
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="main"
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(180deg, #bfdbfe 0%, #faf9f6 100%)" }}
    >
      <div className="w-full max-w-md">
        <button
          onClick={() => setStep("domain")}
          className="mb-6 text-sm text-gray-500 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-green-600"
        >
          ← Change domain
        </button>

        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-1">
          What are you committing to?
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          In your{" "}
          <strong className="text-gray-700 capitalize">{domain}</strong> garden.
          Start with 2–3 promises.
        </p>

        <div className="space-y-4">
          {drafts.map((draft, i) => (
            <div key={i} className="bg-white rounded-xl border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={`promise-${i}`}
                  className="text-sm font-medium text-gray-700"
                >
                  Promise {i + 1}
                </label>
                {drafts.length > 1 && (
                  <button
                    onClick={() => removeDraft(i)}
                    aria-label={`Remove promise ${i + 1}`}
                    className="text-xs text-gray-400 hover:text-red-500 focus-visible:outline-2 focus-visible:outline-red-400"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                id={`promise-${i}`}
                ref={i === 0 ? firstInputRef : undefined}
                type="text"
                value={draft.body}
                onChange={(e) => updateDraft(i, "body", e.target.value)}
                placeholder="e.g. Walk 20 minutes every day"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-describedby={`verify-${i}-desc`}
              />

              <fieldset>
                <legend id={`verify-${i}-desc`} className="text-xs text-gray-500 mb-1">
                  How will you know you&apos;re keeping it?
                </legend>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { value: "self-report", label: "I'll check in" },
                      { value: "sensor",      label: "Connect a sensor" },
                      { value: "none",        label: "Add later" },
                    ] as const
                  ).map((opt) => (
                    <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name={`verify-${i}`}
                        value={opt.value}
                        checked={draft.verification === opt.value}
                        onChange={() => updateDraft(i, "verification", opt.value)}
                        className="accent-green-700"
                      />
                      <span className="text-xs text-gray-600">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {draft.verification === "sensor" && (
                  <p className="mt-1 text-xs text-gray-400 italic">
                    Sensor integration coming in Phase 2. Using self-report for now.
                  </p>
                )}
              </fieldset>
            </div>
          ))}
        </div>

        {drafts.length < 5 && (
          <button
            onClick={addDraft}
            className="mt-3 text-sm text-green-700 hover:text-green-900 focus-visible:outline-2 focus-visible:outline-green-600"
          >
            + Add another promise
          </button>
        )}

        <button
          onClick={handlePlant}
          disabled={!canPlant}
          className="mt-8 w-full py-3 bg-green-700 text-white font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-800 transition-colors focus-visible:outline-2 focus-visible:outline-green-600"
        >
          Plant my garden →
        </button>

        <p className="mt-3 text-xs text-center text-gray-400">
          No account needed. Everything stays on your device.
        </p>
      </div>
    </div>
  );
}
