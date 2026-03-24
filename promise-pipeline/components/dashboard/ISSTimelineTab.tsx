"use client";

// ISS Critical Path to Deorbit — Gantt-style timeline
// Shows the sequence of milestones from now through splashdown ~2031.
// The Roscosmos 2028 commitment endpoint is the structural fault line:
// a red cliff at December 31, 2028.

interface Milestone {
  id: string;
  label: string;
  date: string; // ISO date
  type: "event" | "cliff" | "launch" | "deadline";
  note: string;
  promiseRef?: string;
}

interface GanttRow {
  id: string;
  category: string;
  label: string;
  start: string; // ISO date YYYY-MM
  end: string;   // ISO date YYYY-MM
  color: string;
  status: "active" | "planned" | "at-risk" | "critical";
  note: string;
  promiseRef?: string;
}

// Timeline range: January 2024 – December 2031 (96 months)
const RANGE_START = new Date("2024-01-01");
const RANGE_END = new Date("2031-12-31");
const TOTAL_MONTHS =
  (RANGE_END.getFullYear() - RANGE_START.getFullYear()) * 12 +
  (RANGE_END.getMonth() - RANGE_START.getMonth());

function monthsFromStart(dateStr: string): number {
  const d = new Date(dateStr + "-01");
  return (
    (d.getFullYear() - RANGE_START.getFullYear()) * 12 +
    (d.getMonth() - RANGE_START.getMonth())
  );
}

function pct(months: number): string {
  return `${((months / TOTAL_MONTHS) * 100).toFixed(2)}%`;
}

function spanPct(start: string, end: string): { left: string; width: string } {
  const s = Math.max(0, monthsFromStart(start));
  const e = Math.min(TOTAL_MONTHS, monthsFromStart(end));
  return {
    left: pct(s),
    width: pct(e - s),
  };
}

