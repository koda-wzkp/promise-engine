"use client";

import Link from "next/link";
import { useState } from "react";
import { BOOKING_URL, CONTACT_EMAIL } from "@/lib/constants/booking";
import { NestedPLogo } from "@/components/brand/NestedPLogo";

const PROJECT_TYPES = [
  "Legislation or policy",
  "Corporate commitments / ESG",
  "Organizational / team commitments",
  "AI safety / model governance",
  "Treaty or international agreement",
  "Supply chain",
  "Other",
];

const REFERRAL_SOURCES = [
  "Search",
  "Blog post",
  "Social media",
  "Referral",
  "Conference",
  "Other",
];

const ANALYSES = [
  {
    title: "Oregon HB 2021",
    href: "/demo/hb2021",
    promises: 20,
    agents: 11,
    health: 72,
    finding:
      "Upstream verification gaps cascade into 60% of downstream clean energy commitments.",
  },
  {
    title: "JCPOA (Iran Nuclear Deal)",
    href: "/demo/jcpoa",
    promises: 22,
    agents: 11,
    health: 38,
    finding:
      "The most precisely specified verification regime in arms control history — collapsed in 3.5 years.",
  },
  {
    title: "International Space Station",
    href: "/demo/iss",
    promises: 27,
    agents: 21,
    health: 81,
    finding:
      "Multi-agency commitment network with surprisingly resilient promise architecture.",
  },
];

