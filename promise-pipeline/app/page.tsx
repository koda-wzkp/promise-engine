"use client";

import { useState } from "react";
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
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleBetaSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    try {
      await fetch("/api/beta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch {
      // Silently fail for now
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="font-serif text-5xl font-bold leading-tight text-gray-900 md:text-6xl">
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
            href="/demo/hb2021"
            className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Try the HB 2021 Simulation
          </Link>
          <Link
            href="/about"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Learn More
          </Link>
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

      {/* Beta Signup */}
      <section className="border-t border-gray-200 bg-white px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <h2 className="font-serif text-2xl font-bold text-gray-900">
            Join the Beta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Get early access to custom promise networks, team dashboards, and API access.
          </p>

          {submitted ? (
            <p className="mt-6 text-sm font-medium text-green-700">
              Thanks! We&apos;ll be in touch.
            </p>
          ) : (
            <form onSubmit={handleBetaSignup} className="mt-6 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Sign Up
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
