"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-12">
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

          <h2 className="font-serif text-2xl font-bold text-gray-900">Why Simulation?</h2>
          <p className="leading-relaxed">
            Real-world promises don&apos;t exist in isolation. When a utility company promises to
            reduce emissions, that commitment depends on regulatory approvals, community engagement
            plans, and verification mechanisms. If one promise degrades, the effects cascade through
            the network.
          </p>
          <p className="leading-relaxed">
            Promise Pipeline&apos;s <strong>What If</strong> simulation engine lets you explore these
            cascades before they happen. Change one promise&apos;s status and watch how the network
            health shifts — revealing hidden dependencies and systemic risks.
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
      </main>

      <Footer />
    </div>
  );
}
