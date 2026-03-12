"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const STEPS = [
  {
    number: "1",
    title: "Send us your documents",
    description:
      "Upload the law, policy, contract, or commitment structure you want mapped.",
  },
  {
    number: "2",
    title: "We extract the promises",
    description:
      "Our team identifies every promise: who committed what to whom, by when, verified how.",
  },
  {
    number: "3",
    title: "Review your promise graph",
    description:
      "Interactive dashboard with dependency edges, health scores, and insights.",
  },
  {
    number: "4",
    title: "Embed, share, cite",
    description:
      "Hosted on Promise Pipeline with an embeddable widget for your site.",
  },
];

const PUBLISHED_RESEARCH = [
  {
    title: "Oregon HB 2021",
    description: "Clean electricity transition commitments across utilities, regulators, and communities.",
    href: "/demo/hb2021",
    promises: 12,
    domains: 4,
    grade: "C-",
  },
  {
    title: "Affordable Care Act",
    description: "15 years of ACA promise tracking across federal agencies, insurers, and courts.",
    href: "/demo/aca",
    promises: 20,
    domains: 6,
    grade: "C+",
  },
  {
    title: "US War on Drugs",
    description: "50+ years of federal drug policy promises audited against public outcome data.",
    href: "/demo/war-on-drugs",
    promises: 20,
    domains: 10,
    grade: "F",
  },
];

const CATEGORY_OPTIONS = [
  "Legislation / Policy",
  "Corporate commitments / ESG",
  "Supply chain",
  "Organizational / team",
  "AI safety / model governance",
  "Treaty / international agreement",
  "Other",
];

const SCOPE_OPTIONS = [
  "Small (under 25 promises)",
  "Medium (25-100)",
  "Large (100+)",
  "Not sure",
];

const REFERRAL_OPTIONS = [
  "Search",
  "Blog post",
  "Social media",
  "Referral",
  "Conference",
  "Other",
];

interface FormData {
  name: string;
  organization: string;
  email: string;
  category: string;
  description: string;
  scope: string;
  referral: string;
}

const INITIAL_FORM: FormData = {
  name: "",
  organization: "",
  email: "",
  category: "",
  description: "",
  scope: "",
  referral: "",
};

