"use client";

import { useState } from "react";
import { BillMeta } from "@/lib/types/annotation";

interface OpenStatesBill {
  id: string;
  identifier: string;
  title: string;
  session: string;
  jurisdiction: { name: string; id: string };
  abstracts?: { abstract: string }[];
  classification?: string[];
}

interface BillSearchProps {
  onBillLoaded: (bill: BillMeta, text: string) => void;
}

const STATES = [
  { label: "All States", value: "" },
  { label: "California", value: "California" },
  { label: "Colorado", value: "Colorado" },
  { label: "Hawaii", value: "Hawaii" },
  { label: "Illinois", value: "Illinois" },
  { label: "Maine", value: "Maine" },
  { label: "Maryland", value: "Maryland" },
  { label: "Massachusetts", value: "Massachusetts" },
  { label: "Michigan", value: "Michigan" },
  { label: "Minnesota", value: "Minnesota" },
  { label: "Nevada", value: "Nevada" },
  { label: "New Mexico", value: "New Mexico" },
  { label: "New York", value: "New York" },
  { label: "Oregon", value: "Oregon" },
  { label: "Virginia", value: "Virginia" },
  { label: "Washington", value: "Washington" },
];

function slugify(name: string, identifier: string): string {
  const state = name.split(" ")[0].toLowerCase().slice(0, 2);
  const bill = identifier.toLowerCase().replace(/[\s.]+/g, "");
  return `${state}-${bill}`;
}