const ganttRows: GanttRow[] = [
  // ── Funding ──
  {
    id: "fund-fy26",
    category: "Funding",
    label: "FY2026 Appropriation (ISS-F01)",
    start: "2025-10",
    end: "2026-09",
    color: "#78350f",
    status: "active",
    note: "$1.49B appropriated. P.L. 119-74 signed Jan 23, 2026.",
    promiseRef: "ISS-F01",
  },
  {
    id: "fund-fy27",
    category: "Funding",
    label: "FY2027 Appropriation (must renew)",
    start: "2026-10",
    end: "2027-09",
    color: "#92400e",
    status: "planned",
    note: "Annual renewal required. Not yet appropriated.",
    promiseRef: "ISS-F01",
  },
  {
    id: "fund-fy28",
    category: "Funding",
    label: "FY2028 Appropriation (must renew)",
    start: "2027-10",
    end: "2028-09",
    color: "#92400e",
    status: "planned",
    note: "Annual renewal required. Not yet appropriated.",
    promiseRef: "ISS-F01",
  },
  {
    id: "fund-fy29",
    category: "Funding",
    label: "FY2029 Appropriation (must renew)",
    start: "2028-10",
    end: "2029-09",
    color: "#b45309",
    status: "at-risk",
    note: "Annual renewal required. Budget pressure increasing as CLD demands funding.",
    promiseRef: "ISS-F01",
  },
  {
    id: "fund-fy30",
    category: "Funding",
    label: "FY2030 Appropriation (must renew)",
    start: "2029-10",
    end: "2030-09",
    color: "#b45309",
    status: "at-risk",
    note: "Final ISS operations year. Deorbit costs peak.",
    promiseRef: "ISS-F01",
  },

  // ── Roscosmos Commitment (THE CLIFF) ──
  {
    id: "rosc-commitment",
    category: "Roscosmos",
    label: "Roscosmos commitment (ISS-F03)",
    start: "2024-01",
    end: "2028-12",
    color: "#dc2626",
    status: "active",
    note: "Agreed July 31, 2025. Ends Dec 2028. NASA committed through 2030 — 2-year structural gap.",
    promiseRef: "ISS-F03",
  },
  {
    id: "rosc-gap",
    category: "Roscosmos",
    label: "⚠ ROSCOSMOS GAP — no commitment",
    start: "2029-01",
    end: "2030-12",
    color: "#7f1d1d",
    status: "critical",
    note: "Roscosmos has NOT committed to 2029-2030. Russian segment attitude control and deorbit participation unconfirmed for this period.",
    promiseRef: "ISS-F03",
  },

  // ── Crew Transport ──
  {
    id: "ct-dragon",
    category: "Crew Transport",
    label: "SpaceX Crew Dragon rotations (ISS-CT02)",
    start: "2024-01",
    end: "2030-12",
    color: "#7c3aed",
    status: "active",
    note: "18 successful missions. Crew-12 (Meir, Hathaway, Adenot, Fedyaev) launched Feb 13, 2026. Sole operational provider.",
    promiseRef: "ISS-CT02",
  },
  {
    id: "ct-starliner1",
    category: "Crew Transport",
    label: "Starliner-1 uncrewed test (ISS-CT03)",
    start: "2026-04",
    end: "2026-06",
    color: "#6d28d9",
    status: "at-risk",
    note: "Targeting NET April 2026. Must succeed for crewed certification to proceed.",
    promiseRef: "ISS-CT03",
  },
  {
    id: "ct-starliner2",
    category: "Crew Transport",
    label: "Starliner-2 (first crewed, if T-1 succeeds)",
    start: "2026-10",
    end: "2027-04",
    color: "#4c1d95",
    status: "planned",
    note: "Conditional on Starliner-1 success. Would restore redundancy in crew transport.",
    promiseRef: "ISS-CT01",
  },

  // ── Resupply & Fuel ──
  {
    id: "rs-dragon",
    category: "Resupply",
    label: "SpaceX Dragon cargo (ISS-RS01)",
    start: "2024-01",
    end: "2030-12",
    color: "#2563eb",
    status: "active",
    note: "Primary U.S. cargo vehicle. Also testing Dragon reboost capability (boost kit on CRS-33).",
    promiseRef: "ISS-RS01",
  },
  {
    id: "rs-cygnus",
    category: "Resupply",
    label: "Northrop Grumman Cygnus (ISS-RS02)",
    start: "2024-01",
    end: "2030-12",
    color: "#1d4ed8",
    status: "active",
    note: "Secondary cargo vehicle. No return capability. Used for trash disposal.",
    promiseRef: "ISS-RS02",
  },
  {
    id: "rs-progress",
    category: "Resupply",
    label: "Progress cargo & fuel (ISS-RS03)",
    start: "2024-01",
    end: "2028-12",
    color: "#dc2626",
    status: "at-risk",
    note: "Critical for fuel delivery and reboost. Baikonur Site 31 damaged Nov 2025. Fuel reserves must reach required levels by early 2028.",
    promiseRef: "ISS-RS03",
  },

  // ── Station Maintenance ──
  {
    id: "sm-zvezda",
    category: "Maintenance",
    label: "Zvezda leak monitoring (ISS-SM01)",
    start: "2024-01",
    end: "2030-12",
    color: "#d97706",
    status: "at-risk",
    note: "5/5 severity NASA rating. New pressure signature detected June 2025. NASA and Roscosmos disagree on root cause.",
    promiseRef: "ISS-SM01",
  },
  {
    id: "sm-irosa",
    category: "Maintenance",
    label: "iROSA solar array installation (ISS-SM02)",
    start: "2024-01",
    end: "2027-12",
    color: "#f59e0b",
    status: "active",
    note: "Roll-Out Solar Arrays replacing aging original arrays. Canadarm2 and Dextre operational.",
    promiseRef: "ISS-SM02",
  },

  // ── Orbital Lowering Phase ──
  {
    id: "deorbit-lowering",
    category: "Deorbit",
    label: "Orbital lowering begins (ISS-OO01)",
    start: "2028-06",
    end: "2029-06",
    color: "#374151",
    status: "planned",
    note: "Controlled drift using Russian segment thrusters. Fuel reserves must be in place by early 2028.",
    promiseRef: "ISS-OO01",
  },
  {
    id: "deorbit-usdv",
    category: "Deorbit",
    label: "USDV arrives at ISS (ISS-D01)",
    start: "2029-04",
    end: "2029-08",
    color: "#111827",
    status: "planned",
    note: "SpaceX USDV ($843M contract) docks to Harmony forward port. 46 Draco thrusters, 16,000 kg propellant.",
    promiseRef: "ISS-D01",
  },
  {
    id: "deorbit-final",
    category: "Deorbit",
    label: "Final deorbit burns & splashdown (ISS-D02)",
    start: "2030-06",
    end: "2031-06",
    color: "#0f0f1a",
    status: "planned",
    note: "USDV performs 4-day series of deorbit burns. 925,000 lb structure at 17,100 mph. Point Nemo target. ~2,000 km debris corridor.",
    promiseRef: "ISS-D02",
  },

  // ── Commercial Stations (Transition) ──
  {
    id: "trans-vast",
    category: "Transition",
    label: "Vast Haven-1 launch target (ISS-T05)",
    start: "2027-01",
    end: "2028-06",
    color: "#0891b2",
    status: "planned",
    note: "Q1 2027. 4 crew, 2-week missions. Limited capability but could be first commercial station in orbit.",
    promiseRef: "ISS-T05",
  },
  {
    id: "trans-axiom",
    category: "Transition",
    label: "Axiom Hab-1 launch & attach (ISS-T02)",
    start: "2027-06",
    end: "2029-06",
    color: "#0e7490",
    status: "at-risk",
    note: "First module 2027. PPTM launches first, then Hab-1. USDV port conflict with Axiom under resolution. Capital raising difficult.",
    promiseRef: "ISS-T02",
  },
  {
    id: "trans-starlab",
    category: "Transition",
    label: "Starlab launch via Starship (ISS-T03)",
    start: "2029-01",
    end: "2030-06",
    color: "#155e75",
    status: "planned",
    note: "Voyager/Airbus/Northrop Grumman. Single-module = full capacity on arrival. CDR targeted early 2026. Starship dependency introduces timeline risk.",
    promiseRef: "ISS-T03",
  },
];

