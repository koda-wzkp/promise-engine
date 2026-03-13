"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const USE_CASES = [
  {
    title: "Climate Policy",
    description: "Model HB 2021 emissions commitments across utilities, regulators, and communities.",
    href: "/demo/hb2021",
    tag: "Live Demo",
  },
  {
    title: "Affordable Care Act",
    description: "Analyze ACA promises across federal agencies, insurers, and courts with legal challenge tracking.",
    href: "/demo/aca",
    tag: "Live Demo",
  },
  {
    title: "AI Governance",
    description: "Track AI safety promises from labs, auditors, and oversight bodies.",
    href: "/demo/ai",
    tag: "Demo",
  },
  {
    title: "Infrastructure",
    description: "Monitor infrastructure delivery commitments across agencies.",
    href: "/demo/infrastructure",
    tag: "Demo",
  },
  {
    title: "Supply Chain",
    description: "Verify sustainability and labor promises across global supply chains.",
    href: "/demo/supply-chain",
    tag: "Demo",
  },
  {
    title: "War on Drugs",
    description: "Audit 50+ years of federal drug policy promises against public data on outcomes.",
    href: "/demo/war-on-drugs",
    tag: "Demo",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Map Promises",
    description: "Define who promised what to whom, with verification methods and dependencies.",
  },
  {
    step: "2",
    title: "Build the Network",
    description: "Connect promises through dependency edges to reveal the accountability graph.",
  },
  {
    step: "3",
    title: "Simulate Cascades",
    description: "Ask \"What If?\" — change one promise and watch the network health shift.",
  },
];

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Navbar />

      <main id="main-content">
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center" aria-labelledby="hero-heading">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-gray-400">
          A trust primitive for accountability
        </p>
        <h1 id="hero-heading" className="font-serif text-5xl font-bold leading-tight text-gray-900 md:text-6xl">
          See what happens when
          <br />
          <span className="text-blue-600">promises break</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          Promise Pipeline simulates commitment networks. Map who promised what to whom,
          connect dependencies, and run cascade simulations to find hidden risks before they
          materialize.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/demo/aca"
            className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Try the ACA Demo
          </Link>
          <Link
            href="/demo/hb2021"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            HB 2021 Demo
          </Link>
          <Link
            href="/about"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* X-ray vs MRI */}
      <section className="border-t border-gray-200 bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-serif text-3xl font-bold text-gray-900">
            From Dashboard to Graph
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-6">
              <h3 className="font-serif text-lg font-semibold text-gray-400">Status Dashboard</h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-400">The X-ray</p>
              <p className="mt-3 text-sm text-gray-600">
                Shows which commitments are on track and which are not — in isolation.
                Tells you <strong>what is broken</strong>.
              </p>
            </div>
            <div className="rounded-lg border-2 border-gray-900 p-6">
              <h3 className="font-serif text-lg font-semibold text-gray-900">Promise Graph</h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-blue-600">The MRI</p>
              <p className="mt-3 text-sm text-gray-600">
                Reveals structural relationships, dependency pathways, and downstream effects.
                Tells you <strong>what will break next</strong> and why.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h3 className="font-serif text-lg font-semibold text-gray-900">Simulation Engine</h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-blue-600">The Surgical Sim</p>
              <p className="mt-3 text-sm text-gray-600">
                Models interventions on the full structural scan before anyone operates.
                Shows you <strong>what happens if</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Primitive */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-bold text-gray-900">
            A Trust Primitive
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600 leading-relaxed">
            Credit scores reduce trust to a number. Reputation systems reduce it to aggregate opinion.
            Blockchain eliminates it entirely. None of these model the <em>structure</em> of trust
            itself — the interdependencies, the cascades, the gap between what was promised and what
            was delivered. The promise graph does.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-500">
            This is infrastructure, not advocacy. The data says what it says.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-gray-200 bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-serif text-3xl font-bold text-gray-900">
            How It Works
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 font-serif text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-serif text-3xl font-bold text-gray-900">
            Works Across Domains
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {USE_CASES.map((uc) => (
              <Link
                key={uc.href}
                href={uc.href}
                className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-semibold text-gray-900">
                    {uc.title}
                  </h3>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {uc.tag}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{uc.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services CTA */}
      <section className="border-t border-gray-200 bg-white px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <h2 className="font-serif text-2xl font-bold text-gray-900">
            Get Your Promises Mapped
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We build interactive promise graphs for laws, policies, contracts, and organizational
            commitments. Tell us what you need mapped and we&apos;ll send a proposal.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/services#start"
              className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Start a project
            </Link>
            <Link
              href="/services"
              className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      </main>

      <Footer />
    </div>
  );
}
