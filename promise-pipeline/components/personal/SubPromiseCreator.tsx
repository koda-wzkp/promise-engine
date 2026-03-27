"use client";

/**
 * SubPromiseCreator — Phase 2 "Break this down" flow
 *
 * When tapping a promise and choosing "Break this down", this component
 * lets the user create 1-N sub-promises under the parent.
 * Sub-promises inherit the parent's domain but can override it.
 */

import { useState, useCallback } from "react";
import { GardenPromise } from "@/lib/types/garden";
import type { PersonalDomain } from "@/lib/types/personal";

interface SubPromiseCreatorProps {
  parent: GardenPromise;
  onCreateSubPromise: (promise: GardenPromise) => void;
  onClose: () => void;
}

const DOMAINS: { id: PersonalDomain; label: string; emoji: string }[] = [
  { id: "health", label: "Health", emoji: "🍎" },
  { id: "work", label: "Work", emoji: "🌳" },
  { id: "relationships", label: "Relationships", emoji: "🌸" },
  { id: "creative", label: "Creative", emoji: "🌿" },
  { id: "financial", label: "Financial", emoji: "🌲" },
];

interface SubPromiseInput {
  body: string;
  domain: PersonalDomain;
}

export function SubPromiseCreator({
  parent,
  onCreateSubPromise,
  onClose,
}: SubPromiseCreatorProps) {
  const [inputs, setInputs] = useState<SubPromiseInput[]>([
    { body: "", domain: parent.domain as PersonalDomain },
  ]);

  const addRow = useCallback(() => {
    setInputs((prev) => [
      ...prev,
      { body: "", domain: parent.domain as PersonalDomain },
    ]);
  }, [parent.domain]);

  const updateRow = useCallback((index: number, updates: Partial<SubPromiseInput>) => {
    setInputs((prev) =>
      prev.map((input, i) => (i === index ? { ...input, ...updates } : input))
    );
  }, []);

  const removeRow = useCallback((index: number) => {
    setInputs((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const validInputs = inputs.filter((i) => i.body.trim().length >= 2);
      if (validInputs.length === 0) return;

      for (const input of validInputs) {
        const subPromise: GardenPromise = {
          id: `PG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          isPersonal: true,
          promiser: "self",
          promisee: parent.promisee,
          body: input.body.trim(),
          domain: input.domain,
          status: "declared",
          note: "",
          verification: { method: "self-report" },
          depends_on: [],
          polarity: "give",
          origin: "voluntary",
          createdAt: new Date().toISOString(),
          children: [],
          parent: parent.id,
        };
        onCreateSubPromise(subPromise);
      }

      onClose();
    },
    [inputs, parent, onCreateSubPromise, onClose]
  );

  const canSubmit = inputs.some((i) => i.body.trim().length >= 2);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Break down: ${parent.body}`}
        className="relative z-10 bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-lg font-semibold text-gray-900">
                Break this down
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Split &ldquo;{parent.body}&rdquo; into smaller promises
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Sub-promise inputs */}
          <div className="space-y-3">
            {inputs.map((input, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={input.body}
                    onChange={(e) => updateRow(i, { body: e.target.value })}
                    placeholder={`Sub-promise ${i + 1}`}
                    maxLength={120}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    aria-label={`Sub-promise ${i + 1} description`}
                  />
                  <div className="flex gap-1 flex-wrap">
                    {DOMAINS.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => updateRow(i, { domain: d.id })}
                        className={`text-[10px] px-1.5 py-0.5 rounded-full border transition-colors ${
                          input.domain === d.id
                            ? "border-green-600 bg-green-50 text-green-700"
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                        aria-pressed={input.domain === d.id}
                      >
                        {d.emoji} {d.label}
                      </button>
                    ))}
                  </div>
                </div>
                {inputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="text-gray-300 hover:text-red-400 p-1 mt-1"
                    aria-label={`Remove sub-promise ${i + 1}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add another */}
          <button
            type="button"
            onClick={addRow}
            className="text-sm text-green-700 hover:text-green-800 font-medium flex items-center gap-1"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add another
          </button>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-3 rounded-lg text-base font-semibold transition-colors ${
              canSubmit
                ? "bg-[#1a5f4a] text-white hover:bg-[#155240]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Plant {inputs.filter((i) => i.body.trim().length >= 2).length} root
            {inputs.filter((i) => i.body.trim().length >= 2).length !== 1 ? "s" : ""}
          </button>
        </form>
      </div>
    </div>
  );
}
