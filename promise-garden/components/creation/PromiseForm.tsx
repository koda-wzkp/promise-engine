"use client";

import { useState } from "react";
import type {
  PersonalDomain,
  DurationTier,
  StakesTier,
  CheckInFrequency,
} from "@/lib/types/personal";
import type { PersonalPromise } from "@/lib/types/personal";
import {
  domainMeta,
  durationMeta,
  stakesMeta,
} from "@/lib/types/personal";
import { domainColors } from "@/lib/utils/colors";

interface PromiseFormProps {
  onSubmit: (data: {
    body: string;
    domain: PersonalDomain;
    durationTier: DurationTier;
    stakesTier: StakesTier;
    checkInFrequency: CheckInFrequency;
    promisee?: string;
    targetDate?: string;
    dependsOn?: string[];
    notes?: string;
    reclaims?: string;
  }) => void;
  onCancel?: () => void;
  activePromises?: PersonalPromise[];
  deadStumps?: PersonalPromise[];
  simplified?: boolean; // For onboarding — fewer steps
}

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function PromiseForm({
  onSubmit,
  onCancel,
  activePromises = [],
  deadStumps = [],
  simplified = false,
}: PromiseFormProps) {
  const [step, setStep] = useState(1);
  const [body, setBody] = useState("");
  const [domain, setDomain] = useState<PersonalDomain | null>(null);
  const [durationTier, setDurationTier] = useState<DurationTier | null>(null);
  const [stakesTier, setStakesTier] = useState<StakesTier>("medium");
  const [frequencyType, setFrequencyType] = useState<string>("daily");
  const [specificDays, setSpecificDays] = useState<number[]>([]);
  const [weeklyDay, setWeeklyDay] = useState(0);
  const [monthlyDay, setMonthlyDay] = useState(1);
  const [promisee, setPromisee] = useState("Self");
  const [targetDate, setTargetDate] = useState("");
  const [dependsOn, setDependsOn] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [reclaims, setReclaims] = useState<string | undefined>();
  const [showOptional, setShowOptional] = useState(false);

  const domains: PersonalDomain[] = [
    "health",
    "work",
    "relationships",
    "creative",
    "financial",
  ];
  const durations: DurationTier[] = ["short", "medium", "long"];
  const stakes: StakesTier[] = ["low", "medium", "high"];

  function buildFrequency(): CheckInFrequency {
    switch (frequencyType) {
      case "specific_days":
        return { type: "specific_days", days: specificDays };
      case "weekly":
        return { type: "weekly", day: weeklyDay };
      case "monthly":
        return { type: "monthly", day: monthlyDay };
      default:
        return { type: "daily" };
    }
  }

  function handleSubmit() {
    if (!body.trim() || !domain || !durationTier) return;
    onSubmit({
      body: body.trim(),
      domain,
      durationTier,
      stakesTier,
      checkInFrequency: buildFrequency(),
      promisee: promisee || "Self",
      targetDate: targetDate || undefined,
      dependsOn: dependsOn.length > 0 ? dependsOn : undefined,
      notes: notes.trim() || undefined,
      reclaims,
    });
  }

  // Step 1: What are you promising?
  if (step === 1) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <h2 className="text-xl font-semibold mb-2">
          What are you committing to?
        </h2>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Exercise 3 times a week"
          rows={3}
          autoFocus
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base resize-none focus:outline-none focus:ring-2 focus:ring-garden-green mb-4"
          aria-label="Promise body"
        />
        <div className="flex gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-[var(--text-muted)]"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => body.trim() && setStep(2)}
            disabled={!body.trim()}
            className="flex-1 py-3 bg-garden-green text-white rounded-xl text-sm font-medium disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Quick classification
  if (step === 2) {
    return (
      <div className="w-full max-w-md mx-auto p-6 space-y-6">
        <h2 className="text-xl font-semibold">Classify your promise</h2>

        {/* Domain */}
        <div>
          <label className="block text-sm font-medium mb-2">Domain</label>
          <div className="grid grid-cols-5 gap-2">
            {domains.map((d) => {
              const dc = domainColors[d];
              const selected = domain === d;
              return (
                <button
                  key={d}
                  onClick={() => setDomain(d)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-colors ${
                    selected ? "border-current" : "border-transparent bg-gray-50"
                  }`}
                  style={selected ? { borderColor: dc.text, backgroundColor: dc.bg } : undefined}
                  aria-pressed={selected}
                >
                  <span className="text-xs font-medium" style={selected ? { color: dc.text } : undefined}>
                    {domainMeta[d].label}
                  </span>
                </button>
              );
            })}
          </div>
          {domain && (
            <p className="text-xs text-[var(--text-muted)] mt-1.5">
              You&apos;ll grow {domainMeta[domain].description.split(",")[0].toLowerCase()}.
            </p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium mb-2">Duration</label>
          <div className="grid grid-cols-3 gap-2">
            {durations.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDurationTier(d);
                  setFrequencyType(
                    d === "short" ? "daily" : d === "medium" ? "weekly" : "weekly"
                  );
                }}
                className={`p-3 rounded-xl border-2 text-center transition-colors ${
                  durationTier === d
                    ? "border-garden-green bg-garden-green/5"
                    : "border-transparent bg-gray-50"
                }`}
                aria-pressed={durationTier === d}
              >
                <span className="text-sm font-medium block">
                  {durationMeta[d].label}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {durationMeta[d].description.split(",")[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Stakes */}
        {!simplified && (
          <div>
            <label className="block text-sm font-medium mb-2">Stakes</label>
            <div className="grid grid-cols-3 gap-2">
              {stakes.map((s) => (
                <button
                  key={s}
                  onClick={() => setStakesTier(s)}
                  className={`p-3 rounded-xl border-2 text-center transition-colors ${
                    stakesTier === s
                      ? "border-garden-green bg-garden-green/5"
                      : "border-transparent bg-gray-50"
                  }`}
                  aria-pressed={stakesTier === s}
                >
                  <span className="text-sm font-medium block">
                    {stakesMeta[s].label}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {stakesMeta[s].description.split(",")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium mb-2">Check-in</label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {["daily", "specific_days", "weekly", "monthly"].map((f) => (
              <button
                key={f}
                onClick={() => setFrequencyType(f)}
                className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                  frequencyType === f
                    ? "bg-garden-green text-white"
                    : "bg-gray-100 text-[var(--text-muted)]"
                }`}
              >
                {f === "specific_days" ? "Specific" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {frequencyType === "specific_days" && (
            <div className="flex gap-1">
              {DAYS.map((label, i) => (
                <button
                  key={i}
                  onClick={() =>
                    setSpecificDays((prev) =>
                      prev.includes(i)
                        ? prev.filter((d) => d !== i)
                        : [...prev, i]
                    )
                  }
                  className={`w-9 h-9 rounded-full text-xs font-medium transition-colors ${
                    specificDays.includes(i)
                      ? "bg-garden-green text-white"
                      : "bg-gray-100"
                  }`}
                  aria-label={`${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][i]}`}
                  aria-pressed={specificDays.includes(i)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {frequencyType === "weekly" && (
            <select
              value={weeklyDay}
              onChange={(e) => setWeeklyDay(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              aria-label="Weekly check-in day"
            >
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                (day, i) => (
                  <option key={i} value={i}>{day}</option>
                )
              )}
            </select>
          )}

          {frequencyType === "monthly" && (
            <select
              value={monthlyDay}
              onChange={(e) => setMonthlyDay(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              aria-label="Monthly check-in day"
            >
              {Array.from({ length: 28 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Day {i + 1}</option>
              ))}
            </select>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => setStep(1)}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm"
          >
            Back
          </button>
          <button
            onClick={() => {
              if (simplified) {
                handleSubmit();
              } else {
                setStep(3);
              }
            }}
            disabled={!domain || !durationTier}
            className="flex-1 py-3 bg-garden-green text-white rounded-xl text-sm font-medium disabled:opacity-40"
          >
            {simplified ? "Plant" : "Next"}
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Optional details
  if (step === 3) {
    const domainStumps = deadStumps.filter((s) => s.domain === domain);

    return (
      <div className="w-full max-w-md mx-auto p-6 space-y-5">
        <h2 className="text-xl font-semibold">Optional details</h2>

        <button
          onClick={() => setShowOptional(!showOptional)}
          className="text-sm text-domain-work hover:underline"
        >
          {showOptional ? "Hide details" : "Add details (who, when, dependencies)"}
        </button>

        {showOptional && (
          <div className="space-y-4 animate-slide-down">
            {/* Promisee */}
            <div>
              <label htmlFor="promisee" className="block text-sm font-medium mb-1">
                Who is this promise to?
              </label>
              <input
                id="promisee"
                value={promisee}
                onChange={(e) => setPromisee(e.target.value)}
                placeholder="Self"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>

            {/* Target date */}
            <div>
              <label htmlFor="target" className="block text-sm font-medium mb-1">
                Target date
              </label>
              <input
                id="target"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>

            {/* Dependencies */}
            {activePromises.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Depends on...
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {activePromises.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={dependsOn.includes(p.id)}
                        onChange={(e) =>
                          setDependsOn(
                            e.target.checked
                              ? [...dependsOn, p.id]
                              : dependsOn.filter((d) => d !== p.id)
                          )
                        }
                        className="rounded"
                      />
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: domainColors[p.domain as keyof typeof domainColors]?.text ?? "#6b7280",
                        }}
                      />
                      <span className="truncate">{p.body}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Reclaim stump */}
            {domainStumps.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Grow from an old stump?
                </label>
                <div className="space-y-1">
                  {domainStumps.map((stump) => (
                    <label
                      key={stump.id}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="reclaim"
                        checked={reclaims === stump.id}
                        onChange={() => setReclaims(stump.id)}
                        className="rounded-full"
                      />
                      <span className="truncate text-[var(--text-muted)]">
                        {stump.body}
                      </span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="reclaim"
                      checked={!reclaims}
                      onChange={() => setReclaims(undefined)}
                      className="rounded-full"
                    />
                    <span>Fresh planting</span>
                  </label>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                placeholder="Any context or motivation..."
              />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setStep(2)}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-garden-green text-white rounded-xl text-sm font-medium"
          >
            Plant your seed
          </button>
        </div>
      </div>
    );
  }

  return null;
}