const FEATURES = [
  {
    label: "Promise extraction",
    desc: "Every commitment identified with promiser, promisee, body, deadline, verification method.",
  },
  {
    label: "Dependency mapping",
    desc: "Which promises depend on which, and what cascades when one fails.",
  },
  {
    label: "Network health score",
    desc: "0\u2013100 composite with domain breakdown and structural grading.",
  },
  {
    label: "Structural diagnostics",
    desc: "Cascade risk (R\u2091), FMEA risk priority numbers, verification entropy, incentive alignment.",
  },
  {
    label: "What If simulation",
    desc: "Interactive cascade modeling: \u201cwhat breaks if this promise fails?\u201d",
  },
  {
    label: "Hosted dashboard",
    desc: "Shareable link, updated as new data comes in. Embeddable widget coming soon.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Tell us what you need mapped",
    desc: "A law, policy, contract, or commitment structure. 30-minute call or async via the intake form.",
  },
  {
    step: "2",
    title: "We extract the promises",
    desc: "Every promise identified: who committed what to whom, by when, verified how. AI-assisted extraction with human verification.",
  },
  {
    step: "3",
    title: "Review your promise graph",
    desc: "Interactive dashboard with dependency edges, health scores, cascade simulation, and structural diagnostics.",
  },
  {
    step: "4",
    title: "Use it",
    desc: "Hosted on Promise Pipeline. Shareable link. Embeddable widget coming soon.",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f6" }}>
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-balance">
            Get Your Promises Mapped
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            We turn commitment structures into interactive, auditable promise
            graphs. Laws, policies, contracts, organizational commitments
            &mdash; if it has promises, we can map it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              Book a free demo call
            </a>
            <a
              href="#intake"
              className="px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              Or tell us about your project
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <NestedPLogo mode="flow" size={48} className="mx-auto mb-4" />
          <h2 className="font-serif text-3xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {STEPS.map((item) => (
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

      {/* What You Get */}
      <section className="py-16" style={{ backgroundColor: "#faf9f6" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-3xl font-bold text-gray-900 text-center mb-12">
            What You Get
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="p-5 bg-white rounded-xl border border-gray-200"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-[#1a5f4a] flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {f.label}
                    </h3>
                    <p className="text-sm text-gray-600">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Published Analyses */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-3xl font-bold text-gray-900 text-center mb-12">
            See It In Action
          </h2>
          <p className="text-center mb-12" style={{ color: "#4b5563", fontSize: "14px", marginTop: "8px" }}>
            Our analytical framework is validated against 85,000+ institutional commitments across IMF, World Bank, EPA, and Global Fund datasets.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ANALYSES.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="block p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              >
                <h3 className="font-serif text-lg font-semibold text-gray-900 mb-3">
                  {a.title}
                </h3>
                <div className="flex gap-4 text-xs text-gray-500 mb-3">
                  <span>{a.promises} promises</span>
                  <span>{a.agents} agents</span>
                  <span
                    className="font-medium"
                    style={{
                      color: a.health >= 70 ? "#1a5f4a" : a.health >= 50 ? "#b45309" : "#b91c1c",
                    }}
                  >
                    Health: {a.health}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{a.finding}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Intake Form */}
      <section
        id="intake"
        className="py-16"
        style={{ backgroundColor: "#faf9f6" }}
      >
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-3xl font-bold text-gray-900 text-center mb-3">
            Tell Us About Your Project
          </h2>
          <p className="text-center text-gray-600 mb-8">
            We&apos;ll review your project and get back within 2 business days.
          </p>
          <IntakeForm />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-600 mb-4">Prefer to talk first?</p>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            Book a free 30-minute demo call &rarr;
          </a>
        </div>
      </section>
    </div>
  );
}

function IntakeForm() {
  const [formState, setFormState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submittedName, setSubmittedName] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get("name") as string,
      organization: formData.get("organization") as string,
      email: formData.get("email") as string,
      type: formData.get("type") as string,
      description: formData.get("description") as string,
      referral: formData.get("referral") as string,
    };

    try {
      const res = await fetch("/api/services/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed");
      setSubmittedName(data.name);
      setFormState("success");
    } catch {
      setFormState("error");
    }
  }

  if (formState === "success") {
    return (
      <div className="text-center p-8 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-900 font-medium mb-2">
          Thanks, {submittedName}. We&apos;ll review your project and get back
          within 2 business days.
        </p>
        <p className="text-sm text-gray-600">
          Want to skip the wait?{" "}
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1a5f4a] font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            Book a demo call &rarr;
          </a>
        </p>
      </div>
    );
  }

  if (formState === "error") {
    return (
      <div className="text-center p-8 bg-white rounded-xl border border-red-200">
        <p className="text-gray-900 font-medium mb-2">
          Something went wrong.
        </p>
        <p className="text-sm text-gray-600">
          Email us directly at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-[#1a5f4a] font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
        <button
          onClick={() => setFormState("idle")}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 bg-white p-6 sm:p-8 rounded-xl border border-gray-200"
    >
      {/* Name */}
      <div>
        <label
          htmlFor="intake-name"
          className="block text-sm font-medium text-gray-900 mb-1.5"
        >
          Name <span className="text-red-600">*</span>
        </label>
        <input
          id="intake-name"
          name="name"
          type="text"
          required
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
        />
      </div>

      {/* Organization */}
      <div>
        <label
          htmlFor="intake-org"
          className="block text-sm font-medium text-gray-900 mb-1.5"
        >
          Organization
        </label>
        <input
          id="intake-org"
          name="organization"
          type="text"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="intake-email"
          className="block text-sm font-medium text-gray-900 mb-1.5"
        >
          Email <span className="text-red-600">*</span>
        </label>
        <input
          id="intake-email"
          name="email"
          type="email"
          required
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
        />
      </div>

      {/* What do you want mapped? */}
      <div>
        <label
          htmlFor="intake-type"
          className="block text-sm font-medium text-gray-900 mb-1.5"
        >
          What do you want mapped? <span className="text-red-600">*</span>
        </label>
        <select
          id="intake-type"
          name="type"
          required
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white"
        >
          <option value="">Select a category</option>
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Tell us more */}
      <div>
        <label
          htmlFor="intake-desc"
          className="block text-sm font-medium text-gray-900 mb-1.5"
        >
          Tell us more <span className="text-red-600">*</span>
        </label>
        <textarea
          id="intake-desc"
          name="description"
          required
          rows={4}
          placeholder="Briefly describe what you'd like mapped — e.g., a specific bill, your company's public commitments, a contract with accountability gaps&#8230;"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-y"
        />
      </div>

      {/* How did you find us? */}
      <div>
        <label
          htmlFor="intake-referral"
          className="block text-sm font-medium text-gray-900 mb-1.5"
        >
          How did you find us?
        </label>
        <select
          id="intake-referral"
          name="referral"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white"
        >
          <option value="">Select an option</option>
          {REFERRAL_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={formState === "submitting"}
        className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
      >
        {formState === "submitting" ? "Submitting\u2026" : "Submit"}
      </button>
    </form>
  );
}
