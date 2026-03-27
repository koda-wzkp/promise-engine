"use client";

/**
 * SubPromiseCreator — "Break this down" flow.
 *
 * Allows creating 1-N sub-promises under a parent promise.
 * Sub-promises inherit the parent's domain but can override.
 * Each sub-promise has its own verification method and check-in schedule.
 */

import { useState, useCallback } from "react";
import type { GardenPromise } from "@/lib/types/garden-phase2";
import type { PersonalDomain } from "@/lib/types/personal";
import type { VerificationMethod } from "@/lib/types/promise";

interface SubPromiseCreatorProps {
  parent: GardenPromise;
  onCreateSubPromises: (subPromises: GardenPromise[]) => void;
  onCancel: () => void;
}

interface SubPromiseDraft {
  body: string;
  domain: string;
  verificationMethod: VerificationMethod;
  checkInSchedule: string;
}

const VERIFICATION_OPTIONS: { value: VerificationMethod; label: string }[] = [
  { value: "self-report", label: "Self check-in" },
  { value: "sensor", label: "Sensor (auto)" },
  { value: "none", label: "No verification" },
];

const SCHEDULE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
];

export function SubPromiseCreator({
  parent,
  onCreateSubPromises,
  onCancel,
}: SubPromiseCreatorProps) {
  const [drafts, setDrafts] = useState<SubPromiseDraft[]>([
    {
      body: "",
      domain: parent.domain,
      verificationMethod: "self-report",
      checkInSchedule: "weekly",
    },
  ]);

  const addDraft = useCallback(() => {
    setDrafts((prev) => [
      ...prev,
      {
        body: "",
        domain: parent.domain,
        verificationMethod: "self-report",
        checkInSchedule: "weekly",
      },
    ]);
  }, [parent.domain]);

  const removeDraft = useCallback((index: number) => {
    setDrafts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateDraft = useCallback(
    (index: number, updates: Partial<SubPromiseDraft>) => {
      setDrafts((prev) =>
        prev.map((d, i) => (i === index ? { ...d, ...updates } : d))
      );
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const validDrafts = drafts.filter((d) => d.body.trim());
      if (validDrafts.length === 0) return;

      const subPromises: GardenPromise[] = validDrafts.map((draft) => ({
        id: `PG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        isPersonal: true as const,
        promiser: "self",
        promisee: parent.promisee,
        body: draft.body.trim(),
        domain: draft.domain,
        status: "declared" as const,
        note: "",
        verification: { method: draft.verificationMethod },
        depends_on: [],
        polarity: "give" as const,
        origin: "voluntary" as const,
        createdAt: new Date().toISOString(),
        children: [],
        parent: parent.id,
        checkInSchedule: draft.checkInSchedule,
      }));

      onCreateSubPromises(subPromises);
    },
    [drafts, parent, onCreateSubPromises]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border p-5 max-w-lg mx-auto"
    >
      <h3 className="font-serif text-lg font-semibold text-gray-900 mb-1">
        Break It Down
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Split &ldquo;{parent.body}&rdquo; into smaller promises you can track
        individually.
      </p>

      <div className="space-y-4">
        {drafts.map((draft, i) => (
          <div
            key={i}
            className="border rounded-lg p-3 space-y-3 bg-gray-50/50"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-gray-500 mt-1">
                Sub-promise {i + 1}
              </span>
              {drafts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDraft(i)}
                  className="text-xs text-red-500 hover:text-red-700"
                  aria-label={`Remove sub-promise ${i + 1}`}
                >
                  Remove
                </button>
              )}
            </div>

            <textarea
              value={draft.body}
              onChange={(e) => updateDraft(i, { body: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              rows={2}
              placeholder="What's one piece of this promise?"
              required
              aria-label={`Sub-promise ${i + 1} description`}
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Verification
                </label>
                <select
                  value={draft.verificationMethod}
                  onChange={(e) =>
                    updateDraft(i, {
                      verificationMethod: e.target.value as VerificationMethod,
                    })
                  }
                  className="w-full border rounded px-2 py-1.5 text-xs bg-white"
                >
                  {VERIFICATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Check-in
                </label>
                <select
                  value={draft.checkInSchedule}
                  onChange={(e) =>
                    updateDraft(i, { checkInSchedule: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1.5 text-xs bg-white"
                >
                  {SCHEDULE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addDraft}
          className="w-full py-2 text-sm text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
        >
          + Add another sub-promise
        </button>
      </div>

      <div className="flex gap-2 mt-5">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-2 text-sm text-white bg-green-700 rounded-lg hover:bg-green-800 transition-colors font-medium"
        >
          Plant {drafts.filter((d) => d.body.trim()).length || ""} Root
          {drafts.filter((d) => d.body.trim()).length !== 1 ? "s" : ""}
        </button>
      </div>
    </form>
  );
}
