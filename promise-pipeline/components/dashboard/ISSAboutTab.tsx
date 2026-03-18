"use client";

// ISS-specific About tab.
// Explains the Promise Theory framework in the context of the ISS,
// draws structural parallels to other Promise Pipeline case studies,
// and surfaces the book integration rationale.

export function ISSAboutTab() {
  return (
    <div className="space-y-6 max-w-3xl">

      {/* What is this dashboard */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">
          The ISS as a Promise Network
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          420 metric tons of metal and science is held in orbit by promises —
          promises between governments, between agencies, between companies. The
          station is the promise graph made physical.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          Five space agencies (NASA, Roscosmos, ESA, JAXA, CSA) and multiple
          commercial partners maintain a continuous human presence that has lasted
          over 25 years. The ISS has been occupied without interruption since
          November 2, 2000. The structure cannot exist without the promise network
          being mostly fulfilled. Gravity is the ultimate enforcement mechanism.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          This dashboard tracks 23 promises across 9 domains, drawn from publicly
          available data as of March 17, 2026. Every promise has a promiser,
          promisee, verification method, and dependency chain. The network shows
          which promises are structural bedrock and which are cascading risks.
        </p>
      </div>

      {/* Promise Theory framework */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-serif text-xl font-bold text-gray-900 mb-4">
          Promise Theory Concepts Illustrated
        </h2>
        <div className="space-y-4">
          <TermEntry
            term="Cascade"
            definition="When one promise fails, what else fails downstream?"
            example="Boeing Starliner's Type A mishap (ISS-CT03) cascaded into single-provider crew access (ISS-CT01), which means the medical evacuation system (ISS-CS02) has no backup vehicle. The cascade is two promises deep and spans two domains."
          />
          <TermEntry
            term="Bottleneck Node"
            definition="A promise so many others depend on that its failure is catastrophic."
            example="ISS-F01 (annual Congressional appropriation) has 4+ direct dependents — it is the bedrock of the entire network. ISS-OO01 (Russian segment attitude control) has no full U.S. alternative and is required for debris avoidance, deorbit, and ongoing orbital operations."
          />
          <TermEntry
            term="Verification Gap"
            definition="A promise that exists but cannot be independently confirmed."
            example="The Zvezda PrK leak (ISS-SM01): NASA can measure pressure loss (independent telemetry) but cannot independently assess the structural root cause — that interpretation is controlled by Roscosmos. NASA and Roscosmos literally disagree on whether the station is safe. The measurement exists; the meaning is contested."
          />
          <TermEntry
            term="Structural Conflict"
            definition="When keeping one promise requires breaking another."
            example="Every dollar spent operating ISS (~$1.5B/year) is a dollar not spent building its commercial successor. The ISS cannot deorbit until a commercial replacement is ready, but extending ISS delays the funding that would make replacements ready sooner. This conflict has no clean resolution — it is baked into the promise network."
          />
          <TermEntry
            term="Forced Renegotiation"
            definition="When circumstances change a promise without the promiser's consent."
            example="Butch Wilmore and Suni Williams boarded Boeing Starliner for an 8-day mission in June 2024. NASA's decision to return Starliner empty effectively extended their mission to 286 days. They did not consent to this renegotiation — circumstances imposed it."
          />
          <TermEntry
            term="Shadow Node"
            definition="A real agent or process that influences the network but is not visible in the model."
            example="Roscosmos internal decision-making on post-2028 participation. Russia has committed through 2028; what happens in 2029-2030 depends on political decisions invisible to the promise graph. The shadow node is the Russian government's strategic calculus about ISS vs. its own station program."
          />
          <TermEntry
            term="Terminal Promise"
            definition="A promise that ends everything — unique to the ISS case study."
            example="ISS-D02 (controlled deorbit) is a promise that, when fulfilled, terminates all other promises simultaneously. Every other promise in the network is time-bounded by this terminal event. The cascade dynamics change when promises have an expiration date enforced by physics."
          />
        </div>
      </div>

      {/* Structural parallels */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-serif text-xl font-bold text-gray-900 mb-4">
          Structural Parallels to Other Case Studies
        </h2>
        <div className="space-y-4">
          <ParallelEntry
            title="Roscosmos ↔ PacifiCorp (HB 2021)"
            body="Both are single agents whose reliability creates existential risk for the entire network. PacifiCorp violated its emissions trajectory, cascading into equity promises. Roscosmos's 2028 commitment gap threatens attitude control, fuel delivery, and the entire deorbit plan. The difference: PacifiCorp's failure is engineering; Roscosmos's risk is geopolitical. No amount of engineering can resolve it."
          />
          <ParallelEntry
            title="Starliner Redundancy ↔ HB 2021 Equity Verification Gap"
            body="Both are promises that exist on paper but are not functionally verified. HB 2021 promised equitable benefits for environmental justice communities — with no independent verification mechanism. The Commercial Crew Program promised redundant crew access — but Boeing's failures mean redundancy exists only as a contractual commitment, not an operational reality."
          />
          <ParallelEntry
            title="Zvezda Leak ↔ HB 2021 Tribal Consultation"
            body="Both are promises where the two parties disagree on what fulfillment means. HB 2021 required 'meaningful' tribal consultation — undefined, so neither party can agree on whether it happened. The Zvezda leak has NASA and Roscosmos disagreeing on whether operations are safe — the measurement exists but the interpretation is contested. In both cases, the verification gap is the structural vulnerability."
          />
          <ParallelEntry
            title="Commercial Station Readiness ↔ Paris Agreement NDCs"
            body="Both represent a layer of promises (CLD competitors, national climate targets) that are self-reported, aspirational, and verified only quarterly. In both cases, the most consequential future promises — whether commercial stations will be ready, whether countries will hit climate targets — have the weakest verification infrastructure."
          />
        </div>
      </div>

      {/* Verification infrastructure */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">
          Verification Infrastructure
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          The ISS verification infrastructure is notably stronger than most
          legislative promise networks — a space station has extensive telemetry
          that simply does not exist for policy commitments. 30% of ISS promises
          have automated, sensor-backed verification. But the pattern holds:
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { tier: "Automated (sensor)", count: "7", pct: "30%", color: "#1a5f4a", note: "ISS telemetry, U.S. Space Command tracking" },
            { tier: "Semi-automated", count: "8", pct: "35%", color: "#2563eb", note: "Public reports, launch manifests, OIG filings" },
            { tier: "Manual", count: "7", pct: "30%", color: "#d97706", note: "CLD competitor self-reports, bilateral statements" },
            { tier: "Unverifiable", count: "1", pct: "4%", color: "#b91c1c", note: "ISS-D02 (future event — can only verify prerequisites)" },
          ].map((row) => (
            <div key={row.tier} className="border rounded-lg p-3">
              <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-semibold text-gray-800">{row.tier}</p>
                <span
                  className="text-sm font-bold"
                  style={{ color: row.color }}
                >
                  {row.count}
                </span>
              </div>
              <p className="text-xs text-gray-500">{row.note}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-4 leading-relaxed">
          The transition promises (ISS-T01 through ISS-T05) are all manual or
          self-reported. The most consequential future promises — whether
          commercial stations will actually be ready — have the weakest
          verification. Familiar pattern.
        </p>
      </div>

      {/* Data provenance */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">
          Data Provenance
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          All promise statuses reflect publicly available data as of{" "}
          <strong>March 17, 2026</strong>. This is a live network — statuses
          should be updated as events occur.
        </p>
        <div className="space-y-2">
          {[
            { source: "NASA OIG Reports", url: "oig.nasa.gov/audits", notes: "Independent audits, including IG-24-020 on Zvezda leak" },
            { source: "NASA ISS Blog", url: "blogs.nasa.gov/spacestation", notes: "Daily On-Orbit Status Reports" },
            { source: "Congressional Record", url: "congress.gov", notes: "Annual appropriations, authorization acts" },
            { source: "NASA CCP Mission Records", url: "nasa.gov/commercial-crew", notes: "Crew Dragon and Starliner mission status" },
            { source: "GAO Space Reports", url: "gao.gov", notes: "Independent assessments of CLD program" },
            { source: "TASS / Reuters", url: "tass.com", notes: "Roscosmos statements and bilateral agreements" },
          ].map((src) => (
            <div key={src.source} className="flex gap-3 text-sm">
              <span className="text-gray-500 w-40 shrink-0 text-xs font-mono">
                {src.url}
              </span>
              <div>
                <span className="font-medium text-gray-900">{src.source}</span>
                <span className="text-gray-500 ml-2 text-xs">{src.notes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Book integration */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
        <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">
          Book Integration
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          The ISS dashboard is the culminating case study in{" "}
          <em>A Promise Garden: The Ecology of Commitment</em>. It appears in the
          final analytical chapter — the case that proves the framework works at
          maximum complexity.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          Every glossary term has a live instance. The verification correlation
          holds: ISS promises with strong independent verification (telemetry-backed
          crew safety, resupply tracking) have high fulfillment rates. ISS promises
          with weak verification (transition readiness, Roscosmos internal
          commitments) are the ones at risk. The pattern holds across every domain
          Promise Pipeline has analyzed.
        </p>
      </div>
    </div>
  );
}

function TermEntry({
  term,
  definition,
  example,
}: {
  term: string;
  definition: string;
  example: string;
}) {
  return (
    <div className="border-l-2 border-blue-200 pl-4">
      <p className="text-sm font-semibold text-gray-900">{term}</p>
      <p className="text-xs text-gray-500 italic mb-1">{definition}</p>
      <p className="text-sm text-gray-700 leading-relaxed">{example}</p>
    </div>
  );
}

function ParallelEntry({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="border-l-2 border-amber-300 pl-4">
      <p className="text-sm font-semibold text-gray-900 mb-1">{title}</p>
      <p className="text-sm text-gray-700 leading-relaxed">{body}</p>
    </div>
  );
}