export default function ServicesPage() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.organization || !form.email || !form.category || !form.description) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!form.email.includes("@") || !form.email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/services/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Navbar />

      <main id="main-content">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-4 py-20 text-center" aria-labelledby="services-hero">
          <h1 id="services-hero" className="font-serif text-5xl font-bold leading-tight text-gray-900 md:text-6xl">
            Get Your Promises Mapped
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            We turn messy commitment structures into interactive, auditable promise graphs.
            Laws, policies, contracts, org commitments, supply chains — if it has promises,
            we can map it.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#start"
              className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Start a project
            </a>
            <Link
              href="/demo/hb2021"
              className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              See examples
            </Link>
          </div>
        </section>

        {/* How It Works */}
        <section className="border-t border-gray-200 bg-white px-4 py-16" aria-labelledby="how-it-works">
          <div className="mx-auto max-w-5xl">
            <h2 id="how-it-works" className="text-center font-serif text-3xl font-bold text-gray-900">
              How It Works
            </h2>
            <div className="mt-10 grid gap-8 md:grid-cols-4">
              {STEPS.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                    {step.number}
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What This Replaces */}
        <section className="px-4 py-16" aria-labelledby="what-this-replaces">
          <div className="mx-auto max-w-5xl">
            <h2 id="what-this-replaces" className="text-center font-serif text-3xl font-bold text-gray-900">
              Keep the Expertise In-House
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-gray-500">
              Most organizations outsource this work for six figures a year and get static reports
              their teams can&apos;t build on. Promise Pipeline is a tool your people own.
            </p>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {/* vs. Outside Compliance Audits */}
              <div className="flex flex-col rounded-lg border border-gray-200 border-t-4 border-t-gray-300 bg-white p-6">
                <h3 className="font-serif text-lg font-semibold text-gray-900">
                  vs. Outside Compliance Audits
                </h3>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  What you pay now
                </p>
                <p className="mt-1 text-2xl font-bold text-[#4b5563]">
                  $50,000–200,000<span className="text-base font-medium">/year</span>
                </p>
                <p className="mt-3 text-sm text-gray-600">
                  An outside firm produces a static PDF on an annual cycle. Your team waits months
                  for results they can&apos;t interact with, update, or explore.
                </p>
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    With Promise Pipeline
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#1a5f4a]">
                    $7,500 once <span className="text-base font-medium">+ $149/mo</span>
                  </p>
                  <p className="mt-3 text-sm text-gray-600">
                    Your team owns the dashboard. They update statuses as things change. They run
                    simulations when decisions need to be made. The expertise stays in-house.
                  </p>
                </div>
              </div>

              {/* vs. External Legal Analysis */}
              <div className="flex flex-col rounded-lg border border-gray-200 border-t-4 border-t-gray-300 bg-white p-6">
                <h3 className="font-serif text-lg font-semibold text-gray-900">
                  vs. External Legal Analysis
                </h3>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  What you pay now
                </p>
                <p className="mt-1 text-2xl font-bold text-[#4b5563]">
                  $300–600<span className="text-base font-medium">/hour (outside counsel)</span>
                </p>
                <p className="mt-3 text-sm text-gray-600">
                  Attorneys reconstruct commitment structures from scratch for every filing. Hours of
                  billable time building what a graph shows in seconds.
                </p>
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    With Promise Pipeline
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#1a5f4a]">
                    $2,500–7,500 <span className="text-base font-medium">once</span>
                  </p>
                  <p className="mt-3 text-sm text-gray-600">
                    We build the graph once. Your team maintains it. When legal needs arise, the
                    structure is already mapped — your people walk in prepared instead of paying
                    someone to catch up.
                  </p>
                </div>
              </div>

              {/* vs. Outsourced Research */}
              <div className="flex flex-col rounded-lg border border-gray-200 border-t-4 border-t-gray-300 bg-white p-6">
                <h3 className="font-serif text-lg font-semibold text-gray-900">
                  vs. Outsourced Research
                </h3>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  What you pay now
                </p>
                <p className="mt-1 text-2xl font-bold text-[#4b5563]">
                  $5,000–15,000 <span className="text-base font-medium">per report</span>
                </p>
                <p className="mt-3 text-sm text-gray-600">
                  Contract researchers produce one-time analyses that go stale immediately. No
                  interactivity. No dependency modeling. No way for your team to build on the work.
                </p>
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    With Promise Pipeline
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#1a5f4a]">
                    $7,500 once <span className="text-base font-medium">+ $149/mo</span>
                  </p>
                  <p className="mt-3 text-sm text-gray-600">
                    A living tool your team actually uses — not a deliverable they file away. They
                    add new commitments, track changes, and run What If scenarios as the landscape
                    shifts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="px-4 py-16" aria-labelledby="pricing">
          <div className="mx-auto max-w-5xl">
            <h2 id="pricing" className="text-center font-serif text-3xl font-bold text-gray-900">
              Pricing
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-gray-500">
              Every project starts with a conversation. Pick the tier that fits, and we&apos;ll
              send a detailed proposal.
            </p>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {/* Starter */}
              <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="font-serif text-xl font-bold text-gray-900">Starter</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">$2,500</span>
                  <span className="ml-1 text-sm text-gray-500">+ $49/mo</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-600" aria-hidden="true">&#10003;</span>
                    Up to 25 promises mapped
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-600" aria-hidden="true">&#10003;</span>
                    Single domain
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-600" aria-hidden="true">&#10003;</span>
                    Status dashboard with health score
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-600" aria-hidden="true">&#10003;</span>
                    Embeddable widget
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-600" aria-hidden="true">&#10003;</span>
                    Client status update interface
                  </li>
                </ul>
                <p className="mt-4 text-xs text-gray-400">
                  Best for: single law, policy, or contract
                </p>
                <a
                  href="#start"
                  className="mt-6 block rounded-lg border border-gray-300 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Get started
                </a>
              </div>

              {/* Professional (recommended) */}
              <div className="flex flex-col rounded-lg border-2 border-gray-900 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-bold text-gray-900">Professional</h3>
                  <span className="rounded-full bg-gray-900 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    Recommended
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">$7,500</span>
                  <span className="ml-1 text-sm text-gray-500">+ $149/mo</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-600" aria-hidden="true">&#10003;</span>
                    Up to 100 promises mapped
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-600" aria-hidden="true">&#10003;</span>
                    Multiple domains with dependency graph
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-600" aria-hidden="true">&#10003;</span>
                    Cascade simulation (What If)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-600" aria-hidden="true">&#10003;</span>
                    AI-assisted promise extraction
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-600" aria-hidden="true">&#10003;</span>
                    Interactive embeddable graph widget
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-600" aria-hidden="true">&#10003;</span>
                    Quarterly review session
                  </li>
                </ul>
                <p className="mt-4 text-xs text-gray-400">
                  Best for: complex legislation, org-wide commitments, multi-stakeholder accountability
                </p>
                <a
                  href="#start"
                  className="mt-6 block rounded-lg bg-gray-900 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  Get started
                </a>
              </div>

              {/* Custom */}
              <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="font-serif text-xl font-bold text-gray-900">Custom</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">Contact us</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-600" aria-hidden="true">&#10003;</span>
                    Unlimited scope
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-600" aria-hidden="true">&#10003;</span>
                    Cross-domain networks
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-600" aria-hidden="true">&#10003;</span>
                    API access and data export
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-600" aria-hidden="true">&#10003;</span>
                    Custom integrations
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-600" aria-hidden="true">&#10003;</span>
                    Dedicated support
                  </li>
                </ul>
                <p className="mt-4 text-xs text-gray-400">
                  Best for: foundations, government agencies, enterprise accountability
                </p>
                <a
                  href="#start"
                  className="mt-6 block rounded-lg border border-gray-300 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Contact us
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="border-t border-gray-200 bg-white px-4 py-16" aria-labelledby="social-proof">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="social-proof" className="sr-only">Social Proof</h2>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-300">
              Trusted by
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Early clients and citations coming soon.
            </p>
            <blockquote className="mx-auto mt-8 max-w-xl rounded-lg border-l-4 border-gray-200 bg-gray-50 p-6 text-left">
              <p className="text-sm italic text-gray-400">
                &ldquo;Testimonial placeholder — we&apos;re collecting feedback from early projects.&rdquo;
              </p>
              <footer className="mt-3 text-xs text-gray-300">
                &mdash; Name, Organization
              </footer>
            </blockquote>
          </div>
        </section>

        {/* Published Research */}
        <section className="px-4 py-16" aria-labelledby="published-research">
          <div className="mx-auto max-w-5xl">
            <h2 id="published-research" className="text-center font-serif text-3xl font-bold text-gray-900">
              Our Published Research
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-gray-500">
              These analyses are free, open, and citable. This is the kind of work we do for clients.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {PUBLISHED_RESEARCH.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <h3 className="font-serif text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
                    <span>{item.promises} promises</span>
                    <span aria-hidden="true">&middot;</span>
                    <span>{item.domains} domains</span>
                    <span aria-hidden="true">&middot;</span>
                    <span className="font-mono font-semibold text-gray-600">Grade: {item.grade}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Intake Form */}
        <section id="start" className="scroll-mt-20 border-t border-gray-200 bg-white px-4 py-16" aria-labelledby="intake-heading">
          <div className="mx-auto max-w-xl">
            <h2 id="intake-heading" className="text-center font-serif text-3xl font-bold text-gray-900">
              Start a Project
            </h2>
            <p className="mt-3 text-center text-sm text-gray-500">
              Tell us what you want mapped. We&apos;ll review it and get back to you
              within 2 business days with a proposal.
            </p>

            {submitted ? (
              <div className="mt-8 rounded-lg bg-green-50 p-6 text-center" role="status">
                <p className="text-sm font-medium text-green-800">
                  Thanks, {form.name}. We&apos;ll review your project and get back to you
                  within 2 business days with a proposal.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
                {/* Name */}
                <div>
                  <label htmlFor="inquiry-name" className="block text-sm font-medium text-gray-700">
                    Name <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="inquiry-name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    autoComplete="name"
                  />
                </div>

                {/* Organization */}
                <div>
                  <label htmlFor="inquiry-org" className="block text-sm font-medium text-gray-700">
                    Organization <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="inquiry-org"
                    type="text"
                    required
                    value={form.organization}
                    onChange={(e) => update("organization", e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    autoComplete="organization"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="inquiry-email" className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="inquiry-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    autoComplete="email"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="inquiry-category" className="block text-sm font-medium text-gray-700">
                    What do you want mapped? <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="inquiry-category"
                    required
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    <option value="">Select a category</option>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="inquiry-desc" className="block text-sm font-medium text-gray-700">
                    Describe it briefly <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="inquiry-desc"
                    required
                    rows={4}
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="e.g., Oregon's clean electricity bill HB 2021, our company's DEI commitments, our supplier code of conduct..."
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  />
                </div>

                {/* Scope */}
                <div>
                  <label htmlFor="inquiry-scope" className="block text-sm font-medium text-gray-700">
                    Estimated scope
                  </label>
                  <select
                    id="inquiry-scope"
                    value={form.scope}
                    onChange={(e) => update("scope", e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    <option value="">Select an estimate</option>
                    {SCOPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Referral */}
                <div>
                  <label htmlFor="inquiry-referral" className="block text-sm font-medium text-gray-700">
                    How did you find us?
                  </label>
                  <select
                    id="inquiry-referral"
                    value={form.referral}
                    onChange={(e) => update("referral", e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    <option value="">Select an option</option>
                    {REFERRAL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Request a proposal"}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