const milestones: Milestone[] = [
  {
    id: "m-fy26-signed",
    label: "FY2026 signed (P.L. 119-74)",
    date: "2026-01",
    type: "event",
    note: "Congress preserves $1.49B against 24% cut proposal.",
    promiseRef: "ISS-F01",
  },
  {
    id: "m-crew11-evac",
    label: "Crew-11 medical evacuation",
    date: "2026-01",
    type: "event",
    note: "First medical evacuation in ISS history. Fincke blood clot, Jan 15, 2026.",
    promiseRef: "ISS-CS02",
  },
  {
    id: "m-crew12",
    label: "Crew-12 launches",
    date: "2026-02",
    type: "launch",
    note: "Meir, Hathaway, Adenot, Fedyaev. Accelerated to minimize skeleton crew period.",
    promiseRef: "ISS-CT02",
  },
  {
    id: "m-starliner1",
    label: "Starliner-1 (NET)",
    date: "2026-04",
    type: "launch",
    note: "Uncrewed cargo-only test. Must succeed for crewed certification.",
    promiseRef: "ISS-CT03",
  },
  {
    id: "m-fuel-ready",
    label: "Fuel reserves ready for deorbit",
    date: "2028-03",
    type: "deadline",
    note: "ISS PM Dana Weigel: fuel must be at required levels by early 2028 to begin orbital lowering mid-2028.",
    promiseRef: "ISS-RS03",
  },
  {
    id: "m-rosc-cliff",
    label: "ROSCOSMOS COMMITMENT ENDS",
    date: "2028-12",
    type: "cliff",
    note: "The structural fault line. Russian segment provides non-substitutable attitude control, reboost, and deorbit participation.",
    promiseRef: "ISS-F03",
  },
  {
    id: "m-usdv-arrive",
    label: "USDV arrives at ISS",
    date: "2029-06",
    type: "launch",
    note: "SpaceX Deorbit Vehicle docks to Harmony forward port. ~18 months before final reentry.",
    promiseRef: "ISS-D01",
  },
  {
    id: "m-splashdown",
    label: "Splashdown target (Point Nemo)",
    date: "2031-03",
    type: "deadline",
    note: "925,000 lb structure. ~2,000 km debris corridor in South Pacific.",
    promiseRef: "ISS-D02",
  },
];