export default function BillSearch({ onBillLoaded }: BillSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [results, setResults] = useState<OpenStatesBill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [showManualPaste, setShowManualPaste] = useState(false);
  const [manualText, setManualText] = useState("");
  const [manualBillName, setManualBillName] = useState("");
  const [manualCitation, setManualCitation] = useState("");
  const [manualJurisdiction, setManualJurisdiction] = useState("");
  const [manualYear, setManualYear] = useState("");
  const [loadingBillId, setLoadingBillId] = useState<string | null>(null);
  const [fetchingText, setFetchingText] = useState(false);

  async function handleSearch(cursor?: string) {
    if (!query.trim() && !selectedState) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        ...(query.trim() && { q: query.trim() }),
        ...(selectedState && { jurisdiction: selectedState }),
        classification: "bill",
        per_page: "10",
        ...(cursor && { page: cursor }),
      });

      const headers: Record<string, string> = {};
      // API key is optional — works without it at lower rate limits
      const res = await fetch(`https://v3.openstates.org/bills?${params}`, {
        headers,
      });

      if (!res.ok) {
        throw new Error(`OpenStates API error: ${res.status}`);
      }

      const data = await res.json();
      if (cursor) {
        setResults((prev) => [...prev, ...(data.results || [])]);
      } else {
        setResults(data.results || []);
      }
      setNextCursor(data.pagination?.next || null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to search bills"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadBill(bill: OpenStatesBill) {
    setLoadingBillId(bill.id);
    setFetchingText(true);
    setError(null);

    try {
      // Try to get full text from OpenStates
      const res = await fetch(
        `https://v3.openstates.org/bills/${encodeURIComponent(bill.id)}?include=documents`,
        { headers: {} }
      );

      let billText = "";
      if (res.ok) {
        const detail = await res.json();
        // Check for documents array — try to find HTML text
        if (detail.documents && detail.documents.length > 0) {
          for (const doc of detail.documents) {
            if (doc.links) {
              for (const link of doc.links) {
                if (
                  link.media_type === "text/html" ||
                  link.url?.endsWith(".html") ||
                  link.url?.endsWith(".htm")
                ) {
                  try {
                    const textRes = await fetch(link.url);
                    if (textRes.ok) {
                      const html = await textRes.text();
                      // Strip HTML tags
                      billText = html
                        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
                        .replace(/<[^>]+>/g, " ")
                        .replace(/\s+/g, " ")
                        .trim();
                      break;
                    }
                  } catch {
                    // Skip failed fetches
                  }
                }
                if (
                  link.media_type === "application/pdf" ||
                  link.url?.endsWith(".pdf")
                ) {
                  // Can't parse PDF — will fall through to manual paste
                  continue;
                }
              }
              if (billText) break;
            }
          }
        }
      }

      if (!billText) {
        // No text found — show manual paste
        setShowManualPaste(true);
        setManualBillName(bill.title);
        setManualCitation(bill.identifier);
        setManualJurisdiction(bill.jurisdiction?.name || "");
        setManualYear(bill.session ? bill.session.slice(0, 4) : "");
        setFetchingText(false);
        setLoadingBillId(null);
        return;
      }

      const billMeta: BillMeta = {
        slug: slugify(bill.jurisdiction?.name || "", bill.identifier),
        name: bill.title,
        citation: bill.identifier,
        jurisdiction: bill.jurisdiction?.name || "",
        year: bill.session ? parseInt(bill.session.slice(0, 4)) : 0,
        fetchedAt: new Date().toISOString(),
      };

      onBillLoaded(billMeta, billText);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load bill text"
      );
    } finally {
      setFetchingText(false);
      setLoadingBillId(null);
    }
  }

  function handleManualSubmit() {
    if (!manualText.trim() || !manualBillName.trim()) return;
    const billMeta: BillMeta = {
      slug: slugify(manualJurisdiction || "xx", manualCitation || "manual"),
      name: manualBillName,
      citation: manualCitation,
      jurisdiction: manualJurisdiction,
      year: manualYear ? parseInt(manualYear) : 0,
      fetchedAt: new Date().toISOString(),
    };
    onBillLoaded(billMeta, manualText);
  }

  return (
    <div className="space-y-6">
      {/* Search form */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label
              htmlFor="bill-search-query"
              className="block text-sm font-medium text-[#4b5563] mb-1"
            >
              Search bills
            </label>
            <input
              id="bill-search-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by topic, bill number, or keyword..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-sans text-sm
                focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          </div>
          <div className="sm:w-48">
            <label
              htmlFor="bill-search-state"
              className="block text-sm font-medium text-[#4b5563] mb-1"
            >
              State
            </label>
            <select
              id="bill-search-state"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-sans text-sm
                focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {STATES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:self-end">
            <button
              onClick={() => handleSearch()}
              disabled={loading || (!query.trim() && !selectedState)}
              className="w-full sm:w-auto px-5 py-2 bg-[#1f2937] text-white rounded-md font-sans text-sm font-medium
                hover:bg-[#374151] disabled:opacity-50 disabled:cursor-not-allowed
                focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="px-4 py-3 rounded-md text-sm font-sans"
          style={{ background: "#fef2f2", color: "#991b1b" }}
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[#4b5563]">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </h3>
          <ul className="space-y-2">
            {results.map((bill) => (
              <li
                key={bill.id}
                className="border border-gray-200 rounded-md p-4 hover:border-gray-400 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-medium text-[#1f2937]">
                      {bill.identifier}
                    </p>
                    <p className="text-sm text-[#1f2937] mt-0.5 line-clamp-2">
                      {bill.title}
                    </p>
                    <p className="text-xs text-[#4b5563] mt-1">
                      {bill.jurisdiction?.name} — {bill.session}
                    </p>
                    {bill.abstracts?.[0]?.abstract && (
                      <p className="text-xs text-[#4b5563] mt-1 line-clamp-2">
                        {bill.abstracts[0].abstract}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => loadBill(bill)}
                    disabled={loadingBillId === bill.id}
                    className="shrink-0 px-4 py-1.5 text-sm font-medium text-white rounded-md
                      bg-[#1a5f4a] hover:bg-[#155e3d] disabled:opacity-50
                      focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    {loadingBillId === bill.id
                      ? fetchingText
                        ? "Fetching text..."
                        : "Loading..."
                      : "Load for annotation"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {nextCursor && (
            <button
              onClick={() => handleSearch(nextCursor)}
              disabled={loading}
              className="w-full py-2 text-sm font-medium text-[#4b5563] border border-gray-300 rounded-md
                hover:bg-gray-50 disabled:opacity-50
                focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Load more
            </button>
          )}
        </div>
      )}

      {/* Manual paste fallback */}
      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={() => setShowManualPaste(!showManualPaste)}
          className="text-sm font-medium text-[#1e40af] hover:underline
            focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {showManualPaste ? "Hide" : "Paste bill text manually"}
        </button>

        {showManualPaste && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="manual-bill-name"
                  className="block text-sm font-medium text-[#4b5563] mb-1"
                >
                  Bill name
                </label>
                <input
                  id="manual-bill-name"
                  type="text"
                  value={manualBillName}
                  onChange={(e) => setManualBillName(e.target.value)}
                  placeholder="e.g. Clean Energy Transformation Act"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-sans text-sm
                    focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="manual-citation"
                  className="block text-sm font-medium text-[#4b5563] mb-1"
                >
                  Citation
                </label>
                <input
                  id="manual-citation"
                  type="text"
                  value={manualCitation}
                  onChange={(e) => setManualCitation(e.target.value)}
                  placeholder="e.g. SB 5116"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-sans text-sm
                    focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="manual-jurisdiction"
                  className="block text-sm font-medium text-[#4b5563] mb-1"
                >
                  Jurisdiction
                </label>
                <input
                  id="manual-jurisdiction"
                  type="text"
                  value={manualJurisdiction}
                  onChange={(e) => setManualJurisdiction(e.target.value)}
                  placeholder="e.g. Washington"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-sans text-sm
                    focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="manual-year"
                  className="block text-sm font-medium text-[#4b5563] mb-1"
                >
                  Year
                </label>
                <input
                  id="manual-year"
                  type="text"
                  value={manualYear}
                  onChange={(e) => setManualYear(e.target.value)}
                  placeholder="e.g. 2019"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-sans text-sm
                    focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="manual-bill-text"
                className="block text-sm font-medium text-[#4b5563] mb-1"
              >
                Bill text
              </label>
              <textarea
                id="manual-bill-text"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Paste the full text of the bill here..."
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs leading-relaxed
                  focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
              />
            </div>
            <button
              onClick={handleManualSubmit}
              disabled={!manualText.trim() || !manualBillName.trim()}
              className="px-5 py-2 bg-[#1f2937] text-white rounded-md font-sans text-sm font-medium
                hover:bg-[#374151] disabled:opacity-50 disabled:cursor-not-allowed
                focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Load for annotation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
