"use client";

import { useState } from "react";
import type { GardenPromise } from "@/lib/types/personal";
import { toGardenPromise } from "@/lib/garden/gardenState";
import type { VerificationMethod } from "@/lib/types/promise";

const DOMAINS = ["health", "work", "relationships", "creative", "financial"] as const;
type DomainId = typeof DOMAINS[number];

const VERIFICATION_OPTIONS: { value: VerificationMethod; label: string }[] = [
  { value: "none",        label: "No verification" },
  { value: "self-report", label: "Self-report" },
  { value: "sensor",      label: "Sensor (auto)" },
];

const STATUS_DOT: Record<string, string> = {
  verified:     "bg-green-500",
  declared:     "bg-gray-400",
  degraded:     "bg-amber-500",
  violated:     "bg-gray-300",
  unverifiable: "bg-gray-200",
};

interface SubPromiseCreatorProps {
  promise: GardenPromise;
  subPromises: GardenPromise[];
  onAdd: (parentId: string, sub: GardenPromise) => void;
  onClose: () => void;
}

export function SubPromiseCreator({ promise, subPromises, onAdd, onClose }: SubPromiseCreatorProps) {
  const [showForm, setShowForm] = useState(subPromises.length === 0);
  const [body, setBody] = useState("");
  const [domain, setDomain] = useState<DomainId>(promise.domain as DomainId ?? "health");
  const [method, setMethod] = useState<VerificationMethod>("self-report");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    setSubmitting(true);

    const personalPromise = {
      id: crypto.randomUUID(),
      promiser: "me",
      promisee: "me",
      body: body.trim(),
      domain,
      status: "declared" as const,
      note: "",
      verification: { method },
      depends_on: [],
      isPersonal: true as const,
      origin: "voluntary" as const,
      createdAt: new Date().toISOString(),
    };

    const gardenPromise = toGardenPromise(personalPromise as any);
    onAdd(promise.id, gardenPromise);
    setBody("");
    setShowForm(false);
    setSubmitting(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.3)" }}
      aria-modal="true"
      role="dialog"
      aria-label="Break this promise down"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-serif font-semibold text-gray-900">Break this down</h2>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{promise.body}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-gray-400">✕</button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Existing sub-promises */}
          {subPromises.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sub-promises</p>
              {subPromises.map((sub) => (
                <div key={sub.id} className="flex items-center gap-2 py-1.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[sub.status] ?? "bg-gray-300"}`} aria-hidden="true" />
                  <span className="text-sm text-gray-700 flex-1">{sub.body}</span>
                  <span className="text-xs text-gray-400 capitalize">{sub.domain}</span>
                </div>
              ))}
            </div>
          )}

          {/* Add form toggle */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-2.5 text-sm text-green-700 border border-dashed border-green-300 rounded-xl hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-green-600"
            >
              + Add sub-promise
            </button>
          )}

          {/* Create form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="sub-body" className="text-sm font-medium text-gray-700 mb-1 block">
                  What specifically?
                </label>
                <textarea
                  id="sub-body"
                  rows={2}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="e.g. Go to the gym every Monday and Thursday"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-600"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="sub-domain" className="text-sm font-medium text-gray-700 mb-1 block">Domain</label>
                <select
                  id="sub-domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as DomainId)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  {DOMAINS.map((d) => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sub-method" className="text-sm font-medium text-gray-700 mb-1 block">How verified?</label>
                <select
                  id="sub-method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as VerificationMethod)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  {VERIFICATION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setBody(""); }}
                  className="flex-1 py-2 text-sm text-gray-500 border rounded-xl hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!body.trim() || submitting}
                  className="flex-1 py-2 text-sm font-semibold bg-green-700 text-white rounded-xl disabled:opacity-40 hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-green-600"
                >
                  Plant it
                </button>
              </div>
            </form>
          )}
        </div>

        {!showForm && (
          <div className="px-5 pb-5">
            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm text-gray-500 border rounded-xl hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-gray-400"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