const STATUS_COLORS: Record<string, string> = {
  active: "#1a5f4a",
  planned: "#2563eb",
  "at-risk": "#b45309",
  critical: "#7f1d1d",
};

const YEAR_LABELS = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031];

const CATEGORIES = [
  "Funding",
  "Roscosmos",
  "Crew Transport",
  "Resupply",
  "Maintenance",
  "Deorbit",
  "Transition",
];

export function ISSTimelineTab() {
  const rowsByCategory = CATEGORIES.map((cat) => ({
    category: cat,
    rows: ganttRows.filter((r) => r.category === cat),
  }));

  return (
    <div className="space-y-6">
      {/* Header callout */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-4 h-4 rounded-full bg-red-600 shrink-0" />
          <div>
            <p className="font-semibold text-red-900 text-sm">
              The 2028 Structural Cliff
            </p>
            <p className="text-sm text-red-800 mt-0.5">
              Roscosmos is committed through December 2028. NASA and partners are
              committed through December 2030. Russian segment provides{" "}
              <strong>non-substitutable</strong> attitude control, orbital reboost,
              and deorbit participation. The entire deorbit plan depends on Russian
              participation through at least mid-2030. The 2-year gap has no
              confirmed resolution.
            </p>
          </div>
        </div>
      </div>

      {/* Lindblad Analysis — Healthiest Network */}
      <div style={{
        background: '#ecfdf5',
        border: '1px solid #a7f3d0',
        borderRadius: 8,
        padding: '14px 16px',
        marginBottom: 24,
      }}>
        <div style={{ fontFamily: 'IBM Plex Serif, serif', fontWeight: 600, fontSize: 14, marginBottom: 6, color: '#1a5f4a' }}>
          Lindblad Analysis — Healthiest Network in the Corpus
        </div>
        <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, margin: 0 }}>
          The ISS network scores 74/100 — the highest health score in the Promise Pipeline corpus.
          The Lindblad projection explains why: the majority of ISS promises operate in the
          <strong> computing regime</strong> with numeric, periodic, sensor-verified commitments.
          Life support metrics, orbital parameters, and resupply schedules all have continuous
          automated verification. The crossover direction is <strong>met-rising</strong> across
          most promises — the system is resolving its commitments, not failing them. This is what
          a well-architected promise network looks like: high verification coverage, distributed
          dependencies, and numeric targets with automated observation.
        </p>
      </div>

      {/* Gantt chart */}
      <div className="bg-white rounded-xl border p-6 overflow-x-auto">
        <h3 className="font-serif font-semibold text-gray-900 mb-4">
          Critical Path to Deorbit (2024–2031)
        </h3>

        {/* Year header */}
        <div className="relative mb-2" style={{ minWidth: 900 }}>
          <div className="flex ml-40">
            {YEAR_LABELS.map((year) => (
              <div
                key={year}
                className="flex-1 text-xs font-medium text-gray-500 text-center border-l border-gray-200 pl-1"
              >
                {year}
              </div>
            ))}
          </div>
        </div>

        {/* Rows by category */}
        <div style={{ minWidth: 900 }}>
          {rowsByCategory.map(({ category, rows }) => (
            <div key={category} className="mb-4">
              {/* Category label */}
              <div className="flex items-center mb-1">
                <div className="w-40 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide pr-2">
                  {category}
                </div>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Rows */}
              {rows.map((row) => {
                const { left, width } = spanPct(row.start, row.end);
                return (
                  <div
                    key={row.id}
                    className="flex items-center mb-1 group relative"
                  >
                    {/* Row label */}
                    <div
                      className="w-40 shrink-0 text-xs text-gray-600 truncate pr-2 text-right"
                      title={row.label}
                    >
                      {row.label.replace(/\s*\(ISS-\w+\)/, "")}
                    </div>

                    {/* Bar track */}
                    <div className="flex-1 h-6 bg-gray-50 rounded relative border border-gray-100">
                      {/* Year grid lines */}
                      {YEAR_LABELS.slice(1).map((year) => {
                        const offset = monthsFromStart(
                          `${year}-01`
                        );
                        return (
                          <div
                            key={year}
                            className="absolute top-0 bottom-0 w-px bg-gray-200"
                            style={{ left: pct(offset) }}
                          />
                        );
                      })}

                      {/* Roscosmos cliff line (always shown) */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                        style={{ left: pct(monthsFromStart("2028-12")) }}
                      />

                      {/* The bar */}
                      <div
                        className="absolute top-1 bottom-1 rounded"
                        style={{
                          left,
                          width,
                          backgroundColor: row.color,
                          opacity: row.status === "planned" ? 0.5 : 0.85,
                        }}
                        title={`${row.label}: ${row.note}`}
                      />
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute left-40 -bottom-16 z-30 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg p-2 max-w-xs shadow-xl pointer-events-none">
                      <p className="font-semibold mb-0.5">{row.label}</p>
                      <p className="text-gray-300">{row.note}</p>
                      {row.promiseRef && (
                        <p className="text-gray-400 mt-0.5 font-mono">
                          {row.promiseRef}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Milestone markers */}
          <div className="flex items-center mb-1 mt-4">
            <div className="w-40 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide pr-2">
              Milestones
            </div>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="flex items-start">
            <div className="w-40 shrink-0" />
            <div className="flex-1 h-10 bg-gray-50 rounded border border-gray-100 relative">
              {/* Year grid */}
              {YEAR_LABELS.slice(1).map((year) => (
                <div
                  key={year}
                  className="absolute top-0 bottom-0 w-px bg-gray-200"
                  style={{ left: pct(monthsFromStart(`${year}-01`)) }}
                />
              ))}
              {/* Cliff */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                style={{ left: pct(monthsFromStart("2028-12")) }}
              />
              {/* Milestone diamonds */}
              {milestones.map((m) => {
                const offset = monthsFromStart(m.date);
                const colorMap: Record<string, string> = {
                  event: "#2563eb",
                  cliff: "#dc2626",
                  launch: "#059669",
                  deadline: "#d97706",
                };
                return (
                  <div
                    key={m.id}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group"
                    style={{ left: pct(offset) }}
                    title={`${m.label}: ${m.note}`}
                  >
                    <div
                      className="w-3 h-3 rotate-45 border-2 border-white shadow"
                      style={{ backgroundColor: colorMap[m.type] }}
                    />
                    <div className="absolute bottom-5 -translate-x-1/2 left-1.5 z-30 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg p-2 min-w-max max-w-xs shadow-xl pointer-events-none">
                      <p className="font-semibold">{m.label}</p>
                      <p className="text-gray-300 mt-0.5">{m.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded" style={{ backgroundColor: "#1a5f4a", opacity: 0.85 }} />
            <span>Active / Verified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded" style={{ backgroundColor: "#2563eb", opacity: 0.5 }} />
            <span>Planned (declared)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded" style={{ backgroundColor: "#b45309", opacity: 0.85 }} />
            <span>At risk (degraded)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded" style={{ backgroundColor: "#7f1d1d", opacity: 0.85 }} />
            <span>Critical / No commitment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-0.5 h-3 bg-red-500 inline-block" />
            <span className="text-red-700 font-medium">Roscosmos cliff (Dec 2028)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rotate-45 border-2 border-gray-300 inline-block" style={{ backgroundColor: "#059669" }} />
            <span>Launch / milestone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rotate-45 border-2 border-gray-300 inline-block" style={{ backgroundColor: "#dc2626" }} />
            <span>Cliff / critical deadline</span>
          </div>
        </div>
      </div>

      {/* Key milestones list */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif font-semibold text-gray-900 mb-4">
          Key Milestones in Sequence
        </h3>
        <div className="space-y-3">
          {milestones.map((m) => {
            const isCliff = m.type === "cliff";
            return (
              <div
                key={m.id}
                className={`flex gap-4 items-start p-3 rounded-lg ${
                  isCliff
                    ? "bg-red-50 border border-red-200"
                    : "border border-gray-100"
                }`}
              >
                <div className="text-xs font-mono text-gray-400 w-20 shrink-0 pt-0.5">
                  {m.date}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-semibold ${
                      isCliff ? "text-red-900" : "text-gray-900"
                    }`}
                  >
                    {m.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${isCliff ? "text-red-700" : "text-gray-500"}`}>
                    {m.note}
                  </p>
                  {m.promiseRef && (
                    <span className="text-xs font-mono text-gray-400 mt-0.5 inline-block">
                      {m.promiseRef}
                    </span>
                  )}
                </div>
                {isCliff && (
                  <div className="shrink-0">
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                      STRUCTURAL CLIFF
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(STATUS_COLORS).map(([status, color]) => {
          const count = ganttRows.filter((r) => r.status === status).length;
          const labels: Record<string, string> = {
            active: "Active",
            planned: "Planned",
            "at-risk": "At Risk",
            critical: "Critical",
          };
          return (
            <div
              key={status}
              className="bg-white rounded-xl border p-4 flex items-center gap-3"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{labels[status]}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lindblad Analysis — Crew Access Vulnerability */}
      <div style={{
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: 8,
        padding: '12px 14px',
        marginTop: 10,
        fontSize: 13,
        color: '#4b5563',
        lineHeight: 1.6,
      }}>
        <strong>Crew access is the structural vulnerability.</strong> The Starliner cascade
        (single-provider crew access dependency) and the Roscosmos 2028 commitment gap represent
        hub vulnerabilities in an otherwise healthy network. The Lindblad projection for crew
        access promises shows <strong>transitional regime</strong> (k &asymp; 0.55) — these promises
        are not in the computing regime like the rest of the ISS network because crew launch
        commitments depend on hardware development timelines that resist periodic verification.
        The optimal review interval is <strong>every 3 cycles</strong>, with attention focused
        on the commercial station transition promises that will inherit these dependencies.
      </div>

      {/* Lindblad Analysis — Post-2030 Transition */}
      <div style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: '12px 14px',
        marginTop: 10,
        fontSize: 13,
        color: '#4b5563',
        lineHeight: 1.6,
      }}>
        <strong>Post-2030 transition:</strong> The ISS commitment network has a known sunset.
        The Lindblad projection for the commercial station readiness promises shows
        <strong> composting dynamics</strong> (k &lt; 0.4) — these promises are declared but
        lack the verification infrastructure of the operational ISS network. The transition
        from ISS to commercial stations is, in promise network terms, a transfer from a
        computing-regime network to a composting-regime one. The verification architecture
        hasn&apos;t been built yet for the successor.
      </div>
    </div>
  );
}
