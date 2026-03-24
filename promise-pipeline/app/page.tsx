"use client";

import Link from "next/link";
import { useState } from "react";
import { CloudBackground } from "@/components/layout/CloudBackground";
import { BOOKING_URL } from "@/lib/constants/booking";

function HeroMark() {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 340 340"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Promise Pipeline logo — nested P shapes representing trust at every scale"
      className="mx-auto mb-8 block"
    >
      <defs>
        <path
          id="pp-hero-path"
          d="M 0,340 L 0,0 L 200,0 C 340,0 340,280 200,280 L 60,280 L 60,340 Z"
        />
        <style>{`
          @keyframes pp-hero-appear {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes pp-hero-breathe {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.82; }
          }
          .pp-hero-layer {
            transform-origin: 0 0;
            opacity: 0;
            animation:
              pp-hero-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
              pp-hero-breathe 5s ease-in-out infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .pp-hero-layer { opacity: 1; animation: none !important; }
          }
        `}</style>
      </defs>
      {[
        { fill: "#c93b3b", scale: 1,     delay: "0.1s", breatheDelay: "0s" },
        { fill: "#7b41d6", scale: 0.618, delay: "0.3s", breatheDelay: "0.8s" },
        { fill: "#3e60cf", scale: 0.382, delay: "0.5s", breatheDelay: "1.6s" },
        { fill: "#2a2a4e", scale: 0.236, delay: "0.7s", breatheDelay: "2.4s" },
        { fill: "#2a8f6a", scale: 0.146, delay: "0.9s", breatheDelay: "3.2s" },
      ].map((layer, i) => (
        <use
          key={i}
          href="#pp-hero-path"
          fill={layer.fill}
          transform={`scale(${layer.scale})`}
          className="pp-hero-layer"
          style={{ animationDelay: `${layer.delay}, ${layer.breatheDelay}` }}
        />
      ))}
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <CloudBackground />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <HeroMark />
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 text-balance">
            A trust primitive for commitment networks.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Dashboards show you what&apos;s broken. Promise Pipeline shows you what
            breaks next and why.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/demo/hb2021"
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              See the HB 2021 Demo
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "85,000+", label: "Observations analyzed" },
              { value: "69", label: "Promises tracked" },
              { value: "43", label: "Agents mapped" },
              { value: "3", label: "Live dashboards" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* X-ray vs MRI */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-gray-50 rounded-xl border">
              <h3 className="font-serif text-lg font-semibold text-gray-500 mb-2">
                Traditional dashboards
              </h3>
              <p className="font-serif text-2xl font-bold text-gray-400 mb-3">
                The X-ray
              </p>
              <p className="text-sm text-gray-500">
                Flat projections of isolated statuses. &quot;This promise is
                broken.&quot; No context. No cascades. No downstream view.
              </p>
            </div>
            <div className="p-6 bg-green-50 rounded-xl border border-green-200">
              <h3 className="font-serif text-lg font-semibold text-green-800 mb-2">
                Promise Pipeline
              </h3>
              <p className="font-serif text-2xl font-bold text-green-900 mb-3">
                The MRI
              </p>
              <p className="text-sm text-green-800">
                The full structural model — dependencies, cascades, threats,
                downstream effects. See what breaks next and why.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16" style={{ backgroundColor: "#faf9f6" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-3xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Map",
                desc: "Identify every promise in a system — who committed what to whom, by when.",
              },
              {
                step: "2",
                title: "Schema",
                desc: "Encode promises in a universal type system with dependencies, verification, and polarity.",
              },
              {
                step: "3",
                title: "Verify",
                desc: "Track status against evidence. Filing, audit, sensor, or self-report.",
              },
              {
                step: "4",
                title: "Simulate",
                desc: "Run What If cascades. See which downstream promises break when one fails.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center mx-auto mb-3 font-bold">
                  {item.step}
                </div>
                <h3 className="font-serif font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <UseCases />

      {/* Services CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-serif text-3xl font-bold mb-3">
            Get Your Promises Mapped
          </h2>
          <p className="text-gray-400 mb-6">
            We build interactive promise graphs for laws, policies, and
            organizational commitments.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            >
              Book a demo call
            </a>
            <Link
              href="/services"
              className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg font-medium hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function UseCases() {
  const [activeTab, setActiveTab] = useState("civic");

  const tabs = [
    {
      id: "civic",
      label: "Civic",
      title: "Climate & Civic Accountability",
      desc: "Track legislative promises as dependency networks. See cascade effects when commitments fail. Oregon HB 2021 demo shows 20 promises across 11 agents.",
    },
    {
      id: "jcpoa",
      label: "JCPOA",
      title: "Arms Control — Iran Nuclear Deal",
      desc: "22 promises, 11 agents, 8 domains. The Iran nuclear deal analyzed as a promise network — revealing how the most sophisticated verification regime in arms control history collapsed in 3.5 years.",
    },
    {
      id: "ai",
      label: "AI",
      title: "AI Safety Auditing",
      desc: "Map safety commitments from AI labs. Track voluntary promises vs. imposed obligations. Identify verification gaps in the AI safety ecosystem.",
    },
    {
      id: "infrastructure",
      label: "Infrastructure",
      title: "Infrastructure SLAs",
      desc: "Model SLA dependencies across cloud providers. Simulate outage cascades. Sensor-based verification for real-time status tracking.",
    },
    {
      id: "supply-chain",
      label: "Supply Chain",
      title: "Supply Chain Transparency",
      desc: "Track labor, environmental, and transparency promises across global supply chains. Identify verification gaps in tier 2/3 suppliers.",
    },
  ];

  const active = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="font-serif text-3xl font-bold text-gray-900 text-center mb-8">
          Use Cases
        </h2>

        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl border p-8 text-center max-w-2xl mx-auto">
          <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">
            {active.title}
          </h3>
          <p className="text-gray-600 mb-4">{active.desc}</p>
          {active.id === "civic" && (
            <Link
              href="/demo/hb2021"
              className="inline-block px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800"
            >
              See HB 2021 Demo
            </Link>
          )}
          {active.id === "jcpoa" && (
            <Link
              href="/demo/jcpoa"
              className="inline-block px-4 py-2 bg-red-700 text-white rounded-lg text-sm font-medium hover:bg-red-800"
            >
              See JCPOA Analysis
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

