"use client";

import Link from "next/link";
import { MarsGameAction } from "../../../lib/types/mars-game";
import InlineServiceCTA from "../../cta/InlineServiceCTA";

interface CTAScreenProps {
  dispatch: (action: MarsGameAction) => void;
}

export default function CTAScreen({ dispatch }: CTAScreenProps) {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#faf9f6]"
    >
      <section
        className="mx-auto max-w-2xl px-6 py-16"
        aria-labelledby="cta-title"
      >
        <div className="mb-12">
          <h1
            id="cta-title"
            className="font-serif text-3xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Ares Station is fictional.
            <br />
            <span className="text-[#1a5f4a]">
              Oregon HB 2021 is not.
            </span>
          </h1>

          <div className="space-y-4 text-base text-gray-700 leading-relaxed">
            <p>
              The same promise schema that modeled your Mars colony models 20
              real commitments in Oregon&apos;s clean electricity law — with
              real cascade failures, real verification gaps, and real structural
              conflicts playing out now.
            </p>
            <p>
              The same cascade engine that showed you what breaks when water
              reclamation fails shows what breaks when PacifiCorp&apos;s clean
              energy plan is rejected.
            </p>
            <p>
              The Governor-CEO game ends. The promises in Oregon HB 2021 don&apos;t.
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-12">
          <Link
            href="/demo/hb2021"
            className="flex items-center justify-between w-full rounded-lg bg-[#1a5f4a] px-6 py-4 text-white hover:bg-[#145040] focus-visible:ring-2 focus-visible:ring-[#1a5f4a] focus-visible:ring-offset-2 transition-colors"
          >
            <span className="font-semibold">
              Explore the HB 2021 Dashboard
            </span>
            <span aria-hidden="true">→</span>
          </Link>

          <div className="flex gap-3">
            <button
              onClick={() => dispatch({ type: "RESTART" })}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 transition-colors"
            >
              Play Again
            </button>
            <Link
              href="/about"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 transition-colors text-center"
            >
              Read the Whitepaper
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <div className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wider">
            What you just experienced
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <ConceptCard
              title="Cascade Failure"
              description="One underfunded promise triggered failures across four domains. Promise networks don't contain failure — they transmit it."
            />
            <ConceptCard
              title="Verification Gap"
              description="P7 could receive funding and show progress, but its status was permanently unverifiable. Accountability requires measurement infrastructure."
            />
            <ConceptCard
              title="Structural Conflict"
              description="Mining and life support shared power reserves. No allocation decision resolves a contradiction built into the mandate."
            />
          </div>
          <InlineServiceCTA variant="analysis" />
        </div>
      </section>
    </main>
  );
}

function ConceptCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="font-semibold text-gray-900 text-sm mb-2">{title}</h3>
      <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
