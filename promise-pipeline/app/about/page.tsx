import Link from "next/link";
import type { Metadata } from "next";
import { NestedPLogo } from "@/components/brand/NestedPLogo";

export const metadata: Metadata = {
  title: "About — Promise Pipeline",
  description:
    "An open-source platform applying Promise Theory to commitment tracking, auditing, and simulation.",
  openGraph: {
    title: "About — Promise Pipeline",
    description:
      "An open-source platform applying Promise Theory to commitment tracking, auditing, and simulation.",
    url: "https://promise-engine.vercel.app/about",
    siteName: "Promise Pipeline",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f6" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-6">
          About Promise Pipeline
        </h1>

        <div className="prose prose-gray max-w-none space-y-8">
          <section className="bg-white rounded-xl border p-6">
            <h2 className="font-serif text-xl font-semibold text-gray-900 mb-3">
              What is Promise Pipeline?
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              Promise Pipeline is an open-source platform that applies Promise
              Theory to commitment tracking, auditing, and simulation across
              domains. It models every verifiable commitment — legislative,
              corporate, institutional, personal — as a structured promise with a
              defined promiser, promisee, body, verification mechanism, and
              deadline.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              The difference between a traditional accountability dashboard and a
              promise graph is the difference between an X-ray and an MRI. A
              dashboard shows you what&apos;s broken in isolation. A promise graph
              shows you the structural relationships between commitments, the
              dependency pathways through which failure propagates, and the
              downstream effects of any single break. The simulation engine lets
              you ask &ldquo;what if&rdquo; before anything breaks at all.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              The tagline is: make common sense computable. Everyone knows
              promises depend on each other. Everyone knows broken promises
              cascade. Promise Pipeline makes that intuition into infrastructure
              you can query, simulate, and share.
            </p>
          </section>

          <section className="bg-white rounded-xl border p-6">
            <h2 className="font-serif text-xl font-semibold text-gray-900 mb-3">
              Promise Theory
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              Developed by Mark Burgess, Promise Theory is a framework for
              understanding voluntary cooperation in complex systems. Every agent
              is autonomous — they can only make promises about their own
              behavior. A complete interaction requires both a +give promise (the
              commitment) and a -accept promise (the acknowledgment).
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              Promise Pipeline operationalizes this theory for real-world
              accountability. The universal promise schema — with polarity, scope,
              origin, verification, and dependency edges — captures the structural
              reality of how commitments work and fail.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Promise Pipeline&apos;s empirical research has extended
              Burgess&apos;s framework into domains it was never tested in. The
              verification paradox — that networks which verify more intensely
              surface more problems — was discovered by applying Promise Theory to
              85,000+ institutional commitments across the IMF, World Bank, EPA,
              and Global Fund. The composting/computing framework classifies
              promise dynamics by their Weibull shape parameter: promises with
              robust verification follow self-correcting trajectories (computing),
              while promises with weak or absent verification stagnate and decay
              (composting). These findings are published on SSRN (ID 6444080).
            </p>
          </section>

          <section className="bg-white rounded-xl border p-6">
            <h2 className="font-serif text-xl font-semibold text-gray-900 mb-3">
              The Project
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              Promise Pipeline is created by Conor Nolan-Finkel. Scholarship
              student at The Multiverse School. Solo founder of Pleco. The
              codebase is released under the AGPL-3.0 license from its founding
              commit.
            </p>

            <h3 className="font-serif text-base font-semibold text-gray-900 mt-4 mb-2">
              Live dashboards
            </h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5 mb-4">
              <li>
                <strong>Oregon HB 2021</strong> — 20 promises, 11 agents, 7
                domains. Full cascade simulation, structural diagnostics,
                verification dynamics. The proof of concept.
              </li>
              <li>
                <strong>JCPOA (Iran Nuclear Deal)</strong> — 22 promises, 11
                agents, 6 domains. Best verification infrastructure in arms
                control history — collapsed in 3.5 years. The case study in why
                verification quality alone doesn&apos;t save a network.
              </li>
              <li>
                <strong>International Space Station</strong> — 27 promises, 21
                agents, 9 domains. The healthiest network in the corpus. The
                example of what well-architected commitments look like.
              </li>
            </ul>

            <h3 className="font-serif text-base font-semibold text-gray-900 mt-4 mb-2">
              Research corpus
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Oregon HB 2021, JCPOA, Fort Laramie Treaty (1868), Paris Agreement,
              Clean Air Act 1990, Dodd-Frank 2010, NCLB/ESSA, plus cross-domain
              case studies in cell signaling (MAPK/ERK), software dependencies
              (npm left-pad), infrastructure cascades (2003 Northeast Blackout),
              and narrative analysis (the Anakin Cascade).
            </p>

            <h3 className="font-serif text-base font-semibold text-gray-900 mt-4 mb-2">
              Empirical validation
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              85,000+ observations across four institutional datasets — IMF MONA
              (69,847), World Bank IEG (12,451), EPA ECHO (687), Global Fund
              (2,734). 36 of 37 sign predictions correct (p = 2.76 × 10⁻¹⁰).
            </p>

            <h3 className="font-serif text-base font-semibold text-gray-900 mt-4 mb-2">
              Applications
            </h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
              <li>
                <strong>Promise Garden</strong> — Personal promise tracker
              </li>
              <li>
                <strong>Teams</strong> — Team promise networks with capacity
                simulation
              </li>
              <li>
                <strong>Services</strong> — We build promise graphs for
                organizations, advocates, and policy teams
              </li>
              <li>
                <strong>Annotation tool</strong> — AI-assisted promise extraction
                from legislative text
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-xl border p-6">
            <NestedPLogo mode="intervention" size={56} className="mx-auto mb-4" />
            <h2 className="font-serif text-xl font-semibold text-gray-900 mb-3">
              Mission
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              Two commitments, contingent on Promise Pipeline generating revenue:
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              First, fund a Native-run code organization — working name: Upstream
              — so indigenous engineers and academics can steward treaty
              accountability tools and intertribal promise applications. This is
              not a benefactor model. It&apos;s a full ownership transfer. The
              Fort Laramie Treaty (1868) is already in the research corpus. The
              tools should be built and owned by the communities the treaties were
              made to.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              Second, support spreading Promise Theory applications globally
              through Upstream and beyond. The framework is domain-general. The
              applications should be too.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              These are prophetic promises — commitments made before the
              conditions for fulfilling them exist. They&apos;re tracked in our
              own schema, which means they&apos;re subject to the same
              verification scrutiny as everything else we analyze. Status:
              declared. Verification: self-report. The weakest kind. We know.
            </p>
          </section>

          <section className="bg-white rounded-xl border p-6">
            <h2 className="font-serif text-xl font-semibold text-gray-900 mb-3">
              Technology
            </h2>
            <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
              <li>Next.js 14+ with App Router</li>
              <li>TypeScript (strict mode)</li>
              <li>Tailwind CSS</li>
              <li>Recharts for data visualization</li>
              <li>Sanity CMS for blog content</li>
              <li>
                SVG-based network graph visualization with three views
                (Watershed, Canopy, Strata)
              </li>
              <li>Cascade simulation engine with empirical parameters from Weibull survival analysis (85,000+ observations)</li>
              <li>
                Hex-encoded promise fingerprinting (128-bit headers, SHA-256
                composition)
              </li>
              <li>AGPL-3.0 licensed from founding commit</li>
            </ul>
          </section>

          <section className="bg-white rounded-xl border p-6">
            <NestedPLogo mode="recurse" size={48} className="mx-auto mb-4" />
            <h2 className="font-serif text-xl font-semibold text-gray-900 mb-3">
              Research
            </h2>

            <h3 className="font-serif text-base font-semibold text-gray-900 mb-2">
              The Verification Paradox{" "}
              <span className="font-normal text-gray-500">
                (SSRN ID 6444080, in review)
              </span>
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Cross-domain study of verification dynamics across 85,000+
              institutional commitments. Key findings: programs that verify more
              intensely surface more problems (ρ = −0.242). The Weibull shape
              parameter k classifies commitment dynamics into computing
              (self-correcting, k ≈ 1), composting (stagnating, k &lt; 0.5), and
              pressure (externally forced, k &gt; 1) regimes. Measurement
              structure — not verifier independence — determines which regime a
              promise follows. 36 of 37 sign predictions correct across four
              datasets.
            </p>

            <h3 className="font-serif text-base font-semibold text-gray-900 mb-2">
              Promise Pipeline Whitepaper{" "}
              <span className="font-normal text-gray-500">
                (Version 5, in progress)
              </span>
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Theoretical foundation: Promise Theory as analytical framework, the
              NCTP (Nesting Composable Trust Primitive), five-year roadmap from
              deterministic tracking to probabilistic simulation.
            </p>

            <h3 className="font-serif text-base font-semibold text-gray-900 mb-2">
              Promise Engine Glossary{" "}
              <span className="font-normal text-gray-500">
                (74 terms, 64 novel to Promise Pipeline)
              </span>
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              A lexicon for commitment network analysis. Structural patterns
              identified across domains: verification gap, cascade from hub
              failure, shadow node, unbounded promise, structural conflict, forced
              renegotiation, prophetic promise.
            </p>
          </section>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/demo/hb2021"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 text-sm"
            >
              See the HB 2021 Demo
            </Link>
            <a
              href="https://cal.com/pleco/promise-pipeline-discovery-call"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 text-sm"
            >
              Book a demo call
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
