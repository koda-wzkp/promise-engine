"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import IndigenousAcknowledgment from "@/components/layout/IndigenousAcknowledgment";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Navbar />

      <main id="main-content" className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-serif text-4xl font-bold text-gray-900">About Promise Pipeline</h1>

        <div className="mt-8 space-y-6 text-gray-700">
          <p className="text-lg leading-relaxed">
            Promise Pipeline transforms how we think about accountability. Rooted in{" "}
            <strong>Promise Theory</strong> (Burgess, 2004), it models commitments as voluntary,
            verifiable obligations between autonomous agents — not top-down mandates.
          </p>

          <h2 className="font-serif text-2xl font-bold text-gray-900">The Theory</h2>
          <p className="leading-relaxed">
            In Promise Theory, every commitment has a <em>promiser</em> (who makes it) and a{" "}
            <em>promisee</em> (who relies on it). Promises are always voluntary — they describe
            what an agent <em>intends</em> to do, not what they are forced to do. This subtle
            shift changes everything about how we model accountability.
          </p>

          <h2 className="font-serif text-2xl font-bold text-gray-900">The Promise Graph as Trust Primitive</h2>
          <p className="leading-relaxed">
            The difference between a traditional accountability dashboard and a promise graph is
            analogous to the difference between an X-ray and an MRI. A status dashboard gives you
            a flat projection: you can see that something is broken, but not how the break relates
            to surrounding structures. A promise graph provides the volumetric model: the structural
            relationships between commitments, the dependency pathways through which failure
            propagates, and the downstream effects of any single break.
          </p>
          <p className="leading-relaxed">
            The promise graph is, at its most fundamental level, a <strong>trust primitive</strong> — a
            basic building block from which trust relationships can be composed, observed, and reasoned
            about. It does not reduce trust to a single score, a binary, or a credential. It models
            the full structure of commitments that trust is built on.
          </p>
          <p className="leading-relaxed">
            Credit scores reduce trust to a number derived from financial behavior. Reputation systems
            reduce it to an aggregate of subjective opinions. Blockchain &ldquo;trustlessness&rdquo;
            eliminates the need for trust by making outcomes deterministic. None of these model the
            structure of trust itself — the interdependencies, the cascades, the gap between what was
            promised and what was delivered. The promise graph does.
          </p>
          <p className="leading-relaxed text-sm text-gray-500 italic">
            This is infrastructure, not advocacy. The data says what it says.
          </p>

          <h2 className="font-serif text-2xl font-bold text-gray-900">Why Simulation?</h2>
          <p className="leading-relaxed">
            The dashboard tells you what is broken. The graph tells you what will break next and why.
            The simulation engine extends the analogy further — it is the surgical simulation that
            models an intervention on the full structural scan before anyone operates.
          </p>
          <p className="leading-relaxed">
            Promise Pipeline&apos;s <strong>What If</strong> engine lets you change one promise&apos;s
            status and watch how failure cascades through the network — revealing hidden dependencies
            and systemic risks before they materialize.
          </p>

          <h2 className="font-serif text-2xl font-bold text-gray-900">Built by Koda Nolan-Finkel</h2>
          <p className="leading-relaxed">
            Promise Pipeline grew from research into Oregon&apos;s HB 2021 energy policy, where 20+
            interlinked commitments from utilities, regulators, and communities form a complex
            accountability network. The verification gap between powerful and marginalized agents
            became the central finding — and the driving motivation for this tool.
          </p>

          <h2 className="font-serif text-2xl font-bold text-gray-900">Open Framework</h2>
          <p className="leading-relaxed">
            The universal promise schema works across domains: climate policy, AI governance,
            infrastructure, supply chains, personal goals, and team commitments. Same structure,
            different contexts — because accountability is accountability.
          </p>
        </div>

        <div className="mt-16 border-t border-gray-200 pt-12">
          <IndigenousAcknowledgment variant="standalone" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
