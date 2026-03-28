"use client";

import { useState, useEffect } from "react";
import type { OrgPromise, ExternalDependency } from "@/lib/types/org";
import type { PromiseStatus } from "@/lib/types/promise";
import { suggestCivicLinks } from "@/lib/garden/civicSync";

type Dashboard = "gresham" | "hb2021";

const DASHBOARD_LABELS: Record<Dashboard, string> = {
  gresham: "Gresham CAP",
  hb2021:  "Oregon HB 2021",
};

/**
 * CivicLinkSetup — link org promises to civic dashboard promises.
 * Suggests relevant civic promises based on domain matching.
 */
export function CivicLinkSetup({
  orgPromises,
  onAddDependency,
}: {
  orgPromises: OrgPromise[];
  onAddDependency: (orgPromiseId: string, dep: Omit<ExternalDependency, "id" | "lastSyncedAt">) => Promise<void>;
}) {
  const [selectedPromiseId, setSelectedPromiseId] = useState<string>("");
  const [dashboard, setDashboard] = useState<Dashboard>("gresham");
  const [suggestions, setSuggestions] = useState<
    { id: string; body: string; domain: string; status: PromiseStatus }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const selectedOrgPromise = orgPromises.find((p) => p.id === selectedPromiseId);

  useEffect(() => {
    if (!selectedOrgPromise) { setSuggestions([]); return; }
    setLoading(true);
    suggestCivicLinks(selectedOrgPromise.domain, dashboard)
      .then(setSuggestions)
      .finally(() => setLoading(false));
  }, [selectedOrgPromise, dashboard]);

  async function handleLink(civic: { id: string; body: string; domain: string; status: PromiseStatus }) {
    if (!selectedPromiseId) return;
    setAdding(civic.id);
    try {
      await onAddDependency(selectedPromiseId, {
        type: "civic",
        label: `${DASHBOARD_LABELS[dashboard]}: ${civic.body.slice(0, 80)}`,
        civicPromiseId: civic.id,
        civicDashboard: dashboard,
        status: civic.status,
      });
      setAdded((prev) => new Set([...prev, civic.id]));
    } finally {
      setAdding(null);
    }
  }

  const STATUS_BADGE: Record<PromiseStatus, string> = {
    declared:     "bg-blue-50 text-blue-700",
    verified:     "bg-green-50 text-green-700",
    degraded:     "bg-amber-50 text-amber-700",
    violated:     "bg-red-50 text-red-700",
    unverifiable: "bg-gray-50 text-gray-500",
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-medium text-sm text-gray-900">Civic link setup</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Connect org promises to civic commitments. When civic status changes,
          the cascade propagates through your org.
        </p>
      </div>

      {orgPromises.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-6">
          Create org promises first, then link them to civic commitments.
        </p>
      ) : (
        <div className="space-y-4">
          {/* Org promise selector */}
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Org promise to link
            </label>
            <select
              value={selectedPromiseId}
              onChange={(e) => { setSelectedPromiseId(e.target.value); setAdded(new Set()); }}
              className="w-full border rounded-lg px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select a promise…</option>
              {orgPromises.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.body.slice(0, 70)}
                </option>
              ))}
            </select>
          </div>

          {/* Dashboard selector */}
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Civic dashboard
            </label>
            <div className="flex gap-2">
              {(Object.keys(DASHBOARD_LABELS) as Dashboard[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDashboard(d)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    dashboard === d
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {DASHBOARD_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          {selectedPromiseId && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">
                Suggested matches (by domain)
              </p>
              {loading ? (
                <p className="text-xs text-gray-400 text-center py-4">Loading…</p>
              ) : suggestions.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">
                  No matching civic promises found for domain "{selectedOrgPromise?.domain}".
                </p>
              ) : (
                <div className="space-y-2">
                  {suggestions.map((s) => {
                    const alreadyLinked = selectedOrgPromise?.externalDependencies.some(
                      (dep) => dep.civicPromiseId === s.id
                    ) || added.has(s.id);

                    return (
                      <div
                        key={s.id}
                        className="flex items-start gap-2 px-3 py-2.5 bg-white rounded-xl border text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <code className="text-gray-400 font-mono">{s.id}</code>
                            <span className={`px-1.5 py-0.5 rounded ${STATUS_BADGE[s.status]}`}>
                              {s.status}
                            </span>
                          </div>
                          <p className="text-gray-700 line-clamp-2">{s.body}</p>
                        </div>
                        <button
                          onClick={() => handleLink(s)}
                          disabled={alreadyLinked || adding === s.id}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            alreadyLinked
                              ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          } disabled:opacity-50`}
                        >
                          {alreadyLinked ? "Linked ✓" : adding === s.id ? "Linking…" : "Link"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
