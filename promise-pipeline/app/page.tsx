"use client";

import Link from "next/link";
import { useState } from "react";
import { BOOKING_URL } from "@/lib/constants/booking";
import { NestedPLogo } from "@/components/brand/NestedPLogo";
import { PromiseUniversal } from "@/components/home/PromiseUniversal";
import { UniversalScroller } from "@/components/hero/UniversalScroller";

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <HeroSection />

      {/* Universality of the promise concept */}
      <PromiseUniversal />

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

      {/* All Demos */}
      <section id="demos" className="py-16" style={{ backgroundColor: "#faf9f6" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-3xl font-bold text-gray-900 text-center mb-3">
            Live Dashboards
          </h2>
          <p className="text-center text-gray-500 mb-10 text-sm">
            Four real promise networks, fully modeled and simulable.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                href: "/demo/hb2021",
                label: "Oregon HB 2021",
                subtitle: "100% Clean Electricity by 2040",
                desc: "20 promises · 11 agents · 7 domains",
                tag: "Civic",
                tagColor: "bg-green-100 text-green-800",
                accent: "#059669",
              },
              {
                href: "/demo/jcpoa",
                label: "JCPOA",
                subtitle: "Iran Nuclear Agreement",
                desc: "22 promises · 11 agents · 8 domains",
                tag: "Arms Control",
                tagColor: "bg-red-100 text-red-800",
                accent: "#dc2626",
              },
              {
                href: "/demo/gresham",
                label: "Gresham CAP",
                subtitle: "Gresham Climate Action Plan",
                desc: "42 promises · 24 agents · 6 domains",
                tag: "Municipal",
                tagColor: "bg-blue-100 text-blue-800",
                accent: "#2563eb",
              },
              {
                href: "/demo/iss",
                label: "ISS",
                subtitle: "International Space Station",
                desc: "Multi-party operations agreement",
                tag: "Infrastructure",
                tagColor: "bg-purple-100 text-purple-800",
                accent: "#7c3aed",
              },
            ].map((demo) => (
              <Link
                key={demo.href}
                href={demo.href}
                className="group bg-white rounded-xl border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-serif font-bold text-gray-900 text-lg group-hover:text-gray-700">
                      {demo.label}
                    </p>
                    <p className="text-sm text-gray-500">{demo.subtitle}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${demo.tagColor}`}>
                    {demo.tag}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{demo.desc}</p>
                <p className="mt-3 text-sm font-medium" style={{ color: demo.accent }}>
                  Open dashboard →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

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

function HeroSection() {
  const [heroHovered, setHeroHovered] = useState(false);

  return (
    <section className="relative overflow-hidden" style={{ height: "100vh" }}>
      {/* Animated background */}
      <UniversalScroller ambient />

      {/* Hero content overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
        style={{ zIndex: 10 }}
        onMouseEnter={() => setHeroHovered(true)}
        onMouseLeave={() => setHeroHovered(false)}
      >
        <div className="mx-auto mb-8" style={{ overflow: "visible" }}>
          <NestedPLogo
            mode={heroHovered ? "peel" : "breathe"}
            size={88}
            isHovered={heroHovered}
            className="mx-auto"
          />
        </div>
        <span
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: 11,
            color: "rgba(162,180,255,0.65)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          A trust primitive for commitment networks
        </span>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 mt-3 text-balance">
          Make common sense computable.
        </h1>
        <p
          className="text-lg md:text-xl max-w-2xl mx-auto mb-8"
          style={{ color: "rgba(255,255,255,0.68)" }}
        >
          Dashboards show you what&apos;s broken. Promise Pipeline shows you what
          breaks next and why.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/demo/hb2021"
            className="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            See the HB 2021 Demo
          </Link>
          <a
            href="#demos"
            className="px-6 py-3 border text-white rounded-lg font-medium transition-colors"
            style={{ borderColor: "rgba(255,255,255,0.28)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.55)";
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.28)";
              (e.currentTarget as HTMLElement).style.background = "";
            }}
          >
            View All Demos
          </a>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "267,000+", label: "Observations analyzed" },
            { value: "111", label: "Promises tracked" },
            { value: "80+", label: "Agents mapped" },
            { value: "4", label: "Live dashboards" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.50)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
